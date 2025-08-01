
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

  console.log('RoleDashboard - User:', user);
  console.log('RoleDashboard - Current path:', location.pathname);

  if (!user) {
    console.log('RoleDashboard - No user found');
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600">Loading user data...</p>
        </div>
      </div>
    );
  }

  console.log('RoleDashboard - User role:', user.role);

  // For Chairman role, use organized components based on current route
  if (user.role === 'chairman') {
    console.log('RoleDashboard - Chairman detected, routing based on path:', location.pathname);
    
    switch (location.pathname) {
      case '/students':
        console.log('RoleDashboard - Rendering ChairmanStudentManagement');
        return <ChairmanStudentManagement />;
      case '/faculty':
        console.log('RoleDashboard - Rendering ChairmanFacultyManagement');
        return <ChairmanFacultyManagement />;
      case '/fees':
        console.log('RoleDashboard - Rendering MobileFeeManagementHub');
        return <MobileFeeManagementHub />;
      case '/dashboard':
      case '/':
      default:
        console.log('RoleDashboard - Rendering ChairmanMobileDashboard');
        return <ChairmanMobileDashboard />;
    }
  }

  // For other roles, use their respective dashboards
  const renderDashboard = () => {
    console.log('RoleDashboard - Rendering dashboard for role:', user.role);
    
    switch (user.role) {
      case 'admin':
        return <AdminMobileDashboard />;
      case 'principal':
        return <PrincipalMobileDashboard />;
      case 'hod':
        return <HODMobileDashboard />;
      case 'faculty':
        return <FacultyMobileDashboard />;
      case 'student':
        return <StudentMobileDashboard />;
      default:
        console.log('RoleDashboard - Unknown role, defaulting to StudentMobileDashboard');
        return <StudentMobileDashboard />;
    }
  };

  return (
    <div className="animate-fade-in">
      {renderDashboard()}
    </div>
  );
};

export default RoleDashboard;
