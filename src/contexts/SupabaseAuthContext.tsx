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
  switchRole: (newRole: string) => Promise<void>;
  logout: () => Promise<void>;
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

  // Use department_id (UUID) everywhere
  const createProfileIfMissing = async (authUser: User) => {
    try {
      // Check if profile exists
      const { data: existingProfile, error: profileCheckError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .maybeSingle();

      if (profileCheckError) {
        console.error('Error checking existing profile:', profileCheckError);
      }
      if (existingProfile) return existingProfile;

      // Get user metadata or use defaults
      const metadata = authUser.user_metadata || {};
      const role = metadata.role || 'admin';
      // Expect department_id (UUID) in metadata, fallback to null
      const department_id = metadata.department_id || null;

      // Create the profile
      const { data: newProfile, error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authUser.id,
          name: metadata.name || authUser.email?.split('@')[0] || 'User',
          email: authUser.email,
          role,
          department_id,
          employee_id: metadata.employee_id || null,
          roll_number: metadata.roll_number || null,
          is_active: true
        })
        .select()
        .maybeSingle();

      if (profileError) {
        console.error('Error creating profile:', profileError);
        // Return a basic profile object so user can still access the app
        return {
          id: authUser.id,
          name: authUser.email?.split('@')[0] || 'User',
          email: authUser.email,
          role: 'admin',
          department_id: null,
          employee_id: null,
          roll_number: null,
          is_active: true
        };
      }
      return newProfile;
    } catch (error) {
      console.error('Error in createProfileIfMissing:', error);
      // Return a basic profile so the user can still access the app
      return {
        id: authUser.id,
        name: authUser.email?.split('@')[0] || 'User',
        email: authUser.email,
        role: 'admin',
        department_id: null,
        employee_id: null,
        roll_number: null,
        is_active: true
      };
    }
  };

  useEffect(() => {
    let isMounted = true;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!isMounted) return;
        setSession(session);
        if (session?.user) {
          try {
            const profile = await createProfileIfMissing(session.user);
            if (profile && isMounted) {
              const appUser: AppUser = {
                id: profile.id,
                name: profile.name,
                email: profile.email,
                role: profile.role as UserRole,
                department_id: profile.department_id,
                rollNumber: profile.roll_number,
                studentId: profile.role === 'student' ? profile.id : undefined,
                facultyId: profile.role === 'faculty' ? profile.id : undefined,
                avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${profile.email}`
              };
              setUser(appUser);
            }
          } catch (error) {
            if (isMounted) {
              const basicUser: AppUser = {
                id: session.user.id,
                name: session.user.email?.split('@')[0] || 'User',
                email: session.user.email || '',
                role: 'admin',
                department_id: null,
                rollNumber: null,
                studentId: undefined,
                facultyId: undefined,
                avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${session.user.email}`
              };
              setUser(basicUser);
            }
          }
        } else {
          setUser(null);
        }
        if (isMounted) {
          setLoading(false);
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error('Error getting session:', error);
      }
      if (!session && isMounted) {
        setLoading(false);
      }
    });

    const loadingTimeout = setTimeout(() => {
      if (isMounted) setLoading(false);
    }, 3000);

    return () => {
      isMounted = false;
      subscription.unsubscribe();
      clearTimeout(loadingTimeout);
    };
  }, []);

  const signUp = async (email: string, password: string, userData: any) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: userData }
    });

    if (!error) {
      await supabase.rpc('mark_invitation_used', { invitation_email: email });
    }
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    return { error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  const switchRole = async (newRole: string) => {
    // TODO: call your Supabase function to update the user's role if needed
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  const getInvitationDetails = async (email: string) => {
    const { data, error } = await supabase.rpc('get_invitation_details', {
      invitation_email: email
    });
    return { data: data?.[0], error };
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      loading,
      signUp,
      signIn,
      signOut,
      switchRole,
      logout,
      getInvitationDetails,
    }}>
      {children}
    </AuthContext.Provider>
  );
};