
import { PersonalizedAuthService } from './personalizedAuth';

// Enhanced reset password function with personalization
export async function resetPassword(email: string) {
  console.log('Sending personalized password reset to:', email);
  console.log('Environment check - window available:', typeof window !== 'undefined');
  console.log('Current origin:', typeof window !== 'undefined' ? window.location.origin : 'server-side');
  
  const result = await PersonalizedAuthService.sendPersonalizedPasswordReset(email);
  
  if (!result.success) {
    console.error('Reset password error:', result.error);
    throw new Error(result.error || 'Failed to send reset email');
  }
  
  console.log('Personalized password reset email sent successfully');
  console.log('User role detected:', result.userRole);
  console.log('Full result:', result);
  
  return null;
}

// Legacy compatibility
export { resetPassword as sendPasswordReset };
