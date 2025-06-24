
import React, { useState } from 'react';
import { Calendar, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Button } from '../ui/button';
import LeaveRequestForm from './LeaveRequestForm';
import LeaveApprovalQueue from './LeaveApprovalQueue';

const LeaveManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState('request');

  const tabs = [
    { id: 'request', label: 'Request Leave', icon: Calendar },
    { id: 'approval', label: 'Approval Queue', icon: CheckCircle },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'request':
        return <LeaveRequestForm />;
      case 'approval':
        return <LeaveApprovalQueue />;
      default:
        return <LeaveRequestForm />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Leave Management</h2>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-xl shadow-lg p-1">
        <div className="flex gap-1">
          {tabs.map(tab => {
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

export default LeaveManagement;
