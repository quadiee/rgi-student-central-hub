
import React from 'react';
import MobileHeader from './MobileHeader';
import MobileBottomNav from './MobileBottomNav';

interface MobileLayoutProps {
  children: React.ReactNode;
}

const MobileLayout: React.FC<MobileLayoutProps> = ({ children }) => {
  return (
    <div className="lg:hidden">
      <MobileHeader />
      <main className="pt-16 pb-20 px-4">
        {children}
      </main>
      <MobileBottomNav />
    </div>
  );
};

export default MobileLayout;
