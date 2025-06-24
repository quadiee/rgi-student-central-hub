
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
          // Defer profile fetch to avoid blocking auth state change
          setTimeout(async () => {
            try {
              // Fetch user profile from profiles table with role and department
              const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .single();
              
              if (profileError) {
                console.error('Error fetching user profile:', profileError);
                return;
              }
              
              if (profile) {
                console.log('User profile loaded:', profile);
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
            } catch (error) {
              console.error('Error in profile fetch:', error);
            }
          }, 0);
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
    console.log('Signing up user with data:', userData);
    
    // No email verification needed - simplified flow
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData
      }
    });

    if (!error) {
      console.log('Signup successful, marking invitation as used for:', email);
      // Mark invitation as used
      const { error: markError } = await supabase.rpc('mark_invitation_used', { 
        invitation_email: email 
      });
      
      if (markError) {
        console.error('Error marking invitation as used:', markError);
      }
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
    } else {
      console.log('Sign in successful for:', email);
    }
    
    return { error };
  };

  const signOut = async () => {
    console.log('Signing out user');
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
      console.log('Invitation details retrieved:', data);
      if (data && data.length > 0) {
        const invitation = data[0];
        console.log('Invitation validity check:', {
          is_active: invitation.is_active,
          expires_at: invitation.expires_at,
          used_at: invitation.used_at,
          is_valid: invitation.is_valid,
          role: invitation.role
        });
      }
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
