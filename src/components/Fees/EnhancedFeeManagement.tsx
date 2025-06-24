
import React from 'react';
import { useAuth } from '../../contexts/SupabaseAuthContext';
import StudentFeeView from './StudentFeeView';
import HODFeeView from './HODFeeView';
import PrincipalFeeView from './PrincipalFeeView';
import AdminReportGenerator from './AdminReportGenerator';
import ProtectedRoute from '../Auth/ProtectedRoute';

const EnhancedFeeManagement: React.FC = () => {
  const { user } = useAuth();

  const renderFeeManagement = () => {
    switch (user?.role) {
      case 'student':
        return (
          <ProtectedRoute allowedRoles={['student']}>
            <StudentFeeView />
          </ProtectedRoute>
        );
      
      case 'faculty':
        return (
          <ProtectedRoute allowedRoles={['faculty']}>
            <HODFeeView />
          </ProtectedRoute>
        );
      
      case 'hod':
        return (
          <ProtectedRoute allowedRoles={['hod']}>
            <HODFeeView />
          </ProtectedRoute>
        );
      
      case 'principal':
        return (
          <ProtectedRoute allowedRoles={['principal']}>
            <div className="space-y-6">
              <PrincipalFeeView />
              <AdminReportGenerator />
            </div>
          </ProtectedRoute>
        );
      
      case 'admin':
        return (
          <ProtectedRoute allowedRoles={['admin']}>
            <div className="space-y-6">
              <PrincipalFeeView />
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
