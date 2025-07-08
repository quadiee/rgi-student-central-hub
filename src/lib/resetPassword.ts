
import { PersonalizedAuthService } from './personalizedAuth';

// Enhanced reset password function with personalization
export async function resetPassword(email: string) {
  console.log('Sending personalized password reset to:', email);
  
  const result = await PersonalizedAuthService.sendPersonalizedPasswordReset(email);
  
  if (!result.success) {
    console.error('Reset password error:', result.error);
    return new Error(result.error || 'Failed to send reset email');
  }
  
  console.log('Personalized password reset email sent successfully');
  console.log('User role detected:', result.userRole);
  
  return null;
}

// Legacy compatibility
export { resetPassword as sendPasswordReset };
