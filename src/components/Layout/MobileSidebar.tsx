
import React from 'react';
import { Home, CreditCard, Settings, X, LogOut, Users, UserCheck, FileText, BookOpen } from 'lucide-react';
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
    { id: 'dashboard', label: 'Dashboard', icon: Home, roles: ['student', 'hod', 'principal', 'admin'] },
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
        fixed top-0 left-0 h-full w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out z-50
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">R</span>
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-800">{INSTITUTION.shortName}</h2>
                <p className="text-xs text-gray-600">Student Portal</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Institution Info */}
          <div className="px-6 py-4 bg-blue-50 border-b border-blue-100">
            <h3 className="text-sm font-semibold text-blue-900">{INSTITUTION.name}</h3>
            <p className="text-xs text-blue-700">{INSTITUTION.tagline}</p>
            <p className="text-xs text-blue-600 mt-1">
              Affiliated to {INSTITUTION.academic.affiliation.split(',')[0]}
            </p>
          </div>

          {/* User Info */}
          {user && (
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <img 
                  src={user.avatar} 
                  alt={user.name}
                  className="w-10 h-10 rounded-full"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
                  <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                  {user.department && (
                    <p className="text-xs text-gray-400 truncate">
                      {getDepartmentName(user.department)}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 p-4">
            <ul className="space-y-2">
              {visibleItems.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.id}>
                    <button
                      onClick={() => {
                        onTabChange(item.id);
                        onClose();
                      }}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                        activeTab === item.id
                          ? 'bg-blue-50 text-blue-600 border border-blue-200'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{item.label}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200">
            <div className="mb-3">
              <p className="text-xs text-gray-500">Contact Support:</p>
              <p className="text-xs text-gray-600">{INSTITUTION.contact.emails[0]}</p>
              <p className="text-xs text-gray-600">{INSTITUTION.contact.phones[0]}</p>
            </div>
            <Button
              variant="outline"
              onClick={handleSignOut}
              className="w-full flex items-center space-x-2"
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
