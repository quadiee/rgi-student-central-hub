
import React from 'react';
import MobileHeader from './MobileHeader';
import MobileBottomNav from './MobileBottomNav';

interface MobileLayoutProps {
  children: React.ReactNode;
}

const MobileLayout: React.FC<MobileLayoutProps> = ({ children }) => {
  return (
    <div className="lg:hidden min-h-screen bg-gray-50">
      <MobileHeader onMenuClick={() => {}} activeTab="dashboard" />
      <main className="pt-16 pb-20">
        {children}
      </main>
      <MobileBottomNav />
    </div>
  );
};

export default MobileLayout;
