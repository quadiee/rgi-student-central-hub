
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/SupabaseAuthContext';
import { useLocation } from 'react-router-dom';
import AdaptiveMobileHeader from './AdaptiveMobileHeader';
import SmartBottomNav from './SmartBottomNav';
import MobileFloatingActions from './MobileFloatingActions';
import RoleDashboard from './RoleDashboard';
import { cn } from '../../lib/utils';

interface EnhancedMobileLayoutProps {
  children?: React.ReactNode;
}

const EnhancedMobileLayout: React.FC<EnhancedMobileLayoutProps> = ({ children }) => {
  const { user } = useAuth();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);

  console.log('EnhancedMobileLayout - User:', user);
  console.log('EnhancedMobileLayout - Location:', location.pathname);
  console.log('EnhancedMobileLayout - Children provided:', !!children);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const getRoleTheme = () => {
    switch (user?.role) {
      case 'chairman':
        return 'bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950 dark:to-blue-950';
      case 'admin':
        return 'bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950 dark:to-orange-950';
      case 'principal':
        return 'bg-gradient-to-br from-green-50 to-teal-50 dark:from-green-950 dark:to-teal-950';
      case 'hod':
        return 'bg-gradient-to-br from-orange-50 to-yellow-50 dark:from-orange-950 dark:to-yellow-950';
      case 'faculty':
        return 'bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-950 dark:to-blue-950';
      case 'student':
        return 'bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950';
      default:
        return 'bg-gray-50 dark:bg-gray-950';
    }
  };

  // For Chairman role, only show default header for specific routes
  const shouldShowDefaultHeader = user?.role !== 'chairman' || 
    (user?.role === 'chairman' && (location.pathname === '/dashboard' || location.pathname === '/'));

  console.log('EnhancedMobileLayout - Should show header:', shouldShowDefaultHeader);

  return (
    <div className={cn(
      "lg:hidden min-h-screen relative",
      getRoleTheme()
    )}>
      {shouldShowDefaultHeader && (
        <AdaptiveMobileHeader 
          isScrolled={isScrolled} 
          currentRoute={location.pathname}
        />
      )}
      
      <main className={cn(
        "relative min-h-screen",
        shouldShowDefaultHeader ? "pt-16 pb-20" : "pb-20"
      )}>
        <div className="animate-fade-in">
          {/* Use children if provided, otherwise use RoleDashboard */}
          {children || <RoleDashboard />}
        </div>
      </main>

      <SmartBottomNav currentRoute={location.pathname} />
      <MobileFloatingActions currentRoute={location.pathname} />
      
      {/* Scroll indicator */}
      {isScrolled && shouldShowDefaultHeader && (
        <div className="fixed top-16 left-0 right-0 h-1 bg-gradient-to-r from-primary/20 via-primary to-primary/20 z-30 animate-pulse" />
      )}
    </div>
  );
};

export default EnhancedMobileLayout;
