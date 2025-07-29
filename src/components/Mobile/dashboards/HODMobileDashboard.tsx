
import React from 'react';
import { useAuth } from '../../../contexts/SupabaseAuthContext';
import QuickStatsCards from '../QuickStatsCards';
import RecentActivityFeed from '../RecentActivityFeed';
import NotificationCenter from '../NotificationCenter';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { 
  Users, 
  GraduationCap, 
  Clock, 
  BarChart3, 
  BookOpen,
  Calendar,
  Award,
  TrendingUp
} from 'lucide-react';

const HODMobileDashboard: React.FC = () => {
  const { user } = useAuth();

  const hodStats = [
    {
      title: 'Dept Students',
      value: '487',
      change: '+23 this sem',
      icon: GraduationCap,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    },
    {
      title: 'Faculty Members',
      value: '28',
      change: '2 on leave',
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Avg Attendance',
      value: '87.5%',
      change: '+2.1% this month',
      icon: Clock,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Active Courses',
      value: '42',
      change: 'This semester',
      icon: BookOpen,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    }
  ];

  return (
    <div className="p-4 space-y-6">
      {/* Welcome Section */}
      <div className="text-center py-6">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-yellow-600 bg-clip-text text-transparent">
          HOD Dashboard
        </h2>
        <p className="text-gray-600 mt-2">Department management and oversight</p>
      </div>

      {/* HOD Stats */}
      <QuickStatsCards stats={hodStats} />

      {/* Department Performance */}
      <Card className="bg-gradient-to-r from-orange-50 to-yellow-50 border-orange-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-orange-600" />
            <span>Department Performance</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-600">Academic Performance</span>
                <span className="text-sm font-bold text-orange-600">8.2/10</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-orange-500 h-2 rounded-full w-4/5 transition-all duration-500" />
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-600">Placement Rate</span>
                <span className="text-sm font-bold text-green-600">92%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full w-11/12 transition-all duration-500" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* HOD Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Department Tools</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" className="h-16 flex flex-col items-center justify-center bg-orange-50 hover:bg-orange-100 border-orange-200">
              <GraduationCap className="w-5 h-5 mb-1 text-orange-600" />
              <span className="text-xs">Students</span>
            </Button>
            <Button variant="outline" className="h-16 flex flex-col items-center justify-center bg-blue-50 hover:bg-blue-100 border-blue-200">
              <Users className="w-5 h-5 mb-1 text-blue-600" />
              <span className="text-xs">Faculty</span>
            </Button>
            <Button variant="outline" className="h-16 flex flex-col items-center justify-center bg-green-50 hover:bg-green-100 border-green-200">
              <Clock className="w-5 h-5 mb-1 text-green-600" />
              <span className="text-xs">Attendance</span>
            </Button>
            <Button variant="outline" className="h-16 flex flex-col items-center justify-center bg-purple-50 hover:bg-purple-100 border-purple-200">
              <Calendar className="w-5 h-5 mb-1 text-purple-600" />
              <span className="text-xs">Schedule</span>
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

export default HODMobileDashboard;
