
import React, { useState } from 'react';
import { Bell, Settings, User, LogOut, Menu, Search } from 'lucide-react';
import { Button } from '../ui/button';
import { useAuth } from '../../contexts/SupabaseAuthContext';
import { useIsMobile } from '../../hooks/use-mobile';
import UserProfile from '../Auth/UserProfile';
import NotificationCenter from '../Notifications/NotificationCenter';
import MobileHeader from './MobileHeader';
import { Badge } from '../ui/badge';

interface HeaderProps {
  onMenuClick?: () => void;
  activeTab?: string;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick, activeTab = 'dashboard' }) => {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [showProfile, setShowProfile] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  if (isMobile) {
    return <MobileHeader onMenuClick={onMenuClick || (() => {})} activeTab={activeTab} />;
  }

  const getRoleTheme = () => {
    switch (user?.role) {
      case 'chairman':
        return 'from-purple-600 to-blue-600';
      case 'admin':
        return 'from-red-500 to-orange-500';
      case 'hod':
        return 'from-indigo-600 to-purple-600';
      default:
        return 'from-blue-500 to-cyan-500';
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm shadow-soft border-b border-gray-200 dark:bg-gray-900/95 dark:border-gray-800">
        <div className="container-app">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-6">
              {onMenuClick && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onMenuClick}
                  className="hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <Menu className="w-5 h-5" />
                </Button>
              )}
              
              <div className="flex flex-col">
                <div className="flex items-center space-x-2">
                  <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                    {getGreeting()}, {user?.name?.split(' ')[0] || user?.email?.split('@')[0]}
                  </h1>
                  {user?.role === 'chairman' && (
                    <Badge variant="secondary" className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                      Chairman
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                  {user?.role} Dashboard
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Search Bar */}
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-64 pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                />
              </div>

              {/* Notification Button */}
              <Button
                variant="ghost"
                size="sm"
                className="relative hover:bg-gray-100 dark:hover:bg-gray-800 p-2"
                onClick={() => setShowNotifications(true)}
              >
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse">
                  3
                </span>
              </Button>

              {/* Settings Button */}
              <Button 
                variant="ghost" 
                size="sm" 
                className="hover:bg-gray-100 dark:hover:bg-gray-800 p-2"
              >
                <Settings className="w-5 h-5" />
              </Button>

              {/* User Profile Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowProfile(true)}
                className="flex items-center space-x-3 hover:bg-gray-100 dark:hover:bg-gray-800 p-2 rounded-lg"
              >
                <div className={`w-10 h-10 rounded-full bg-gradient-to-r ${getRoleTheme()} flex items-center justify-center shadow-lg`}>
                  <span className="text-white text-sm font-bold">
                    {user?.name?.split(' ').map(n => n[0]).join('') || user?.email?.[0].toUpperCase()}
                  </span>
                </div>
                <div className="hidden lg:block text-left">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {user?.name || user?.email}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                    {user?.role}
                  </p>
                </div>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Profile Modal */}
      {showProfile && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-strong max-w-md w-full max-h-[90vh] overflow-y-auto animate-scale-in">
            <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-800">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Profile Settings</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowProfile(false)}
                className="hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                ×
              </Button>
            </div>
            <div className="p-6">
              <UserProfile />
            </div>
          </div>
        </div>
      )}

      {/* Notifications Modal */}
      {showNotifications && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-strong max-w-lg w-full max-h-[90vh] overflow-y-auto animate-scale-in">
            <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-800">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Notifications</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowNotifications(false)}
                className="hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                ×
              </Button>
            </div>
            <div className="p-6">
              <NotificationCenter onClose={() => setShowNotifications(false)} />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
