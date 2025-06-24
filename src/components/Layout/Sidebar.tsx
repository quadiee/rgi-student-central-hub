
import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  CreditCard, 
  FileText, 
  Settings,
  BookOpen,
  UserCheck,
  GraduationCap
} from 'lucide-react';
import { useAuth } from '../../contexts/SupabaseAuthContext';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange }) => {
  const { user } = useAuth();

  const getMenuItems = () => {
    const baseItems = [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard }
    ];

    if (user?.role === 'admin' || user?.role === 'principal') {
      return [
        ...baseItems,
        { id: 'fees', label: 'Fee Management', icon: CreditCard },
        { id: 'admin', label: 'Admin Panel', icon: Settings },
        { id: 'students', label: 'Students', icon: Users },
        { id: 'attendance', label: 'Attendance', icon: UserCheck },
        { id: 'exams', label: 'Exams', icon: FileText },
        { id: 'reports', label: 'Reports', icon: BookOpen }
      ];
    } else if (user?.role === 'hod') {
      return [
        ...baseItems,
        { id: 'fees', label: 'Fee Management', icon: CreditCard },
        { id: 'students', label: 'Department Students', icon: Users },
        { id: 'attendance', label: 'Attendance', icon: UserCheck },
        { id: 'exams', label: 'Exams', icon: FileText },
        { id: 'reports', label: 'Reports', icon: BookOpen }
      ];
    } else if (user?.role === 'faculty') {
      return [
        ...baseItems,
        { id: 'fees', label: 'Fee Management', icon: CreditCard },
        { id: 'students', label: 'My Students', icon: Users },
        { id: 'attendance', label: 'Attendance', icon: UserCheck },
        { id: 'exams', label: 'Exams', icon: FileText }
      ];
    } else {
      return [
        ...baseItems,
        { id: 'fees', label: 'Fee Status', icon: CreditCard },
        { id: 'attendance', label: 'My Attendance', icon: UserCheck },
        { id: 'exams', label: 'My Results', icon: FileText }
      ];
    }
  };

  const menuItems = getMenuItems();

  return (
    <div className="bg-white shadow-lg h-full w-64 fixed left-0 top-0 z-10">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-lg">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800">RGCE Portal</h1>
            <p className="text-sm text-gray-500">Finance Management</p>
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
                  ? 'bg-blue-50 border-r-4 border-blue-600 text-blue-600'
                  : 'text-gray-700 hover:text-blue-600'
              }`}
            >
              <Icon className="w-5 h-5 mr-3" />
              {item.label}
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default Sidebar;
