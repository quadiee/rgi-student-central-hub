
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  "https://hsmavqldffsxetwyyhgj.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzbWF2cWxkZmZzeGV0d3l5aGdqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3NDAyNDYsImV4cCI6MjA2NjMxNjI0Nn0.-IgvTTnQcoYd2Q1jIH9Nt3zTcrnUtMAxPe0UAFZguAE"
);

// Get the correct app URL based on environment
const getAppUrl = () => {
  // Check if we're in production (deployed app)
  if (window.location.hostname.includes('lovable.app')) {
    return window.location.origin;
  }
  // For development or other environments
  return window.location.origin;
};

// Usage: await resetPassword(email)
export async function resetPassword(email) {
  const appUrl = getAppUrl();
  
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${appUrl}/reset-password`
  });
  
  if (error) {
    console.error('Reset password error:', error);
    return error;
  }
  
  // Call our custom edge function to send the email
  try {
    const { error: functionError } = await supabase.functions.invoke('send-password-reset', {
      body: {
        email: email,
        resetUrl: `${appUrl}/reset-password`
      }
    });
    
    if (functionError) {
      console.error('Function error:', functionError);
      return functionError;
    }
  } catch (err) {
    console.error('Failed to call send-password-reset function:', err);
    return { message: 'Failed to send reset email' };
  }
  
  return null;
}
