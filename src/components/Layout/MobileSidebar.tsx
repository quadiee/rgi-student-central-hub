
import React from 'react';
import { X, Home, Users, DollarSign, FileText, Settings, ChevronRight } from 'lucide-react';
import { Button } from '../ui/button';
import { useAuth } from '../../contexts/SupabaseAuthContext';

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  navigation: Array<{
    name: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    current: boolean;
  }>;
  onNavigate: (href: string) => void;
}

const MobileSidebar: React.FC<MobileSidebarProps> = ({
  isOpen,
  onClose,
  navigation,
  onNavigate
}) => {
  const { profile, signOut } = useAuth();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={onClose} />
      
      <div className="relative flex w-full max-w-xs flex-col bg-white">
        <div className="flex h-16 items-center justify-between px-4 border-b">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">R</span>
            </div>
            <span className="font-semibold text-gray-900">RGCE</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <nav className="space-y-1 px-2 py-4">
            {navigation.map((item) => (
              <button
                key={item.name}
                onClick={() => {
                  onNavigate(item.href);
                  onClose();
                }}
                className={`
                  w-full group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors
                  ${item.current
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }
                `}
              >
                <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                {item.name}
                <ChevronRight className="ml-auto h-4 w-4" />
              </button>
            ))}
          </nav>
        </div>

        {profile && (
          <div className="border-t border-gray-200 p-4">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                {profile.profile_photo_url ? (
                  <img src={profile.profile_photo_url} alt={profile.name} className="w-10 h-10 rounded-full" />
                ) : (
                  <span className="text-gray-600 font-medium">
                    {profile.name?.split(' ').map(n => n[0]).join('') || profile.email[0].toUpperCase()}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {profile.name || 'User'}
                </p>
                <p className="text-xs text-gray-500 capitalize">
                  {profile.role || 'Student'}
                </p>
                <p className="text-xs text-gray-400 truncate">
                  {profile.department_name || 'Department'}
                </p>
              </div>
            </div>
            <Button 
              onClick={signOut} 
              variant="outline" 
              size="sm" 
              className="w-full"
            >
              Sign Out
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MobileSidebar;
