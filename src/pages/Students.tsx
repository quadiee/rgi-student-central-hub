
import React from 'react';
import { useAuth } from '../contexts/SupabaseAuthContext';
import StudentManagement from '../components/Students/StudentManagement';
import ChairmanStudentManagement from '../components/Mobile/ChairmanStudentManagement';
import EnhancedMobileLayout from '../components/Mobile/EnhancedMobileLayout';
import ModernLayout from '../components/Layout/ModernLayout';
import { useIsMobile } from '../hooks/use-mobile';

const Students: React.FC = () => {
  const { user } = useAuth();
  const isMobile = useIsMobile();

  if (!user) return null;

  // For Chairman on mobile, use the specialized component
  if (isMobile && user.role === 'chairman') {
    return (
      <EnhancedMobileLayout>
        <ChairmanStudentManagement />
      </EnhancedMobileLayout>
    );
  }

  // For mobile (non-chairman users)
  if (isMobile) {
    return (
      <EnhancedMobileLayout>
        <StudentManagement />
      </EnhancedMobileLayout>
    );
  }

  // For desktop
  return (
    <ModernLayout>
      <StudentManagement />
    </ModernLayout>
  );
};

export default Students;
