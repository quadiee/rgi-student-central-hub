
import React from 'react';
import { useAuth } from '../contexts/SupabaseAuthContext';
import { useIsMobile } from '../hooks/use-mobile';
import EnhancedMobileLayout from '../components/Mobile/EnhancedMobileLayout';
import ModernLayout from '../components/Layout/ModernLayout';
import FacultyMobileDashboard from '../components/Mobile/dashboards/FacultyMobileDashboard';
import FacultyDesktopDashboard from '../components/Faculty/FacultyDesktopDashboard';

const FacultyDashboard: React.FC = () => {
  const { user } = useAuth();
  const isMobile = useIsMobile();

  if (!user || user.role !== 'faculty') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-2">Access Denied</h1>
          <p className="text-gray-600">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  if (isMobile) {
    return (
      <EnhancedMobileLayout>
        <FacultyMobileDashboard />
      </EnhancedMobileLayout>
    );
  }

  return (
    <ModernLayout>
      <FacultyDesktopDashboard />
    </ModernLayout>
  );
};

export default FacultyDashboard;
