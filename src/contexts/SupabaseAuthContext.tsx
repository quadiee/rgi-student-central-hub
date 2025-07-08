import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Session, useSession, useSupabaseClient } from '@supabase/auth-helpers-react';
import { Database } from '../integrations/supabase/types';
import { User } from '../types';

interface SupabaseAuthContextProps {
  children: ReactNode;
}

interface AuthContextType {
  user: {
    id: string;
    name: string;
    email: string;
    role: 'student' | 'hod' | 'principal' | 'admin' | 'chairman';
    department_id: string;
    department_name?: string;
    avatar?: string;
    rollNumber?: string;
    employeeId?: string;
    yearSection?: string;
    studentId?: string;
    facultyId?: string;
    isActive?: boolean;
    lastLogin?: string;
    createdAt?: string;
  } | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  signUp: (email: string, password: string, userData?: any) => Promise<void>;
  updateProfile: (updates: any) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const SupabaseAuthProvider: React.FC<SupabaseAuthContextProps> = ({ children }) => {
  const [user, setUser] = useState<AuthContextType['user']>(null);
  const [loading, setLoading] = useState(true);
  const session = useSession();
  const supabaseClient = useSupabaseClient<Database>();

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      if (session?.user) {
        try {
          const { data: profile, error } = await supabaseClient
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (error) {
            console.error('Error fetching profile:', error);
            setUser(null);
          } else if (profile) {
            setUser({
              id: session.user.id,
              name: profile.name,
              email: profile.email,
              role: profile.role,
              department_id: profile.department_id,
              department_name: profile.department_id,
              avatar: profile.profile_photo_url,
              rollNumber: profile.roll_number,
              employeeId: profile.employee_id,
              yearSection: profile.year_section,
              studentId: session.user.id,
              facultyId: session.user.id,
              isActive: profile.is_active,
              lastLogin: profile.last_login,
              createdAt: profile.created_at,
            });
          } else {
            setUser(null);
          }
        } catch (error) {
          console.error('Unexpected error fetching profile:', error);
          setUser(null);
        } finally {
          setLoading(false);
        }
      } else {
        setUser(null);
        setLoading(false);
      }
    };

    fetchUser();
  }, [session, supabaseClient]);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { error } = await supabaseClient.auth.signInWithPassword({ email, password });
      if (error) throw error;
    } catch (error: any) {
      console.error('Error signing in:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      const { error } = await supabaseClient.auth.signOut();
      if (error) throw error;
      setUser(null);
    } catch (error: any) {
      console.error('Error signing out:', error);
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, userData: any = {}) => {
    setLoading(true);
    try {
      const { data, error } = await supabaseClient.auth.signUp({
        email,
        password,
        options: {
          data: {
            ...userData,
          },
        },
      });

      if (error) {
        console.error('Error signing up:', error);
        throw error;
      }

      if (data.user) {
        const { error: profileError } = await supabaseClient
          .from('profiles')
          .insert([
            {
              id: data.user.id,
              email: data.user.email,
              ...userData,
            },
          ]);

        if (profileError) {
          console.error('Error creating profile:', profileError);
          throw profileError;
        }
      }
    } catch (error: any) {
      console.error('Error during sign-up:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: any) => {
    setLoading(true);
    try {
      const { error } = await supabaseClient
        .from('profiles')
        .update(updates)
        .eq('id', session?.user.id);

      if (error) {
        console.error('Error updating profile:', error);
        throw error;
      }

      setUser((prevUser: any) => ({ ...prevUser, ...updates }));
    } catch (error: any) {
      console.error('Error updating profile:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    session,
    loading,
    signIn,
    signOut,
    signUp,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within a SupabaseAuthProvider');
  }
  return context;
};
