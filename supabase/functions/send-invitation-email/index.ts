import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const RESEND_API_KEY = "re_j9X6eXgU_By73fLLepM1s2qYZsaG1WqaL";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Fetch invitation data
    const { email, role, department, invitedBy, invitationId } = await req.json();

    // Fetch the invitationToken automatically from the database
    const { data: invitationRecord, error: invitationRecordError } = await supabase
      .from('user_invitations')
      .select('token')
      .eq('id', invitationId)
      .single();

    if (invitationRecordError || !invitationRecord?.token) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Could not fetch invitation token.",
          details: invitationRecordError || "No token found for this invitation."
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders }
        }
      );
    }

    const invitationToken = invitationRecord.token;

    if (!email || !role || !department || !invitedBy || !invitationId || !invitationToken) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Missing required field. Please provide email, role, department, invitedBy, and invitationId."
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders }
        }
      );
    }

    const { data: inviterData, error: inviterError } = await supabase
      .from("profiles")
      .select("name, email")
      .eq("id", invitedBy)
      .single();

    if (inviterError) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Could not fetch inviter details.",
          details: inviterError
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders }
        }
      );
    }

    const inviterName = inviterData?.name || "Administrator";
    const invitationUrl = `${Deno.env.get("SITE_URL") || "https://rgi-student-central-hub.lovable.app"}/invite/${encodeURIComponent(invitationToken)}`;

    const emailHtml = `
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

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: "no-reply@resend.dev",
        to: email,
        subject: "You're Invited to Join RGI Student Central Hub",
        html: emailHtml
      }),
    });

    const resendResult = await res.json();

    if (!res.ok) {
      return new Response(
        JSON.stringify({
          success: false,
          error: resendResult.error || resendResult.message || "Unknown error from Resend",
          resendResult
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders }
        }
      );
    }

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
        resendResult
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