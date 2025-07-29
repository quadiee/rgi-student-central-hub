
import React from 'react';
import { useAuth } from '../../../contexts/SupabaseAuthContext';
import QuickStatsCards from '../QuickStatsCards';
import RecentActivityFeed from '../RecentActivityFeed';
import NotificationCenter from '../NotificationCenter';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { 
  Users, 
  UserCog, 
  Shield, 
  Settings, 
  Database,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';

const AdminMobileDashboard: React.FC = () => {
  const { user } = useAuth();

  const adminStats = [
    {
      title: 'Total Users',
      value: '3,150',
      change: '+25 this week',
      icon: Users,
      color: 'text-red-600',
      bgColor: 'bg-red-50'
    },
    {
      title: 'Active Sessions',
      value: '847',
      change: 'Currently online',
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Pending Issues',
      value: '12',
      change: '3 high priority',
      icon: AlertTriangle,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    },
    {
      title: 'System Health',
      value: '99.8%',
      change: 'All systems go',
      icon: Shield,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    }
  ];

  return (
    <div className="p-4 space-y-6">
      {/* Welcome Section */}
      <div className="text-center py-6">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
          Administrator Dashboard
        </h2>
        <p className="text-gray-600 mt-2">System management and user oversight</p>
      </div>

      {/* Admin Stats */}
      <QuickStatsCards stats={adminStats} />

      {/* System Status */}
      <Card className="bg-gradient-to-r from-red-50 to-orange-50 border-red-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="w-5 h-5 text-red-600" />
            <span>System Overview</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-white/70 rounded-lg">
              <div className="flex items-center space-x-2">
                <Database className="w-4 h-4 text-green-600" />
                <span className="text-sm">Database</span>
              </div>
              <span className="text-sm font-medium text-green-600">Healthy</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-white/70 rounded-lg">
              <div className="flex items-center space-x-2">
                <Settings className="w-4 h-4 text-blue-600" />
                <span className="text-sm">Services</span>
              </div>
              <span className="text-sm font-medium text-blue-600">Running</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-white/70 rounded-lg">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-orange-600" />
                <span className="text-sm">Backup</span>
              </div>
              <span className="text-sm font-medium text-orange-600">Scheduled</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Admin Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Admin Tools</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" className="h-16 flex flex-col items-center justify-center bg-red-50 hover:bg-red-100 border-red-200">
              <UserCog className="w-5 h-5 mb-1 text-red-600" />
              <span className="text-xs">User Management</span>
            </Button>
            <Button variant="outline" className="h-16 flex flex-col items-center justify-center bg-orange-50 hover:bg-orange-100 border-orange-200">
              <Settings className="w-5 h-5 mb-1 text-orange-600" />
              <span className="text-xs">System Settings</span>
            </Button>
            <Button variant="outline" className="h-16 flex flex-col items-center justify-center bg-blue-50 hover:bg-blue-100 border-blue-200">
              <Database className="w-5 h-5 mb-1 text-blue-600" />
              <span className="text-xs">Database</span>
            </Button>
            <Button variant="outline" className="h-16 flex flex-col items-center justify-center bg-purple-50 hover:bg-purple-100 border-purple-200">
              <Shield className="w-5 h-5 mb-1 text-purple-600" />
              <span className="text-xs">Security</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <RecentActivityFeed limit={5} />

      {/* Notifications */}
      <NotificationCenter />
    </div>
  );
};

export default AdminMobileDashboard;
