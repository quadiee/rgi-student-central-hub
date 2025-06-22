
import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import StudentDashboard from './StudentDashboard';
import FacultyDashboard from './FacultyDashboard';
import HODDashboard from './HODDashboard';
import PrincipalDashboard from './PrincipalDashboard';

const Dashboard: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Please log in to view your dashboard.</p>
      </div>
    );
  }

  switch (user.role) {
    case 'student':
      return <StudentDashboard />;
    case 'faculty':
      return <FacultyDashboard />;
    case 'hod':
      return <HODDashboard />;
    case 'principal':
      return <PrincipalDashboard />;
    case 'admin':
      // Admin gets the principal view as it's the most comprehensive
      return <PrincipalDashboard />;
    default:
      return <StudentDashboard />;
  }
};

export default Dashboard;
