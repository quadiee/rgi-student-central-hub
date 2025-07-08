
import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  CreditCard, 
  Settings,
  FileText,
  UserCheck,
  GraduationCap,
  LogOut,
  Crown
} from 'lucide-react';
import { useAuth } from '../../contexts/SupabaseAuthContext';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange }) => {
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    window.location.href = '/';
  };

  const getMenuItems = () => {
    const baseItems = [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard }
    ];

    // Chairman only sees dashboard
    if (user?.role === 'chairman') {
      return baseItems;
    }

    if (user?.role === 'admin' || user?.role === 'principal') {
      return [
        ...baseItems,
        { id: 'fees', label: 'Fee Management', icon: CreditCard },
        { id: 'students', label: 'Students', icon: Users },
        { id: 'attendance', label: 'Attendance', icon: UserCheck },
        { id: 'exams', label: 'Exams', icon: FileText },
        { id: 'reports', label: 'Reports', icon: FileText },
        { id: 'admin', label: 'Admin Panel', icon: Settings }
      ];
    } else if (user?.role === 'hod') {
      return [
        ...baseItems,
        { id: 'fees', label: 'Fee Management', icon: CreditCard },
        { id: 'students', label: 'Department Students', icon: Users },
        { id: 'attendance', label: 'Attendance', icon: UserCheck },
        { id: 'exams', label: 'Exams', icon: FileText },
        { id: 'reports', label: 'Reports', icon: FileText }
      ];
    } else {
      return [
        ...baseItems,
        { id: 'fees', label: 'My Fees', icon: CreditCard }
      ];
    }
  };

  const menuItems = getMenuItems();

  // Get the appropriate icon and title based on role
  const getSidebarHeader = () => {
    if (user?.role === 'chairman') {
      return {
        icon: Crown,
        title: 'RGCE Portal',
        subtitle: 'Chairman Panel'
      };
    }
    return {
      icon: GraduationCap,
      title: 'RGCE Portal',
      subtitle: 'Fee Management'
    };
  };

  const headerInfo = getSidebarHeader();
  const HeaderIcon = headerInfo.icon;

  return (
    <div className="bg-white shadow-lg h-full w-64 fixed left-0 top-0 z-10">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg ${user?.role === 'chairman' ? 'bg-gradient-to-r from-purple-600 to-blue-600' : 'bg-gradient-to-r from-blue-600 to-purple-600'}`}>
            <HeaderIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800">{headerInfo.title}</h1>
            <p className="text-sm text-gray-500">{headerInfo.subtitle}</p>
          </div>
        </div>
      </div>
      
      <nav className="mt-6">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center px-6 py-3 text-left hover:bg-blue-50 transition-colors ${
                activeTab === item.id
                  ? `${user?.role === 'chairman' ? 'bg-purple-50 border-r-4 border-purple-600 text-purple-600' : 'bg-blue-50 border-r-4 border-blue-600 text-blue-600'}`
                  : 'text-gray-700 hover:text-blue-600'
              }`}
            >
              <Icon className="w-5 h-5 mr-3" />
              {item.label}
            </button>
          );
        })}
      </nav>
      
      {/* User Profile and Logout */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${user?.role === 'chairman' ? 'bg-gradient-to-r from-purple-500 to-blue-500' : 'bg-gradient-to-r from-blue-500 to-purple-500'}`}>
              <span className="text-white text-sm font-medium">
                {user?.name?.split(' ').map(n => n[0]).join('') || user?.email?.[0].toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.name || user?.email}
              </p>
              <p className="text-xs text-gray-500 capitalize">
                {user?.role === 'chairman' ? 'Chairman' : user?.role}
              </p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
