import { supabase } from '../integrations/supabase/client';

// Get the correct app URL based on environment
const getAppUrl = () => {
  if (window.location.hostname.includes('lovable.app')) {
    return window.location.origin;
  }
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