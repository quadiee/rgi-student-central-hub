
import React, { useState } from 'react';
import { useAuth } from '../../contexts/SupabaseAuthContext';
import MobileBottomNav from './MobileBottomNav';
import MobileTopHeader from './MobileTopHeader';

interface MobileLayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const MobileLayout: React.FC<MobileLayoutProps> = ({ children, activeTab, onTabChange }) => {
  const { user } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Top Header */}
      <MobileTopHeader 
        activeTab={activeTab}
        onNotificationClick={() => setShowNotifications(!showNotifications)}
        showNotifications={showNotifications}
        onCloseNotifications={() => setShowNotifications(false)}
      />

      {/* Main Content Area */}
      <main className="flex-1 overflow-auto pb-20 px-4 pt-4">
        {children}
      </main>

      {/* Bottom Navigation */}
      <MobileBottomNav 
        activeTab={activeTab}
        onTabChange={onTabChange}
        userRole={user?.role || 'student'}
      />
    </div>
  );
};

export default MobileLayout;
