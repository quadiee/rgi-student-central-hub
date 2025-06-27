
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';
import type { User, Session } from '@supabase/supabase-js';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'hod' | 'principal' | 'admin';
  department_id: string;
  department_name?: string;
  roll_number?: string;
  employee_id?: string;
  profile_photo_url?: string;
  is_active: boolean;
  created_at: string;
  // Make avatar required to match User interface
  avatar: string;
  rollNumber?: string;
  department?: string;
}

interface SupabaseAuthContextType {
  user: UserProfile | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: any }>;
  signOut: () => Promise<{ error?: any }>;
  signUp: (email: string, password: string, userData?: any) => Promise<{ error?: any }>;
  refreshUser: () => Promise<void>;
  getInvitationDetails: (email: string) => Promise<{ data?: any; error?: any }>;
}

const SupabaseAuthContext = createContext<SupabaseAuthContextType>({
  user: null,
  session: null,
  loading: true,
  signIn: async () => ({}),
  signOut: async () => ({}),
  signUp: async () => ({}),
  refreshUser: async () => {},
  getInvitationDetails: async () => ({}),
});

export const useAuth = () => {
  const context = useContext(SupabaseAuthContext);
  if (!context) {
    throw new Error('useAuth must be used within a SupabaseAuthProvider');
  }
  return context;
};

export const SupabaseAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const loadUserProfile = async (userId: string): Promise<UserProfile | null> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          departments:department_id (
            name,
            code
          )
        `)
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error loading user profile:', error);
        return null;
      }

      return {
        ...data,
        role: data.role as 'student' | 'hod' | 'principal' | 'admin',
        department_name: data.departments?.name || 'Unknown',
        // Ensure avatar is always a string
        avatar: data.profile_photo_url || '',
        rollNumber: data.roll_number,
        department: data.departments?.code || 'Unknown'
      };
    } catch (error) {
      console.error('Error in loadUserProfile:', error);
      return null;
    }
  };

  const getInvitationDetails = async (email: string) => {
    try {
      const { data, error } = await supabase.rpc('get_invitation_details', {
        invitation_email: email
      });

      if (error) {
        return { error };
      }

      return { data: data?.[0] || null };
    } catch (error) {
      return { error };
    }
  };

  const refreshUser = async () => {
    const { data: { session: currentSession } } = await supabase.auth.getSession();
    if (currentSession?.user) {
      const profile = await loadUserProfile(currentSession.user.id);
      setUser(profile);
      setSession(currentSession);
    }
  };

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      setLoading(true);
      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        setSession(initialSession);
        
        if (initialSession?.user) {
          const profile = await loadUserProfile(initialSession.user.id);
          setUser(profile);
        }
      } catch (error) {
        console.error('Error getting initial session:', error);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      console.log('Auth state changed:', event, currentSession?.user?.email);
      
      setSession(currentSession);
      
      if (currentSession?.user) {
        const profile = await loadUserProfile(currentSession.user.id);
        setUser(profile);
      } else {
        setUser(null);
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      setUser(null);
      setSession(null);
    }
    return { error };
  };

  const signUp = async (email: string, password: string, userData?: any) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData
      }
    });
    return { error };
  };

  const value: SupabaseAuthContextType = {
    user,
    session,
    loading,
    signIn,
    signOut,
    signUp,
    refreshUser,
    getInvitationDetails,
  };

  return (
    <SupabaseAuthContext.Provider value={value}>
      {children}
    </SupabaseAuthContext.Provider>
  );
};

// Export AuthProvider alias for backward compatibility
export const AuthProvider = SupabaseAuthProvider;
