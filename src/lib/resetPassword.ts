
import { supabase } from '../integrations/supabase/client';
import { getPasswordResetUrl } from '../utils/appUrl';

// Usage: await resetPassword(email)
export async function resetPassword(email: string) {
  const resetUrl = getPasswordResetUrl();
  
  console.log('Sending password reset to:', email);
  console.log('Reset URL will be:', resetUrl);
  
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: resetUrl
  });
  
  if (error) {
    console.error('Reset password error:', error);
    return error;
  }
  
  try {
    const { error: functionError } = await supabase.functions.invoke('send-password-reset', {
      body: {
        email: email,
        resetUrl: resetUrl
      }
    });
    
    if (functionError) {
      console.error('Function error:', functionError);
      return functionError;
    }
    
    console.log('Password reset email sent successfully');
  } catch (err) {
    console.error('Failed to call send-password-reset function:', err);
    return { message: 'Failed to send reset email' };
  }
  
  return null;
}
