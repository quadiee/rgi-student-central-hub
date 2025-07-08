
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0'

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ValidationRequest {
  email: string;
  token?: string;
}

interface ValidationResponse {
  userExists: boolean;
  invitationValid: boolean;
  invitationData?: any;
  error?: string;
  redirect?: 'signup' | 'login' | 'password-setup' | 'invalid';
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, token }: ValidationRequest = await req.json();

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
    const { data: authData, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.error('Error checking auth users:', authError);
      return new Response(
        JSON.stringify({ 
          userExists: false, 
          invitationValid: false,
          error: "Failed to verify user existence",
          redirect: 'invalid'
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const userExists = authData.users.some(user => user.email === email);

    // If token is provided, validate invitation
    let invitationData = null;
    let invitationValid = false;
    
    if (token) {
      const { data: invitationResults, error: invitationError } = await supabase
        .from('user_invitations')
        .select('*')
        .eq('token', token)
        .eq('is_active', true)
        .single();

      if (!invitationError && invitationResults) {
        const now = new Date();
        const expiresAt = new Date(invitationResults.expires_at);
        
        invitationValid = 
          invitationResults.email === email &&
          now <= expiresAt &&
          !invitationResults.used_at;
        
        if (invitationValid) {
          invitationData = invitationResults;
        }
      }
    }

    // Determine redirect based on user existence and invitation status
    let redirect: ValidationResponse['redirect'] = 'invalid';
    
    if (token && !invitationValid) {
      redirect = 'invalid';
    } else if (token && invitationValid && userExists) {
      redirect = 'password-setup';
    } else if (token && invitationValid && !userExists) {
      redirect = 'signup';
    } else if (!token && userExists) {
      redirect = 'login';
    }

    const response: ValidationResponse = {
      userExists,
      invitationValid,
      invitationData,
      redirect
    };

    return new Response(
      JSON.stringify(response),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error('Error in enhanced validation function:', error);
    return new Response(
      JSON.stringify({ 
        userExists: false, 
        invitationValid: false,
        error: error.message,
        redirect: 'invalid'
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
