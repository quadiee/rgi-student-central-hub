
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

  console.log('=== RoleDashboard START ===');
  console.log('RoleDashboard - User:', user);
  console.log('RoleDashboard - Current path:', location.pathname);
  console.log('RoleDashboard - User role:', user?.role);

  // Force render something visible for debugging
  if (!user) {
    console.log('RoleDashboard - No user, showing loading');
    return (
      <div className="flex items-center justify-center min-h-screen bg-red-100">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg">
          <p className="text-red-600 font-bold">DEBUG: No User Found</p>
          <p className="text-gray-600">Loading user data...</p>
        </div>
      </div>
    );
  }

  console.log('RoleDashboard - User found, role:', user.role);

  // For Chairman role, use organized components based on current route
  if (user.role === 'chairman') {
    console.log('RoleDashboard - Chairman detected, routing based on path:', location.pathname);
    
    // Always render something visible for Chairman
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
        console.log('RoleDashboard - Rendering ChairmanMobileDashboard for path:', location.pathname);
        return (
          <div className="min-h-screen bg-purple-50">
            <div className="p-4 bg-red-100 border-b-2 border-red-300">
              <p className="text-red-800 font-bold">DEBUG: About to render ChairmanMobileDashboard</p>
              <p className="text-red-600 text-sm">Path: {location.pathname}</p>
              <p className="text-red-600 text-sm">User: {user.name} ({user.role})</p>
            </div>
            <ChairmanMobileDashboard />
          </div>
        );
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
    <div className="animate-fade-in min-h-screen bg-gray-50">
      <div className="p-4 bg-yellow-100 border-b-2 border-yellow-300">
        <p className="text-yellow-800 font-bold">DEBUG: Non-Chairman Role Dashboard</p>
        <p className="text-yellow-600 text-sm">Role: {user.role}</p>
      </div>
      {renderDashboard()}
    </div>
  );
};

export default RoleDashboard;
