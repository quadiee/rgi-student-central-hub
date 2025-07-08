import { supabase } from '../integrations/supabase/client';

export interface SignUpData {
  name: string;
  role: string;
  department: string;
  phone?: string;
  roll_number?: string;
  employee_id?: string;
  guardian_name?: string;
  guardian_phone?: string;
  address?: string;
}

export interface ValidationResult {
  userExists: boolean;
  invitationValid: boolean;
  invitationData?: any;
  error?: string;
  redirect?: 'signup' | 'login' | 'password-setup' | 'invalid';
}

export const authUtils = {
  // Enhanced validation that checks both user existence and invitation validity
  validateInvitation: async (email: string, token?: string): Promise<ValidationResult> => {
    try {
      const { data, error } = await supabase.functions.invoke('check-user-exists', {
        body: { email, token }
      });
      
      if (error) {
        return {
          userExists: false,
          invitationValid: false,
          error: error.message,
          redirect: 'invalid'
        };
      }
      
      return data;
    } catch (error: any) {
      return {
        userExists: false,
        invitationValid: false,
        error: error.message,
        redirect: 'invalid'
      };
    }
  },

  // Legacy method for backward compatibility
  checkUserExists: async (email: string): Promise<boolean> => {
    const result = await authUtils.validateInvitation(email);
    return result.userExists;
  },

  // Send password reset email
  sendPasswordReset: async (email: string): Promise<{ error?: any }> => {
    try {
      const { error } = await supabase.functions.invoke('send-password-reset', {
        body: { 
          email,
          resetUrl: `${window.location.origin}/reset-password`
        }
      });
      return { error };
    } catch (error) {
      return { error };
    }
  },

  // Send magic link
  sendMagicLink: async (email: string): Promise<{ error?: any }> => {
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });
      return { error };
    } catch (error) {
      return { error };
    }
  },

  // Update user password (for existing users)
  updatePassword: async (password: string): Promise<{ error?: any }> => {
    try {
      const { error } = await supabase.auth.updateUser({ password });
      return { error };
    } catch (error) {
      return { error };
    }
  },

  // Sign up new user with profile data
  signUpWithProfile: async (email: string, password: string, userData: SignUpData): Promise<{ error?: any }> => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: userData
        }
      });
      return { error };
    } catch (error) {
      return { error };
    }
  },

  // Remove user (admin function)
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
