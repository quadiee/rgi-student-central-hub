
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

  console.log('🖥️ Dashboard - Desktop Dashboard rendering with:', {
    user: user ? { id: user.id, role: user.role, name: user.name } : null,
    isMobile
  });

  useEffect(() => {
    // Redirect faculty users to their dedicated dashboard
    if (user?.role === 'faculty') {
      console.log('🖥️ Dashboard - Redirecting faculty to dedicated dashboard');
      navigate('/faculty-dashboard', { replace: true });
      return;
    }
  }, [user, navigate]);

  // Use enhanced mobile dashboard for mobile devices
  if (isMobile) {
    console.log('🖥️ Dashboard - Mobile detected, using RoleDashboard');
    return <RoleDashboard />;
  }

  // Desktop dashboard logic - no wrapper needed as ModernLayout handles it
  const renderDashboard = () => {
    console.log('🖥️ Dashboard - Rendering desktop dashboard for role:', user?.role);
    
    switch (user?.role) {
      case 'student':
        console.log('🖥️ Dashboard - Rendering StudentDashboard');
        return <StudentDashboard />;
      case 'chairman':
        console.log('🖥️ Dashboard - Rendering ChairmanDashboard');
        return <ChairmanDashboard />;
      case 'principal':
        console.log('🖥️ Dashboard - Rendering PrincipalDashboard');
        return <PrincipalDashboard />;
      case 'hod':
        console.log('🖥️ Dashboard - Rendering HODDashboard with RealTimeStats');
        return (
          <div className="space-y-6">
            <RealTimeStats />
            <HODDashboard />
          </div>
        );
      case 'admin':
        console.log('🖥️ Dashboard - Rendering PrincipalDashboard with RealTimeStats for admin');
        return (
          <div className="space-y-6">
            <RealTimeStats />
            <PrincipalDashboard />
          </div>
        );
      default:
        console.log('🖥️ Dashboard - Default case, rendering StudentDashboard');
        return <StudentDashboard />;
    }
  };

  return (
    <>
      {console.log('🖥️ Dashboard - About to render desktop dashboard content')}
      {renderDashboard()}
    </>
  );
};

export default Dashboard;
