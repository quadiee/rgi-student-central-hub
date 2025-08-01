
import React, { useEffect } from 'react';
import { useAuth } from '../../contexts/SupabaseAuthContext';
import { useIsMobile } from '../../hooks/use-mobile';
import { useNavigate } from 'react-router-dom';
import RoleDashboard from '../Mobile/RoleDashboard';
import StudentDashboard from './StudentDashboard';
import HODDashboard from './HODDashboard';
import PrincipalDashboard from './PrincipalDashboard';
import ChairmanDashboard from './ChairmanDashboard';
import RealTimeStats from './RealTimeStats';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  // EXTREME DEBUGGING FOR DASHBOARD
  console.log('%c=== DASHBOARD COMPONENT DEBUG ===', 'background: teal; color: white; font-size: 18px; padding: 10px;');
  console.log('Dashboard - User:', user);
  console.log('Dashboard - IsMobile:', isMobile);
  console.log('Dashboard - User Role:', user?.role);
  console.log('Dashboard - Timestamp:', new Date().toISOString());

  useEffect(() => {
    // Redirect faculty users to their dedicated dashboard
    if (user?.role === 'faculty') {
      console.log('Dashboard - Redirecting faculty to /faculty-dashboard');
      navigate('/faculty-dashboard', { replace: true });
      return;
    }
  }, [user, navigate]);

  // Use enhanced mobile dashboard for mobile devices
  if (isMobile) {
    console.log('%c DASHBOARD - MOBILE DETECTED, RENDERING ROLEDASHBOARD', 'background: orange; color: white; font-size: 16px;');
    return <RoleDashboard />;
  }

  // Desktop dashboard logic - no wrapper needed as ModernLayout handles it
  const renderDashboard = () => {
    console.log('%c DASHBOARD - RENDERING DESKTOP FOR ROLE:', user?.role, 'background: green; color: white; font-size: 16px;');
    
    switch (user?.role) {
      case 'student':
        return <StudentDashboard />;
      case 'chairman':
        return <ChairmanDashboard />;
      case 'principal':
        return <PrincipalDashboard />;
      case 'hod':
        return (
          <div className="space-y-6">
            <RealTimeStats />
            <HODDashboard />
          </div>
        );
      case 'admin':
        return (
          <div className="space-y-6">
            <RealTimeStats />
            <PrincipalDashboard />
          </div>
        );
      default:
        return <StudentDashboard />;
    }
  };

  return renderDashboard();
};

export default Dashboard;
