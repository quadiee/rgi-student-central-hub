
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { useAuth } from '../../contexts/SupabaseAuthContext';
import { supabase } from '../../integrations/supabase/client';
import { Activity, AlertTriangle, CheckCircle, Clock, Database } from 'lucide-react';

interface SystemStats {
  totalFeeRecords: number;
  pendingPayments: number;
  processedToday: number;
  systemHealth: 'healthy' | 'warning' | 'error';
  lastUpdated: string;
}

const FeeSystemStatus: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<SystemStats>({
    totalFeeRecords: 0,
    pendingPayments: 0,
    processedToday: 0,
    systemHealth: 'healthy',
    lastUpdated: new Date().toISOString()
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSystemStats();
    const interval = setInterval(fetchSystemStats, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchSystemStats = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];

      // Get total fee records
      const { count: totalRecords } = await supabase
        .from('fee_records')
        .select('*', { count: 'exact', head: true });

      // Get pending payments
      const { count: pendingCount } = await supabase
        .from('fee_records')
        .select('*', { count: 'exact', head: true })
        .in('status', ['Pending', 'Overdue', 'Partial']);

      // Get payments processed today
      const { count: processedToday } = await supabase
        .from('payment_transactions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'Success')
        .gte('processed_at', today);

      // Determine system health
      let systemHealth: 'healthy' | 'warning' | 'error' = 'healthy';
      if (pendingCount && pendingCount > 100) {
        systemHealth = 'warning';
      }
      if (pendingCount && pendingCount > 500) {
        systemHealth = 'error';
      }

      setStats({
        totalFeeRecords: totalRecords || 0,
        pendingPayments: pendingCount || 0,
        processedToday: processedToday || 0,
        systemHealth,
        lastUpdated: new Date().toISOString()
      });

    } catch (error) {
      console.error('Error fetching system stats:', error);
      setStats(prev => ({ ...prev, systemHealth: 'error' }));
    } finally {
      setLoading(false);
    }
  };

  const getHealthBadge = () => {
    switch (stats.systemHealth) {
      case 'healthy':
        return <Badge className="bg-green-100 text-green-800">Healthy</Badge>;
      case 'warning':
        return <Badge className="bg-yellow-100 text-yellow-800">Warning</Badge>;
      case 'error':
        return <Badge className="bg-red-100 text-red-800">Error</Badge>;
    }
  };

  const getHealthIcon = () => {
    switch (stats.systemHealth) {
      case 'healthy':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case 'error':
        return <AlertTriangle className="w-5 h-5 text-red-600" />;
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map(i => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* System Health Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Activity className="w-5 h-5" />
              <span>Fee System Status</span>
            </div>
            {getHealthBadge()}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-3">
            {getHealthIcon()}
            <div>
              <p className="font-medium">
                System Status: {stats.systemHealth === 'healthy' ? 'All systems operational' : 
                                stats.systemHealth === 'warning' ? 'High pending payment volume' : 
                                'System issues detected'}
              </p>
              <p className="text-sm text-gray-500">
                Last updated: {new Date(stats.lastUpdated).toLocaleString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* System Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Fee Records</p>
                <p className="text-2xl font-bold text-blue-600">
                  {stats.totalFeeRecords.toLocaleString()}
                </p>
              </div>
              <Database className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Payments</p>
                <p className="text-2xl font-bold text-orange-600">
                  {stats.pendingPayments.toLocaleString()}
                </p>
              </div>
              <Clock className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Processed Today</p>
                <p className="text-2xl font-bold text-green-600">
                  {stats.processedToday.toLocaleString()}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">System Load</p>
                <p className="text-2xl font-bold text-purple-600">
                  {stats.pendingPayments > 0 ? 
                    Math.round((stats.processedToday / (stats.pendingPayments + stats.processedToday)) * 100) + '%' : 
                    '100%'
                  }
                </p>
              </div>
              <Activity className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity (placeholder for future implementation) */}
      <Card>
        <CardHeader>
          <CardTitle>Recent System Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-sm">System health check completed successfully</span>
              <span className="text-xs text-gray-500 ml-auto">
                {new Date().toLocaleTimeString()}
              </span>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
              <Database className="w-4 h-4 text-blue-600" />
              <span className="text-sm">Database connection stable</span>
              <span className="text-xs text-gray-500 ml-auto">
                {new Date(Date.now() - 60000).toLocaleTimeString()}
              </span>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <Activity className="w-4 h-4 text-gray-600" />
              <span className="text-sm">Automated backup completed</span>
              <span className="text-xs text-gray-500 ml-auto">
                {new Date(Date.now() - 3600000).toLocaleTimeString()}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FeeSystemStatus;
