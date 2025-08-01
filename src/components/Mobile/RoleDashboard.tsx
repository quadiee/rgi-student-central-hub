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

  // EXTREME DEBUGGING
  console.log('%c=== ROLE DASHBOARD EXTREME DEBUG ===', 'background: purple; color: white; font-size: 20px; padding: 15px;');
  console.log('RoleDashboard - Timestamp:', new Date().toISOString());
  console.log('RoleDashboard - Current URL:', window.location.href);
  console.log('RoleDashboard - Location pathname:', location.pathname);
  console.log('RoleDashboard - User object:', user);
  console.log('RoleDashboard - User role:', user?.role);
  console.log('RoleDashboard - User name:', user?.name);
  console.log('RoleDashboard - Document title:', document.title);
  console.log('RoleDashboard - Window innerWidth:', window.innerWidth);
  console.log('RoleDashboard - Window innerHeight:', window.innerHeight);

  // Force render something immediately visible
  if (!user) {
    console.log('%c❌ NO USER - SHOWING RED SCREEN', 'background: red; color: white; font-size: 16px;');
    return (
      <div 
        className="fixed inset-0 z-[9999] bg-red-600 flex items-center justify-center text-white"
        style={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0, 
          zIndex: 9999, 
          backgroundColor: '#dc2626' 
        }}
      >
        <div className="text-center p-8">
          <h1 className="text-3xl font-bold mb-4">🚨 NO USER FOUND</h1>
          <p className="text-xl">Loading user data...</p>
          <p className="text-sm mt-2">Time: {new Date().toLocaleTimeString()}</p>
        </div>
      </div>
    );
  }

  console.log('%c✅ USER FOUND - ROLE:', user.role, 'background: green; color: white; font-size: 16px;');

  // For Chairman role - FORCE IMMEDIATE RENDER
  if (user.role === 'chairman') {
    console.log('%c👑 CHAIRMAN DETECTED - ROUTING', 'background: gold; color: black; font-size: 16px;');
    console.log('Chairman routing - Path:', location.pathname);
    
    // For dashboard routes, render ChairmanMobileDashboard immediately
    if (location.pathname === '/dashboard' || location.pathname === '/') {
      console.log('%c🎯 RENDERING CHAIRMAN DASHBOARD NOW!', 'background: blue; color: white; font-size: 16px;');
      return <ChairmanMobileDashboard />;
    }
    
    // Other routes
    switch (location.pathname) {
      case '/students':
        console.log('Rendering ChairmanStudentManagement');
        return <ChairmanStudentManagement />;
      case '/faculty':
        console.log('Rendering ChairmanFacultyManagement');
        return <ChairmanFacultyManagement />;
      case '/fees':
        console.log('Rendering MobileFeeManagementHub');
        return <MobileFeeManagementHub />;
      default:
        console.log('Chairman - Default case, rendering dashboard');
        return <ChairmanMobileDashboard />;
    }
  }

  // For other roles
  console.log('RoleDashboard - Rendering for role:', user.role);
  
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
      console.log('Unknown role, defaulting to StudentMobileDashboard');
      return <StudentMobileDashboard />;
  }
};

export default RoleDashboard;
