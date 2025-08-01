
import React, { useState } from 'react';
import { useAuth } from '../../../contexts/SupabaseAuthContext';
import { 
  Users, 
  GraduationCap, 
  CreditCard, 
  BarChart3,
  TrendingUp,
  Building,
  BookOpen,
  AlertCircle
} from 'lucide-react';
import { Card, CardContent } from '../../ui/card';
import { Button } from '../../ui/button';
import { useNavigate } from 'react-router-dom';

const ChairmanMobileDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  console.log('=== ChairmanMobileDashboard START ===');
  console.log('ChairmanMobileDashboard - Component loaded');
  console.log('ChairmanMobileDashboard - User:', user);

  const stats = [
    {
      title: 'Total Students',
      value: '2,847',
      change: '+12% from last month',
      icon: GraduationCap,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Faculty Members',
      value: '156',
      change: '+3 new this month',
      icon: Users,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Fee Collection',
      value: '₹1.2Cr',
      change: '85% collected',
      icon: CreditCard,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      title: 'Departments',
      value: '8',
      change: 'All active',
      icon: Building,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    }
  ];

  const quickActions = [
    {
      title: 'Student Management',
      description: 'View all students across departments',
      icon: GraduationCap,
      route: '/students',
      color: 'bg-blue-50 hover:bg-blue-100 border-blue-200'
    },
    {
      title: 'Faculty Overview',
      description: 'Manage faculty across all departments',
      icon: Users,
      route: '/faculty',
      color: 'bg-green-50 hover:bg-green-100 border-green-200'
    },
    {
      title: 'Fee Management',
      description: 'Monitor fee collection and payments',
      icon: CreditCard,
      route: '/fees',
      color: 'bg-purple-50 hover:bg-purple-100 border-purple-200'
    },
    {
      title: 'Reports & Analytics',
      description: 'View institutional reports',
      icon: BarChart3,
      route: '/reports',
      color: 'bg-orange-50 hover:bg-orange-100 border-orange-200'
    }
  ];

  const recentActivity = [
    {
      action: 'New faculty member added',
      department: 'Computer Science',
      time: '2 hours ago',
      icon: Users
    },
    {
      action: 'Fee payment received',
      department: 'Electronics & Communication',
      time: '4 hours ago',
      icon: CreditCard
    },
    {
      action: 'Student enrollment completed',
      department: 'Mechanical Engineering',
      time: '1 day ago',
      icon: GraduationCap
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950 dark:to-blue-950">
      {/* DEBUG Header */}
      <div className="bg-green-100 border-b-4 border-green-400 p-4 sticky top-0 z-50">
        <p className="text-green-800 font-bold text-center">✅ SUCCESS: ChairmanMobileDashboard is rendering!</p>
        <p className="text-green-600 text-sm text-center mt-1">User: {user?.name} | Role: {user?.role}</p>
      </div>

      {/* Header */}
      <div className="bg-white/80 backdrop-blur-lg border-b border-purple-200 p-4 sticky top-16 z-10">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Chairman Dashboard</h1>
          <p className="text-sm text-gray-600 mt-1">
            Welcome back, {user?.name || 'Chairman'}
          </p>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Success Indicator */}
        <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
            <p className="text-green-800 font-medium">Dashboard Successfully Loaded</p>
          </div>
          <p className="text-green-600 text-sm mt-1">All components are rendering correctly</p>
        </div>

        {/* Institution Stats */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Institution Overview</h2>
          <div className="grid grid-cols-2 gap-4">
            {stats.map((stat, index) => (
              <Card key={index} className="bg-white/90 backdrop-blur-sm border-0 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                      <stat.icon className={`h-5 w-5 ${stat.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-600 truncate">{stat.title}</p>
                      <p className="text-lg font-bold text-gray-900">{stat.value}</p>
                      <p className="text-xs text-gray-500 truncate">{stat.change}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="space-y-3">
            {quickActions.map((action, index) => (
              <Button
                key={index}
                variant="outline"
                className={`w-full p-4 h-auto justify-start ${action.color}`}
                onClick={() => navigate(action.route)}
              >
                <div className="flex items-center space-x-4 w-full">
                  <action.icon className="h-6 w-6 text-gray-700" />
                  <div className="text-left flex-1">
                    <div className="font-medium text-gray-900">{action.title}</div>
                    <div className="text-sm text-gray-600">{action.description}</div>
                  </div>
                </div>
              </Button>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
          <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="p-2 rounded-lg bg-gray-100">
                      <activity.icon className="h-4 w-4 text-gray-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                      <p className="text-xs text-gray-600">{activity.department} • {activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* System Status */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">System Status</h2>
          <div className="grid grid-cols-2 gap-4">
            <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-sm">
              <CardContent className="p-4 text-center">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
                <p className="text-sm font-medium text-gray-900">All Systems</p>
                <p className="text-xs text-green-600">Operational</p>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-sm">
              <CardContent className="p-4 text-center">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <BookOpen className="w-4 h-4 text-blue-600" />
                </div>
                <p className="text-sm font-medium text-gray-900">Academic Year</p>
                <p className="text-xs text-blue-600">2024-25</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Footer Debug Info */}
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mt-8">
          <p className="text-blue-800 font-medium text-center">🎉 Dashboard Fully Loaded</p>
          <p className="text-blue-600 text-sm text-center mt-1">
            Timestamp: {new Date().toLocaleTimeString()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChairmanMobileDashboard;
