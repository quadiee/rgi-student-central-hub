
import React from 'react';
import { useIsMobile } from '../hooks/use-mobile';
import FlexibleFacultyManagement from '../components/Faculty/FlexibleFacultyManagement';
import MobileFacultyLayout from '../components/Layout/MobileFacultyLayout';

const Faculty: React.FC = () => {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <MobileFacultyLayout>
        <FlexibleFacultyManagement />
      </MobileFacultyLayout>
    );
  }

  return <FlexibleFacultyManagement />;
};

export default Faculty;
