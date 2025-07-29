
import React from 'react';
import EnhancedMobileLayout from '../Mobile/EnhancedMobileLayout';

interface MobileLayoutProps {
  children: React.ReactNode;
}

const MobileLayout: React.FC<MobileLayoutProps> = ({ children }) => {
  return <EnhancedMobileLayout>{children}</EnhancedMobileLayout>;
};

export default MobileLayout;
