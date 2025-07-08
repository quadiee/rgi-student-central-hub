
import React, { useState } from 'react';
import { Bell, Settings, User, LogOut, Menu } from 'lucide-react';
import { Button } from '../ui/button';
import { useAuth } from '../../contexts/SupabaseAuthContext';
import UserProfile from '../Auth/UserProfile';
import NotificationCenter from '../Notifications/NotificationCenter';

interface HeaderProps {
  onMenuClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { profile } = useAuth();
  const [showProfile, setShowProfile] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <>
      <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {onMenuClick && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onMenuClick}
                className="md:hidden"
              >
                <Menu className="w-5 h-5" />
              </Button>
            )}
            <div>
              <h1 className="text-xl font-semibold text-gray-800">
                Welcome back, {profile?.name || profile?.email}
              </h1>
              <p className="text-sm text-gray-600 capitalize">
                {profile?.role} Dashboard
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              size="sm" 
              className="relative"
              onClick={() => setShowNotifications(true)}
            >
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                3
              </span>
            </Button>

            <Button variant="ghost" size="sm">
              <Settings className="w-5 h-5" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowProfile(true)}
              className="flex items-center space-x-2"
            >
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {profile?.name?.split(' ').map(n => n[0]).join('') || profile?.email?.[0].toUpperCase()}
                </span>
              </div>
              <span className="hidden md:block text-sm font-medium">
                {profile?.name || profile?.email}
              </span>
            </Button>
          </div>
        </div>
      </header>

      {showProfile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-lg font-semibold">Profile Settings</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowProfile(false)}
              >
                ×
              </Button>
            </div>
            <div className="p-4">
              <UserProfile />
            </div>
          </div>
        </div>
      )}

      {showNotifications && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-lg font-semibold">Notifications</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowNotifications(false)}
              >
                ×
              </Button>
            </div>
            <div className="p-4">
              <NotificationCenter onClose={() => setShowNotifications(false)} />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
