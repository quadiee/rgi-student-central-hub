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
    const { adminUserId } = await req.json();
    if (!adminUserId) {
      return new Response(JSON.stringify({ error: "No adminUserId provided" }), { status: 400 });
    }

    const { data: profile, error } = await supabase
      .from("profiles")
      .select("email")
      .eq("id", adminUserId)
      .single();

    if (error || !profile?.email) {
      return new Response(JSON.stringify({ error: "Admin user not found" }), { status: 404 });
    }

    const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    const { data: sessionData, error: sessionError } = await adminClient.auth.admin.createSession({
      user_id: adminUserId
    });

    if (sessionError || !sessionData?.session?.access_token) {
      return new Response(JSON.stringify({ error: sessionError?.message || "Failed to create admin session" }), { status: 500 });
    }

    return new Response(
      JSON.stringify({
        access_token: sessionData.session.access_token,
        refresh_token: sessionData.session.refresh_token,
        user: sessionData.user
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message || "Unknown error" }), { status: 500 });
  }
});
