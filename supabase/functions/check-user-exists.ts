import { serve } from "https://deno.land/std/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

serve(async (req) => {
  const { email } = await req.json();
  const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const { data } = await supabase.auth.admin.listUsers({ email });
  // If any user matches this email, return exists: true
  if (data?.users?.length > 0) {
    return new Response(JSON.stringify({ exists: true }), { headers: { "Content-Type": "application/json" } });
  }
  return new Response(JSON.stringify({ exists: false }), { headers: { "Content-Type": "application/json" } });
});
