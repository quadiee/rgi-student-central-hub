
import React from 'react';
import { useAuth } from '../../contexts/SupabaseAuthContext';
import StudentDashboard from './StudentDashboard';
import HODDashboard from './HODDashboard';
import ChairmanDashboard from './ChairmanDashboard';
import PrincipalDashboard from './PrincipalDashboard';
import RealTimeStats from './RealTimeStats';

const Dashboard: React.FC = () => {
  const { user } = useAuth();

  const renderDashboard = () => {
    switch (user?.role) {
      case 'student':
        return <StudentDashboard />;
      case 'chairman':
      case 'principal':
        // Both Chairman and Principal get the same view (institution-wide)
        return <ChairmanDashboard />;
      case 'hod':
        return (
          <div className="space-y-6">
            <RealTimeStats />
            <HODDashboard />
          </div>
        );
      case 'admin':
        // Admin gets full access with enhanced dashboard
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
