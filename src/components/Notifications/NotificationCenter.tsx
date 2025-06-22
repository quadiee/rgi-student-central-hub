
import React, { useState } from 'react';
import { Bell, Check, Clock, AlertTriangle, X } from 'lucide-react';
import { Button } from '../ui/button';

interface Notification {
  id: string;
  type: 'leave_approved' | 'leave_denied' | 'attendance_alert' | 'fee_reminder';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'leave_approved',
    title: 'Leave Request Approved',
    message: 'Your leave request for July 1-3 has been approved by Dr. Rajesh Kumar',
    timestamp: '2024-06-20T10:00:00',
    read: false
  },
  {
    id: '2',
    type: 'attendance_alert',
    title: 'Low Attendance Alert',
    message: 'Your attendance in Data Structures is below 75%. Current: 68%',
    timestamp: '2024-06-20T09:00:00',
    read: false
  },
  {
    id: '3',
    type: 'fee_reminder',
    title: 'Fee Payment Due',
    message: 'Semester fee payment is due by July 31, 2024',
    timestamp: '2024-06-19T15:00:00',
    read: true
  }
];

interface NotificationCenterProps {
  onClose: () => void;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({ onClose }) => {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'leave_approved':
        return <Check className="w-5 h-5 text-green-500" />;
      case 'leave_denied':
        return <X className="w-5 h-5 text-red-500" />;
      case 'attendance_alert':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'fee_reminder':
        return <Clock className="w-5 h-5 text-blue-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notif => ({ ...notif, read: true }))
    );
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="bg-white rounded-xl shadow-lg border max-w-md w-full">
      <div className="p-4 border-b flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Bell className="w-5 h-5 text-blue-500" />
          <h3 className="font-semibold text-gray-800">Notifications</h3>
          {unreadCount > 0 && (
            <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </div>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="max-h-96 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            No notifications
          </div>
        ) : (
          <div className="space-y-1">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 border-b last:border-b-0 cursor-pointer hover:bg-gray-50 ${
                  !notification.read ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                }`}
                onClick={() => markAsRead(notification.id)}
              >
                <div className="flex items-start space-x-3">
                  {getNotificationIcon(notification.type)}
                  <div className="flex-1 min-w-0">
                    <h4 className={`text-sm font-medium ${!notification.read ? 'text-gray-900' : 'text-gray-700'}`}>
                      {notification.title}
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">
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
      </div>

      {unreadCount > 0 && (
        <div className="p-3 border-t">
          <Button
            variant="outline"
            size="sm"
            onClick={markAllAsRead}
            className="w-full"
          >
            Mark all as read
          </Button>
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;
