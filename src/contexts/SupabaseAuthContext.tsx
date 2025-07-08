
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
    avatar: string;
    rollNumber?: string;
    employeeId?: string;
    yearSection?: string;
    studentId?: string;
    facultyId?: string;
    isActive?: boolean;
    lastLogin?: string;
    createdAt?: string;
    phone?: string;
    address?: string;
    profile_photo_url?: string;
    roll_number?: string;
    employee_id?: string;
    created_at?: string;
  } | null;
  session: Session | null;
  loading: boolean;
  profileLoading?: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: any }>;
  signOut: () => Promise<{ error?: any }>;
  signUp: (email: string, password: string, userData?: any) => Promise<{ error?: any }>;
  updateProfile: (updates: any) => Promise<{ error?: any }>;
  refreshUser: () => Promise<void>;
  getInvitationDetails?: (email: string) => Promise<any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const SupabaseAuthProvider: React.FC<SupabaseAuthContextProps> = ({ children }) => {
  const [user, setUser] = useState<AuthContextType['user']>(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);
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
              avatar: profile.profile_photo_url || '',
              rollNumber: profile.roll_number,
              employeeId: profile.employee_id,
              yearSection: profile.year_section,
              studentId: session.user.id,
              facultyId: session.user.id,
              isActive: profile.is_active,
              lastLogin: profile.last_login,
              createdAt: profile.created_at,
              phone: profile.phone,
              address: profile.address,
              profile_photo_url: profile.profile_photo_url,
              roll_number: profile.roll_number,
              employee_id: profile.employee_id,
              created_at: profile.created_at,
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
      return { error: null };
    } catch (error: any) {
      console.error('Error signing in:', error);
      return { error };
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
      return { error: null };
    } catch (error: any) {
      console.error('Error signing out:', error);
      return { error };
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
        return { error };
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
          return { error: profileError };
        }
      }
      return { error: null };
    } catch (error: any) {
      console.error('Error during sign-up:', error);
      return { error };
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
        return { error };
      }

      setUser((prevUser: any) => ({ ...prevUser, ...updates }));
      return { error: null };
    } catch (error: any) {
      console.error('Error updating profile:', error);
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const refreshUser = async () => {
    setProfileLoading(true);
    try {
      if (session?.user) {
        const { data: profile, error } = await supabaseClient
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (!error && profile) {
          setUser({
            id: session.user.id,
            name: profile.name,
            email: profile.email,
            role: profile.role,
            department_id: profile.department_id,
            department_name: profile.department_id,
            avatar: profile.profile_photo_url || '',
            rollNumber: profile.roll_number,
            employeeId: profile.employee_id,
            yearSection: profile.year_section,
            studentId: session.user.id,
            facultyId: session.user.id,
            isActive: profile.is_active,
            lastLogin: profile.last_login,
            createdAt: profile.created_at,
            phone: profile.phone,
            address: profile.address,
            profile_photo_url: profile.profile_photo_url,
            roll_number: profile.roll_number,
            employee_id: profile.employee_id,
            created_at: profile.created_at,
          });
        }
      }
    } catch (error) {
      console.error('Error refreshing user:', error);
    } finally {
      setProfileLoading(false);
    }
  };

  const getInvitationDetails = async (email: string) => {
    try {
      const { data, error } = await supabaseClient
        .from('user_invitations')
        .select('*')
        .eq('email', email)
        .single();

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  };

  const value: AuthContextType = {
    user,
    session,
    loading,
    profileLoading,
    signIn,
    signOut,
    signUp,
    updateProfile,
    refreshUser,
    getInvitationDetails,
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
