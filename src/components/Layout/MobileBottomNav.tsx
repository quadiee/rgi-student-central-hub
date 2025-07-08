
import React from 'react';
import { 
  Home, 
  CreditCard, 
  Users, 
  UserCheck, 
  FileText, 
  Settings,
  Crown,
  BookOpen
} from 'lucide-react';

interface MobileBottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  userRole: string;
}

const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ 
  activeTab, 
  onTabChange, 
  userRole 
}) => {
  const getNavItems = () => {
    if (userRole === 'chairman') {
      return [
        { id: 'dashboard', icon: Crown, label: 'Dashboard', color: 'purple' }
      ];
    }

    if (userRole === 'admin' || userRole === 'principal') {
      return [
        { id: 'dashboard', icon: Home, label: 'Home', color: 'blue' },
        { id: 'fees', icon: CreditCard, label: 'Fees', color: 'green' },
        { id: 'students', icon: Users, label: 'Students', color: 'orange' },
        { id: 'reports', icon: FileText, label: 'Reports', color: 'indigo' },
        { id: 'admin', icon: Settings, label: 'Admin', color: 'gray' }
      ];
    } else if (userRole === 'hod') {
      return [
        { id: 'dashboard', icon: Home, label: 'Home', color: 'blue' },
        { id: 'fees', icon: CreditCard, label: 'Fees', color: 'green' },
        { id: 'students', icon: Users, label: 'Students', color: 'orange' },
        { id: 'attendance', icon: UserCheck, label: 'Attendance', color: 'purple' },
        { id: 'reports', icon: FileText, label: 'Reports', color: 'indigo' }
      ];
    } else {
      return [
        { id: 'dashboard', icon: Home, label: 'Home', color: 'blue' },
        { id: 'fees', icon: CreditCard, label: 'My Fees', color: 'green' },
        { id: 'attendance', icon: UserCheck, label: 'Attendance', color: 'purple' },
        { id: 'exams', icon: BookOpen, label: 'Exams', color: 'red' }
      ];
    }
  };

  const navItems = getNavItems();

  const getColorClasses = (color: string, isActive: boolean) => {
    const colorMap = {
      blue: isActive ? 'text-blue-600 bg-blue-100' : 'text-gray-500 hover:text-blue-500',
      green: isActive ? 'text-green-600 bg-green-100' : 'text-gray-500 hover:text-green-500',
      purple: isActive ? 'text-purple-600 bg-purple-100' : 'text-gray-500 hover:text-purple-500',
      orange: isActive ? 'text-orange-600 bg-orange-100' : 'text-gray-500 hover:text-orange-500',
      indigo: isActive ? 'text-indigo-600 bg-indigo-100' : 'text-gray-500 hover:text-indigo-500',
      red: isActive ? 'text-red-600 bg-red-100' : 'text-gray-500 hover:text-red-500',
      gray: isActive ? 'text-gray-700 bg-gray-100' : 'text-gray-500 hover:text-gray-600'
    };
    return colorMap[color as keyof typeof colorMap] || colorMap.blue;
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-gray-200 px-2 py-2 z-30">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`flex flex-col items-center justify-center py-2 px-3 rounded-2xl min-w-0 flex-1 mx-1 transition-all duration-200 ${
                isActive
                  ? `${getColorClasses(item.color, true)} shadow-sm scale-105`
                  : `${getColorClasses(item.color, false)} hover:bg-gray-50`
              }`}
            >
              <Icon className={`w-6 h-6 mb-1 ${isActive ? 'animate-pulse' : ''}`} />
              <span className="text-xs font-medium truncate w-full text-center">
                {item.label}
              </span>
              {isActive && (
                <div className="w-1 h-1 bg-current rounded-full mt-1 animate-pulse"></div>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileBottomNav;
