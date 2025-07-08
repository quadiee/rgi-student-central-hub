
import React from 'react';
import { useAuth } from '../../contexts/SupabaseAuthContext';
import EnhancedStudentDashboard from './EnhancedStudentDashboard';

const StudentDashboard: React.FC = () => {
  const { user } = useAuth();

  if (!user) return null;

  return <EnhancedStudentDashboard />;
};

export default StudentDashboard;
