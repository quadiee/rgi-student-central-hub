
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../integrations/supabase/client';

interface SupabaseAuthContextProps {
  children: ReactNode;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'hod' | 'principal' | 'admin' | 'chairman' | 'faculty';
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
}

interface AuthContextType {
  user: UserProfile | null;
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
  const [user, setUser] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Debounced profile fetch to prevent race conditions
  const [profileFetchTimeout, setProfileFetchTimeout] = useState<NodeJS.Timeout | null>(null);

  const fetchUserProfile = async (userId: string): Promise<UserProfile | null> => {
    try {
      console.log('Fetching profile for user:', userId);
      
      // Clear any existing timeout
      if (profileFetchTimeout) {
        clearTimeout(profileFetchTimeout);
      }

      const { data: profile, error } = await supabase
        .from('profiles')
        .select(`
          id,
          name,
          email,
          role,
          department_id,
          phone,
          address,
          profile_photo_url,
          roll_number,
          employee_id,
          year,
          year_section,
          is_active,
          last_login,
          created_at,
          departments:department_id (
            name,
            code
          )
        `)
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return null;
      }

      console.log('Profile fetched successfully:', profile);
      
      return {
        id: userId,
        name: profile.name || profile.email,
        email: profile.email,
        role: profile.role,
        department_id: profile.department_id,
        department_name: profile.departments?.name,
        avatar: profile.profile_photo_url || '',
        rollNumber: profile.roll_number,
        employeeId: profile.employee_id,
        yearSection: profile.year_section,
        studentId: userId,
        facultyId: userId,
        isActive: profile.is_active,
        lastLogin: profile.last_login,
        createdAt: profile.created_at,
        phone: profile.phone,
        address: profile.address,
        profile_photo_url: profile.profile_photo_url,
        roll_number: profile.roll_number,
        employee_id: profile.employee_id,
        created_at: profile.created_at,
      };
    } catch (error) {
      console.error('Unexpected error fetching profile:', error);
      return null;
    }
  };

  const debouncedFetchProfile = (userId: string) => {
    // Clear any existing timeout
    if (profileFetchTimeout) {
      clearTimeout(profileFetchTimeout);
    }

    // Set a new timeout to fetch profile after 100ms
    const timeout = setTimeout(async () => {
      setProfileLoading(true);
      const profile = await fetchUserProfile(userId);
      setUser(profile);
      setProfileLoading(false);
    }, 100);

    setProfileFetchTimeout(timeout);
  };

  useEffect(() => {
    let mounted = true;
    
    console.log('Setting up auth state listener');
    
    // Initialize auth state
    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        console.log('Initial session check:', { session: !!session, error });
        
        if (!mounted) return;
        
        setSession(session);
        
        if (session?.user) {
          debouncedFetchProfile(session.user.id);
        } else {
          setUser(null);
          setProfileLoading(false);
        }
        
        if (mounted) {
          setLoading(false);
          setIsInitialized(true);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        if (mounted) {
          setLoading(false);
          setIsInitialized(true);
        }
      }
    };

    // Listen for auth changes with proper debouncing
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, { session: !!session });
      
      if (!mounted || !isInitialized) return;
      
      setSession(session);
      
      if (session?.user) {
        debouncedFetchProfile(session.user.id);
      } else {
        setUser(null);
        setProfileLoading(false);
      }
      
      if (mounted) {
        setLoading(false);
      }
    });

    // Initialize only once
    if (!isInitialized) {
      initializeAuth();
    }

    return () => {
      mounted = false;
      if (profileFetchTimeout) {
        clearTimeout(profileFetchTimeout);
      }
      console.log('Cleaning up auth listener');
      subscription.unsubscribe();
    };
  }, [isInitialized]);

  const signIn = async (email: string, password: string) => {
    console.log('Sign in attempt for:', email);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ 
        email, 
        password 
      });
      
      console.log('Sign in response:', { data: !!data, error });
      
      if (error) {
        console.error('Sign in error:', error);
        return { error };
      }
      
      return { error: null };
    } catch (error: any) {
      console.error('Sign in exception:', error);
      return { error };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // Clear state immediately
      setUser(null);
      setSession(null);
      setProfileLoading(false);
      
      return { error: null };
    } catch (error: any) {
      console.error('Error signing out:', error);
      return { error };
    }
  };

  const signUp = async (email: string, password: string, userData: any = {}) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            ...userData,
          },
        },
      });

      if (error) {
        console.error('Error signing up:', error);
        return { error };
      }

      return { error: null };
    } catch (error: any) {
      console.error('Error during sign-up:', error);
      return { error };
    }
  };

  const updateProfile = async (updates: any) => {
    try {
      const { error } = await supabase
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
    }
  };

  const refreshUser = async () => {
    if (session?.user) {
      setProfileLoading(true);
      const profile = await fetchUserProfile(session.user.id);
      setUser(profile);
      setProfileLoading(false);
    }
  };

  const getInvitationDetails = async (email: string) => {
    try {
      const { data, error } = await supabase
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
