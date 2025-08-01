
import React from 'react';
import { useAuth } from '../contexts/SupabaseAuthContext';
import { useIsMobile } from '../hooks/use-mobile';
import Dashboard from '../components/Dashboard/Dashboard';
import EnhancedMobileLayout from '../components/Mobile/EnhancedMobileLayout';
import ModernLayout from '../components/Layout/ModernLayout';

const Index: React.FC = () => {
  const { user, loading } = useAuth();
  const isMobile = useIsMobile();

  // EXTREME DEBUGGING FOR INDEX PAGE
  console.log('%c=== INDEX PAGE DEBUG ===', 'background: orange; color: white; font-size: 18px; padding: 10px;');
  console.log('Index - User:', user);
  console.log('Index - Loading:', loading);
  console.log('Index - IsMobile:', isMobile);
  console.log('Index - User Role:', user?.role);
  console.log('Index - Window location:', window.location.href);
  console.log('Index - Timestamp:', new Date().toISOString());

  if (loading) {
    console.log('%c INDEX LOADING STATE', 'background: blue; color: white; font-size: 16px;');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    console.log('%c INDEX NO USER - REDIRECTING', 'background: red; color: white; font-size: 16px;');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg">Please log in to continue</p>
        </div>
      </div>
    );
  }

  // FORCE MOBILE LAYOUT FOR CHAIRMAN ON MOBILE
  if (isMobile) {
    console.log('%c INDEX - RENDERING MOBILE LAYOUT', 'background: purple; color: white; font-size: 16px;');
    return <EnhancedMobileLayout />;
  }

  // DESKTOP LAYOUT
  console.log('%c INDEX - RENDERING DESKTOP LAYOUT', 'background: green; color: white; font-size: 16px;');
  return (
    <ModernLayout>
      <Dashboard />
    </ModernLayout>
  );
};

export default Index;
