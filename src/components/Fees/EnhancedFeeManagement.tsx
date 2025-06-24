
import React from 'react';
import { useAuth } from '../../contexts/SupabaseAuthContext';
import CSVFeeUploader from './CSVFeeUploader';
import RealTimeFeeDashboard from './RealTimeFeeDashboard';
import StudentPaymentPortal from './StudentPaymentPortal';
import AdminDashboard from '../Admin/AdminDashboard';

const EnhancedFeeManagement: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="text-center py-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Fee Management</h2>
        <p className="text-gray-600">Please log in to access fee management features.</p>
      </div>
    );
  }

  const renderRoleSpecificView = () => {
    switch (user.role) {
      case 'student':
        return <StudentPaymentPortal />;
      
      case 'hod':
        return (
          <div className="space-y-6">
            <RealTimeFeeDashboard />
          </div>
        );
      
      case 'principal':
        return (
          <div className="space-y-6">
            <RealTimeFeeDashboard />
            <CSVFeeUploader />
          </div>
        );
      
      case 'admin':
        return <AdminDashboard />;
      
      default:
        return (
          <div className="text-center py-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Access Denied</h2>
            <p className="text-gray-600">Your role does not have access to fee management features.</p>
          </div>
        );
    }
  };

  // For admin users, show the full admin dashboard instead of fee management
  if (user.role === 'admin') {
    return renderRoleSpecificView();
  }

  return (
    <div className="space-y-6">
      {/* Role-specific fee management views */}
      {renderRoleSpecificView()}
    </div>
  );
};

export default EnhancedFeeManagement;
