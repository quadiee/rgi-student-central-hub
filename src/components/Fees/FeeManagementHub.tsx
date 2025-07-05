
import React from 'react';
import { useAuth } from '../../contexts/SupabaseAuthContext';
import AdminFeeAssignment from './AdminFeeAssignment';
import EnhancedStudentFeeView from './EnhancedStudentFeeView';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

const FeeManagementHub: React.FC = () => {
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
        return <EnhancedStudentFeeView />;
      
      case 'admin':
      case 'principal':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Admin Functions</CardTitle>
                </CardHeader>
                <CardContent>
                  <AdminFeeAssignment />
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Fee Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Use the fee assignment tool to assign fees to students individually or in bulk.
                    Students will receive their fee notifications and can pay online through integrated payment gateways.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        );
      
      case 'hod':
        return (
          <div className="text-center py-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Fee Management</h2>
            <p className="text-gray-600">HOD dashboard for fee management coming soon.</p>
          </div>
        );
      
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
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Fee Management System</h1>
        <p className="text-gray-600 mt-2">Manage student fees and payments</p>
      </div>
      
      {renderRoleSpecificView()}
    </div>
  );
};

export default FeeManagementHub;
