import { supabase } from '../integrations/supabase/client';

// Usage: await changeEmail(newEmail)
export async function changeEmail(newEmail) {
  const { error } = await supabase.auth.updateUser({ email: newEmail });
  return error;
}
