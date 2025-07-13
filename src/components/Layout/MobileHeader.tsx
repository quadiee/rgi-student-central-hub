
import React, { useState, useEffect } from 'react';
import { Bell, Menu, Search, Settings, User } from 'lucide-react';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { useAuth } from '../../contexts/SupabaseAuthContext';
import { supabase } from '../../integrations/supabase/client';
import NotificationCenter from '../Notifications/NotificationCenter';

interface MobileHeaderProps {
  onMenuClick: () => void;
  activeTab: string;
}

interface Notification {
  id: string;
  type: 'fee_reminder' | 'attendance_alert' | 'general';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  user_id: string;
}

const MobileHeader: React.FC<MobileHeaderProps> = ({ onMenuClick, activeTab }) => {
  const { user, refreshUser } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

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

  // Load mock notifications with real-time simulation
  useEffect(() => {
    const loadNotifications = () => {
      const mockNotifications: Notification[] = [
        {
          id: '1',
          type: 'fee_reminder',
          title: 'Fee Payment Due',
          message: 'Your semester fee payment is due in 3 days',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
          read: false,
          user_id: user?.id || ''
        },
        {
          id: '2',
          type: 'attendance_alert',
          title: 'Attendance Alert',
          message: 'Your attendance is below 75% in Data Structures',
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
          read: false,
          user_id: user?.id || ''
        },
        {
          id: '3',
          type: 'general',
          title: 'System Update',
          message: 'New features have been added to the dashboard',
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
          read: true,
          user_id: user?.id || ''
        }
      ];

      setNotifications(mockNotifications);
      const unread = mockNotifications.filter(n => !n.read).length;
      setUnreadCount(unread);
    };

    if (user?.id) {
      loadNotifications();
    }
  }, [user?.id]);

  // Simulate real-time notifications
  useEffect(() => {
    if (!user?.id) return;

    const interval = setInterval(() => {
      // Simulate receiving a new notification every 30 seconds (for demo)
      const newNotification: Notification = {
        id: Date.now().toString(),
        type: 'general',
        title: 'Real-time Update',
        message: `New activity detected at ${new Date().toLocaleTimeString()}`,
        timestamp: new Date().toISOString(),
        read: false,
        user_id: user.id
      };

      setNotifications(prev => [newNotification, ...prev.slice(0, 4)]); // Keep only 5 notifications
      setUnreadCount(prev => prev + 1);
    }, 30000); // Every 30 seconds

    return () => clearInterval(interval);
  }, [user?.id]);

  // Real-time profile updates
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel('profile-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${user.id}`
        },
        async () => {
          console.log('Profile updated, refreshing user data');
          await refreshUser();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, refreshUser]);

  const markNotificationAsRead = (notificationId: string) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
    setUnreadCount(0);
  };

  const getInitials = () => {
    if (user?.name) {
      return user.name.split(' ').map(n => n[0]).join('').toUpperCase();
    }
    return user?.email?.[0].toUpperCase() || 'U';
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
          {/* Notifications */}
          <Button
            variant="ghost"
            size="sm"
            className="p-2 hover:bg-gray-100 rounded-lg relative"
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <Bell className="w-5 h-5 text-gray-600" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs text-white flex items-center justify-center font-medium">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </Button>

          {/* Profile Avatar */}
          <Button
            variant="ghost"
            size="sm"
            className="p-1 hover:bg-gray-100 rounded-lg"
          >
            <Avatar className="w-8 h-8">
              <AvatarImage 
                src={user?.profile_photo_url || user?.avatar} 
                alt={user?.name || 'User'}
              />
              <AvatarFallback className={`text-white text-xs font-bold ${
                user?.role === 'chairman' 
                  ? 'bg-gradient-to-r from-purple-500 to-blue-500' 
                  : user?.role === 'admin'
                  ? 'bg-gradient-to-r from-red-500 to-pink-500'
                  : user?.role === 'principal'
                  ? 'bg-gradient-to-r from-green-500 to-teal-500'
                  : user?.role === 'hod'
                  ? 'bg-gradient-to-r from-orange-500 to-yellow-500'
                  : 'bg-gradient-to-r from-blue-500 to-purple-500'
              }`}>
                {getInitials()}
              </AvatarFallback>
            </Avatar>
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
        <div className="absolute top-full left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
          <div className="p-4 max-h-96 overflow-y-auto">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-800">Notifications</h3>
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={markAllAsRead}
                  className="text-xs text-blue-600 hover:text-blue-800"
                >
                  Mark all read
                </Button>
              )}
            </div>
            
            {notifications.length === 0 ? (
              <div className="text-center py-6 text-gray-500">
                <Bell className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">No notifications yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      !notification.read 
                        ? 'bg-blue-50 border-l-4 border-l-blue-500' 
                        : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                    onClick={() => markNotificationAsRead(notification.id)}
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`w-2 h-2 rounded-full mt-2 ${
                        notification.type === 'fee_reminder' ? 'bg-orange-500' :
                        notification.type === 'attendance_alert' ? 'bg-red-500' :
                        'bg-blue-500'
                      }`}></div>
                      <div className="flex-1 min-w-0">
                        <h4 className={`text-sm font-medium ${
                          !notification.read ? 'text-gray-900' : 'text-gray-700'
                        }`}>
                          {notification.title}
                        </h4>
                        <p className="text-xs text-gray-600 mt-1">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-500 mt-2">
                          {new Date(notification.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <button
              onClick={() => setShowNotifications(false)}
              className="w-full mt-4 text-sm text-blue-600 font-medium py-2 hover:text-blue-800"
            >
              Close Notifications
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default MobileHeader;
