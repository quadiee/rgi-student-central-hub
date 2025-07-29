
import React from 'react';
import { NavLink } from 'react-router-dom';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { 
  X, 
  LayoutDashboard, 
  Users, 
  GraduationCap, 
  CreditCard,
  BarChart3,
  Settings,
  RefreshCw,
  Eye
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAuth } from '../../contexts/SupabaseAuthContext';

interface ChairmanMobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const ChairmanMobileSidebar: React.FC<ChairmanMobileSidebarProps> = ({ 
  isOpen, 
  onClose 
}) => {
  const { user } = useAuth();

  const navigationItems = [
    {
      title: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
      description: 'Overview & Analytics'
    },
    {
      title: 'Students',
      href: '/students',
      icon: GraduationCap,
      description: 'Student Information',
      viewOnly: true
    },
    {
      title: 'Faculty',
      href: '/faculty',
      icon: Users,
      description: 'Faculty Overview',
      viewOnly: true
    },
    {
      title: 'Fee Management',
      href: '/fees',
      icon: CreditCard,
      description: 'Financial Overview',
      viewOnly: true
    }
  ];

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-50 lg:hidden"
        onClick={onClose}
      />
      
      {/* Sidebar */}
      <div className={cn(
        "fixed left-0 top-0 h-full w-80 bg-white shadow-xl z-50 transform transition-transform duration-300 lg:hidden",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <span className="text-white font-bold text-sm">
                  {user?.name?.substring(0, 2).toUpperCase() || 'CH'}
                </span>
              </div>
              <div>
                <h3 className="text-white font-semibold">{user?.name}</h3>
                <Badge className="bg-white/20 text-white border-white/30 text-xs">
                  Chairman Access
                </Badge>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-white hover:bg-white/20"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 p-4 space-y-2">
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">
              Navigation
            </h4>
            {navigationItems.map((item) => (
              <NavLink
                key={item.href}
                to={item.href}
                onClick={onClose}
                className={({ isActive }) => cn(
                  "flex items-center justify-between p-3 rounded-lg transition-all duration-200 group",
                  isActive 
                    ? "bg-gradient-to-r from-purple-50 to-blue-50 border-l-4 border-l-purple-500 text-purple-700" 
                    : "hover:bg-gray-50 text-gray-700"
                )}
              >
                <div className="flex items-center space-x-3">
                  <item.icon className="w-5 h-5" />
                  <div>
                    <p className="font-medium">{item.title}</p>
                    <p className="text-xs text-gray-500">{item.description}</p>
                  </div>
                </div>
                {item.viewOnly && (
                  <Eye className="w-4 h-4 opacity-60" />
                )}
              </NavLink>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="pt-4 border-t border-gray-200">
            <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">
              Quick Actions
            </h4>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.location.reload()}
              className="w-full justify-start text-purple-600 border-purple-200 hover:bg-purple-50"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh Data
            </Button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200">
          <div className="text-xs text-gray-500 text-center">
            <p>RGI Central Hub</p>
            <p className="mt-1">Chairman Portal - View Only Access</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default ChairmanMobileSidebar;
