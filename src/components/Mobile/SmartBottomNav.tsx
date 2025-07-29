
import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/SupabaseAuthContext';
import { cn } from '../../lib/utils';
import { 
  LayoutDashboard, 
  Users, 
  GraduationCap, 
  CreditCard, 
  UserCog,
  BarChart3,
  Calendar,
  ClipboardCheck,
  BookOpen,
  Settings
} from 'lucide-react';

interface SmartBottomNavProps {
  currentRoute: string;
}

const SmartBottomNav: React.FC<SmartBottomNavProps> = ({ currentRoute }) => {
  const { user } = useAuth();

  const getRoleNavItems = () => {
    const baseItems = [
      {
        title: 'Dashboard',
        href: '/dashboard',
        icon: LayoutDashboard,
        roles: ['student', 'faculty', 'hod', 'principal', 'admin', 'chairman']
      }
    ];

    switch (user?.role) {
      case 'chairman':
        return [
          ...baseItems,
          { title: 'Faculty', href: '/faculty', icon: Users, roles: ['chairman'] },
          { title: 'Reports', href: '/reports', icon: BarChart3, roles: ['chairman'] },
          { title: 'Settings', href: '/settings', icon: Settings, roles: ['chairman'] }
        ];

      case 'admin':
      case 'principal':
        return [
          ...baseItems,
          { title: 'Students', href: '/students', icon: GraduationCap, roles: ['admin', 'principal'] },
          { title: 'Faculty', href: '/faculty', icon: Users, roles: ['admin', 'principal'] },
          { title: 'Fees', href: '/fees', icon: CreditCard, roles: ['admin', 'principal'] },
          { title: 'Users', href: '/user-management', icon: UserCog, roles: ['admin', 'principal'] }
        ];

      case 'hod':
        return [
          ...baseItems,
          { title: 'Students', href: '/students', icon: GraduationCap, roles: ['hod'] },
          { title: 'Faculty', href: '/faculty', icon: Users, roles: ['hod'] },
          { title: 'Attendance', href: '/attendance', icon: ClipboardCheck, roles: ['hod'] },
          { title: 'Reports', href: '/reports', icon: BarChart3, roles: ['hod'] }
        ];

      case 'faculty':
        return [
          ...baseItems,
          { title: 'Students', href: '/students', icon: GraduationCap, roles: ['faculty'] },
          { title: 'Attendance', href: '/attendance', icon: ClipboardCheck, roles: ['faculty'] },
          { title: 'Classes', href: '/classes', icon: BookOpen, roles: ['faculty'] },
          { title: 'Schedule', href: '/schedule', icon: Calendar, roles: ['faculty'] }
        ];

      case 'student':
        return [
          ...baseItems,
          { title: 'Fees', href: '/fees', icon: CreditCard, roles: ['student'] },
          { title: 'Attendance', href: '/attendance', icon: ClipboardCheck, roles: ['student'] },
          { title: 'Exams', href: '/exams', icon: BookOpen, roles: ['student'] },
          { title: 'Profile', href: '/profile', icon: UserCog, roles: ['student'] }
        ];

      default:
        return baseItems;
    }
  };

  const navItems = getRoleNavItems().filter(item => 
    user && item.roles.includes(user.role)
  ).slice(0, 5);

  const getRoleThemeColor = () => {
    switch (user?.role) {
      case 'chairman':
        return 'text-purple-600 bg-purple-100 border-purple-200';
      case 'admin':
        return 'text-red-600 bg-red-100 border-red-200';
      case 'principal':
        return 'text-green-600 bg-green-100 border-green-200';
      case 'hod':
        return 'text-orange-600 bg-orange-100 border-orange-200';
      case 'faculty':
        return 'text-cyan-600 bg-cyan-100 border-cyan-200';
      case 'student':
        return 'text-blue-600 bg-blue-100 border-blue-200';
      default:
        return 'text-primary bg-primary/10 border-primary/20';
    }
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-border shadow-lg z-40">
      <div className="grid grid-cols-5 h-16">
        {navItems.map((item) => {
          const isActive = currentRoute === item.href || 
                         (item.href === '/dashboard' && currentRoute === '/');
          
          return (
            <NavLink
              key={item.title}
              to={item.href}
              className={cn(
                'flex flex-col items-center justify-center px-1 text-xs transition-all duration-300 relative overflow-hidden',
                isActive
                  ? `${getRoleThemeColor()} font-medium transform scale-105`
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              )}
            >
              {/* Active indicator */}
              {isActive && (
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-current rounded-b-full animate-scale-in" />
              )}
              
              <item.icon className={cn(
                "w-5 h-5 mb-1 transition-transform duration-200",
                isActive ? "animate-bounce" : ""
              )} />
              <span className="truncate leading-tight">{item.title}</span>
              
              {/* Ripple effect */}
              {isActive && (
                <div className="absolute inset-0 bg-current opacity-10 rounded-full animate-pulse" />
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};

export default SmartBottomNav;
