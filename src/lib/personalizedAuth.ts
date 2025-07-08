
import { supabase } from '../integrations/supabase/client';
import { LinkGenerator, LinkContext } from '../utils/linkGenerator';

export interface PersonalizedAuthResult {
  success: boolean;
  message?: string;
  error?: string;
  redirectUrl?: string;
  userRole?: string;
  userData?: any;
}

export interface InvitationValidationResult extends PersonalizedAuthResult {
  userExists: boolean;
  invitationValid: boolean;
  invitationData?: any;
  redirect?: 'signup' | 'login' | 'password-setup' | 'invalid';
}

export class PersonalizedAuthService {
  // Enhanced invitation validation with user context
  static async validateInvitationWithContext(email: string, token?: string): Promise<InvitationValidationResult> {
    try {
      const { data, error } = await supabase.functions.invoke('check-user-exists', {
        body: { email, token }
      });
      
      if (error) {
        return {
          success: false,
          userExists: false,
          invitationValid: false,
          error: error.message,
          redirect: 'invalid'
        };
      }
      
      // Add personalized redirect URLs based on role
      if (data.invitationValid && data.invitationData) {
        const context: LinkContext = {
          userRole: data.invitationData.role,
          department: data.invitationData.department,
          userData: data.invitationData
        };
        
        if (data.redirect === 'signup') {
          data.redirectUrl = LinkGenerator.generateInvitationUrl(token || '', context);
        } else if (data.redirect === 'password-setup') {
          data.redirectUrl = LinkGenerator.generatePasswordResetUrl(token, context);
        }
      }
      
      return { success: true, ...data };
    } catch (error: any) {
      return {
        success: false,
        userExists: false,
        invitationValid: false,
        error: error.message,
        redirect: 'invalid'
      };
    }
  }

  // Enhanced password reset with role-based personalization
  static async sendPersonalizedPasswordReset(email: string): Promise<PersonalizedAuthResult> {
    try {
      console.log('PersonalizedAuthService: Starting password reset for:', email);
      
      // Get user profile for context
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('name, role, department_id, departments(name, code)')
        .eq('email', email)
        .single();

      console.log('Profile lookup result:', { profile, profileError });

      const context: LinkContext = {
        userRole: profile?.role,
        department: profile?.departments?.code,
        userData: {
          name: profile?.name,
          email: email
        }
      };

      console.log('Calling edge function with context:', context);

      const { data, error } = await supabase.functions.invoke('send-password-reset', {
        body: { 
          email,
          resetUrl: LinkGenerator.generatePasswordResetUrl(undefined, context),
          context
        }
      });

      console.log('Edge function response:', { data, error });

      if (error) {
        console.error('Edge function error:', error);
        return {
          success: false,
          error: error.message || 'Failed to send password reset email'
        };
      }

      // Check if the response indicates success
      if (data && !data.success) {
        console.error('Edge function returned failure:', data);
        return {
          success: false,
          error: data.error || 'Failed to send password reset email'
        };
      }

      return {
        success: true,
        message: `Personalized password reset email sent to ${email}`,
        userRole: profile?.role,
        emailId: data?.emailId
      };
    } catch (error: any) {
      console.error('Password reset service error:', error);
      return {
        success: false,
        error: error.message || 'An unexpected error occurred'
      };
    }
  }

  // Enhanced signup with role-specific profile creation
  static async signUpWithPersonalizedProfile(
    email: string, 
    password: string, 
    userData: any, 
    invitationContext?: LinkContext
  ): Promise<PersonalizedAuthResult> {
    try {
      const redirectUrl = invitationContext 
        ? LinkGenerator.getRoleBasedDashboardUrl(invitationContext.userRole || 'student')
        : LinkGenerator.getRoleBasedDashboardUrl('student');

      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            ...userData,
            invitation_context: invitationContext
          }
        }
      });

      if (error) {
        return {
          success: false,
          error: error.message
        };
      }

      return {
        success: true,
        message: 'Account created successfully with personalized setup',
        redirectUrl,
        userRole: userData.role
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Enhanced sign in with role-based redirection
  static async signInWithPersonalizedRedirect(email: string, password: string): Promise<PersonalizedAuthResult> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        return {
          success: false,
          error: error.message
        };
      }

      // Get user profile for personalized redirect
      if (data.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role, name')
          .eq('id', data.user.id)
          .single();

        const redirectUrl = LinkGenerator.getRoleBasedDashboardUrl(profile?.role || 'student');

        return {
          success: true,
          message: `Welcome back, ${profile?.name || 'User'}!`,
          redirectUrl,
          userRole: profile?.role,
          userData: profile
        };
      }

      return {
        success: true,
        message: 'Signed in successfully'
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Magic link with personalized landing
  static async sendPersonalizedMagicLink(email: string): Promise<PersonalizedAuthResult> {
    try {
      // Get user context
      const { data: profile } = await supabase
        .from('profiles')
        .select('role, name, department_id')
        .eq('email', email)
        .single();

      const context: LinkContext = {
        userRole: profile?.role,
        userData: {
          name: profile?.name,
          email: email
        }
      };

      const redirectUrl = LinkGenerator.getRoleBasedDashboardUrl(profile?.role || 'student');

      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: redirectUrl
        }
      });

      if (error) {
        return {
          success: false,
          error: error.message
        };
      }

      return {
        success: true,
        message: `Personalized magic link sent to ${email}`,
        userRole: profile?.role
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Update password with role-based success handling
  static async updatePasswordWithContext(password: string): Promise<PersonalizedAuthResult> {
    try {
      const { data: { user }, error } = await supabase.auth.updateUser({ password });
      
      if (error) {
        return {
          success: false,
          error: error.message
        };
      }

      if (user) {
        // Get user profile for personalized response
        const { data: profile } = await supabase
          .from('profiles')
          .select('role, name')
          .eq('id', user.id)
          .single();

        const redirectUrl = LinkGenerator.getRoleBasedDashboardUrl(profile?.role || 'student');

        return {
          success: true,
          message: `Password updated successfully, ${profile?.name || 'User'}!`,
          redirectUrl,
          userRole: profile?.role
        };
      }

      return {
        success: true,
        message: 'Password updated successfully'
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}

// Legacy compatibility - keep existing auth-utils exports but mark as deprecated
export const authUtils = {
  // @deprecated Use PersonalizedAuthService.validateInvitationWithContext instead
  validateInvitation: PersonalizedAuthService.validateInvitationWithContext,
  // @deprecated Use PersonalizedAuthService.sendPersonalizedPasswordReset instead
  sendPasswordReset: PersonalizedAuthService.sendPersonalizedPasswordReset,
  // @deprecated Use PersonalizedAuthService.signUpWithPersonalizedProfile instead
  signUpWithProfile: PersonalizedAuthService.signUpWithPersonalizedProfile,
  // @deprecated Use PersonalizedAuthService.updatePasswordWithContext instead
  updatePassword: PersonalizedAuthService.updatePasswordWithContext,
  // @deprecated Use PersonalizedAuthService.sendPersonalizedMagicLink instead
  sendMagicLink: PersonalizedAuthService.sendPersonalizedMagicLink,
  
  // Keep legacy method for backward compatibility
  checkUserExists: async (email: string): Promise<boolean> => {
    const result = await PersonalizedAuthService.validateInvitationWithContext(email);
    return result.userExists;
  },

  // Keep remove user method
  removeUser: async (userId: string): Promise<{ error?: any }> => {
    try {
      const { error } = await supabase.functions.invoke('remove-user', {
        body: { userId }
      });
      return { error };
    } catch (error) {
      return { error };
    }
  }
};
