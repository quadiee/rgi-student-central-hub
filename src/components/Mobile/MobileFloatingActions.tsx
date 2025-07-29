
import React, { useState } from 'react';
import { useAuth } from '../../contexts/SupabaseAuthContext';
import { Button } from '../ui/button';
import { Plus, QrCode, Upload, UserPlus, FileText, Calendar, MessageCircle } from 'lucide-react';
import { cn } from '../../lib/utils';

interface MobileFloatingActionsProps {
  currentRoute: string;
}

const MobileFloatingActions: React.FC<MobileFloatingActionsProps> = ({ currentRoute }) => {
  const { user } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false);

  const getRoleActions = () => {
    switch (user?.role) {
      case 'chairman':
        return [
          { icon: FileText, label: 'Report', action: 'generate-report' },
          { icon: MessageCircle, label: 'Message', action: 'send-message' }
        ];

      case 'admin':
      case 'principal':
        return [
          { icon: UserPlus, label: 'Add User', action: 'add-user' },
          { icon: Upload, label: 'Import', action: 'bulk-import' },
          { icon: FileText, label: 'Report', action: 'generate-report' },
          { icon: QrCode, label: 'QR Code', action: 'qr-code' }
        ];

      case 'hod':
        return [
          { icon: UserPlus, label: 'Add Student', action: 'add-student' },
          { icon: Calendar, label: 'Schedule', action: 'create-schedule' },
          { icon: FileText, label: 'Report', action: 'generate-report' }
        ];

      case 'faculty':
        return [
          { icon: QrCode, label: 'Attendance', action: 'mark-attendance' },
          { icon: Calendar, label: 'Class', action: 'schedule-class' },
          { icon: FileText, label: 'Grade', action: 'enter-grades' }
        ];

      case 'student':
        return [
          { icon: QrCode, label: 'Pay Fees', action: 'pay-fees' },
          { icon: FileText, label: 'Request', action: 'create-request' }
        ];

      default:
        return [];
    }
  };

  const getRoleColors = () => {
    switch (user?.role) {
      case 'chairman':
        return 'from-purple-600 to-blue-600';
      case 'admin':
        return 'from-red-600 to-orange-600';
      case 'principal':
        return 'from-green-600 to-teal-600';
      case 'hod':
        return 'from-orange-600 to-yellow-600';
      case 'faculty':
        return 'from-cyan-600 to-blue-600';
      case 'student':
        return 'from-blue-600 to-indigo-600';
      default:
        return 'from-gray-600 to-gray-700';
    }
  };

  const actions = getRoleActions();

  if (actions.length === 0) return null;

  const handleActionClick = (action: string) => {
    setIsExpanded(false);
    console.log('Action clicked:', action);
    // TODO: Implement action handlers
  };

  return (
    <div className="fixed bottom-20 right-4 z-50">
      {/* Action buttons */}
      <div className={cn(
        "flex flex-col-reverse space-y-reverse space-y-3 mb-3 transition-all duration-300",
        isExpanded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
      )}>
        {actions.map((action, index) => (
          <Button
            key={action.action}
            onClick={() => handleActionClick(action.action)}
            className={cn(
              "w-12 h-12 rounded-full shadow-lg hover:shadow-xl bg-white text-gray-700 hover:text-gray-900 border border-gray-200 transition-all duration-300",
              `animate-scale-in delay-${index * 100}`
            )}
            style={{
              animationDelay: `${index * 100}ms`
            }}
          >
            <action.icon className="w-5 h-5" />
            <span className="sr-only">{action.label}</span>
          </Button>
        ))}
      </div>

      {/* Main FAB */}
      <Button
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          "w-14 h-14 rounded-full shadow-xl hover:shadow-2xl bg-gradient-to-r text-white transition-all duration-300 transform hover:scale-110 relative overflow-hidden",
          getRoleColors(),
          isExpanded ? "rotate-45" : "rotate-0"
        )}
      >
        <Plus className={cn(
          "w-6 h-6 transition-transform duration-300",
          isExpanded ? "rotate-45" : "rotate-0"
        )} />
        
        {/* Pulse animation */}
        <div className="absolute inset-0 bg-white/20 rounded-full animate-ping" />
        
        {/* Ripple effect */}
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full animate-bounce" />
      </Button>

      {/* Backdrop */}
      {isExpanded && (
        <div 
          className="fixed inset-0 bg-black/10 backdrop-blur-sm -z-10 animate-fade-in"
          onClick={() => setIsExpanded(false)}
        />
      )}
    </div>
  );
};

export default MobileFloatingActions;
