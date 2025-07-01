
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
  phone?: string;
  address?: string;
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
  profileLoading: boolean;
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
  profileLoading: false,
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

// Enhanced caching system
const profileCache = new Map<string, UserProfile>();
const departmentCache = new Map<string, string>();

const getCachedProfile = (userId: string): UserProfile | null => {
  // Check memory cache first
  if (profileCache.has(userId)) {
    return profileCache.get(userId)!;
  }

  // Check sessionStorage
  try {
    const cached = sessionStorage.getItem(`profile_${userId}`);
    if (cached) {
      const profile = JSON.parse(cached);
      profileCache.set(userId, profile);
      return profile;
    }
  } catch (error) {
    console.error('Error reading cached profile:', error);
  }

  return null;
};

const setCachedProfile = (userId: string, profile: UserProfile) => {
  profileCache.set(userId, profile);
  try {
    sessionStorage.setItem(`profile_${userId}`, JSON.stringify(profile));
  } catch (error) {
    console.error('Error caching profile:', error);
  }
};

const loadDepartmentName = async (departmentId: string): Promise<string> => {
  // Check cache first
  if (departmentCache.has(departmentId)) {
    return departmentCache.get(departmentId)!;
  }

  // Check localStorage cache
  try {
    const cachedName = localStorage.getItem(`dept_${departmentId}`);
    if (cachedName) {
      departmentCache.set(departmentId, cachedName);
      return cachedName;
    }
  } catch (error) {
    console.error('Error reading cached department:', error);
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
      try {
        localStorage.setItem(`dept_${departmentId}`, deptName);
      } catch (error) {
        console.error('Error caching department:', error);
      }
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
  const [profileLoading, setProfileLoading] = useState(false);

  const loadUserProfileLazy = async (userId: string): Promise<UserProfile | null> => {
    try {
      setProfileLoading(true);
      console.log('Loading user profile for:', userId);

      // Check cache first for instant loading
      const cachedProfile = getCachedProfile(userId);
      if (cachedProfile) {
        console.log('Found cached profile:', cachedProfile);
        setUser(cachedProfile);
        setProfileLoading(false);
        
        // Refresh department name in background if needed
        if (cachedProfile.department_id) {
          loadDepartmentName(cachedProfile.department_id).then(deptName => {
            if (deptName !== cachedProfile.department_name) {
              const updatedProfile = { ...cachedProfile, department_name: deptName };
              setCachedProfile(userId, updatedProfile);
              setUser(updatedProfile);
            }
          });
        }
        
        return cachedProfile;
      }

      // Fetch basic profile without JOIN for speed
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError) {
        console.error('Error loading user profile:', profileError);
        setProfileLoading(false);
        return null;
      }

      console.log('Loaded profile data:', profileData);

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
        department: departmentCode,
        phone: profileData.phone || '',
        address: profileData.address || ''
      };

      console.log('Created user profile:', userProfile);

      // Cache the profile
      setCachedProfile(userId, userProfile);
      setUser(userProfile);
      setProfileLoading(false);

      return userProfile;
    } catch (error) {
      console.error('Error in loadUserProfileLazy:', error);
      setProfileLoading(false);
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
      profileCache.delete(currentSession.user.id);
      sessionStorage.removeItem(`profile_${currentSession.user.id}`);
      await loadUserProfileLazy(currentSession.user.id);
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
      setLoading(false); // Set loading to false immediately after auth check
      
      if (currentSession?.user) {
        console.log('User authenticated, loading profile...');
        // Load profile asynchronously without blocking UI
        setTimeout(() => {
          if (mounted) {
            loadUserProfileLazy(currentSession.user.id);
          }
        }, 0);
      } else {
        console.log('User not authenticated, clearing profile');
        setUser(null);
        setProfileLoading(false);
        // Clear all caches on logout
        profileCache.clear();
        departmentCache.clear();
        try {
          sessionStorage.clear();
        } catch (error) {
          console.error('Error clearing session storage:', error);
        }
      }
    });

    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        
        if (!mounted) return;

        console.log('Initial session:', initialSession?.user?.email);
        setSession(initialSession);
        setLoading(false); // Set loading to false immediately
        
        if (initialSession?.user) {
          console.log('Initial user found, loading profile...');
          // Load profile asynchronously
          setTimeout(() => {
            if (mounted) {
              loadUserProfileLazy(initialSession.user.id);
            }
          }, 0);
        }
      } catch (error) {
        console.error('Error getting initial session:', error);
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
      setProfileLoading(false);
      // Clear all caches
      profileCache.clear();
      departmentCache.clear();
      try {
        sessionStorage.clear();
      } catch (error) {
        console.error('Error clearing storage on signOut:', error);
      }
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
    profileLoading,
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
