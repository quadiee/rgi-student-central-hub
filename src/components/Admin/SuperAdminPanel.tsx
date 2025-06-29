import React, { useState, useEffect } from 'react';
import { Users, Settings, Eye, EyeOff, Shield, UserCheck, Building } from 'lucide-react';
import { Button } from '../ui/button';
import { useToast } from '../ui/use-toast';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../integrations/supabase/client';
import UserRoleManager from './UserRoleManager';
import AdminImpersonationPanel from './AdminImpersonationPanel';
import EnhancedUserInvitationManager from './EnhancedUserInvitationManager';

interface SuperAdminPanelProps {
  onUserManagementClick?: () => void;
}

function isAdmin(user) {
  return user?.role?.toLowerCase() === 'admin';
}

const SuperAdminPanel: React.FC<SuperAdminPanelProps> = ({ onUserManagementClick }) => {
  const { user, hasPermission, isImpersonating, exitImpersonation } = useAuth();
  const [activeSection, setActiveSection] = useState('overview');
  const [systemStats, setSystemStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalDepartments: 0,
    pendingInvitations: 0
  });
  const { toast } = useToast();

  useEffect(() => {
    loadSystemStats();
  }, []);

  const loadSystemStats = async () => {
    try {
      const [usersQuery, departmentsQuery, invitationsQuery] = await Promise.all([
        supabase.from('profiles').select('id, is_active'),
        supabase.from('departments').select('id').eq('is_active', true),
        supabase.from('user_invitations').select('id').eq('is_active', true).is('used_at', null)
      ]);

      const users = usersQuery.data || [];
      const departments = departmentsQuery.data || [];
      const invitations = invitationsQuery.data || [];

      setSystemStats({
        totalUsers: users.length,
        activeUsers: users.filter(u => u.is_active).length,
        totalDepartments: departments.length,
        pendingInvitations: invitations.length
      });
    } catch (error) {
      console.error('Error loading system stats:', error);
    }
  };

  // Grant access if admin, or if hasPermission returns true
  if (!user || (!isAdmin(user) && !hasPermission('access_admin_panel'))) {
    return (
      <div className="text-center py-8">
        <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">Access denied. Administrator privileges required.</p>
      </div>
    );
  }

  const sections = [
    { id: 'overview', label: 'System Overview', icon: Settings },
    { id: 'users', label: 'User Management', icon: Users },
    { id: 'roles', label: 'Role Management', icon: Shield },
    { id: 'impersonation', label: 'User Impersonation', icon: Eye },
    { id: 'invitations', label: 'Bulk Invitations', icon: UserCheck },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-blue-50 p-6 rounded-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-600 text-sm font-medium">Total Users</p>
                    <p className="text-2xl font-bold text-blue-900">{systemStats.totalUsers}</p>
                  </div>
                  <Users className="w-8 h-8 text-blue-600" />
                </div>
              </div>
              
              <div className="bg-green-50 p-6 rounded-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-600 text-sm font-medium">Active Users</p>
                    <p className="text-2xl font-bold text-green-900">{systemStats.activeUsers}</p>
                  </div>
                  <UserCheck className="w-8 h-8 text-green-600" />
                </div>
              </div>
              
              <div className="bg-purple-50 p-6 rounded-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-600 text-sm font-medium">Departments</p>
                    <p className="text-2xl font-bold text-purple-900">{systemStats.totalDepartments}</p>
                  </div>
                  <Building className="w-8 h-8 text-purple-600" />
                </div>
              </div>
              
              <div className="bg-orange-50 p-6 rounded-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-600 text-sm font-medium">Pending Invitations</p>
                    <p className="text-2xl font-bold text-orange-900">{systemStats.pendingInvitations}</p>
                  </div>
                  <Settings className="w-8 h-8 text-orange-600" />
                </div>
              </div>
            </div>

            {isImpersonating && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Eye className="w-5 h-5 text-yellow-600" />
                    <span className="text-yellow-800 font-medium">
                      Currently impersonating another user
                    </span>
                  </div>
                  <Button
                    onClick={exitImpersonation}
                    variant="outline"
                    size="sm"
                    className="text-yellow-700 border-yellow-300 hover:bg-yellow-100"
                  >
                    <EyeOff className="w-4 h-4 mr-2" />
                    Exit Impersonation
                  </Button>
                </div>
              </div>
            )}

            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button
                  onClick={() => setActiveSection('users')}
                  className="flex items-center justify-center space-x-2 h-12"
                >
                  <Users className="w-5 h-5" />
                  <span>Manage Users</span>
                </Button>
                <Button
                  onClick={() => setActiveSection('invitations')}
                  variant="outline"
                  className="flex items-center justify-center space-x-2 h-12"
                >
                  <UserCheck className="w-5 h-5" />
                  <span>Send Invitations</span>
                </Button>
              </div>
            </div>
          </div>
        );
      
      case 'users':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800">User Management</h3>
              <Button onClick={onUserManagementClick} variant="outline">
                View Detailed User Management
              </Button>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6">
              <p className="text-gray-600">
                Advanced user management features are available in the detailed user management section.
                Use the button above to access full user management capabilities.
              </p>
            </div>
          </div>
        );
      
      case 'roles':
        return <UserRoleManager />;
      
      case 'impersonation':
        return <AdminImpersonationPanel />;
      
      case 'invitations':
        return <EnhancedUserInvitationManager />;
      
      default:
        return <div>Section not found</div>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Admin Panel</h2>
        {hasPermission('manage_users') && (
          <div className="flex items-center space-x-2 text-sm text-green-600">
            <Shield className="w-4 h-4" />
            <span>Full System Access</span>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex flex-wrap gap-2 mb-6">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  activeSection === section.id
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{section.label}</span>
              </button>
            );
          })}
        </div>

        {renderContent()}
      </div>
    </div>
  );
};

export default SuperAdminPanel;