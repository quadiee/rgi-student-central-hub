
import React, { useState } from 'react';
import { Bell, User, LogOut, RefreshCw } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import NotificationCenter from '../Notifications/NotificationCenter';

const Header: React.FC = () => {
  const { user, logout, switchRole } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);

  const handleRoleSwitch = () => {
    const roles = ['admin', 'faculty', 'student', 'hod', 'principal'];
    const currentIndex = roles.indexOf(user?.role || 'admin');
    const nextRole = roles[(currentIndex + 1) % roles.length];
    switchRole(nextRole as any);
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 h-16 flex items-center justify-between px-6 relative">
      <div className="flex items-center space-x-4">
        <h2 className="text-2xl font-semibold text-gray-800">
          Welcome, {user?.name}
        </h2>
        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium capitalize">
          {user?.role}
        </span>
      </div>
      
      <div className="flex items-center space-x-4">
        <button
          onClick={handleRoleSwitch}
          className="flex items-center space-x-2 px-3 py-2 bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          <span className="text-sm">Switch Role</span>
        </button>
        
        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors relative"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
              2
            </span>
          </button>
          
          {showNotifications && (
            <div className="absolute right-0 top-full mt-2 z-50">
              <NotificationCenter onClose={() => setShowNotifications(false)} />
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-white" />
          </div>
          <span className="text-gray-700 font-medium">{user?.name}</span>
        </div>
        
        <button
          onClick={logout}
          className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
};

export default Header;
