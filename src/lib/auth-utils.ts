
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

export const authUtils = {
  // Check if user exists in auth system
  checkUserExists: async (email: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.functions.invoke('check-user-exists', {
        body: { email }
      });
      if (error) return false;
      return !!data?.exists;
    } catch {
      return false;
    }
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

  // Sign up new user with complete profile data
  signUpWithProfile: async (email: string, password: string, userData: SignUpData): Promise<{ error?: any }> => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            name: userData.name,
            role: userData.role,
            department: userData.department,
            phone: userData.phone,
            roll_number: userData.roll_number,
            employee_id: userData.employee_id,
            guardian_name: userData.guardian_name,
            guardian_phone: userData.guardian_phone,
            address: userData.address
          }
        }
      });
      return { error };
    } catch (error) {
      return { error };
    }
  },

  // Validate invitation token
  validateInvitationToken: async (token: string): Promise<{ data?: any; error?: any }> => {
    try {
      const { data, error } = await supabase.rpc('validate_invitation_token', {
        p_token: token
      });
      return { data: data?.[0], error };
    } catch (error) {
      return { error };
    }
  },

  // Complete invitation profile
  completeInvitationProfile: async (userId: string, invitationId: string, profileData: any): Promise<{ error?: any }> => {
    try {
      const { data, error } = await supabase.rpc('complete_invitation_profile', {
        p_user_id: userId,
        p_invitation_id: invitationId,
        p_profile_data: profileData
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
