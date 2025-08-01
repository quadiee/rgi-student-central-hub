
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

  // Force console logs
  console.log('%c=== CHAIRMAN MOBILE DASHBOARD RENDERING ===', 'background: red; color: white; font-size: 16px; padding: 10px;');
  console.log('ChairmanMobileDashboard - Component loaded at:', new Date().toISOString());
  console.log('ChairmanMobileDashboard - User:', user);
  console.log('ChairmanMobileDashboard - Window location:', window.location.href);
  console.log('ChairmanMobileDashboard - Document ready state:', document.readyState);

  // Force a visible, unmistakable render
  return (
    <div 
      className="fixed inset-0 z-[9999] bg-red-500 overflow-auto"
      style={{ 
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
        backgroundColor: '#ef4444',
        overflow: 'auto'
      }}
    >
      {/* EMERGENCY VISIBILITY TEST */}
      <div 
        className="w-full h-screen bg-yellow-400 p-4"
        style={{
          width: '100%',
          height: '100vh',
          backgroundColor: '#facc15',
          padding: '16px',
          minHeight: '100vh'
        }}
      >
        <div className="bg-green-500 p-8 rounded-lg text-center text-white font-bold text-2xl mb-4">
          🚨 CHAIRMAN DASHBOARD IS RENDERING! 🚨
        </div>
        
        <div className="bg-blue-500 p-4 rounded text-white mb-4">
          <h1 className="text-xl font-bold mb-2">EMERGENCY DEBUG INFO</h1>
          <p>✅ Component: ChairmanMobileDashboard</p>
          <p>✅ Time: {new Date().toLocaleTimeString()}</p>
          <p>✅ User: {user?.name || 'No user'}</p>
          <p>✅ Role: {user?.role || 'No role'}</p>
          <p>✅ Path: {window.location.pathname}</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Chairman Dashboard</h2>
          <p className="text-gray-700 mb-4">
            Welcome back, {user?.name || 'Chairman'}
          </p>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-blue-100 p-4 rounded-lg text-center">
              <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <p className="text-sm font-medium">Total Students</p>
              <p className="text-xl font-bold">2,847</p>
            </div>
            <div className="bg-green-100 p-4 rounded-lg text-center">
              <Building className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <p className="text-sm font-medium">Faculty</p>
              <p className="text-xl font-bold">156</p>
            </div>
          </div>

          <div className="space-y-3">
            <Button
              className="w-full p-4 h-auto bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() => navigate('/students')}
            >
              <div className="flex items-center space-x-4 w-full">
                <GraduationCap className="h-6 w-6" />
                <div className="text-left flex-1">
                  <div className="font-medium">Student Management</div>
                  <div className="text-sm opacity-90">View all students</div>
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
                  <div className="text-sm opacity-90">Manage faculty</div>
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
                  <div className="text-sm opacity-90">Monitor payments</div>
                </div>
              </div>
            </Button>
          </div>
        </div>

        <div className="bg-orange-500 p-4 rounded mt-4 text-white text-center">
          <p className="font-bold">🎯 IF YOU CAN SEE THIS, THE COMPONENT IS WORKING!</p>
          <p className="text-sm mt-1">Timestamp: {new Date().toISOString()}</p>
        </div>
      </div>
    </div>
  );
};

export default ChairmanMobileDashboard;
