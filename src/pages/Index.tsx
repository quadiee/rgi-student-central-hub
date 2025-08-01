
import React from 'react';
import { useAuth } from '../contexts/SupabaseAuthContext';
import { useIsMobile } from '../hooks/use-mobile';
import EnhancedMobileLayout from '../components/Mobile/EnhancedMobileLayout';
import Dashboard from '../components/Dashboard/Dashboard';

const Index: React.FC = () => {
  const { user, loading } = useAuth();
  const isMobile = useIsMobile();

  console.log('🏠 Index.tsx - Rendering with:', {
    user: user ? { id: user.id, role: user.role, name: user.name } : null,
    loading,
    isMobile,
    currentPath: window.location.pathname
  });

  if (loading) {
    console.log('🏠 Index.tsx - Still loading, showing loading state');
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2">Authenticating...</span>
      </div>
    );
  }

  if (!user) {
    console.log('🏠 Index.tsx - No user found, should redirect to auth');
    return null;
  }

  console.log('🏠 Index.tsx - About to render layout:', { isMobile, userRole: user.role });

  if (isMobile) {
    console.log('🏠 Index.tsx - Rendering EnhancedMobileLayout for mobile');
    return <EnhancedMobileLayout />;
  }

  console.log('🏠 Index.tsx - Rendering Desktop Dashboard');
  return <Dashboard />;
};

export default Index;
