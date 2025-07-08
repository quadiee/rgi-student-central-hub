
import React, { useState } from 'react';
import { Bell, Menu, Search, Settings, User } from 'lucide-react';
import { Button } from '../ui/button';
import { useAuth } from '../../contexts/SupabaseAuthContext';

interface MobileHeaderProps {
  onMenuClick: () => void;
  activeTab: string;
}

const MobileHeader: React.FC<MobileHeaderProps> = ({ onMenuClick, activeTab }) => {
  const { user } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);

  const getTabTitle = (tab: string) => {
    switch (tab) {
      case 'dashboard': return 'Dashboard';
      case 'fees': return 'Fee Management';
      case 'students': return 'Students';
      case 'attendance': return 'Attendance';
      case 'exams': return 'Exams';
      case 'reports': return 'Reports';
      case 'admin': return 'Admin Panel';
      default: return 'Dashboard';
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-30 lg:hidden">
      {/* Main Header */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onMenuClick}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <Menu className="w-6 h-6 text-gray-700" />
          </Button>
          
          <div>
            <h1 className="text-lg font-bold text-gray-800">
              {getTabTitle(activeTab)}
            </h1>
            <p className="text-xs text-gray-500">
              {getGreeting()}, {user?.name?.split(' ')[0] || 'User'}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            className="p-2 hover:bg-gray-100 rounded-lg relative"
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <Bell className="w-5 h-5 text-gray-600" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
              3
            </span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${user?.role === 'chairman' ? 'bg-gradient-to-r from-purple-500 to-blue-500' : 'bg-gradient-to-r from-blue-500 to-purple-500'}`}>
              <span className="text-white text-xs font-bold">
                {user?.name?.split(' ').map(n => n[0]).join('') || user?.email?.[0].toUpperCase()}
              </span>
            </div>
          </Button>
        </div>
      </div>

      {/* Quick Actions Bar */}
      <div className="px-4 pb-3">
        <div className="flex items-center space-x-2 bg-gray-50 rounded-lg p-2">
          <Search className="w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search..."
            className="flex-1 bg-transparent text-sm text-gray-700 placeholder-gray-400 focus:outline-none"
          />
        </div>
      </div>

      {/* Notifications Dropdown */}
      {showNotifications && (
        <div className="absolute top-full left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
          <div className="p-4">
            <h3 className="font-semibold text-gray-800 mb-3">Notifications</h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <div>
                  <p className="text-sm font-medium text-gray-800">Fee Payment Reminder</p>
                  <p className="text-xs text-gray-600">Your semester fee is due in 5 days</p>
                </div>
              </div>
              <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div>
                  <p className="text-sm font-medium text-gray-800">Attendance Updated</p>
                  <p className="text-xs text-gray-600">Your attendance has been marked for today</p>
                </div>
              </div>
              <div className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                <div>
                  <p className="text-sm font-medium text-gray-800">Exam Schedule</p>
                  <p className="text-xs text-gray-600">Mid-term exams start next week</p>
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowNotifications(false)}
              className="w-full mt-4 text-sm text-blue-600 font-medium"
            >
              View All Notifications
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default MobileHeader;
