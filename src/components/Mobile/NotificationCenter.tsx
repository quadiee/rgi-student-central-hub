
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/SupabaseAuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';
import { 
  Bell, 
  AlertCircle, 
  CheckCircle, 
  Info, 
  X,
  CreditCard,
  Users,
  Calendar,
  FileText
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface Notification {
  id: string;
  type: 'info' | 'warning' | 'success' | 'error';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  actionable: boolean;
  category: 'fee' | 'attendance' | 'general' | 'exam';
}

const NotificationCenter: React.FC = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Mock notifications for demo - replace with real data fetching
    const mockNotifications: Notification[] = [
      {
        id: '1',
        type: 'warning',
        title: 'Fee Payment Due',
        message: 'Your semester fee payment is due in 3 days',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        isRead: false,
        actionable: true,
        category: 'fee'
      },
      {
        id: '2',
        type: 'success',
        title: 'Payment Confirmed',
        message: 'Your fee payment of ₹15,000 has been processed successfully',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        isRead: false,
        actionable: false,
        category: 'fee'
      },
      {
        id: '3',
        type: 'info',
        title: 'Attendance Alert',
        message: 'Your attendance is below 75% in Mathematics',
        timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
        isRead: true,
        actionable: true,
        category: 'attendance'
      }
    ];

    setNotifications(mockNotifications);
    setUnreadCount(mockNotifications.filter(n => !n.isRead).length);
  }, []);

  const getNotificationIcon = (type: string, category: string) => {
    if (category === 'fee') return CreditCard;
    if (category === 'attendance') return Users;
    if (category === 'exam') return FileText;
    
    switch (type) {
      case 'success':
        return CheckCircle;
      case 'warning':
        return AlertCircle;
      case 'error':
        return AlertCircle;
      default:
        return Info;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'text-green-600 bg-green-100';
      case 'warning':
        return 'text-orange-600 bg-orange-100';
      case 'error':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-blue-600 bg-blue-100';
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, isRead: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    const notification = notifications.find(n => n.id === id);
    if (notification && !notification.isRead) {
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  };

  const getTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));

    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h ago`;
    } else {
      return `${Math.floor(diffInMinutes / 1440)}d ago`;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Bell className="w-5 h-5 text-blue-600" />
            <span>Notifications</span>
            {unreadCount > 0 && (
              <Badge variant="destructive" className="text-xs">
                {unreadCount}
              </Badge>
            )}
          </CardTitle>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => {
                setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
                setUnreadCount(0);
              }}
              className="text-xs"
            >
              Mark all read
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {notifications.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Bell className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No notifications</p>
          </div>
        ) : (
          <ScrollArea className="h-80">
            <div className="space-y-3">
              {notifications.map((notification, index) => {
                const Icon = getNotificationIcon(notification.type, notification.category);
                
                return (
                  <div 
                    key={notification.id}
                    className={cn(
                      "relative p-3 rounded-lg border transition-all duration-200 animate-fade-in",
                      notification.isRead ? "bg-gray-50" : "bg-white border-l-4",
                      notification.type === 'warning' ? "border-l-orange-500" :
                      notification.type === 'success' ? "border-l-green-500" :
                      notification.type === 'error' ? "border-l-red-500" : "border-l-blue-500",
                      `delay-${index * 100}`
                    )}
                    style={{
                      animationDelay: `${index * 100}ms`
                    }}
                  >
                    <div className="flex items-start space-x-3">
                      <div className={cn(
                        "p-2 rounded-full flex-shrink-0",
                        getNotificationColor(notification.type)
                      )}>
                        <Icon className="w-4 h-4" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className={cn(
                            "font-medium text-sm truncate",
                            notification.isRead ? "text-gray-600" : "text-gray-900"
                          )}>
                            {notification.title}
                          </p>
                          <div className="flex items-center space-x-2 flex-shrink-0 ml-2">
                            <p className="text-xs text-gray-500">
                              {getTimeAgo(notification.timestamp)}
                            </p>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => dismissNotification(notification.id)}
                              className="p-1 h-6 w-6"
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                        <p className={cn(
                          "text-sm mt-1 line-clamp-2",
                          notification.isRead ? "text-gray-500" : "text-gray-700"
                        )}>
                          {notification.message}
                        </p>
                        
                        <div className="flex items-center justify-between mt-2">
                          <Badge variant="outline" className="text-xs">
                            {notification.category}
                          </Badge>
                          
                          {!notification.isRead && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => markAsRead(notification.id)}
                              className="text-xs h-6"
                            >
                              Mark as read
                            </Button>
                          )}
                          
                          {notification.actionable && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-xs h-6"
                            >
                              Take Action
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};

export default NotificationCenter;
