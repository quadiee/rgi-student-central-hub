
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../integrations/supabase/client';
import { EnhancedUser, Permission, UserRole, Department } from '../types/enhancedTypes';
import { useToast } from '../components/ui/use-toast';

interface EnhancedAuthContextType {
  user: EnhancedUser | null;
  permissions: Permission[];
  userRoles: UserRole[];
  departments: Department[];
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  hasPermission: (permissionName: string, departmentId?: string) => boolean;
  refreshUserData: () => Promise<void>;
}

const EnhancedAuthContext = createContext<EnhancedAuthContextType | undefined>(undefined);

export const useEnhancedAuth = () => {
  const context = useContext(EnhancedAuthContext);
  if (!context) {
    throw new Error('useEnhancedAuth must be used within an EnhancedAuthProvider');
  }
  return context;
};

export const EnhancedAuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<EnhancedUser | null>(null);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Load user data including permissions and roles
  const loadUserData = async (userId: string) => {
    try {
      // Load user profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select(`
          *,
          departments:department_id (*)
        `)
        .eq('id', userId)
        .single();

      if (profileError) throw profileError;

      // Load user roles
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select(`
          *,
          roles (name, description),
          departments (name, code)
        `)
        .eq('user_id', userId)
        .eq('is_active', true);

      if (rolesError) throw rolesError;

      // Load user permissions through roles
      const { data: userPermissionsData, error: permissionsError } = await supabase
        .from('user_roles')
        .select(`
          role_permissions (
            permissions (*)
         )
        `)
        .eq('user_id', userId)
        .eq('is_active', true);

      // If there was an error fetching permissions, log and use empty array
      if (permissionsError) {
        console.warn('Could not load user permissions:', permissionsError.message);
        setPermissions([]);
      } else {
        // Now safe to flatten and extract Permission objects
        const flatPermissions: Permission[] = (userPermissionsData ?? [])
          .flatMap(ur =>
            ur.role_permissions?.map(rp => rp.permissions) ?? []
          )
          .filter(Boolean);

        setPermissions(flatPermissions);
      }

      setUser({
        id: profile.id,
        name: profile.name,
        email: profile.email,
        role: profile.role,
        department: profile.department,
        department_id: profile.department_id,
        rollNumber: profile.roll_number,
        employeeId: profile.employee_id,
        profileImage: profile.profile_photo_url,
        permissions: flatPermissions.map(p => p?.name).filter(Boolean),
        userRoles: roles || [],
        departmentDetails: profile.departments
      });

      setPermissions(flatPermissions);
      setUserRoles(roles || []);

    } catch (error) {
      console.error('Error loading user data:', error);
      toast({
        title: "Error",
        description: "Failed to load user data",
        variant: "destructive",
      });
    }
  };

  // Load departments
  const loadDepartments = async () => {
    try {
      const { data, error } = await supabase
        .from('departments')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setDepartments(data || []);
    } catch (error) {
      console.error('Error loading departments:', error);
    }
  };

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          await loadUserData(session.user.id);
        }
        
        await loadDepartments();
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        await loadUserData(session.user.id);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setPermissions([]);
        setUserRoles([]);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        await loadUserData(data.user.id);
      }

      toast({
        title: "Success",
        description: "Logged in successfully",
      });
    } catch (error: any) {
      console.error('Login error:', error);
      toast({
        title: "Login Failed",
        description: error.message || "Please check your credentials",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setPermissions([]);
      setUserRoles([]);
      
      toast({
        title: "Logged Out",
        description: "You have been logged out successfully",
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const hasPermission = (permissionName: string, departmentId?: string): boolean => {
    if (!user) return false;
    
    // Check if user has the permission
    const hasDirectPermission = permissions.some(p => p.name === permissionName);
    
    if (!hasDirectPermission) return false;
    
    // If no department specified, return true
    if (!departmentId) return true;
    
    // Check if user has role in the specified department or has global role
    return userRoles.some(role => 
      role.is_active && (
        role.department_id === departmentId || 
        role.department_id === null // Global role
      )
    );
  };

  const refreshUserData = async () => {
    if (user) {
      await loadUserData(user.id);
    }
  };

  const value = {
    user,
    permissions,
    userRoles,
    departments,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    hasPermission,
    refreshUserData,
  };

  return (
    <EnhancedAuthContext.Provider value={value}>
      {children}
    </EnhancedAuthContext.Provider>
  );
};
