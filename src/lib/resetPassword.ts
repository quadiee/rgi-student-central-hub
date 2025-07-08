
import { supabase } from '../integrations/supabase/client';

// Get the correct app URL based on environment
const getAppUrl = () => {
  if (window.location.hostname.includes('lovable.app')) {
    return window.location.origin;
  }
  return window.location.origin;
};

// Usage: await resetPassword(email)
export async function resetPassword(email: string) {
  const appUrl = getAppUrl();
  
  try {
    // Use Supabase's built-in password reset
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${appUrl}/reset-password`
    });
    
    if (error) {
      console.error('Reset password error:', error);
      return error;
    }
    
    // Also try to call our custom function for enhanced email
    try {
      const { error: functionError } = await supabase.functions.invoke('send-password-reset', {
        body: {
          email: email,
          resetUrl: `${appUrl}/reset-password`
        }
      });
      
      if (functionError) {
        console.warn('Custom email function failed:', functionError);
        // Don't return error since the main reset worked
      }
    } catch (err) {
      console.warn('Failed to call send-password-reset function:', err);
      // Don't return error since the main reset worked
    }
    
    return null;
  } catch (err) {
    console.error('Password reset failed:', err);
    return { message: 'Failed to send reset email' };
  }
}
