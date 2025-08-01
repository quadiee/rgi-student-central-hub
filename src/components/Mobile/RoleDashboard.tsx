
import React from 'react';
import { useAuth } from '../../contexts/SupabaseAuthContext';
import ChairmanMobileDashboard from './dashboards/ChairmanMobileDashboard';
import AdminMobileDashboard from './dashboards/AdminMobileDashboard';
import PrincipalMobileDashboard from './dashboards/PrincipalMobileDashboard';
import HODMobileDashboard from './dashboards/HODMobileDashboard';
import FacultyMobileDashboard from './dashboards/FacultyMobileDashboard';
import StudentMobileDashboard from './dashboards/StudentMobileDashboard';

// Import the organized Chairman components
import ChairmanStudentManagement from './ChairmanStudentManagement';
import ChairmanFacultyManagement from './ChairmanFacultyManagement';
import MobileFeeManagementHub from '../Fees/MobileFeeManagementHub';
import { useLocation } from 'react-router-dom';

const RoleDashboard: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();

  console.log('🏛️ RoleDashboard - Rendering with:', {
    user: user ? { id: user.id, role: user.role, name: user.name } : null,
    currentPath: location.pathname
  });

  if (!user) {
    console.log('🏛️ RoleDashboard - No user found, returning null');
    return null;
  }

  // For Chairman role, use organized components based on current route
  if (user.role === 'chairman') {
    console.log('🏛️ RoleDashboard - Chairman role detected, routing based on path:', location.pathname);
    
    switch (location.pathname) {
      case '/students':
        console.log('🏛️ RoleDashboard - Rendering ChairmanStudentManagement');
        return <ChairmanStudentManagement />;
      case '/faculty':
        console.log('🏛️ RoleDashboard - Rendering ChairmanFacultyManagement');
        return <ChairmanFacultyManagement />;
      case '/fees':
        console.log('🏛️ RoleDashboard - Rendering MobileFeeManagementHub');
        return <MobileFeeManagementHub />;
      default:
        console.log('🏛️ RoleDashboard - Default case for Chairman, rendering ChairmanMobileDashboard');
        return <ChairmanMobileDashboard />;
    }
  }

  // For other roles, use their respective dashboards
  const renderDashboard = () => {
    console.log('🏛️ RoleDashboard - Rendering dashboard for role:', user.role);
    
    switch (user.role) {
      case 'admin':
        console.log('🏛️ RoleDashboard - Rendering AdminMobileDashboard');
        return <AdminMobileDashboard />;
      case 'principal':
        console.log('🏛️ RoleDashboard - Rendering PrincipalMobileDashboard');
        return <PrincipalMobileDashboard />;
      case 'hod':
        console.log('🏛️ RoleDashboard - Rendering HODMobileDashboard');
        return <HODMobileDashboard />;
      case 'faculty':
        console.log('🏛️ RoleDashboard - Rendering FacultyMobileDashboard');
        return <FacultyMobileDashboard />;
      case 'student':
        console.log('🏛️ RoleDashboard - Rendering StudentMobileDashboard');
        return <StudentMobileDashboard />;
      default:
        console.log('🏛️ RoleDashboard - Default case, rendering StudentMobileDashboard');
        return <StudentMobileDashboard />;
    }
  };

  return (
    <div className="animate-fade-in">
      {console.log('🏛️ RoleDashboard - About to render dashboard content')}
      {renderDashboard()}
    </div>
  );
};

export default RoleDashboard;
