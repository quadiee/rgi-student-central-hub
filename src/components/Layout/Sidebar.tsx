
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { useAuth } from '../../contexts/SupabaseAuthContext';
import { 
  LayoutDashboard, 
  Users, 
  GraduationCap, 
  CreditCard, 
  BarChart3, 
  Settings,
  UserCog,
  BookOpen,
  ChevronRight
} from 'lucide-react';

const Sidebar: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();

  const navigationItems = [
    {
      title: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
      roles: ['student', 'faculty', 'hod', 'principal', 'admin', 'chairman']
    },
    {
      title: 'Students',
      href: '/students',
      icon: GraduationCap,
      roles: ['hod', 'principal', 'admin', 'chairman']
    },
    {
      title: 'Faculty',
      href: '/faculty',
      icon: Users,
      roles: ['hod', 'principal', 'admin', 'chairman']
    },
    {
      title: 'Fees',
      href: '/fees',
      icon: CreditCard,
      roles: ['student', 'hod', 'principal', 'admin', 'chairman']
    },
    {
      title: 'Reports',
      href: '/reports',
      icon: BarChart3,
      roles: ['hod', 'principal', 'admin', 'chairman']
    },
    {
      title: 'User Management',
      href: '/user-management',
      icon: UserCog,
      roles: ['principal', 'admin', 'chairman']
    }
  ];

  const filteredNavigation = navigationItems.filter(item => 
    user && item.roles.includes(user.role)
  );

  console.log('Sidebar - Current user:', user);
  console.log('Sidebar - User role:', user?.role);
  console.log('Sidebar - Filtered navigation:', filteredNavigation);
  console.log('Sidebar - Navigation items:', navigationItems);

  return (
    <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
      <div className="flex flex-col flex-grow bg-white border-r border-gray-200 pt-5 pb-4 overflow-y-auto">
        <div className="flex items-center flex-shrink-0 px-4">
          <BookOpen className="h-8 w-8 text-primary" />
          <span className="ml-2 text-xl font-bold text-gray-900">RGCE</span>
        </div>
        
        <nav className="mt-8 flex-1 px-2 space-y-1">
          {filteredNavigation.map((item) => {
            const isActive = location.pathname === item.href || 
                           (item.href === '/dashboard' && location.pathname === '/');
            
            return (
              <NavLink
                key={item.title}
                to={item.href}
                className={cn(
                  'group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors duration-200',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                )}
              >
                <item.icon
                  className={cn(
                    'mr-3 flex-shrink-0 h-5 w-5',
                    isActive 
                      ? 'text-primary-foreground' 
                      : 'text-gray-400 group-hover:text-gray-500'
                  )}
                />
                {item.title}
                {isActive && (
                  <ChevronRight className="ml-auto h-4 w-4" />
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* User Info */}
        <div className="flex-shrink-0 px-4 py-3 border-t border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                <span className="text-sm font-medium text-primary-foreground">
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                {user?.name || 'User'}
              </p>
              <p className="text-xs font-medium text-gray-500 group-hover:text-gray-700">
                {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)} ({user?.role})
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
