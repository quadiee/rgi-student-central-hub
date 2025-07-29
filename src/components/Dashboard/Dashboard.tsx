
import React from 'react';
import { useAuth } from '../../contexts/SupabaseAuthContext';
import { useIsMobile } from '../../hooks/use-mobile';
import RoleDashboard from '../Mobile/RoleDashboard';
import StudentDashboard from './StudentDashboard';
import HODDashboard from './HODDashboard';
import PrincipalDashboard from './PrincipalDashboard';
import ChairmanDashboard from './ChairmanDashboard';
import RealTimeStats from './RealTimeStats';
import FeeManagementHub from '../Fees/FeeManagementHub';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const isMobile = useIsMobile();

  // Use enhanced mobile dashboard for mobile devices
  if (isMobile) {
    return <RoleDashboard />;
  }

  // Desktop dashboard logic with enhanced chairman view
  const renderDashboard = () => {
    switch (user?.role) {
      case 'student':
        return <StudentDashboard />;
      case 'chairman':
        // Chairman gets the personalized enhanced dashboard
        return <ChairmanDashboard />;
      case 'principal':
        return <PrincipalDashboard />;
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
