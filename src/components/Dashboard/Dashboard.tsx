
import React from 'react';
import { useAuth } from '../../contexts/SupabaseAuthContext';
import StudentDashboard from './StudentDashboard';
import HODDashboard from './HODDashboard';
import PrincipalDashboard from './PrincipalDashboard';
import RealTimeStats from './RealTimeStats';

const Dashboard: React.FC = () => {
  const { profile } = useAuth();

  const renderDashboard = () => {
    switch (profile?.role) {
      case 'student':
        return <StudentDashboard />;
      case 'hod':
        return (
          <div className="space-y-6">
            <RealTimeStats />
            <HODDashboard />
          </div>
        );
      case 'principal':
      case 'admin':
        return (
          <div className="space-y-6">
            <RealTimeStats />
            <PrincipalDashboard />
          </div>
        );
      default:
        return <StudentDashboard />;
    }
  };

  return (
    <div className="space-y-6">
      {renderDashboard()}
    </div>
  );
};

export default Dashboard;
