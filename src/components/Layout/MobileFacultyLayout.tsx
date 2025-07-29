
import React from 'react';
import MobileHeader from './MobileHeader';
import MobileQuickActions from '../Mobile/MobileQuickActions';

interface MobileFacultyLayoutProps {
  children: React.ReactNode;
}

const MobileFacultyLayout: React.FC<MobileFacultyLayoutProps> = ({ children }) => {
  const [activeTab, setActiveTab] = React.useState('faculty');

  return (
    <div className="lg:hidden min-h-screen bg-gray-50">
      <MobileHeader onMenuClick={() => {}} activeTab={activeTab} />
      <main className="pt-16">
        {children}
      </main>
      <MobileQuickActions activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default MobileFacultyLayout;
