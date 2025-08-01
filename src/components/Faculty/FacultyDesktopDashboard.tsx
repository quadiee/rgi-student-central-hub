
import React from 'react';
import { useAuth } from '../../contexts/SupabaseAuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Calendar, Clock, BookOpen, Users, TrendingUp, Award, Bell, Settings } from 'lucide-react';

const FacultyDesktopDashboard: React.FC = () => {
  const { user } = useAuth();

  const quickStats = [
    {
      title: 'My Courses',
      value: '4',
      change: 'Current Semester',
      icon: BookOpen,
      color: 'text-blue-600'
    },
    {
      title: 'Total Students',
      value: '180',
      change: 'All Courses',
      icon: Users,
      color: 'text-green-600'
    },
    {
      title: 'Attendance Rate',
      value: '95%',
      change: 'This Month',
      icon: Clock,
      color: 'text-purple-600'
    },
    {
      title: 'Classes Today',
      value: '3',
      change: 'Remaining',
      icon: Calendar,
      color: 'text-orange-600'
    }
  ];

  const quickActions = [
    {
      title: 'Mark Attendance',
      description: 'Record student attendance for today\'s classes',
      icon: Clock,
      action: () => console.log('Mark attendance')
    },
    {
      title: 'View Timetable',
      description: 'Check your weekly class schedule',
      icon: Calendar,
      action: () => console.log('View timetable')
    },
    {
      title: 'Manage Courses',
      description: 'Update course content and materials',
      icon: BookOpen,
      action: () => console.log('Manage courses')
    },
    {
      title: 'Student Grades',
      description: 'View and update student grades',
      icon: TrendingUp,
      action: () => console.log('Student grades')
    },
    {
      title: 'Apply for Leave',
      description: 'Submit leave applications',
      icon: Bell,
      action: () => console.log('Apply for leave')
    },
    {
      title: 'Profile Settings',
      description: 'Update your faculty profile',
      icon: Settings,
      action: () => console.log('Profile settings')
    }
  ];

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Welcome back, {user?.name || 'Faculty'}</h1>
          <p className="text-muted-foreground mt-1">
            {user?.department_name || 'Faculty'} Department • {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </Button>
          <Button className="gap-2">
            <Award className="h-4 w-4" />
            Performance
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {quickStats.map((stat, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">
                    {stat.change}
                  </p>
                </div>
                <stat.icon className={`h-8 w-8 ${stat.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Today's Schedule */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Today's Schedule
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
              <div>
                <h4 className="font-semibold">Data Structures</h4>
                <p className="text-sm text-muted-foreground">CSE 3rd Year - Section A</p>
              </div>
              <div className="text-right">
                <p className="font-medium">09:00 - 10:00 AM</p>
                <p className="text-sm text-green-600">Room 301</p>
              </div>
            </div>
            <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
              <div>
                <h4 className="font-semibold">Algorithms</h4>
                <p className="text-sm text-muted-foreground">CSE 4th Year - Section B</p>
              </div>
              <div className="text-right">
                <p className="font-medium">11:00 - 12:00 PM</p>
                <p className="text-sm text-green-600">Room 205</p>
              </div>
            </div>
            <div className="flex justify-between items-center p-4 bg-orange-50 rounded-lg">
              <div>
                <h4 className="font-semibold">Database Systems</h4>
                <p className="text-sm text-muted-foreground">CSE 3rd Year - Section C</p>
              </div>
              <div className="text-right">
                <p className="font-medium">02:00 - 03:00 PM</p>
                <p className="text-sm text-green-600">Lab 1</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {quickActions.map((action, index) => (
              <Button
                key={index}
                variant="outline"
                className="h-auto p-4 flex flex-col items-start gap-2 text-left hover:bg-muted"
                onClick={action.action}
              >
                <action.icon className="h-6 w-6 text-primary" />
                <div>
                  <h4 className="font-semibold">{action.title}</h4>
                  <p className="text-sm text-muted-foreground">{action.description}</p>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm">Attendance marked for Data Structures - Section A</p>
                <p className="text-xs text-muted-foreground">2 hours ago</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm">Assignment uploaded for Algorithms course</p>
                <p className="text-xs text-muted-foreground">1 day ago</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm">Leave application submitted</p>
                <p className="text-xs text-muted-foreground">3 days ago</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FacultyDesktopDashboard;
