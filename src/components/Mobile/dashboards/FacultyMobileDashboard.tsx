
import React from 'react';
import { useAuth } from '../../../contexts/SupabaseAuthContext';
import QuickStatsCards from '../QuickStatsCards';
import RecentActivityFeed from '../RecentActivityFeed';
import NotificationCenter from '../NotificationCenter';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { 
  Users, 
  BookOpen, 
  Clock, 
  Calendar, 
  CheckCircle,
  FileText,
  Award,
  GraduationCap
} from 'lucide-react';

const FacultyMobileDashboard: React.FC = () => {
  const { user } = useAuth();

  const facultyStats = [
    {
      title: 'My Students',
      value: '145',
      change: '3 classes',
      icon: GraduationCap,
      color: 'text-cyan-600',
      bgColor: 'bg-cyan-50'
    },
    {
      title: 'Classes Today',
      value: '4',
      change: '2 completed',
      icon: BookOpen,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Attendance Rate',
      value: '89%',
      change: 'This month',
      icon: Clock,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Assignments',
      value: '12',
      change: '8 pending review',
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
        <p className="text-gray-600 mt-2">Teaching and student management portal</p>
      </div>

      {/* Faculty Stats */}
      <QuickStatsCards stats={facultyStats} />

      {/* Today's Schedule */}
      <Card className="bg-gradient-to-r from-cyan-50 to-blue-50 border-cyan-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-cyan-600" />
            <span>Today's Schedule</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-white/70 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Data Structures</p>
                <p className="text-sm text-gray-600">10:00 AM - Room 301</p>
              </div>
              <CheckCircle className="w-5 h-5 text-green-500" />
            </div>
            <div className="flex justify-between items-center p-3 bg-white/70 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Algorithms Lab</p>
                <p className="text-sm text-gray-600">2:00 PM - Lab 2</p>
              </div>
              <Clock className="w-5 h-5 text-orange-500" />
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
              <Clock className="w-5 h-5 mb-1 text-cyan-600" />
              <span className="text-xs">Mark Attendance</span>
            </Button>
            <Button variant="outline" className="h-16 flex flex-col items-center justify-center bg-blue-50 hover:bg-blue-100 border-blue-200">
              <BookOpen className="w-5 h-5 mb-1 text-blue-600" />
              <span className="text-xs">My Classes</span>
            </Button>
            <Button variant="outline" className="h-16 flex flex-col items-center justify-center bg-purple-50 hover:bg-purple-100 border-purple-200">
              <FileText className="w-5 h-5 mb-1 text-purple-600" />
              <span className="text-xs">Assignments</span>
            </Button>
            <Button variant="outline" className="h-16 flex flex-col items-center justify-center bg-green-50 hover:bg-green-100 border-green-200">
              <Award className="w-5 h-5 mb-1 text-green-600" />
              <span className="text-xs">Grades</span>
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
