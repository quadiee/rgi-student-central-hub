
import React from 'react';
import FeeListManagement from './FeeListManagement';
import ScholarshipInitializer from './ScholarshipInitializer';
import { useAuth } from '../../contexts/SupabaseAuthContext';

const EnhancedFeeManagement: React.FC = () => {
  const { user } = useAuth();
  
  // Show initializer only for admins and principals
  const canInitialize = user?.role && ['admin', 'principal'].includes(user.role);

  return (
    <div className="space-y-6">
      {canInitialize && (
        <ScholarshipInitializer />
      )}
      <FeeListManagement />
    </div>
  );
};

export default EnhancedFeeManagement;
