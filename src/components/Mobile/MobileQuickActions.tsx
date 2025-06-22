
import React from 'react';
import { Home, UserCheck, Users, BarChart3, Plus, QrCode } from 'lucide-react';

interface MobileQuickActionsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const MobileQuickActions: React.FC<MobileQuickActionsProps> = ({ activeTab, onTabChange }) => {
  const quickActions = [
    { id: 'dashboard', icon: Home, label: 'Home' },
    { id: 'attendance', icon: UserCheck, label: 'Attendance' },
    { id: 'students', icon: Users, label: 'Students' },
    { id: 'reports', icon: BarChart3, label: 'Reports' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg lg:hidden">
      <div className="flex items-center justify-around py-2">
        {quickActions.map((action) => {
          const Icon = action.icon;
          const isActive = activeTab === action.id;
          
          return (
            <button
              key={action.id}
              onClick={() => onTabChange(action.id)}
              className={`flex flex-col items-center p-2 rounded-lg transition-colors ${
                isActive
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <Icon className="w-6 h-6 mb-1" />
              <span className="text-xs font-medium">{action.label}</span>
            </button>
          );
        })}
        
        {/* Floating Action Button */}
        <div className="relative">
          <button className="bg-gradient-to-r from-blue-500 to-purple-500 text-white p-3 rounded-full shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-200">
            <Plus className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MobileQuickActions;
