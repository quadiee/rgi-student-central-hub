
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/SupabaseAuthContext';
import { supabase } from '../../integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import { 
  Activity, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Clock,
  CreditCard,
  Users,
  FileText
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface ActivityItem {
  id: string;
  type: 'payment' | 'attendance' | 'fee' | 'exam' | 'general';
  title: string;
  description: string;
  timestamp: string;
  status: 'success' | 'warning' | 'error' | 'info';
  metadata?: any;
}

interface RecentActivityFeedProps {
  limit?: number;
}

const RecentActivityFeed: React.FC<RecentActivityFeedProps> = ({ limit = 10 }) => {
  const { user } = useAuth();
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadRecentActivities();
    }
  }, [user]);

  const loadRecentActivities = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Load recent activities from user_activity_logs
      const { data: activityData } = await supabase
        .from('user_activity_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(limit);

      // Load recent payment transactions
      const { data: paymentData } = await supabase
        .from('payment_transactions')
        .select('*')
        .eq('student_id', user.id)
        .order('processed_at', { ascending: false })
        .limit(5);

      // Combine and format activities
      const formattedActivities: ActivityItem[] = [];

      // Add payment activities
      if (paymentData) {
        paymentData.forEach(payment => {
          formattedActivities.push({
            id: payment.id,
            type: 'payment',
            title: 'Payment Processed',
            description: `₹${Number(payment.amount).toLocaleString()} - ${payment.payment_method}`,
            timestamp: payment.processed_at,
            status: payment.status === 'Success' ? 'success' : 'error',
            metadata: payment
          });
        });
      }

      // Add general activities
      if (activityData) {
        activityData.forEach(activity => {
          formattedActivities.push({
            id: activity.id,
            type: activity.activity_type as any,
            title: activity.activity_description,
            description: activity.activity_type.replace('_', ' '),
            timestamp: activity.created_at,
            status: 'info',
            metadata: activity.metadata
          });
        });
      }

      // Sort by timestamp and limit
      const sortedActivities = formattedActivities
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, limit);

      setActivities(sortedActivities);

    } catch (error) {
      console.error('Error loading activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type: string, status: string) => {
    switch (type) {
      case 'payment':
        return CreditCard;
      case 'attendance':
        return Clock;
      case 'fee':
        return FileText;
      case 'exam':
        return Users;
      default:
        switch (status) {
          case 'success':
            return CheckCircle;
          case 'warning':
            return AlertCircle;
          case 'error':
            return XCircle;
          default:
            return Activity;
        }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'text-green-600 bg-green-100';
      case 'warning':
        return 'text-yellow-600 bg-yellow-100';
      case 'error':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-blue-600 bg-blue-100';
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

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="w-5 h-5" />
            <span>Recent Activity</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-200 rounded-lg animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Activity className="w-5 h-5 text-blue-600" />
          <span>Recent Activity</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No recent activity</p>
          </div>
        ) : (
          <ScrollArea className="h-64">
            <div className="space-y-3">
              {activities.map((activity, index) => {
                const Icon = getActivityIcon(activity.type, activity.status);
                
                return (
                  <div 
                    key={activity.id} 
                    className={cn(
                      "flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors animate-fade-in",
                      `delay-${index * 100}`
                    )}
                    style={{
                      animationDelay: `${index * 100}ms`
                    }}
                  >
                    <div className={cn(
                      "p-2 rounded-full flex-shrink-0",
                      getStatusColor(activity.status)
                    )}>
                      <Icon className="w-4 h-4" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-gray-900 text-sm truncate">
                          {activity.title}
                        </p>
                        <p className="text-xs text-gray-500 flex-shrink-0">
                          {getTimeAgo(activity.timestamp)}
                        </p>
                      </div>
                      <p className="text-sm text-gray-600 truncate">
                        {activity.description}
                      </p>
                      <Badge variant="outline" className="mt-1 text-xs">
                        {activity.type.replace('_', ' ')}
                      </Badge>
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

export default RecentActivityFeed;
