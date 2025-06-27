
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';
import type { User } from '@supabase/supabase-js';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  department_id: string;
  department_name?: string;
  rollNumber?: string;
  employeeId?: string;
  profileImage?: string;
  isActive?: boolean;
  lastLogin?: string;
  createdAt?: string;
}

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  switchToUserView?: (userId: string, role: string) => Promise<boolean>;
  exitImpersonation?: () => Promise<boolean>;
  isImpersonating?: boolean;
  hasPermission?: (permission: string) => boolean;
  refreshUser: () => Promise<void>;
  switchRole?: (role: string) => void;
  logout?: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signIn: async () => {},
  signOut: async () => {},
  refreshUser: async () => {},
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isImpersonating, setIsImpersonating] = useState(false);

  const loadUserProfile = async (userId: string): Promise<UserProfile | null> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          departments:department_id (
            name,
            code
          )
        `)
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error loading user profile:', error);
        return null;
      }

      return {
        id: data.id,
        name: data.name,
        email: data.email,
        role: data.role,
        department_id: data.department_id,
        department_name: data.departments?.name || 'Unknown',
        rollNumber: data.roll_number,
        employeeId: data.employee_id,
        profileImage: data.profile_photo_url,
        isActive: data.is_active,
        createdAt: data.created_at,
      };
    } catch (error) {
      console.error('Error in loadUserProfile:', error);
      return null;
    }
  };

  const refreshUser = async () => {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (authUser) {
      const profile = await loadUserProfile(authUser.id);
      setUser(profile);
    }
  };

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      setLoading(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const profile = await loadUserProfile(session.user.id);
          setUser(profile);
        }
      } catch (error) {
        console.error('Error getting initial session:', error);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const profile = await loadUserProfile(session.user.id);
        setUser(profile);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setUser(null);
    setIsImpersonating(false);
  };

  const switchToUserView = async (userId: string, role: string): Promise<boolean> => {
    try {
      const profile = await loadUserProfile(userId);
      if (profile) {
        setUser(profile);
        setIsImpersonating(true);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error switching to user view:', error);
      return false;
    }
  };

  const exitImpersonation = async (): Promise<boolean> => {
    try {
      await refreshUser();
      setIsImpersonating(false);
      return true;
    } catch (error) {
      console.error('Error exiting impersonation:', error);
      return false;
    }
  };

  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    // Simple role-based permissions
    if (user.role === 'admin') return true;
    if (permission === 'impersonate_users') return user.role === 'admin';
    return false;
  };

  const switchRole = (role: string) => {
    if (user) {
      setUser({ ...user, role });
    }
  };

  const logout = () => {
    signOut();
  };

  const value: AuthContextType = {
    user,
    loading,
    signIn,
    signOut,
    switchToUserView,
    exitImpersonation,
    isImpersonating,
    hasPermission,
    refreshUser,
    switchRole,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
