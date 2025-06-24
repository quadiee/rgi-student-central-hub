
import React from 'react';
import { useAuth } from '../../contexts/SupabaseAuthContext';
import FeeSystemStatus from './FeeSystemStatus';
import SampleDataGenerator from './SampleDataGenerator';
import MultiUserTestPanel from './MultiUserTestPanel';
import StudentFeeView from './StudentFeeView';
import HODFeeView from './HODFeeView';
import PrincipalFeeView from './PrincipalFeeView';

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
        return <StudentFeeView />;
      
      case 'faculty':
      case 'hod':
        return <HODFeeView />;
      
      case 'principal':
      case 'admin':
        return <PrincipalFeeView />;
      
      default:
        return (
          <div className="text-center py-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Access Denied</h2>
            <p className="text-gray-600">Your role does not have access to fee management features.</p>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* System Status - Visible to all authenticated users */}
      <FeeSystemStatus />
      
      {/* Admin Tools - Only visible to admins */}
      {user.role === 'admin' && (
        <>
          <SampleDataGenerator />
          <MultiUserTestPanel />
        </>
      )}
      
      {/* Role-specific fee management views */}
      {renderRoleSpecificView()}
    </div>
  );
};

export default EnhancedFeeManagement;
