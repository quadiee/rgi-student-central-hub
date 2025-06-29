
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

// Cache for department names to avoid repeated queries
const departmentCache = new Map<string, string>();

const loadDepartmentName = async (departmentId: string): Promise<string> => {
  // Check cache first
  if (departmentCache.has(departmentId)) {
    return departmentCache.get(departmentId)!;
  }

  // Check localStorage cache
  const cachedName = localStorage.getItem(`dept_${departmentId}`);
  if (cachedName) {
    departmentCache.set(departmentId, cachedName);
    return cachedName;
  }

  // Fetch from database
  try {
    const { data, error } = await supabase
      .from('departments')
      .select('name, code')
      .eq('id', departmentId)
      .single();

    if (!error && data) {
      const deptName = data.name || 'Unknown';
      departmentCache.set(departmentId, deptName);
      localStorage.setItem(`dept_${departmentId}`, deptName);
      return deptName;
    }
  } catch (error) {
    console.error('Error loading department:', error);
  }

  return 'Unknown';
};

export const SupabaseAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const loadUserProfile = async (userId: string): Promise<UserProfile | null> => {
    try {
      // Check session cache first
      const cachedProfile = sessionStorage.getItem(`profile_${userId}`);
      if (cachedProfile) {
        try {
          const parsed = JSON.parse(cachedProfile);
          // Use cached profile but refresh department name in background
          setTimeout(() => {
            if (parsed.department_id) {
              loadDepartmentName(parsed.department_id).then(deptName => {
                if (deptName !== parsed.department_name) {
                  // Update cache if department name changed
                  const updatedProfile = { ...parsed, department_name: deptName };
                  sessionStorage.setItem(`profile_${userId}`, JSON.stringify(updatedProfile));
                  setUser(updatedProfile);
                }
              });
            }
          }, 0);
          return parsed;
        } catch (e) {
          console.error('Error parsing cached profile:', e);
        }
      }

      // Fetch basic profile without JOIN first for speed
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError) {
        console.error('Error loading user profile:', profileError);
        return null;
      }

      // Load department name asynchronously
      let departmentName = 'Unknown';
      let departmentCode = 'Unknown';
      
      if (profileData.department_id) {
        try {
          departmentName = await loadDepartmentName(profileData.department_id);
          const { data: deptData } = await supabase
            .from('departments')
            .select('code')
            .eq('id', profileData.department_id)
            .single();
          if (deptData) {
            departmentCode = deptData.code;
          }
        } catch (error) {
          console.error('Error loading department details:', error);
        }
      }

      const userProfile: UserProfile = {
        ...profileData,
        role: profileData.role as 'student' | 'hod' | 'principal' | 'admin',
        department_name: departmentName,
        avatar: profileData.profile_photo_url || '',
        rollNumber: profileData.roll_number,
        department: departmentCode
      };

      // Cache the profile
      sessionStorage.setItem(`profile_${userId}`, JSON.stringify(userProfile));

      return userProfile;
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
      // Clear cache to force refresh
      sessionStorage.removeItem(`profile_${currentSession.user.id}`);
      const profile = await loadUserProfile(currentSession.user.id);
      setUser(profile);
      setSession(currentSession);
    }
  };

  useEffect(() => {
    let mounted = true;

    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      console.log('Auth state changed:', event, currentSession?.user?.email);
      
      if (!mounted) return;

      setSession(currentSession);
      
      if (currentSession?.user) {
        // Load profile asynchronously to avoid blocking UI
        setTimeout(async () => {
          if (mounted) {
            const profile = await loadUserProfile(currentSession.user.id);
            if (mounted) {
              setUser(profile);
            }
          }
        }, 0);
      } else {
        setUser(null);
        // Clear all caches on logout
        sessionStorage.clear();
        departmentCache.clear();
      }
      
      if (mounted) {
        setLoading(false);
      }
    });

    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        
        if (!mounted) return;

        setSession(initialSession);
        
        if (initialSession?.user) {
          // Load profile asynchronously
          setTimeout(async () => {
            if (mounted) {
              const profile = await loadUserProfile(initialSession.user.id);
              if (mounted) {
                setUser(profile);
              }
            }
          }, 0);
        }
      } catch (error) {
        console.error('Error getting initial session:', error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    getInitialSession();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
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
      // Clear all caches
      sessionStorage.clear();
      departmentCache.clear();
    }
    return { error };
  };

  const signUp = async (email: string, password: string, userData?: any) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData,
        emailRedirectTo: `${window.location.origin}/`
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

export const AuthProvider = SupabaseAuthProvider;
