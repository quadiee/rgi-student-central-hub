import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/SupabaseAuthContext';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from '../ui/sidebar';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  CreditCard,
  BarChart3,
  Settings,
  UserCog,
  BookOpen,
  Calendar,
  FileText,
  Building2,
  Shield,
  LogOut,
  ChevronRight
} from 'lucide-react';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { INSTITUTION } from '../../constants/institutional';

interface NavigationItem {
  title: string;
  url: string;
  icon: React.ComponentType<any>;
  roles: string[];
  badge?: string;
}

const AppSidebar: React.FC = () => {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';

  const navigationItems: NavigationItem[] = [
    {
      title: 'Dashboard',
      url: '/dashboard',
      icon: LayoutDashboard,
      roles: ['student', 'faculty', 'hod', 'principal', 'admin', 'chairman']
    },
    {
      title: 'Students',
      url: '/students',
      icon: GraduationCap,
      roles: ['hod', 'principal', 'admin', 'chairman']
    },
    {
      title: 'Faculty',
      url: '/faculty',
      icon: Users,
      roles: ['hod', 'principal', 'admin', 'chairman']
    },
    {
      title: 'Attendance',
      url: '/attendance',
      icon: Calendar,
      roles: ['hod', 'principal', 'admin', 'chairman']
    },
    {
      title: 'Exams',
      url: '/exams',
      icon: FileText,
      roles: ['hod', 'principal', 'admin', 'chairman']
    },
    {
      title: 'Fee Management',
      url: '/fees',
      icon: CreditCard,
      roles: ['student', 'hod', 'principal', 'admin', 'chairman']
    },
    {
      title: 'Reports',
      url: '/reports',
      icon: BarChart3,
      roles: ['hod', 'principal', 'admin', 'chairman']
    },
    {
      title: 'Admin Panel',
      url: '/admin',
      icon: Shield,
      roles: ['principal', 'admin', 'chairman'],
      badge: 'Admin'
    },
    {
      title: 'User Management',
      url: '/user-management',
      icon: UserCog,
      roles: ['principal', 'admin', 'chairman']
    }
  ];

  const filteredNavigation = navigationItems.filter(item => 
    user && item.roles.includes(user.role)
  );

  const isActive = (path: string) => {
    return location.pathname === path || 
           (path === '/dashboard' && location.pathname === '/');
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return (
    <Sidebar className="border-r border-border bg-sidebar-background">
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
            <BookOpen className="w-4 h-4 text-white" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-sidebar-foreground">
                {INSTITUTION.shortName}
              </span>
              <span className="text-xs text-muted-foreground">
                Student Portal
              </span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2 py-4">
        <SidebarGroup>
          <SidebarGroupLabel className={collapsed ? "sr-only" : ""}>
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredNavigation.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      className={({ isActive: navIsActive }) =>
                        `flex items-center gap-3 rounded-lg px-3 py-2 transition-colors ${
                          isActive(item.url) || navIsActive
                            ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
                            : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
                        }`
                      }
                    >
                      <item.icon className="w-4 h-4" />
                      {!collapsed && (
                        <>
                          <span className="flex-1">{item.title}</span>
                          {item.badge && (
                            <span className="bg-orange-100 text-orange-600 text-xs px-2 py-0.5 rounded-full">
                              {item.badge}
                            </span>
                          )}
                          {isActive(item.url) && (
                            <ChevronRight className="w-3 h-3" />
                          )}
                        </>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-4">
        <div className="flex items-center gap-3">
          <Avatar className="w-8 h-8">
            <AvatarFallback className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">
                {user?.name || 'User'}
              </p>
              <p className="text-xs text-muted-foreground capitalize">
                {user?.role}
              </p>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSignOut}
            className={`p-1.5 ${collapsed ? 'w-8 h-8' : ''}`}
          >
            <LogOut className="w-4 h-4" />
            {!collapsed && <span className="sr-only">Sign Out</span>}
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
