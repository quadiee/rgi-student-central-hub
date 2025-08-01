
import React from 'react';
import { useIsMobile } from '../hooks/use-mobile';
import { useAuth } from '../contexts/SupabaseAuthContext';
import FeeManagementHub from '../components/Fees/FeeManagementHub';
import MobileFeeManagementHub from '../components/Fees/MobileFeeManagementHub';

const Fees: React.FC = () => {
  const isMobile = useIsMobile();
  const { user } = useAuth();

  // Use mobile-optimized component on mobile devices
  if (isMobile) {
    return <MobileFeeManagementHub />;
  }

  // Use desktop component for larger screens
  return <FeeManagementHub />;
};

export default Fees;
