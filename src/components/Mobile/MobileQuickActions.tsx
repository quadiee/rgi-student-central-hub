
import React from 'react';
import { Home, UserCheck, Users, BarChart3, Plus, QrCode, CreditCard, BookOpen } from 'lucide-react';
import { useAuth } from '../../contexts/SupabaseAuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { cn } from '../../lib/utils';

interface MobileQuickActionsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const MobileQuickActions: React.FC<MobileQuickActionsProps> = ({ activeTab, onTabChange }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const getRoleGradient = () => {
    switch (user?.role) {
      case 'chairman':
        return 'from-purple-500 to-blue-500';
      case 'admin':
        return 'from-red-500 to-orange-500';
      case 'principal':
        return 'from-green-500 to-teal-500';
      case 'hod':
        return 'from-orange-500 to-yellow-500';
      case 'faculty':
        return 'from-cyan-500 to-blue-500';
      case 'student':
        return 'from-blue-500 to-indigo-500';
      default:
        return 'from-blue-500 to-purple-500';
    }
  };

  const getQuickActions = () => {
    if (user?.role === 'chairman') {
      return [
        { id: 'dashboard', icon: Home, label: 'Dashboard', color: 'purple', path: '/dashboard' },
        { id: 'faculty', icon: Users, label: 'Faculty', color: 'blue', path: '/faculty' },
        { id: 'reports', icon: BarChart3, label: 'Reports', color: 'indigo', path: '/reports' },
      ];
    }

    if (user?.role === 'admin' || user?.role === 'principal') {
      return [
        { id: 'dashboard', icon: Home, label: 'Home', color: 'blue', path: '/dashboard' },
        { id: 'fees', icon: CreditCard, label: 'Fees', color: 'green', path: '/fees' },
        { id: 'students', icon: Users, label: 'Students', color: 'orange', path: '/students' },
        { id: 'faculty', icon: Users, label: 'Faculty', color: 'purple', path: '/faculty' },
        { id: 'reports', icon: BarChart3, label: 'Reports', color: 'indigo', path: '/reports' },
      ];
    } else if (user?.role === 'hod') {
      return [
        { id: 'dashboard', icon: Home, label: 'Home', color: 'blue', path: '/dashboard' },
        { id: 'fees', icon: CreditCard, label: 'Fees', color: 'green', path: '/fees' },
        { id: 'students', icon: Users, label: 'Students', color: 'orange', path: '/students' },
        { id: 'faculty', icon: Users, label: 'Faculty', color: 'purple', path: '/faculty' },
        { id: 'attendance', icon: UserCheck, label: 'Attendance', color: 'purple', path: '/attendance' },
      ];
    } else {
      return [
        { id: 'dashboard', icon: Home, label: 'Home', color: 'blue', path: '/dashboard' },
        { id: 'fees', icon: CreditCard, label: 'My Fees', color: 'green', path: '/fees' },
        { id: 'attendance', icon: UserCheck, label: 'Attendance', color: 'purple', path: '/attendance' },
        { id: 'exams', icon: BookOpen, label: 'Exams', color: 'red', path: '/exams' },
      ];
    }
  };

  const quickActions = getQuickActions();

  const getColorClasses = (color: string, isActive: boolean) => {
    const colors = {
      blue: isActive ? 'text-blue-600 bg-blue-100' : 'text-blue-500',
      green: isActive ? 'text-green-600 bg-green-100' : 'text-green-500',
      purple: isActive ? 'text-purple-600 bg-purple-100' : 'text-purple-500',
      orange: isActive ? 'text-orange-600 bg-orange-100' : 'text-orange-500',
      indigo: isActive ? 'text-indigo-600 bg-indigo-100' : 'text-indigo-500',
      red: isActive ? 'text-red-600 bg-red-100' : 'text-red-500',
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  const handleTabChange = (actionId: string, path: string) => {
    onTabChange(actionId);
    navigate(path);
  };

  // Determine active tab based on current location
  const getCurrentActiveTab = () => {
    const currentPath = location.pathname;
    const activeAction = quickActions.find(action => action.path === currentPath);
    return activeAction ? activeAction.id : quickActions[0]?.id || 'dashboard';
  };

  const currentActiveTab = getCurrentActiveTab();

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-gray-200 shadow-lg lg:hidden z-40">
      <div className="flex items-center justify-around py-2 px-4">
        {quickActions.map((action) => {
          const Icon = action.icon;
          const isActive = currentActiveTab === action.id;
          
          return (
            <button
              key={action.id}
              onClick={() => handleTabChange(action.id, action.path)}
              className={cn(
                "flex flex-col items-center p-3 rounded-xl transition-all duration-300 min-w-0",
                isActive
                  ? `${getColorClasses(action.color, true)} shadow-lg transform scale-105`
                  : `text-gray-600 hover:text-gray-800 hover:bg-gray-50 ${getColorClasses(action.color, false)}`
              )}
            >
              <Icon className={cn(
                "w-6 h-6 mb-1 transition-transform duration-200",
                isActive ? 'animate-bounce' : ''
              )} />
              <span className="text-xs font-medium truncate">{action.label}</span>
              {isActive && (
                <div className="w-1 h-1 bg-current rounded-full mt-1 animate-pulse" />
              )}
            </button>
          );
        })}
        
        {/* Floating Action Button */}
        <div className="relative">
          <button className={cn(
            "p-3 rounded-full shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-300 animate-pulse text-white",
            `bg-gradient-to-r ${getRoleGradient()}`
          )}>
            <Plus className="w-6 h-6" />
          </button>
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-bounce" />
        </div>
      </div>
    </div>
  );
};

export default MobileQuickActions;
