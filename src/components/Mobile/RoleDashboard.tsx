
import React from 'react';
import { useAuth } from '../../contexts/SupabaseAuthContext';
import ChairmanMobileDashboard from './dashboards/ChairmanMobileDashboard';
import AdminMobileDashboard from './dashboards/AdminMobileDashboard';
import PrincipalMobileDashboard from './dashboards/PrincipalMobileDashboard';
import HODMobileDashboard from './dashboards/HODMobileDashboard';
import FacultyMobileDashboard from './dashboards/FacultyMobileDashboard';
import StudentMobileDashboard from './dashboards/StudentMobileDashboard';

const RoleDashboard: React.FC = () => {
  const { user } = useAuth();

  if (!user) return null;

  const renderDashboard = () => {
    switch (user.role) {
      case 'chairman':
        return <ChairmanMobileDashboard />;
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
