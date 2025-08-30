
import React from 'react';
import { useAuth } from '../../contexts/SupabaseAuthContext';
import SimplifiedFeeManagement from './SimplifiedFeeManagement';

const SimplifiedFeeManagementRoute: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600">Please log in to view the fee management system.</p>
        </div>
      </div>
    );
  }

  // Allow access to admin, principal, chairman, and hod roles
  const allowedRoles = ['admin', 'principal', 'chairman', 'hod'];
  if (!allowedRoles.includes(user.role || '')) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Restricted</h2>
          <p className="text-gray-600">You don't have permission to access the fee management system.</p>
        </div>
      </div>
    );
  }

  return <SimplifiedFeeManagement />;
};

export default SimplifiedFeeManagementRoute;
