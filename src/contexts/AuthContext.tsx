
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../integrations/supabase/client';
import { User as AppUser, UserRole, Department } from '../types';
import { useToast } from '../components/ui/use-toast';

interface Permission {
  id: string;
  name: string;
  description: string;
  resource_type: string;
  action_type: string;
}

interface AdminSession {
  id: string;
  admin_user_id: string;
  impersonated_user_id?: string;
  impersonated_role?: string;
  is_active: boolean;
}

interface AuthContextType {
  user: AppUser | null;
  session: Session | null;
  permissions: Permission[];
  adminSession: AdminSession | null;
  loading: boolean;
  signUp: (email: string, password: string, userData: any) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<{ error: any }>;
  hasPermission: (permissionName: string, departmentId?: string) => boolean;
  switchToUserView: (userId: string, role?: string) => Promise<boolean>;
  exitImpersonation: () => Promise<boolean>;
  isImpersonating: boolean;
  refreshUserData: () => Promise<void>;
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
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [adminSession, setAdminSession] = useState<AdminSession | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadUserPermissions = async (userId: string) => {
    try {
      const { data: userPermissions, error } = await supabase
        .from('user_roles')
        .select(`
          role_permissions (
            permissions (*)
          )
        `)
        .eq('user_id', userId)
        .eq('is_active', true);

      if (error) {
        console.warn('Could not load user permissions:', error);
        return [];
      }

      const flatPermissions = userPermissions?.flatMap(ur => 
        ur.role_permissions?.map(rp => rp.permissions) || []
      ).filter(Boolean) || [];

      return flatPermissions;
    } catch (error) {
      console.error('Error loading permissions:', error);
      return [];
    }
  };

  const loadAdminSession = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('admin_sessions')
        .select('*')
        .eq('admin_user_id', userId)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.warn('Could not load admin session:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error loading admin session:', error);
      return null;
    }
  };

  const createProfileIfMissing = async (authUser: User) => {
    try {
      const { data: existingProfile, error: profileCheckError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .maybeSingle();

      if (profileCheckError) {
        console.error('Error checking existing profile:', profileCheckError);
      }

      if (existingProfile) {
        return existingProfile;
      }

      const metadata = authUser.user_metadata || {};
      const role = metadata.role || 'admin';
      const departmentString = metadata.department || 'ADMIN';
      
      const validDepartments: Department[] = ['CSE', 'ECE', 'MECH', 'CIVIL', 'EEE', 'IT', 'ADMIN'];
      const department: Department = validDepartments.includes(departmentString as Department) 
        ? departmentString as Department 
        : 'ADMIN';

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
        .maybeSingle();

      if (profileError) {
        console.error('Error creating profile:', profileError);
        return {
          id: authUser.id,
          name: authUser.email?.split('@')[0] || 'User',
          email: authUser.email,
          role: 'admin',
          department: 'ADMIN' as Department,
          employee_id: null,
          roll_number: null,
          is_active: true
        };
      }

      return newProfile;
    } catch (error) {
      console.error('Error in createProfileIfMissing:', error);
      return {
        id: authUser.id,
        name: authUser.email?.split('@')[0] || 'User',
        email: authUser.email,
        role: 'admin',
        department: 'ADMIN' as Department,
        employee_id: null,
        roll_number: null,
        is_active: true
      };
    }
  };

  const loadUserData = async (authUser: User) => {
    try {
      const profile = await createProfileIfMissing(authUser);
      const userPermissions = await loadUserPermissions(authUser.id);
      const adminSessionData = await loadAdminSession(authUser.id);

      if (profile) {
        const appUser: AppUser = {
          id: profile.id,
          name: profile.name,
          email: profile.email,
          role: profile.role as UserRole,
          department: profile.department as Department,
          rollNumber: profile.roll_number,
          studentId: profile.role === 'student' ? profile.id : undefined,
          facultyId: profile.role === 'faculty' ? profile.id : undefined,
          avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${profile.email}`
        };
        
        setUser(appUser);
        setPermissions(userPermissions);
        setAdminSession(adminSessionData);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!isMounted) return;
        
        setSession(session);
        
        if (session?.user) {
          await loadUserData(session.user);
        } else {
          setUser(null);
          setPermissions([]);
          setAdminSession(null);
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
      if (isMounted) {
        setLoading(false);
      }
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
      options: {
        data: userData
      }
    });

    if (!error) {
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
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    return { error };
  };

  const signOut = async () => {
    // Clear admin session if exists
    if (adminSession) {
      await supabase
        .from('admin_sessions')
        .update({ is_active: false })
        .eq('id', adminSession.id);
    }

    const { error } = await supabase.auth.signOut();
    return { error };
  };

  const hasPermission = (permissionName: string, departmentId?: string): boolean => {
    if (!user) return false;
    
    const hasDirectPermission = permissions.some(p => p.name === permissionName);
    
    if (!hasDirectPermission) return false;
    if (!departmentId) return true;
    
    // Check department-level permissions if needed
    return true; // Simplified for now
  };

  const switchToUserView = async (userId: string, role?: string): Promise<boolean> => {
    if (!user || !hasPermission('impersonate_users')) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to switch user views",
        variant: "destructive"
      });
      return false;
    }

    try {
      // End current admin session if exists
      if (adminSession) {
        await supabase
          .from('admin_sessions')
          .update({ is_active: false })
          .eq('id', adminSession.id);
      }

      // Create new admin session
      const { data, error } = await supabase
        .from('admin_sessions')
        .insert({
          admin_user_id: user.id,
          impersonated_user_id: userId,
          impersonated_role: role,
          is_active: true
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating admin session:', error);
        return false;
      }

      setAdminSession(data);
      
      toast({
        title: "View Switched",
        description: `Now viewing as ${role || 'user'}`,
      });

      // Refresh user data to reflect impersonation
      await refreshUserData();
      
      return true;
    } catch (error) {
      console.error('Error switching user view:', error);
      return false;
    }
  };

  const exitImpersonation = async (): Promise<boolean> => {
    if (!adminSession) return true;

    try {
      await supabase
        .from('admin_sessions')
        .update({ is_active: false })
        .eq('id', adminSession.id);

      setAdminSession(null);
      
      toast({
        title: "Impersonation Ended",
        description: "Returned to admin view",
      });

      await refreshUserData();
      
      return true;
    } catch (error) {
      console.error('Error ending impersonation:', error);
      return false;
    }
  };

  const refreshUserData = async () => {
    if (session?.user) {
      await loadUserData(session.user);
    }
  };

  const getInvitationDetails = async (email: string) => {
    const { data, error } = await supabase.rpc('get_invitation_details', {
      invitation_email: email
    });
    
    return { data: data?.[0], error };
  };

  const value = {
    user,
    session,
    permissions,
    adminSession,
    loading,
    signUp,
    signIn,
    signOut,
    hasPermission,
    switchToUserView,
    exitImpersonation,
    isImpersonating: !!adminSession?.impersonated_user_id,
    refreshUserData,
    getInvitationDetails
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
