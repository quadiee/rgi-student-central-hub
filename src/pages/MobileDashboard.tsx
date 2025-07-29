
import React from 'react';
import { useIsMobile } from '../hooks/use-mobile';
import RoleDashboard from '../components/Mobile/RoleDashboard';
import Dashboard from '../components/Dashboard/Dashboard';

const MobileDashboard: React.FC = () => {
  const isMobile = useIsMobile();
  
  return isMobile ? <RoleDashboard /> : <Dashboard />;
};

export default MobileDashboard;
