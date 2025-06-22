
import React, { useState } from 'react';
import { Users, BookOpen, Settings, UserPlus, Plus, Edit, Trash2 } from 'lucide-react';
import { Button } from '../ui/button';
import { useToast } from '../ui/use-toast';
import UserManagement from './UserManagement';
import CourseManagement from './CourseManagement';
import SystemSettings from './SystemSettings';

const AdminPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState('users');
  const { toast } = useToast();

  const renderTabContent = () => {
    switch (activeTab) {
      case 'users':
        return <UserManagement />;
      case 'courses':
        return <CourseManagement />;
      case 'settings':
        return <SystemSettings />;
      default:
        return <UserManagement />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">System Administration</h2>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-xl shadow-lg p-1">
        <div className="flex space-x-1">
          {[
            { id: 'users', label: 'User Management', icon: Users },
            { id: 'courses', label: 'Course Management', icon: BookOpen },
            { id: 'settings', label: 'System Settings', icon: Settings },
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      {renderTabContent()}
    </div>
  );
};

export default AdminPanel;
