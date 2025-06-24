
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

  const createProfileIfMissing = async (authUser: User) => {
    try {
      console.log('Creating profile for user:', authUser.email);
      
      // First check if profile exists
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (existingProfile) {
        console.log('Profile already exists:', existingProfile);
        return existingProfile;
      }

      // Get user metadata or use defaults
      const metadata = authUser.user_metadata || {};
      const role = metadata.role || 'admin'; // Default to admin for now
      const department = metadata.department || 'ADMIN';

      // Create the profile
      const { data: newProfile, error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authUser.id,
          name: metadata.name || authUser.email?.split('@')[0] || 'User',
          email: authUser.email,
          role: role,
          department: department,
          employee_id: metadata.employee_id || null,
          roll_number: metadata.roll_number || null,
          is_active: true
        })
        .select()
        .single();

      if (profileError) {
        console.error('Error creating profile:', profileError);
        // Return a basic profile object so user can still access the app
        return {
          id: authUser.id,
          name: authUser.email?.split('@')[0] || 'User',
          email: authUser.email,
          role: 'admin',
          department: 'ADMIN',
          employee_id: null,
          roll_number: null,
          is_active: true
        };
      }

      console.log('Profile created successfully:', newProfile);
      return newProfile;
    } catch (error) {
      console.error('Error in createProfileIfMissing:', error);
      // Return a basic profile so the user can still access the app
      return {
        id: authUser.id,
        name: authUser.email?.split('@')[0] || 'User',
        email: authUser.email,
        role: 'admin',
        department: 'ADMIN',
        employee_id: null,
        roll_number: null,
        is_active: true
      };
    }
  };

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        setSession(session);
        
        if (session?.user) {
          try {
            // Try to get existing profile or create one
            const profile = await createProfileIfMissing(session.user);
            
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
              console.log('User profile set:', appUser);
              setUser(appUser);
            }
          } catch (error) {
            console.error('Error setting up user profile:', error);
            // Set a basic user so they can still access the app
            const basicUser: AppUser = {
              id: session.user.id,
              name: session.user.email?.split('@')[0] || 'User',
              email: session.user.email || '',
              role: 'admin',
              department: 'ADMIN',
              rollNumber: null,
              studentId: undefined,
              facultyId: undefined,
              avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${session.user.email}`
            };
            setUser(basicUser);
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
    console.log('Signing up user with data:', userData);
    
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
