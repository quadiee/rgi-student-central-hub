
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-4">
      <div className="max-w-md mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Chairman Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user?.name || 'Chairman'}</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Card>
            <CardContent className="p-4 text-center">
              <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-600">Total Students</p>
              <p className="text-2xl font-bold text-gray-900">2,847</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <Building className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-600">Faculty</p>
              <p className="text-2xl font-bold text-gray-900">156</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <BarChart3 className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-600">Departments</p>
              <p className="text-2xl font-bold text-gray-900">12</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <TrendingUp className="w-8 h-8 text-orange-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-600">Revenue</p>
              <p className="text-2xl font-bold text-gray-900">₹2.4Cr</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="space-y-3">
          <Button
            className="w-full p-4 h-auto bg-blue-600 hover:bg-blue-700 text-white"
            onClick={() => navigate('/students')}
          >
            <div className="flex items-center space-x-4 w-full">
              <GraduationCap className="h-6 w-6" />
              <div className="text-left flex-1">
                <div className="font-medium">Student Management</div>
                <div className="text-sm opacity-90">View and manage all students</div>
              </div>
            </div>
          </Button>

          <Button
            className="w-full p-4 h-auto bg-green-600 hover:bg-green-700 text-white"
            onClick={() => navigate('/faculty')}
          >
            <div className="flex items-center space-x-4 w-full">
              <Users className="h-6 w-6" />
              <div className="text-left flex-1">
                <div className="font-medium">Faculty Overview</div>
                <div className="text-sm opacity-90">Manage faculty members</div>
              </div>
            </div>
          </Button>

          <Button
            className="w-full p-4 h-auto bg-purple-600 hover:bg-purple-700 text-white"
            onClick={() => navigate('/fees')}
          >
            <div className="flex items-center space-x-4 w-full">
              <CreditCard className="h-6 w-6" />
              <div className="text-left flex-1">
                <div className="font-medium">Fee Management</div>
                <div className="text-sm opacity-90">Monitor fee collections</div>
              </div>
            </div>
          </Button>

          <Button
            variant="outline"
            className="w-full p-4 h-auto"
            onClick={() => navigate('/reports')}
          >
            <div className="flex items-center space-x-4 w-full">
              <BarChart3 className="h-6 w-6" />
              <div className="text-left flex-1">
                <div className="font-medium">Reports & Analytics</div>
                <div className="text-sm text-gray-600">View detailed reports</div>
              </div>
            </div>
          </Button>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
              <AlertCircle className="w-5 h-5 mr-2 text-orange-500" />
              Recent Activity
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">New admissions</span>
                <span className="font-medium">+24 today</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Fee collections</span>
                <span className="font-medium text-green-600">₹2.1L today</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Pending approvals</span>
                <span className="font-medium text-orange-600">8 items</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ChairmanMobileDashboard;
