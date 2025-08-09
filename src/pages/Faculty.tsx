
import React from 'react';
import { useAuth } from '../contexts/SupabaseAuthContext';
import FacultyManagement from '../components/Faculty/FacultyManagement';
import ChairmanFacultyManagement from '../components/Mobile/ChairmanFacultyManagement';
import { useIsMobile } from '../hooks/use-mobile';

const Faculty: React.FC = () => {
  const { user } = useAuth();
  const isMobile = useIsMobile();

  if (!user) return null;

  // For Chairman on mobile, use the specialized component
  if (isMobile && user.role === 'chairman') {
    return <ChairmanFacultyManagement />;
  }

  // For mobile (non-chairman users) and desktop - no layout wrapper needed
  // ModernLayout is already handled at the app level
  return <FacultyManagement />;
};

export default Faculty;
