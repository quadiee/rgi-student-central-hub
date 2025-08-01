
import React from 'react';
import { useAuth } from '../contexts/SupabaseAuthContext';
import FacultyManagement from '../components/Faculty/FacultyManagement';
import ChairmanFacultyManagement from '../components/Mobile/ChairmanFacultyManagement';
import EnhancedMobileLayout from '../components/Mobile/EnhancedMobileLayout';
import ModernLayout from '../components/Layout/ModernLayout';
import { useIsMobile } from '../hooks/use-mobile';

const Faculty: React.FC = () => {
  const { user } = useAuth();
  const isMobile = useIsMobile();

  if (!user) return null;

  // For Chairman on mobile, use the specialized component
  if (isMobile && user.role === 'chairman') {
    return (
      <EnhancedMobileLayout>
        <ChairmanFacultyManagement />
      </EnhancedMobileLayout>
    );
  }

  // For mobile (non-chairman users)
  if (isMobile) {
    return (
      <EnhancedMobileLayout>
        <FacultyManagement />
      </EnhancedMobileLayout>
    );
  }

  // For desktop
  return (
    <ModernLayout>
      <FacultyManagement />
    </ModernLayout>
  );
};

export default Faculty;
