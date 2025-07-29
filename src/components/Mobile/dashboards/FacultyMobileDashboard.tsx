
import React from 'react';
import { useAuth } from '../../../contexts/SupabaseAuthContext';
import QuickStatsCards from '../QuickStatsCards';
import RecentActivityFeed from '../RecentActivityFeed';
import NotificationCenter from '../NotificationCenter';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { 
  Users, 
  Clock, 
  BookOpen, 
  Calendar, 
  CheckCircle,
  TrendingUp,
  FileText,
  QrCode
} from 'lucide-react';

const FacultyMobileDashboard: React.FC = () => {
  const { user } = useAuth();

  const facultyStats = [
    {
      title: 'My Classes',
      value: '6',
      change: 'Active this sem',
      icon: BookOpen,
      color: 'text-cyan-600',
      bgColor: 'bg-cyan-50'
    },
    {
      title: 'Students',
      value: '234',
      change: 'Under supervision',
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Attendance Rate',
      value: '94.2%',
      change: 'This month',
      icon: Clock,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Assignments',
      value: '18',
      change: 'Pending review',
      icon: FileText,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    }
  ];

  return (
    <div className="p-4 space-y-6">
      {/* Welcome Section */}
      <div className="text-center py-6">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
          Faculty Dashboard
        </h2>
        <p className="text-gray-600 mt-2">Teaching and student management</p>
      </div>

      {/* Faculty Stats */}
      <QuickStatsCards stats={facultyStats} />

      {/* Teaching Overview */}
      <Card className="bg-gradient-to-r from-cyan-50 to-blue-50 border-cyan-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-cyan-600" />
            <span>Teaching Performance</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-600">Class Completion</span>
                <span className="text-sm font-bold text-cyan-600">78%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-cyan-500 h-2 rounded-full w-3/4 transition-all duration-500" />
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-600">Student Satisfaction</span>
                <span className="text-sm font-bold text-blue-600">4.7/5</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full w-11/12 transition-all duration-500" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Faculty Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" className="h-16 flex flex-col items-center justify-center bg-cyan-50 hover:bg-cyan-100 border-cyan-200">
              <QrCode className="w-5 h-5 mb-1 text-cyan-600" />
              <span className="text-xs">Mark Attendance</span>
            </Button>
            <Button variant="outline" className="h-16 flex flex-col items-center justify-center bg-blue-50 hover:bg-blue-100 border-blue-200">
              <Calendar className="w-5 h-5 mb-1 text-blue-600" />
              <span className="text-xs">Schedule Class</span>
            </Button>
            <Button variant="outline" className="h-16 flex flex-col items-center justify-center bg-green-50 hover:bg-green-100 border-green-200">
              <CheckCircle className="w-5 h-5 mb-1 text-green-600" />
              <span className="text-xs">Grade Students</span>
            </Button>
            <Button variant="outline" className="h-16 flex flex-col items-center justify-center bg-purple-50 hover:bg-purple-100 border-purple-200">
              <FileText className="w-5 h-5 mb-1 text-purple-600" />
              <span className="text-xs">Assignments</span>
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

export default FacultyMobileDashboard;
