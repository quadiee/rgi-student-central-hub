import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { SmtpClient } from "https://deno.land/x/smtp@v0.10.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Your Gmail details here
const GMAIL_ADDRESS = "praveen@rgce.edu.in"; // <-- change to your Gmail address
const GMAIL_APP_PASSWORD = "qjnj rpik nnmq iwf"; // <-- change to your app password

interface InvitationEmailRequest {
  email: string;
  role: string;
  department: string;
  invitedBy: string;
  invitationId: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { email, role, department, invitedBy, invitationId }: InvitationEmailRequest = await req.json();

    // Get inviter details
    const { data: inviterData } = await supabase
      .from("profiles")
      .select("name, email")
      .eq("id", invitedBy)
      .single();

    const inviterName = inviterData?.name || "Administrator";

    // Create invitation email content
    const invitationUrl = `${Deno.env.get("SITE_URL") || "https://your-site-url.com"}/auth?mode=invited&email=${encodeURIComponent(email)}`;

    const emailContent = `
      <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #2563eb;">You're Invited to Join RGI Student Central Hub</h2>
            <p>Hello,</p>
            <p>You have been invited by <strong>${inviterName}</strong> to join the RGI Student Central Hub as a <strong>${role.toUpperCase()}</strong> in the <strong>${department}</strong> department.</p>
            <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #1e40af;">Invitation Details:</h3>
              <ul style="list-style: none; padding: 0;">
                <li><strong>Role:</strong> ${role.charAt(0).toUpperCase() + role.slice(1)}</li>
                <li><strong>Department:</strong> ${department}</li>
                <li><strong>Email:</strong> ${email}</li>
              </ul>
            </div>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${invitationUrl}" 
                 style="background-color: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
                Accept Invitation & Register
              </a>
            </div>
            <p style="color: #666; font-size: 14px;">
              This invitation will expire in 7 days. If you have any questions, please contact the administrator.
            </p>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
            <p style="color: #666; font-size: 12px; text-align: center;">
              This is an automated email from RGI Student Central Hub. Please do not reply to this email.
            </p>
          </div>
        </body>
      </html>
    `;

    // SEND EMAIL via Gmail SMTP
    const client = new SmtpClient();

    await client.connectTLS({
      hostname: "smtp.gmail.com",
      port: 465,
      username: GMAIL_ADDRESS,
      password: GMAIL_APP_PASSWORD,
    });

    await client.send({
      from: GMAIL_ADDRESS,
      to: email,
      subject: "You're Invited to Join RGI Student Central Hub",
      content: "", // plain text fallback, optional
      html: emailContent,
    });

    await client.close();

    // Update the invitation to mark as email sent
    await supabase
      .from("user_invitations")
      .update({
        email_sent: true,
        email_sent_at: new Date().toISOString(),
      })
      .eq("id", invitationId);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Invitation email sent successfully",
        invitationUrl: invitationUrl,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("Error sending invitation email:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "Failed to send invitation email",
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  }
};

serve(handler);