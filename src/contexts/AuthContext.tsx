
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole } from '../types';
import { mockUsers } from '../data/mockData';

interface AuthContextType {
  user: User | null;
  login: (email: string, role: UserRole) => Promise<void>;
  logout: () => void;
  switchRole: (role: UserRole) => void;
  isLoading: boolean;
  isAuthenticated: boolean;
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
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state from localStorage on app start
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const savedUser = localStorage.getItem('rgce_user');
        const rememberMe = localStorage.getItem('rgce_remember_me');
        
        if (savedUser && rememberMe) {
          const userData = JSON.parse(savedUser);
          setUser(userData);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        // Clear corrupted data
        localStorage.removeItem('rgce_user');
        localStorage.removeItem('rgce_remember_me');
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Auto-logout after 24 hours of inactivity
  useEffect(() => {
    if (user) {
      const lastActivity = localStorage.getItem('rgce_last_activity');
      const now = Date.now();
      const twentyFourHours = 24 * 60 * 60 * 1000;

      if (lastActivity && (now - parseInt(lastActivity)) > twentyFourHours) {
        logout();
        return;
      }

      // Update last activity
      localStorage.setItem('rgce_last_activity', now.toString());

      // Set up activity tracking
      const updateActivity = () => {
        localStorage.setItem('rgce_last_activity', Date.now().toString());
      };

      const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
      events.forEach(event => {
        document.addEventListener(event, updateActivity, true);
      });

      return () => {
        events.forEach(event => {
          document.removeEventListener(event, updateActivity, true);
        });
      };
    }
  }, [user]);

  const login = async (email: string, role: UserRole): Promise<void> => {
    setIsLoading(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Find user by email and role, or create a mock user
      let foundUser = mockUsers.find(u => u.email === email && u.role === role);
      
      if (!foundUser) {
        // Create a mock user for demo purposes
        foundUser = {
          id: Date.now().toString(),
          name: email.split('@')[0].replace('.', ' ').replace(/\b\w/g, l => l.toUpperCase()),
          email,
          role,
          department: role === 'student' ? 'CSE' : 'Computer Science',
          rollNumber: role === 'student' ? '21CSE001' : undefined,
          yearSection: role === 'student' ? '3rd Year - A' : undefined,
          attendancePercentage: role === 'student' ? 85 : undefined,
          avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${email}`,
        };
      }

      setUser(foundUser);
      
      // Save to localStorage for persistence
      localStorage.setItem('rgce_user', JSON.stringify(foundUser));
      localStorage.setItem('rgce_last_activity', Date.now().toString());
      
    } catch (error) {
      console.error('Login error:', error);
      throw new Error('Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    // Clear all auth-related data from localStorage
    localStorage.removeItem('rgce_user');
    localStorage.removeItem('rgce_remember_me');
    localStorage.removeItem('rgce_last_activity');
  };

  const switchRole = (role: UserRole) => {
    if (user) {
      const updatedUser = { ...user, role };
      setUser(updatedUser);
      localStorage.setItem('rgce_user', JSON.stringify(updatedUser));
    }
  };

  const value = {
    user,
    login,
    logout,
    switchRole,
    isLoading,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
