
import React from 'react';
import { useAuth } from '../../contexts/SupabaseAuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Bell, Search, Menu, User, Settings } from 'lucide-react';
import { cn } from '../../lib/utils';

interface AdaptiveMobileHeaderProps {
  isScrolled: boolean;
  currentRoute: string;
}

const AdaptiveMobileHeader: React.FC<AdaptiveMobileHeaderProps> = ({ 
  isScrolled, 
  currentRoute 
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const getRoleColors = () => {
    switch (user?.role) {
      case 'chairman':
        return 'from-purple-600 to-blue-600 text-white';
      case 'admin':
        return 'from-red-600 to-orange-600 text-white';
      case 'principal':
        return 'from-green-600 to-teal-600 text-white';
      case 'hod':
        return 'from-orange-600 to-yellow-600 text-white';
      case 'faculty':
        return 'from-cyan-600 to-blue-600 text-white';
      case 'student':
        return 'from-blue-600 to-indigo-600 text-white';
      default:
        return 'from-gray-600 to-gray-700 text-white';
    }
  };

  const getRouteTitle = () => {
    const routeMap: { [key: string]: string } = {
      '/dashboard': 'Dashboard',
      '/students': 'Students',
      '/faculty': 'Faculty',
      '/fees': 'Fee Management',
      '/attendance': 'Attendance',
      '/reports': 'Reports',
      '/user-management': 'User Management',
      '/exams': 'Examinations'
    };
    
    return routeMap[currentRoute] || 'RGI Central Hub';
  };

  const getRoleDisplayName = () => {
    return user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1) || 'User';
  };

  return (
    <header className={cn(
      "fixed top-0 left-0 right-0 z-40 transition-all duration-300",
      isScrolled 
        ? "bg-white/95 backdrop-blur-lg shadow-lg border-b" 
        : `bg-gradient-to-r ${getRoleColors()}`
    )}>
      <div className="px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Left section - Menu and title */}
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "p-2",
                isScrolled ? "text-gray-700 hover:bg-gray-100" : "text-white hover:bg-white/20"
              )}
            >
              <Menu className="w-5 h-5" />
            </Button>
            
            <div className="min-w-0 flex-1">
              <h1 className={cn(
                "font-bold text-lg truncate transition-colors",
                isScrolled ? "text-gray-900" : "text-white"
              )}>
                {getRouteTitle()}
              </h1>
              <div className="flex items-center space-x-2">
                <Badge 
                  variant={isScrolled ? "secondary" : "outline"}
                  className={cn(
                    "text-xs",
                    isScrolled 
                      ? "bg-gray-100 text-gray-700" 
                      : "bg-white/20 text-white border-white/30"
                  )}
                >
                  {getRoleDisplayName()}
                </Badge>
              </div>
            </div>
          </div>

          {/* Right section - Actions */}
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "p-2 relative",
                isScrolled ? "text-gray-700 hover:bg-gray-100" : "text-white hover:bg-white/20"
              )}
            >
              <Search className="w-5 h-5" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "p-2 relative",
                isScrolled ? "text-gray-700 hover:bg-gray-100" : "text-white hover:bg-white/20"
              )}
            >
              <Bell className="w-5 h-5" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/profile')}
              className={cn(
                "p-2",
                isScrolled ? "text-gray-700 hover:bg-gray-100" : "text-white hover:bg-white/20"
              )}
            >
              <User className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdaptiveMobileHeader;
