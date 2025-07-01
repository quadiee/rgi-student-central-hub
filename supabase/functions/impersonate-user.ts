// Edge Function for real user impersonation in Supabase
import { serve } from "https://deno.land/std@0.192.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.40.0";

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  try {
    const { userId } = await req.json();
    if (!userId) {
      return new Response(JSON.stringify({ error: "No userId provided" }), { status: 400 });
    }

    const { data: profile, error } = await supabase
      .from("profiles")
      .select("email")
      .eq("id", userId)
      .single();

    if (error || !profile?.email) {
      return new Response(JSON.stringify({ error: "User not found" }), { status: 404 });
    }

    const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    const { data: impersonation, error: impError } = await adminClient.auth.admin.createSession({
      user_id: userId
    });

    if (impError || !impersonation?.session?.access_token) {
      return new Response(JSON.stringify({ error: impError?.message || "Failed to create session" }), { status: 500 });
    }

    return new Response(
      JSON.stringify({
        access_token: impersonation.session.access_token,
        refresh_token: impersonation.session.refresh_token,
        user: impersonation.user
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message || "Unknown error" }), { status: 500 });
  }
});
