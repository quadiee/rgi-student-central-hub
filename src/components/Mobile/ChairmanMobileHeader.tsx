
import React from 'react';
import { Crown, Bell, Settings, Search } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';

interface ChairmanMobileHeaderProps {
  title: string;
  subtitle?: string;
  onSearch?: () => void;
  showNotifications?: boolean;
  notificationCount?: number;
}

const ChairmanMobileHeader: React.FC<ChairmanMobileHeaderProps> = ({
  title,
  subtitle,
  onSearch,
  showNotifications = false,
  notificationCount = 0
}) => {
  return (
    <div className="sticky top-0 z-30 bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 text-white shadow-lg">
      <div className="px-4 py-4">
        {/* Header Row */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 backdrop-blur-sm rounded-xl">
              <Crown className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-bold">{title}</h1>
                <Badge variant="secondary" className="bg-white/20 text-white border-white/30 text-xs">
                  Chairman
                </Badge>
              </div>
              {subtitle && (
                <p className="text-sm text-purple-100 opacity-90">{subtitle}</p>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {onSearch && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onSearch}
                className="bg-white/20 hover:bg-white/30 text-white p-2"
              >
                <Search className="w-4 h-4" />
              </Button>
            )}
            
            {showNotifications && (
              <Button
                variant="ghost"
                size="sm"
                className="bg-white/20 hover:bg-white/30 text-white p-2 relative"
              >
                <Bell className="w-4 h-4" />
                {notificationCount > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center text-xs p-0"
                  >
                    {notificationCount > 9 ? '9+' : notificationCount}
                  </Badge>
                )}
              </Button>
            )}
            
            <Button
              variant="ghost"
              size="sm"
              className="bg-white/20 hover:bg-white/30 text-white p-2"
            >
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        {/* Status Indicator */}
        <div className="flex items-center justify-center">
          <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-xs font-medium">Executive Dashboard Active</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChairmanMobileHeader;
