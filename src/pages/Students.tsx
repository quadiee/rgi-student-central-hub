
import React from 'react';
import { useAuth } from '../contexts/SupabaseAuthContext';
import StudentManagement from '../components/Students/StudentManagement';
import ChairmanStudentManagement from '../components/Mobile/ChairmanStudentManagement';
import { useIsMobile } from '../hooks/use-mobile';

const Students: React.FC = () => {
  const { user } = useAuth();
  const isMobile = useIsMobile();

  if (!user) return null;

  // For Chairman on mobile, use the specialized component
  if (isMobile && user.role === 'chairman') {
    return <ChairmanStudentManagement />;
  }

  // For mobile (non-chairman users) and desktop - no layout wrapper needed
  // ModernLayout is already handled at the app level
  return <StudentManagement />;
};

export default Students;
