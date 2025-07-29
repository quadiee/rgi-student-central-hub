
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
  Settings,
  Eye
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
          { 
            title: 'Students', 
            href: '/students', 
            icon: GraduationCap, 
            roles: ['chairman'],
            viewOnly: true
          },
          { 
            title: 'Faculty', 
            href: '/faculty', 
            icon: Users, 
            roles: ['chairman'],
            viewOnly: true
          },
          { 
            title: 'Fees', 
            href: '/fees', 
            icon: CreditCard, 
            roles: ['chairman'],
            viewOnly: true
          }
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
  ).slice(0, 4);

  const getRoleThemeColor = () => {
    switch (user?.role) {
      case 'chairman':
        return {
          active: 'text-purple-600 bg-purple-100 border-purple-200',
          gradient: 'from-purple-600 to-blue-600'
        };
      case 'admin':
        return {
          active: 'text-red-600 bg-red-100 border-red-200',
          gradient: 'from-red-600 to-orange-600'
        };
      case 'principal':
        return {
          active: 'text-green-600 bg-green-100 border-green-200',
          gradient: 'from-green-600 to-teal-600'
        };
      case 'hod':
        return {
          active: 'text-orange-600 bg-orange-100 border-orange-200',
          gradient: 'from-orange-600 to-yellow-600'
        };
      case 'faculty':
        return {
          active: 'text-cyan-600 bg-cyan-100 border-cyan-200',
          gradient: 'from-cyan-600 to-blue-600'
        };
      case 'student':
        return {
          active: 'text-blue-600 bg-blue-100 border-blue-200',
          gradient: 'from-blue-600 to-indigo-600'
        };
      default:
        return {
          active: 'text-primary bg-primary/10 border-primary/20',
          gradient: 'from-gray-600 to-gray-700'
        };
    }
  };

  const themeColors = getRoleThemeColor();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-border shadow-lg z-40 safe-area-pb">
      <div className={`grid grid-cols-${navItems.length} h-16 relative`}>
        {/* Gradient accent line */}
        <div className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${themeColors.gradient}`} />
        
        {navItems.map((item: any) => {
          const isActive = currentRoute === item.href || 
                         (item.href === '/dashboard' && currentRoute === '/');
          
          return (
            <NavLink
              key={item.title}
              to={item.href}
              className={cn(
                'flex flex-col items-center justify-center px-1 text-xs transition-all duration-300 relative overflow-hidden group',
                'min-h-[44px] active:scale-95', // Better touch target
                isActive
                  ? `${themeColors.active} font-medium transform scale-105 shadow-sm`
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              )}
            >
              {/* Active indicator */}
              {isActive && (
                <div className={cn(
                  "absolute top-0 left-1/2 transform -translate-x-1/2 w-8 h-1 rounded-b-full animate-scale-in",
                  `bg-gradient-to-r ${themeColors.gradient}`
                )} />
              )}
              
              <div className="flex flex-col items-center space-y-0.5">
                <div className="relative">
                  <item.icon className={cn(
                    "w-5 h-5 transition-all duration-200",
                    isActive ? "animate-bounce" : "group-hover:scale-110"
                  )} />
                  
                  {/* View-only indicator for Chairman */}
                  {item.viewOnly && (
                    <Eye className="absolute -top-1 -right-1 w-2.5 h-2.5 text-purple-500 opacity-75" />
                  )}
                </div>
                
                <span className={cn(
                  "truncate leading-tight text-center",
                  isActive ? "font-semibold" : "font-medium"
                )}>
                  {item.title}
                </span>
              </div>
              
              {/* Ripple effect for active state */}
              {isActive && (
                <div className="absolute inset-0 bg-current opacity-5 rounded-lg animate-pulse" />
              )}
            </NavLink>
          );
        })}
      </div>

      {/* Role indicator */}
      {user?.role === 'chairman' && (
        <div className="absolute -top-6 right-4">
          <div className={cn(
            "px-2 py-1 rounded-full text-xs font-medium shadow-sm",
            "bg-gradient-to-r from-purple-500 to-blue-500 text-white"
          )}>
            Chairman Portal
          </div>
        </div>
      )}
    </nav>
  );
};

export default SmartBottomNav;
