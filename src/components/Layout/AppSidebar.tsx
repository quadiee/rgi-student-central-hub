import React from 'react';
import {
  Home,
  LayoutDashboard,
  Settings,
  User,
  Book,
  Calendar,
  FileText,
  Users,
  Contact2,
  HelpCircle,
  Building2,
  Wallet,
  LucideIcon
} from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/SupabaseAuthContext';
import { cn } from '../../lib/utils';

interface MenuItem {
  title: string;
  icon: LucideIcon;
  href: string;
  description: string;
}

const AppSidebar: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();

  const menuItems = [
    {
      title: 'Dashboard',
      icon: LayoutDashboard,
      href: '/',
      description: 'Quick overview of your stats'
    },
    {
      title: 'Profile',
      icon: User,
      href: '/profile',
      description: 'Manage your profile settings'
    },
    ...(user?.role === 'student' ? [{
      title: 'Fee Records',
      icon: Wallet,
      href: '/student/fees',
      description: 'View your fee payment history'
    }] : []),
    ...(user?.role === 'hod' ? [{
      title: 'Department Fees',
      icon: Users,
      href: '/department/fees',
      description: 'Manage department fee records'
    }] : []),
    ...(user?.role === 'principal' || user?.role === 'admin' ? [{
      title: 'Institution Fees',
      icon: Building2,
      href: '/institution/fees',
      description: 'Manage institution fee records'
    }] : []),
    ...(user?.role === 'chairman' ? [{
      title: 'Student Management',
      icon: Users,
      href: '/chairman/students',
      description: 'Manage student records and fees'
    }] : []),
    ...(user?.role === 'admin' ? [{
      title: 'User Management',
      icon: Users,
      href: '/admin/users',
      description: 'Manage user accounts and roles'
    }] : []),
    
    // Add simplified fee management for authorized roles
    ...(user?.role && ['admin', 'principal', 'chairman', 'hod'].includes(user.role) ? [{
      title: 'RGCAS Fee System',
      icon: Building2,
      href: '/simplified-fees',
      description: 'Simplified fee management for RGCAS'
    }] : []),

    {
      title: 'Academics',
      icon: Book,
      href: '/academics',
      description: 'View academic calendar and resources'
    },
    {
      title: 'Events',
      icon: Calendar,
      href: '/events',
      description: 'Check upcoming college events'
    },
    {
      title: 'Notices',
      icon: FileText,
      href: '/notices',
      description: 'Read important college notices'
    },
    {
      title: 'Contact',
      icon: Contact2,
      href: '/contact',
      description: 'Get in touch with college authorities'
    },
    {
      title: 'Help',
      icon: HelpCircle,
      href: '/help',
      description: 'Find answers to common questions'
    },
    {
      title: 'Settings',
      icon: Settings,
      href: '/settings',
      description: 'Configure app preferences'
    }
  ];

  return (
    <div className="flex flex-col h-full bg-gray-50 border-r py-4">
      <div className="px-4 mb-4">
        <NavLink to="/" className="flex items-center text-lg font-semibold">
          <Home className="mr-2 h-5 w-5" />
          RGCE Portal
        </NavLink>
      </div>
      <div className="space-y-1 flex-1">
        {menuItems.map((item) => (
          <NavLink
            key={item.title}
            to={item.href}
            className={({ isActive }) =>
              cn(
                "flex items-center space-x-2 px-4 py-2 rounded-md transition-colors hover:bg-gray-200",
                isActive
                  ? "bg-gray-200 font-medium"
                  : "text-gray-600 hover:text-gray-900"
              )
            }
          >
            <item.icon className="h-4 w-4" />
            <span>{item.title}</span>
          </NavLink>
        ))}
      </div>
    </div>
  );
};

export default AppSidebar;
