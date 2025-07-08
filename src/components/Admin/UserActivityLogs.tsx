import React, { useState, useEffect } from 'react';
import { Activity, Filter, Search, Calendar, User, Clock } from 'lucide-react';
import { useAuth } from '../../contexts/SupabaseAuthContext';
import { supabase } from '../../integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Badge } from '../ui/badge';
import { useToast } from '../ui/use-toast';
import { Button } from '../ui/button';

interface UserActivity {
  id: string;
  user_id: string | null;
  activity_type: string;
  activity_description: string;
  metadata: any | null;
  created_at: string | null;
  ip_address?: string | null;
  user_agent?: string | null;
  user_name?: string;
  user_email?: string;
}

// This matches exactly what Supabase returns when you join the `profiles` table
type ActivityRow = {
  id: string;
  user_id: string | null;
  activity_type: string;
  activity_description: string;
  metadata: any | null;
  created_at: string | null;
  ip_address: string | null;
  user_agent: string | null;
  profiles: {
    name: string;
    email: string;
  } | null;
};

const UserActivityLogs: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedActivityType, setSelectedActivityType] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const recordsPerPage = 20;

  useEffect(() => {
    if (user) loadActivityLogs();
  }, [user, currentPage, searchTerm, selectedActivityType]);

  const loadActivityLogs = async () => {
    if (!user) return;

    try {
      setLoading(true);

      let query = supabase
        .from<ActivityRow>('user_activity_logs')
        .select(
          `
          *,
          profiles (
            name,
            email
          )
        `,
          { count: 'exact' }
        )
        .order('created_at', { ascending: false })
        .range(
          (currentPage - 1) * recordsPerPage,
          currentPage * recordsPerPage - 1
        );

      // if student, filter to only their own logs
      if (user.role === 'student') {
        query = query.eq('user_id', user.id);
      }
      if (selectedActivityType !== 'all') {
        query = query.eq('activity_type', selectedActivityType);
      }
      if (searchTerm) {
        query = query.or(
          `activity_description.ilike.%${searchTerm}%,activity_type.ilike.%${searchTerm}%`
        );
      }

      const { data, error, count } = await query;
      if (error) throw error;

      // Map the joined row into our UI-friendly UserActivity
      const formatted = (data || []).map((row) => ({
        id: row.id,
        user_id: row.user_id,
        activity_type: row.activity_type,
        activity_description: row.activity_description,
        metadata: row.metadata,
        created_at: row.created_at,
        ip_address: row.ip_address,
        user_agent: row.user_agent,
        user_name: row.profiles?.name,
        user_email: row.profiles?.email,
      }));

      setActivities(formatted);
      setTotalRecords(count ?? 0);
    } catch (err) {
      console.error('Error loading activity logs:', err);
      toast({
        title: 'Error',
        description: 'Failed to load activity logs',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (activityType: string) => {
    switch (activityType) {
      case 'user_registered':
        return <User className="w-4 h-4 text-blue-500" />;
      case 'payment_created':
      case 'payment_updated':
        return <Activity className="w-4 h-4 text-green-500" />;
      case 'fee_record_created':
        return <Calendar className="w-4 h-4 text-purple-500" />;
      default:
        return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  const getActivityBadgeColor = (activityType: string) => {
    switch (activityType) {
      case 'user_registered':
        return 'bg-blue-100 text-blue-800';
      case 'payment_created':
      case 'payment_updated':
        return 'bg-green-100 text-green-800';
      case 'fee_record_created':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const totalPages = Math.ceil(totalRecords / recordsPerPage);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            User Activity Logs
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search activities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select
              value={selectedActivityType}
              onValueChange={setSelectedActivityType}
            >
              <SelectTrigger>
                <SelectValue placeholder="Activity Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Activities</SelectItem>
                <SelectItem value="user_registered">
                  User Registration
                </SelectItem>
                <SelectItem value="payment_created">Payment Created</SelectItem>
                <SelectItem value="payment_updated">Payment Updated</SelectItem>
                <SelectItem value="fee_record_created">
                  Fee Record Created
                </SelectItem>
              </SelectContent>
            </Select>
            <Button
              onClick={() => {
                setSearchTerm('');
                setSelectedActivityType('all');
                setCurrentPage(1);
              }}
              variant="outline"
            >
              Clear Filters
            </Button>
          </div>

          {/* Activity List */}
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto" />
              </div>
            ) : activities.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No activity logs found
              </div>
            ) : (
              activities.map((act) => (
                <div
                  key={act.id}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      {getActivityIcon(act.activity_type)}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-gray-900">
                            {act.activity_description}
                          </h4>
                          <Badge className={getActivityBadgeColor(act.activity_type)}>
                            {act.activity_type.replace('_', ' ')}
                          </Badge>
                        </div>
                        {user?.role !== 'student' && (
                          <p className="text-sm text-gray-600 mb-2">
                            User: {act.user_name ?? act.user_email ?? 'Unknown'}
                          </p>
                        )}
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(act.created_at || '').toLocaleString()}
                          </span>
                          {act.ip_address && <span>IP: {act.ip_address}</span>}
                        </div>
                        {act.metadata && Object.keys(act.metadata).length > 0 && (
                          <div className="mt-2 p-2 bg-gray-100 rounded text-xs">
                            <strong>Details:</strong>
                            <pre className="mt-1 whitespace-pre-wrap">
                              {JSON.stringify(act.metadata, null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Showing{' '}
                {(currentPage - 1) * recordsPerPage + 1} to{' '}
                {Math.min(currentPage * recordsPerPage, totalRecords)} of{' '}
                {totalRecords} records
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <span className="text-sm">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage(Math.min(totalPages, currentPage + 1))
                  }
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UserActivityLogs;
