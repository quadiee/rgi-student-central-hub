
import React, { useState } from 'react';
import { Users, Settings, Shield, MailPlus, Building } from 'lucide-react';
import { useAuth } from '../../contexts/SupabaseAuthContext';
import SuperAdminPanel from './SuperAdminPanel';
import EnhancedUserManagement from './EnhancedUserManagement';
import UnifiedUserInvitationManager from './UnifiedUserInvitationManager';
import DepartmentManagement from './DepartmentManagement';

// Enhanced admin check to include all administrative roles
function isAdmin(user: any) {
  if (!user) return false;
  return ['admin', 'principal', 'chairman'].includes(user.role?.toLowerCase());
}

const AdminPanel: React.FC = () => {
  const { user, loading, profileLoading } = useAuth();
  const [activeSection, setActiveSection] = useState('admin-overview');

  // Show loading state while authentication or profile is loading
  if (loading || profileLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Shield className="w-16 h-16 text-blue-400 mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  // Check if user has admin privileges
  if (!user || !isAdmin(user)) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center max-w-md">
          <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Access Denied</h3>
          <p className="text-gray-600 mb-2">Administrator privileges required.</p>
          <div className="text-sm text-gray-500 space-y-1">
            <p>Current role: <span className="font-mono">{user?.role || 'Not authenticated'}</span></p>
            <p>User: <span className="font-mono">{user?.email || 'Not logged in'}</span></p>
          </div>
        </div>
      </div>
    );
  }

  const sections = [
    { id: 'admin-overview', label: 'Admin Overview', icon: Shield },
    { id: 'user-management', label: 'User Management', icon: Users },
    { id: 'department-management', label: 'Departments', icon: Building },
    { id: 'enhanced-users', label: 'Enhanced Users', icon: Settings },
    { id: 'invite-users', label: 'User Invitations', icon: MailPlus },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'admin-overview':
        return <SuperAdminPanel onUserManagementClick={() => setActiveSection('user-management')} />;
      case 'user-management':
        return <EnhancedUserManagement />;
      case 'department-management':
        return <DepartmentManagement />;
      case 'enhanced-users':
        return (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-semibold mb-4 flex items-center">
              <Settings className="w-5 h-5 mr-2" />
              Enhanced Users
            </h3>
            <p className="text-muted-foreground">Enhanced users panel placeholder.</p>
          </div>
        );
      case 'invite-users':
        return (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-semibold mb-4 flex items-center">
              <MailPlus className="w-5 h-5 mr-2" />
              User Invitations
            </h3>
            <UnifiedUserInvitationManager />
          </div>
        );
      default:
        return <SuperAdminPanel onUserManagementClick={() => setActiveSection('user-management')} />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Admin Panel</h1>
          <p className="text-muted-foreground mt-1">
            Comprehensive administrative control center
          </p>
        </div>
        <div className="flex items-center space-x-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg">
          <Shield className="w-4 h-4" />
          <span className="text-sm font-medium">{user.role} Access</span>
        </div>
      </div>

      {/* Section Tabs */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="border-b border-gray-200">
          <div className="flex overflow-x-auto">
            {sections.map((section) => {
              const Icon = section.icon;
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`flex items-center space-x-2 px-6 py-4 text-sm font-medium transition-colors whitespace-nowrap border-b-2 ${
                    activeSection === section.id
                      ? 'border-blue-500 text-blue-600 bg-blue-50'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{section.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="p-6">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
