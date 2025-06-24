
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../integrations/supabase/client';
import { User as AppUser, UserRole } from '../types';

interface AuthContextType {
  user: AppUser | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, userData: any) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<{ error: any }>;
  getInvitationDetails: (email: string) => Promise<any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        setSession(session);
        
        if (session?.user) {
          // Fetch user profile from profiles table
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
          
          if (profileError) {
            console.error('Error fetching user profile:', profileError);
          }
          
          if (profile) {
            const appUser: AppUser = {
              id: profile.id,
              name: profile.name,
              email: profile.email,
              role: profile.role as UserRole,
              department: profile.department,
              rollNumber: profile.roll_number,
              studentId: profile.role === 'student' ? profile.id : undefined,
              facultyId: profile.role === 'faculty' ? profile.id : undefined,
              avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${profile.email}`
            };
            setUser(appUser);
          }
        } else {
          setUser(null);
        }
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, userData: any) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData,
        emailRedirectTo: `${window.location.origin}/`
      }
    });

    if (!error) {
      // Mark invitation as used
      await supabase.rpc('mark_invitation_used', { invitation_email: email });
    }

    return { error };
  };

  const signIn = async (email: string, password: string) => {
    console.log('Attempting to sign in with email:', email);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) {
      console.error('Sign in error:', error);
    }
    
    return { error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  const getInvitationDetails = async (email: string) => {
    console.log('Getting invitation details for:', email);
    const { data, error } = await supabase.rpc('get_invitation_details', {
      invitation_email: email
    });
    
    if (error) {
      console.error('Error getting invitation details:', error);
    } else {
      console.log('Invitation details:', data);
    }
    
    return { data: data?.[0], error };
  };

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    getInvitationDetails
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
