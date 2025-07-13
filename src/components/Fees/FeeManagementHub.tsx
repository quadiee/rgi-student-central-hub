
import React from 'react';
import { useIsMobile } from '../../hooks/use-mobile';
import MobileFeeManagementHub from './MobileFeeManagementHub';
import DesktopFeeManagementHub from './DesktopFeeManagementHub';

const FeeManagementHub: React.FC = () => {
  const isMobile = useIsMobile();

  return isMobile ? <MobileFeeManagementHub /> : <DesktopFeeManagementHub />;
};

export default FeeManagementHub;
