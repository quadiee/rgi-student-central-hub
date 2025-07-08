
import { PersonalizedAuthService } from './personalizedAuth';

// Legacy compatibility - redirect to personalized service
export async function sendMagicLink(email: string) {
  const result = await PersonalizedAuthService.sendPersonalizedMagicLink(email);
  
  if (!result.success) {
    return new Error(result.error || 'Failed to send magic link');
  }
  
  return null;
}
