import { serve } from "https://deno.land/std/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const RESEND_API_KEY = "qjnj rpik nnmq iwf";
const SENDER_EMAIL = "praveen@rgce.edu.in";
const APP_NAME = "RG Student - hub";
const APP_URL = "https://rgi-student-central-hub.lovable.app";
const SUPABASE_URL = "https://hsmavqldffsxetwyyhgj.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzbWF2cWxkZmZzeGV0d3l5aGdqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDc0MDI0NiwiZXhwIjoyMDY2MzE2MjQ2fQ.FROoyu6SR5PLsySUJ1tcsYXyreZVWv_hNserU_rEeIg";

serve(async (req) => {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  const { email, role, department, invitedBy, invitationId } = await req.json();

  // Get invitation token
  const { data: invitation, error } = await supabase
    .from('user_invitations')
    .select('token')
    .eq('id', invitationId)
    .single();

  if (error || !invitation?.token) {
    return new Response(
      JSON.stringify({ success: false, error: "Could not fetch invitation token." }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const invitationUrl = `${APP_URL}/invite/${invitation.token}`;

  const emailHtml = `
    <h2>You're Invited to Join ${APP_NAME}!</h2>
    <p>You have been invited to join as a <b>${role}</b> in the <b>${department}</b> department.</p>
    <div style="margin:24px 0;">
      <a href="${invitationUrl}" style="background:#2563eb;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:bold;">
        Accept Invitation & Register
      </a>
    </div>
    <p>If you do not wish to accept, you can safely ignore this email.</p>
  `;

  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from: SENDER_EMAIL,
      to: email,
      subject: `You're Invited to Join ${APP_NAME}`,
      html: emailHtml
    }),
  });

  return new Response(
    JSON.stringify({ success: true }),
    { headers: { "Content-Type": "application/json" } }
  );
});
