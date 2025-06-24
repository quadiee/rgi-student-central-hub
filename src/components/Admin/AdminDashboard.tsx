
import React from 'react';
import { Users, Mail, Settings, UserPlus, Shield } from 'lucide-react';
import { useAuth } from '../../contexts/SupabaseAuthContext';
import { useAdminStats } from '../../hooks/useAdminStats';
import AdminPanel from './AdminPanel';

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const { stats } = useAdminStats();

  if (!user || !['admin', 'principal'].includes(user.role)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Access Denied</h2>
          <p className="text-gray-600">Administrator privileges required to access this section.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <Shield className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-800">Administration Dashboard</h1>
          </div>
          <p className="text-gray-600">Manage users, system settings, and institutional data</p>
        </div>

        {/* Admin Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Users</p>
                <p className="text-2xl font-bold text-blue-600">
                  {stats.loading ? '...' : stats.totalUsers}
                </p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Pending Invitations</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {stats.loading ? '...' : stats.pendingInvitations}
                </p>
              </div>
              <Mail className="w-8 h-8 text-yellow-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Active Students</p>
                <p className="text-2xl font-bold text-green-600">
                  {stats.loading ? '...' : stats.activeStudents}
                </p>
              </div>
              <UserPlus className="w-8 h-8 text-green-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Faculty Members</p>
                <p className="text-2xl font-bold text-purple-600">
                  {stats.loading ? '...' : stats.facultyMembers}
                </p>
              </div>
              <Settings className="w-8 h-8 text-purple-500" />
            </div>
          </div>
        </div>

        {/* Main Admin Panel */}
        <AdminPanel />
      </div>
    </div>
  );
};

export default AdminDashboard;
