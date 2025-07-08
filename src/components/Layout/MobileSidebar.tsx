
import React from 'react';
import { Home, CreditCard, Settings, X, LogOut, Users, UserCheck, FileText, BookOpen, Crown } from 'lucide-react';
import { useAuth } from '../../contexts/SupabaseAuthContext';
import { Button } from '../ui/button';
import { INSTITUTION, DEPARTMENT_CODES } from '../../constants/institutional';

interface MobileSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

const MobileSidebar: React.FC<MobileSidebarProps> = ({
  activeTab,
  onTabChange,
  isOpen,
  onClose
}) => {
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home, roles: ['student', 'hod', 'principal', 'admin', 'chairman'] },
    { id: 'fees', label: 'Fee Management', icon: CreditCard, roles: ['student', 'hod', 'principal', 'admin'] },
    { id: 'students', label: 'Students', icon: Users, roles: ['hod', 'principal', 'admin'] },
    { id: 'attendance', label: 'Attendance', icon: UserCheck, roles: ['hod', 'principal', 'admin'] },
    { id: 'exams', label: 'Exams', icon: BookOpen, roles: ['hod', 'principal', 'admin'] },
    { id: 'reports', label: 'Reports', icon: FileText, roles: ['hod', 'principal', 'admin'] },
    { id: 'admin', label: 'Admin Panel', icon: Settings, roles: ['principal', 'admin'] }
  ];

  const visibleItems = menuItems.filter(item => 
    user && item.roles.includes(user.role)
  );

  const getDepartmentName = (deptCode: string) => {
    return DEPARTMENT_CODES[deptCode as keyof typeof DEPARTMENT_CODES] || deptCode;
  };

  const getSidebarHeader = () => {
    if (user?.role === 'chairman') {
      return {
        icon: Crown,
        title: INSTITUTION.shortName,
        subtitle: 'Chairman Portal',
        gradient: 'from-purple-600 to-blue-600'
      };
    }
    return {
      icon: Home,
      title: INSTITUTION.shortName,
      subtitle: 'Student Portal',
      gradient: 'from-blue-600 to-purple-600'
    };
  };

  const headerInfo = getSidebarHeader();
  const HeaderIcon = headerInfo.icon;

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 h-full w-72 bg-gradient-to-br from-white to-gray-50 shadow-2xl transform transition-transform duration-300 ease-in-out z-50
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex flex-col h-full">
          {/* Header with Gradient */}
          <div className={`bg-gradient-to-r ${headerInfo.gradient} p-6 text-white rounded-br-3xl`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <HeaderIcon className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold">{headerInfo.title}</h2>
                  <p className="text-xs text-white/80">{headerInfo.subtitle}</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="lg:hidden p-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* User Info Card */}
            {user && (
              <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">
                      {user.name?.split(' ').map(n => n[0]).join('') || user.email?.[0].toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium truncate">{user.name || user.email}</p>
                    <p className="text-white/70 text-xs capitalize">
                      {user.role === 'chairman' ? 'Chairman' : user.role}
                    </p>
                    {user.department_id && user.role !== 'chairman' && (
                      <p className="text-white/60 text-xs truncate">
                        {getDepartmentName(user.department_id)}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Institution Info */}
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-900">{INSTITUTION.name}</h3>
            <p className="text-xs text-gray-600">{INSTITUTION.tagline}</p>
            <p className="text-xs text-gray-500 mt-1">
              Affiliated to {INSTITUTION.academic.affiliation.split(',')[0]}
            </p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
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
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                    isActive
                      ? `${user?.role === 'chairman' ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg' : 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'}`
                      : 'text-gray-700 hover:bg-gray-100 hover:shadow-md'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-500'}`} />
                  <span className="font-medium">{item.label}</span>
                  {isActive && (
                    <div className="ml-auto w-2 h-2 bg-white rounded-full"></div>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <div className="mb-4">
              <p className="text-xs text-gray-500 mb-1">Need Help?</p>
              <p className="text-xs text-gray-600">{INSTITUTION.contact.emails[0]}</p>
              <p className="text-xs text-gray-600">{INSTITUTION.contact.phones[0]}</p>
            </div>
            <Button
              variant="outline"
              onClick={handleSignOut}
              className="w-full flex items-center justify-center space-x-2 hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default MobileSidebar;
