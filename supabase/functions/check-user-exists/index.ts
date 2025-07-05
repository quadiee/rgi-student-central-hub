
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0'

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CheckUserRequest {
  email: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email }: CheckUserRequest = await req.json();

    if (!email) {
      return new Response(
        JSON.stringify({ error: "Email is required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Check if user exists in auth.users
    const { data, error } = await supabase.auth.admin.listUsers();
    
    if (error) {
      console.error('Error checking users:', error);
      return new Response(
        JSON.stringify({ exists: false }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const userExists = data.users.some(user => user.email === email);

    return new Response(
      JSON.stringify({ exists: userExists }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error('Error in check-user-exists function:', error);
    return new Response(
      JSON.stringify({ error: error.message, exists: false }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
