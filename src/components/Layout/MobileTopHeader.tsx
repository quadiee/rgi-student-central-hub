
import React from 'react';
import { Bell, Search, User } from 'lucide-react';
import { useAuth } from '../../contexts/SupabaseAuthContext';
import { Button } from '../ui/button';

interface MobileTopHeaderProps {
  activeTab: string;
  onNotificationClick: () => void;
  showNotifications: boolean;
  onCloseNotifications: () => void;
}

const MobileTopHeader: React.FC<MobileTopHeaderProps> = ({
  activeTab,
  onNotificationClick,
  showNotifications,
  onCloseNotifications
}) => {
  const { user } = useAuth();

  const getTabTitle = (tab: string) => {
    switch (tab) {
      case 'dashboard': return 'Dashboard';
      case 'fees': return user?.role === 'student' ? 'My Fees' : 'Fee Management';
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
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold text-gray-900 truncate">
              {getTabTitle(activeTab)}
            </h1>
            <p className="text-xs text-gray-500 truncate">
              {getGreeting()}, {user?.name?.split(' ')[0] || 'User'}
            </p>
          </div>

          <div className="flex items-center space-x-2 ml-4">
            <Button
              variant="ghost"
              size="sm"
              className="p-2 relative"
              onClick={onNotificationClick}
            >
              <Bell className="w-5 h-5 text-gray-600" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                3
              </span>
            </Button>

            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              user?.role === 'chairman' 
                ? 'bg-gradient-to-r from-purple-500 to-blue-500' 
                : 'bg-gradient-to-r from-blue-500 to-purple-500'
            }`}>
              <span className="text-white text-xs font-bold">
                {user?.name?.split(' ').map(n => n[0]).join('') || user?.email?.[0].toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mt-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              className="w-full pl-10 pr-4 py-2 bg-gray-100 border-0 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors"
            />
          </div>
        </div>
      </header>

      {/* Notifications Overlay */}
      {showNotifications && (
        <div className="fixed inset-0 z-50 bg-black/50" onClick={onCloseNotifications}>
          <div className="absolute top-20 left-4 right-4 bg-white rounded-2xl shadow-xl max-h-80 overflow-y-auto">
            <div className="p-4 border-b">
              <h3 className="font-semibold text-gray-900">Notifications</h3>
            </div>
            <div className="p-4 space-y-3">
              <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-xl">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <p className="text-sm font-medium text-gray-800">Fee Payment Reminder</p>
                  <p className="text-xs text-gray-600">Your semester fee is due in 5 days</p>
                </div>
              </div>
              <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-xl">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <p className="text-sm font-medium text-gray-800">Attendance Updated</p>
                  <p className="text-xs text-gray-600">Your attendance has been marked for today</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MobileTopHeader;
