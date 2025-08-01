
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0'

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ValidationRequest {
  email?: string;
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

    console.log('Received request with email:', email, 'token:', token);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // If we have a token, validate the invitation first
    if (token) {
      console.log('Validating token:', token);
      
      const { data: invitationResults, error: invitationError } = await supabase
        .from('user_invitations')
        .select('*')
        .eq('token', token)
        .eq('is_active', true)
        .single();

      console.log('Invitation query result:', { invitationResults, invitationError });

      if (invitationError || !invitationResults) {
        console.log('Invalid token or invitation not found');
        return new Response(
          JSON.stringify({ 
            userExists: false, 
            invitationValid: false,
            error: "Invalid or expired invitation token",
            redirect: 'invalid'
          }),
          {
            status: 200,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          }
        );
      }

      // Check if invitation is expired
      const now = new Date();
      const expiresAt = new Date(invitationResults.expires_at);
      
      if (now > expiresAt) {
        console.log('Invitation expired');
        return new Response(
          JSON.stringify({ 
            userExists: false, 
            invitationValid: false,
            error: "Invitation has expired",
            redirect: 'invalid'
          }),
          {
            status: 200,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          }
        );
      }

      // Check if invitation has been used
      if (invitationResults.used_at) {
        console.log('Invitation already used');
        return new Response(
          JSON.stringify({ 
            userExists: false, 
            invitationValid: false,
            error: "Invitation has already been used",
            redirect: 'invalid'
          }),
          {
            status: 200,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          }
        );
      }

      // Get the email from the invitation
      const invitationEmail = invitationResults.email;
      console.log('Invitation email:', invitationEmail);

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

      const userExists = authData.users.some(user => user.email === invitationEmail);
      console.log('User exists:', userExists);

      // Determine redirect based on user existence
      let redirect: ValidationResponse['redirect'] = 'signup';
      
      if (userExists) {
        redirect = 'password-setup';
      }

      const response: ValidationResponse = {
        userExists,
        invitationValid: true,
        invitationData: invitationResults,
        redirect
      };

      console.log('Returning response:', response);

      return new Response(
        JSON.stringify(response),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // If no token provided but email is provided
    if (email) {
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

      const response: ValidationResponse = {
        userExists,
        invitationValid: false,
        redirect: userExists ? 'login' : 'invalid'
      };

      return new Response(
        JSON.stringify(response),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Neither email nor token provided
    return new Response(
      JSON.stringify({ 
        userExists: false, 
        invitationValid: false,
        error: "Email or token is required",
        redirect: 'invalid'
      }),
      {
        status: 400,
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
