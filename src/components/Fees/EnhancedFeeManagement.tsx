
import React from 'react';
import { useAuth } from '../../contexts/SupabaseAuthContext';
import StudentFeeDashboard from './StudentFeeDashboard';
import HODFeeDashboard from './HODFeeDashboard';
import AdminReportGenerator from './AdminReportGenerator';
import ProtectedRoute from '../Auth/ProtectedRoute';

const EnhancedFeeManagement: React.FC = () => {
  const { user } = useAuth();

  const renderFeeManagement = () => {
    switch (user?.role) {
      case 'student':
        return (
          <ProtectedRoute allowedRoles={['student']}>
            <StudentFeeDashboard />
          </ProtectedRoute>
        );
      
      case 'faculty':
        return (
          <ProtectedRoute allowedRoles={['faculty']}>
            <HODFeeDashboard />
          </ProtectedRoute>
        );
      
      case 'hod':
        return (
          <ProtectedRoute allowedRoles={['hod']}>
            <HODFeeDashboard />
          </ProtectedRoute>
        );
      
      case 'principal':
        return (
          <ProtectedRoute allowedRoles={['principal']}>
            <div className="space-y-6">
              <HODFeeDashboard />
              <AdminReportGenerator />
            </div>
          </ProtectedRoute>
        );
      
      case 'admin':
        return (
          <ProtectedRoute allowedRoles={['admin']}>
            <div className="space-y-6">
              <HODFeeDashboard />
              <AdminReportGenerator />
            </div>
          </ProtectedRoute>
        );
      
      default:
        return (
          <div className="text-center py-8">
            <p className="text-gray-500">Access denied. Please contact administrator.</p>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      {renderFeeManagement()}
    </div>
  );
};

export default EnhancedFeeManagement;
