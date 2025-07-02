import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  "https://hsmavqldffsxetwyyhgj.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzbWF2cWxkZmZzeGV0d3l5aGdqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3NDAyNDYsImV4cCI6MjA2NjMxNjI0Nn0.-IgvTTnQcoYd2Q1jIH9Nt3zTcrnUtMAxPe0UAFZguAE"
);

// Usage: await changeEmail(newEmail)
export async function changeEmail(newEmail) {
  const { error } = await supabase.auth.updateUser({ email: newEmail });
  return error;
}
