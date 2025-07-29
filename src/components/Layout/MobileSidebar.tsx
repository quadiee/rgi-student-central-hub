import React from 'react';
import { Home, CreditCard, Settings, X, LogOut, Users, UserCheck, FileText, BookOpen, Crown, Sparkles } from 'lucide-react';
import { useAuth } from '../../contexts/SupabaseAuthContext';
import { Button } from '../ui/button';
import { INSTITUTION, DEPARTMENT_CODES } from '../../constants/institutional';
import { Badge } from '../ui/badge';

interface MobileSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  isOpen: boolean;
  onClose: () => void;
  isDesktop?: boolean;
}

const MobileSidebar: React.FC<MobileSidebarProps> = ({
  activeTab,
  onTabChange,
  isOpen,
  onClose,
  isDesktop = false
}) => {
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home, roles: ['student', 'hod', 'principal', 'admin', 'chairman'] },
    { id: 'fees', label: 'Fee Management', icon: CreditCard, roles: ['student', 'hod', 'principal', 'admin'] },
    { id: 'students', label: 'Students', icon: Users, roles: ['hod', 'principal', 'admin'] },
    { id: 'faculty', label: 'Faculty', icon: UserCheck, roles: ['hod', 'principal', 'admin', 'chairman'] },
    { id: 'attendance', label: 'Attendance', icon: UserCheck, roles: ['hod', 'principal', 'admin'] },
    { id: 'exams', label: 'Exams', icon: BookOpen, roles: ['hod', 'principal', 'admin'] },
    { id: 'reports', label: 'Reports', icon: FileText, roles: ['hod', 'principal', 'admin'] },
    { id: 'admin', label: 'Admin Panel', icon: Settings, roles: ['principal', 'admin'] }
  ];

  const visibleItems = menuItems.filter(item => 
    user && item.roles.includes(user.role)
  );

  console.log('=== MOBILE SIDEBAR DEBUG ===');
  console.log('Current user:', user);
  console.log('User role:', user?.role);
  console.log('All menu items:', menuItems);
  console.log('Visible items for user:', visibleItems);
  console.log('Faculty item should be visible:', user?.role && ['hod', 'principal', 'admin', 'chairman'].includes(user.role));

  const getDepartmentName = (deptCode: string) => {
    return DEPARTMENT_CODES[deptCode as keyof typeof DEPARTMENT_CODES] || deptCode;
  };

  const getSidebarTheme = () => {
    if (user?.role === 'chairman') {
      return {
        icon: Crown,
        title: INSTITUTION.shortName,
        subtitle: 'Chairman Portal',
        gradient: 'from-purple-600 via-blue-600 to-indigo-600',
        accent: 'from-purple-500 to-blue-500'
      };
    }
    
    return {
      icon: Home,
      title: INSTITUTION.shortName,
      subtitle: 'Student Portal',
      gradient: 'from-blue-600 via-cyan-600 to-teal-600',
      accent: 'from-blue-500 to-cyan-500'
    };
  };

  const theme = getSidebarTheme();
  const HeaderIcon = theme.icon;

  return (
    <>
      {/* Enhanced Mobile Overlay */}
      {isOpen && !isDesktop && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden animate-fade-in"
          onClick={onClose}
        />
      )}
      
      {/* Enhanced Sidebar */}
      <div className={`
        ${isDesktop ? 'relative' : 'fixed'} top-0 left-0 h-full w-80 bg-white dark:bg-gray-900 shadow-2xl transform transition-all duration-500 ease-out
        ${isDesktop ? 'z-30' : 'z-50'}
        ${isOpen ? 'translate-x-0' : isDesktop ? '-translate-x-full' : '-translate-x-full lg:translate-x-0'}
        border-r border-gray-200 dark:border-gray-800
      `}>
        <div className="flex flex-col h-full">
          {/* Enhanced Header with Gradient */}
          <div className="relative overflow-hidden">
            <div className={`absolute inset-0 bg-gradient-to-br ${theme.gradient}`} />
            
            <div className="relative p-6 text-white">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg">
                    <HeaderIcon className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold font-heading">{theme.title}</h2>
                    <p className="text-sm text-white/80 font-medium">{theme.subtitle}</p>
                  </div>
                </div>
                <button 
                  onClick={onClose}
                  className={`${isDesktop ? '' : 'lg:hidden'} p-2 rounded-xl hover:bg-white/10 transition-colors`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Enhanced User Info Card */}
              {user && (
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-white/20">
                  <div className="flex items-center space-x-3">
                    <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg">
                      <span className="text-white text-lg font-bold">
                        {user.name?.split(' ').map(n => n[0]).join('') || user.email?.[0].toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-semibold truncate">{user.name || user.email}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge 
                          variant="secondary" 
                          className="bg-white/20 text-white border-white/30 text-xs capitalize"
                        >
                          {user.role === 'chairman' ? 'Chairman' : user.role}
                        </Badge>
                        {user.role === 'chairman' && (
                          <div className="flex items-center space-x-1">
                            <Sparkles className="w-3 h-3 text-yellow-300" />
                            <span className="text-xs text-white/70">Premium</span>
                          </div>
                        )}
                      </div>
                      {user.department_id && user.role !== 'chairman' && (
                        <p className="text-white/70 text-xs mt-1 truncate">
                          {getDepartmentName(user.department_id)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Enhanced Institution Info */}
          <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">{INSTITUTION.name}</h3>
              <p className="text-xs text-gray-600 dark:text-gray-400">{INSTITUTION.tagline}</p>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Affiliated to {INSTITUTION.academic.affiliation.split(',')[0]}
                </p>
              </div>
            </div>
          </div>

          {/* Enhanced Navigation */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto scrollbar-thin">
            {visibleItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onTabChange(item.id);
                    onClose();
                  }}
                  className={`group w-full flex items-center space-x-3 px-4 py-3 rounded-2xl transition-all duration-300 font-medium ${
                    isActive
                      ? `bg-gradient-to-r ${theme.accent} text-white shadow-lg shadow-black/10 scale-105`
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:shadow-md hover:scale-105'
                  }`}
                >
                  <Icon className={`w-5 h-5 transition-all duration-300 ${
                    isActive ? 'text-white' : 'text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300'
                  }`} />
                  <span className="font-medium">{item.label}</span>
                  {isActive && (
                    <div className="ml-auto flex items-center space-x-2">
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                      <Sparkles className="w-4 h-4 text-white/70" />
                    </div>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Enhanced Footer */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
            <div className="space-y-4">
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">Need Help?</p>
                <div className="space-y-1">
                  <p className="text-xs text-gray-600 dark:text-gray-400">{INSTITUTION.contact.emails[0]}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">{INSTITUTION.contact.phones[0]}</p>
                </div>
              </div>
              
              <Button
                variant="outline"
                onClick={handleSignOut}
                className="w-full flex items-center justify-center space-x-2 hover:bg-red-50 hover:border-red-200 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:border-red-800 dark:hover:text-red-400 transition-all duration-300 rounded-2xl"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default MobileSidebar;
