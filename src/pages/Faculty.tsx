
import React from 'react';
import { useIsMobile } from '../hooks/use-mobile';
import { useAuth } from '../contexts/SupabaseAuthContext';
import StreamlinedFacultyManagement from '../components/Faculty/StreamlinedFacultyManagement';
import ChairmanFacultyManagement from '../components/Mobile/ChairmanFacultyManagement';

const Faculty: React.FC = () => {
  const isMobile = useIsMobile();
  const { user } = useAuth();

  // Use organized Chairman component on mobile
  if (isMobile && user?.role === 'chairman') {
    return <ChairmanFacultyManagement />;
  }

  // Use regular component for desktop or other roles
  return <StreamlinedFacultyManagement />;
};

export default Faculty;
