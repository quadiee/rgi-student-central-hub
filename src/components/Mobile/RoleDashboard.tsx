
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

  if (!user) return null;

  // For Chairman role, use organized components based on current route
  if (user.role === 'chairman') {
    switch (location.pathname) {
      case '/students':
        return <ChairmanStudentManagement />;
      case '/faculty':
        return <ChairmanFacultyManagement />;
      case '/fees':
        return <MobileFeeManagementHub />;
      case '/dashboard':
      case '/':
        // Use the main dashboard for chairman on dashboard route
        return <ChairmanMobileDashboard />;
      default:
        return <ChairmanMobileDashboard />;
    }
  }

  // For other roles, use their respective dashboards
  const renderDashboard = () => {
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
