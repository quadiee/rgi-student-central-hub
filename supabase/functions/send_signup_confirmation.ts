import { serve } from "https://deno.land/std/http/server.ts";

const RESEND_API_KEY = "qjnj rpik nnmq iwf";
const SENDER_EMAIL = "praveen@rgce.edu.in";
const APP_NAME = "RG Student - hub";

serve(async (req) => {
  const { email, confirmationUrl } = await req.json();

  const emailHtml = `
    <h2>Welcome to ${APP_NAME}!</h2>
    <p>Thank you for signing up. Please confirm your email address by clicking the link below:</p>
    <div style="margin:24px 0;">
      <a href="${confirmationUrl}" style="background:#2563eb;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:bold;">
        Confirm Email
      </a>
    </div>
    <p>If you didn't request this, you can safely ignore this email.</p>
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
      subject: `Confirm your email for ${APP_NAME}`,
      html: emailHtml
    }),
  });

  return new Response(
    JSON.stringify({ success: true }),
    { headers: { "Content-Type": "application/json" } }
  );
});
