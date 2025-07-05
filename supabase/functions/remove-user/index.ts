
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0'

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface RemoveUserRequest {
  userId: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId }: RemoveUserRequest = await req.json();

    if (!userId) {
      return new Response(
        JSON.stringify({ error: "User ID is required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Get the current user to check if they have admin privileges
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Authentication required" }),
        {
          status: 401,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Verify the requesting user is an admin
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid authentication" }),
        {
          status: 401,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Check if requesting user has admin role
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || !profile || !['admin', 'principal'].includes(profile.role)) {
      return new Response(
        JSON.stringify({ error: "Insufficient privileges" }),
        {
          status: 403,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Remove user from auth.users (this will cascade to profiles via foreign key)
    const { error: deleteError } = await supabase.auth.admin.deleteUser(userId);

    if (deleteError) {
      console.error('Error deleting user:', deleteError);
      return new Response(
        JSON.stringify({ error: deleteError.message }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Also deactivate any related invitations
    await supabase
      .from('user_invitations')
      .update({ is_active: false })
      .eq('email', (await supabase.auth.admin.getUserById(userId)).data.user?.email);

    return new Response(
      JSON.stringify({ success: true, message: "User removed successfully" }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error('Error in remove-user function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
      status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
