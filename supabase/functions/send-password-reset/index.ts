import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";
import { Resend } from "npm:resend@2.0.0";

// ⚠️ Your Resend API key hard‑coded:
const resend = new Resend("re_j9X6eXgU_By73fLLepM1s2qYZsaG1WqaL");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface PasswordResetRequest {
  email: string;
  resetUrl?: string;
}

const getAppUrl = (req: Request): string => {
  const origin = req.headers.get("origin");
  const referer = req.headers.get("referer");
  if (origin) return origin;
  if (referer) {
    try { return new URL(referer).origin; } catch {}
  }
  return "https://rgi-student-central-hub.lovable.app"; // fallback
};

serve(async (req: Request) => {
  // 1. Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // 2. Initialize Supabase client
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // 3. Parse the incoming email
    const { email }: PasswordResetRequest = await req.json();

    // 4. Generate a password recovery link
    const appUrl = getAppUrl(req);
    const redirectUrl = `${appUrl}/reset-password`;
    const { data, error } = await supabase.auth.admin.generateLink({
      type: "recovery",
      email,
      options: { redirectTo: redirectUrl },
    });
    if (error) throw error;

    const resetUrl = data.properties?.action_link || data.properties?.hashed_token;

    // 5. Send the reset email via Resend
    await resend.emails.send({
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
                 style="background: linear-gradient(135deg, #2563eb, #9333ea); color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
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

    // 6. Return success
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (err: any) {
    // 7. Return error
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});
