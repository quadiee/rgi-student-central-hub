
import React, { useState } from 'react';
import { Users, Settings, Shield, MailPlus } from 'lucide-react';
import { useAuth } from '../../contexts/SupabaseAuthContext';
import SuperAdminPanel from './SuperAdminPanel';
import UserManagement from './UserManagement';
import EnhancedUserManagement from './EnhancedUserManagement';
import UserInvitationManager from './UserInvitationManager';

// Recognize admin/principal as admins
function isAdmin(user: any) {
  return (
    user?.role?.toLowerCase() === 'admin' ||
    user?.role?.toLowerCase() === 'principal'
  );
}

const AdminPanel: React.FC = () => {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState('admin-overview');

  // Check if user has admin privileges
  if (!user || !isAdmin(user)) {
    return (
      <div className="text-center py-8">
        <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">Access denied. Administrator privileges required.</p>
        <p className="text-sm text-gray-400 mt-2">Current role: {user?.role || 'Not authenticated'}</p>
      </div>
    );
  }

  const sections = [
    { id: 'admin-overview', label: 'Admin Overview', icon: Shield },
    { id: 'user-management', label: 'User Management', icon: Users },
    { id: 'enhanced-users', label: 'Enhanced Users', icon: Settings },
    { id: 'invite-users', label: 'Invite Users', icon: MailPlus },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'admin-overview':
        return <SuperAdminPanel onUserManagementClick={() => setActiveSection('user-management')} />;
      case 'user-management':
        return <UserManagement />;
      case 'enhanced-users':
        return <EnhancedUserManagement />;
      case 'invite-users':
        return (
          <div>
            <h3 className="text-xl font-semibold mb-4 flex items-center">
              <MailPlus className="w-5 h-5 mr-2" />
              User Invitations
            </h3>
            <UserInvitationManager />
          </div>
        );
      default:
        return <SuperAdminPanel onUserManagementClick={() => setActiveSection('user-management')} />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Admin Panel</h2>
        <div className="flex items-center space-x-2 text-sm text-blue-600">
          <Shield className="w-4 h-4" />
          <span>Administrator Access ({user.role})</span>
        </div>
      </div>

      {/* Section Tabs */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex space-x-1 mb-6">
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

export default AdminPanel;
