import { supabase } from '../integrations/supabase/client';

// Usage: await sendMagicLink(email)
export async function sendMagicLink(email: string) {
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${window.location.origin}/auth/callback`
    }
  });
  return error;
}
