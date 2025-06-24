
import React from 'react';
import { useEnhancedAuth } from '../../contexts/EnhancedAuthContext';
import EnhancedStudentDashboard from './EnhancedStudentDashboard';
import EnhancedHODDashboard from './EnhancedHODDashboard';
import EnhancedPrincipalDashboard from './EnhancedPrincipalDashboard';

const Dashboard: React.FC = () => {
  const { user } = useEnhancedAuth();

  const renderDashboard = () => {
    switch (user?.role) {
      case 'student':
        return <EnhancedStudentDashboard />;
      case 'hod':
        return <EnhancedHODDashboard />;
      case 'principal':
      case 'admin':
        return <EnhancedPrincipalDashboard />;
      default:
        return <EnhancedStudentDashboard />;
    }
  };

  return (
    <div className="space-y-6">
      {renderDashboard()}
    </div>
  );
};

export default Dashboard;
