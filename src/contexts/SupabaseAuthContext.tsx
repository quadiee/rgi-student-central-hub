
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../integrations/supabase/client';
import { useToast } from '../components/ui/use-toast';

interface Profile {
  id: string;
  name: string;
  email: string;
  role: string;
  department_id?: string;
  department_name?: string;
  is_active: boolean;
  profile_completed?: boolean;
  roll_number?: string;
  employee_id?: string;
  phone?: string;
  address?: string;
  profile_photo_url?: string;
  created_at?: string;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  profileLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: any }>;
  signUp: (email: string, password: string, metadata?: any) => Promise<{ error?: any }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  getInvitationDetails: (email: string) => Promise<any>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within a SupabaseAuthProvider');
  }
  return context;
};

export const SupabaseAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);
  const { toast } = useToast();

  const fetchProfile = async (userId: string) => {
    try {
      setProfileLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          departments(name)
        `)
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Profile fetch error:', error);
        setProfile(null);
        return;
      }

      // Transform the data to include department_name
      const profileWithDepartment = {
        ...data,
        department_name: data.departments?.name || null
      };

      setProfile(profileWithDepartment);
    } catch (error) {
      console.error('Profile fetch error:', error);
      setProfile(null);
    } finally {
      setProfileLoading(false);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      return { error };
    } catch (error) {
      return { error };
    }
  };

  const signUp = async (email: string, password: string, metadata?: any) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
          emailRedirectTo: `${window.location.origin}/auth`
        }
      });
      return { error };
    } catch (error) {
      return { error };
    }
  };

  const getInvitationDetails = async (email: string) => {
    try {
      const { data, error } = await supabase
        .from('user_invitations')
        .select('*')
        .eq('email', email)
        .eq('is_active', true)
        .single();
      
      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Sign out error:', error);
        toast({
          title: "Sign Out Error",
          description: error.message,
          variant: "destructive"
        });
      } else {
        setUser(null);
        setProfile(null);
        toast({
          title: "Signed Out",
          description: "You have been signed out successfully."
        });
      }
    } catch (error) {
      console.error('Sign out error:', error);
      toast({
        title: "Sign Out Error",
        description: "An error occurred while signing out.",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Session error:', error);
        }
        
        if (session?.user) {
          setUser(session.user);
          await fetchProfile(session.user.id);
        }
      } catch (error) {
        console.error('Initial session error:', error);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        
        if (session?.user) {
          setUser(session.user);
          await fetchProfile(session.user.id);
        } else {
          setUser(null);
          setProfile(null);
        }
        
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const value = {
    user,
    profile,
    loading,
    profileLoading,
    signIn,
    signUp,
    signOut,
    refreshProfile,
    getInvitationDetails
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
