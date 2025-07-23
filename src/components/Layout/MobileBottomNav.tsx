
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { useAuth } from '../../contexts/SupabaseAuthContext';
import { 
  LayoutDashboard, 
  Users, 
  GraduationCap, 
  CreditCard, 
  UserCog 
} from 'lucide-react';

const MobileBottomNav: React.FC = () => {
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
      title: 'Users',
      href: '/user-management',
      icon: UserCog,
      roles: ['principal', 'admin', 'chairman']
    }
  ];

  const filteredNavigation = navigationItems.filter(item => 
    user && item.roles.includes(user.role)
  ).slice(0, 5); // Limit to 5 items for mobile

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 lg:hidden">
      <div className="grid grid-cols-5 h-16">
        {filteredNavigation.map((item) => {
          const isActive = location.pathname === item.href || 
                         (item.href === '/dashboard' && location.pathname === '/');
          
          return (
            <NavLink
              key={item.title}
              to={item.href}
              className={cn(
                'flex flex-col items-center justify-center px-1 text-xs transition-colors duration-200',
                isActive
                  ? 'text-primary bg-primary/10'
                  : 'text-gray-600 hover:text-gray-900'
              )}
            >
              <item.icon className="h-5 w-5 mb-1" />
              <span className="truncate">{item.title}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileBottomNav;
