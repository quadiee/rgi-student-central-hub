
import React from 'react';
import FeeListManagement from './FeeListManagement';
import { useAuth } from '../../contexts/SupabaseAuthContext';

const EnhancedFeeManagement: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <FeeListManagement />
    </div>
  );
};

export default EnhancedFeeManagement;
