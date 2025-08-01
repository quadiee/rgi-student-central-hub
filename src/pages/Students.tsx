
import React from 'react';
import { useIsMobile } from '../hooks/use-mobile';
import { useAuth } from '../contexts/SupabaseAuthContext';
import StudentManagement from '../components/Students/StudentManagement';
import ChairmanStudentManagement from '../components/Mobile/ChairmanStudentManagement';

const Students: React.FC = () => {
  const isMobile = useIsMobile();
  const { user } = useAuth();

  // Use organized Chairman component on mobile
  if (isMobile && user?.role === 'chairman') {
    return <ChairmanStudentManagement />;
  }

  // Use regular component for desktop or other roles
  return <StudentManagement />;
};

export default Students;
