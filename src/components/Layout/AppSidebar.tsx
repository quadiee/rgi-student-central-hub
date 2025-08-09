
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  GraduationCap, 
  DollarSign, 
  Calendar,
  UserPlus,
  Settings,
  LogOut,
  Building2
} from 'lucide-react';
import { useAuth } from '../../contexts/SupabaseAuthContext';
import { Button } from '../ui/button';
import { useToast } from '../ui/use-toast';

const AppSidebar: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSignOut = async () => {
    const result = await signOut();
    if (result.error) {
      toast({
        title: "Error signing out",
        description: result.error.message,
        variant: "destructive"
      });
    } else {
      navigate('/auth');
    }
  };

  const navigationItems = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
      roles: ['student', 'hod', 'principal', 'admin', 'chairman', 'faculty']
    },
    {
      name: 'Attendance',
      href: '/attendance',
      icon: Calendar,
      roles: ['student', 'hod', 'principal', 'admin', 'chairman', 'faculty']
    },
    {
      name: 'Fee Management',
      href: '/fees',
      icon: DollarSign,
      roles: ['student', 'hod', 'principal', 'admin', 'chairman']
    },
    {
      name: 'Students',
      href: '/students',
      icon: GraduationCap,
      roles: ['hod', 'principal', 'admin', 'chairman']
    },
    {
      name: 'Faculty',
      href: '/faculty',
      icon: Users,
      roles: ['principal', 'admin', 'chairman', 'hod']
    },
    {
      name: 'User Management',
      href: '/user-management',
      icon: UserPlus,
      roles: ['admin', 'principal', 'chairman']
    }
  ];

  const filteredItems = navigationItems.filter(item => 
    user?.role && item.roles.includes(user.role)
  );

  return (
    <div className="flex flex-col h-full bg-white border-r border-gray-200">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">RGCE Portal</h2>
            <p className="text-sm text-gray-500">{user?.department_name}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6">
        <ul className="space-y-2">
          {filteredItems.map((item) => (
            <li key={item.name}>
              <NavLink
                to={item.href}
                className={({ isActive }) =>
                  `flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }`
                }
              >
                <item.icon className="w-5 h-5 mr-3" />
                {item.name}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* User Profile & Sign Out */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
            <span className="text-sm font-medium text-gray-700">
              {user?.name?.charAt(0) || user?.email?.charAt(0)}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user?.name || 'User'}
            </p>
            <p className="text-xs text-gray-500 truncate capitalize">
              {user?.role}
            </p>
          </div>
        </div>
        <Button 
          onClick={handleSignOut}
          variant="ghost" 
          className="w-full justify-start px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
        >
          <LogOut className="w-4 h-4 mr-3" />
          Sign Out
        </Button>
      </div>
    </div>
  );
};

export default AppSidebar;
