
import React, { useState } from 'react';
import { Users, Mail, Settings } from 'lucide-react';
import UserManagement from './UserManagement';
import UserInvitationManager from './UserInvitationManager';
import { useAuth } from '../../contexts/SupabaseAuthContext';

const AdminPanel: React.FC = () => {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState('users');

  if (!user || !['admin', 'principal'].includes(user.role)) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Access denied. Administrator privileges required.</p>
      </div>
    );
  }

  const sections = [
    { id: 'users', label: 'User Management', icon: Users },
    { id: 'invitations', label: 'Send Invitations', icon: Mail },
    { id: 'settings', label: 'System Settings', icon: Settings }
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'users':
        return <UserManagement />;
      case 'invitations':
        return <UserInvitationManager />;
      case 'settings':
        return (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">System Settings</h3>
            <p className="text-gray-600">System configuration options will be available here.</p>
          </div>
        );
      default:
        return <UserManagement />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Admin Panel</h2>
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
