
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0'
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PasswordResetRequest {
  email: string;
  resetUrl: string;
}

// Get the correct app URL
const getAppUrl = (req: Request): string => {
  const origin = req.headers.get('origin');
  const referer = req.headers.get('referer');
  
  // If origin is available, use it
  if (origin) {
    return origin;
  }
  
  // If referer is available, extract origin from it
  if (referer) {
    try {
      return new URL(referer).origin;
    } catch (e) {
      console.log('Could not parse referer:', referer);
    }
  }
  
  // Default fallback - update this to your actual deployed URL
  return 'https://rgi-student-central-hub.lovable.app';
};

const handler = async (req: Request): Promise<Response> => {
  console.log('Password reset email function called');
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email }: PasswordResetRequest = await req.json();
    console.log('Sending password reset email to:', email);

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Get the correct app URL
    const appUrl = getAppUrl(req);
    const redirectUrl = `${appUrl}/reset-password`;

    // Generate password reset link using Supabase Auth
    const { data, error } = await supabase.auth.admin.generateLink({
      type: 'recovery',
      email: email,
      options: {
        redirectTo: redirectUrl
      }
    })

    if (error) {
      console.error('Error generating reset link:', error)
      throw error
    }

    const resetUrl = data.properties?.action_link || data.properties?.hashed_token
    console.log('Generated reset URL:', resetUrl)

    const emailResponse = await resend.emails.send({
      from: "RGCE Portal <noreply@rgce.edu.in>",
      to: [email],
      subject: "Reset Your RGCE Portal Password",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #2563eb, #9333ea); padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">RGCE Portal</h1>
            <p style="color: white; margin: 5px 0;">Rajiv Gandhi College of Engineering</p>
          </div>
          
          <div style="padding: 30px; background-color: #f9fafb;">
            <h2 style="color: #374151; margin-bottom: 20px;">Password Reset Request</h2>
            
            <p style="color: #6b7280; line-height: 1.6; margin-bottom: 25px;">
              We received a request to reset your password for your RGCE Portal account. 
              Click the button below to set a new password:
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" 
                 style="background: linear-gradient(135deg, #2563eb, #9333ea); 
                        color: white; 
                        padding: 12px 30px; 
                        text-decoration: none; 
                        border-radius: 8px; 
                        font-weight: bold;
                        display: inline-block;">
                Reset Password
              </a>
            </div>
            
            <p style="color: #6b7280; font-size: 14px; line-height: 1.6;">
              If the button doesn't work, copy and paste this link into your browser:<br>
              <a href="${resetUrl}" style="color: #2563eb; word-break: break-all;">${resetUrl}</a>
            </p>
            
            <div style="background-color: #fef3c7; border: 1px solid #f59e0b; border-radius: 6px; padding: 15px; margin: 20px 0;">
              <p style="color: #92400e; margin: 0; font-size: 14px;">
                <strong>Important:</strong> This link will expire in 1 hour for security reasons. 
                If you didn't request this password reset, please ignore this email.
              </p>
            </div>
            
            <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
              If you're having trouble accessing your account, please contact the IT department.
            </p>
          </div>
          
          <div style="background-color: #374151; padding: 20px; text-align: center;">
            <p style="color: #d1d5db; margin: 0; font-size: 12px;">
              © ${new Date().getFullYear()} Rajiv Gandhi College of Engineering. All rights reserved.
            </p>
          </div>
        </div>
      `,
    });

    console.log("Password reset email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, data: emailResponse }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });

  } catch (error: any) {
    console.error("Error sending password reset email:", error);
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
