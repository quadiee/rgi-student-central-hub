
import React from 'react';
import { useAuth } from '../contexts/SupabaseAuthContext';
import { Navigate } from 'react-router-dom';
import Dashboard from '../components/Dashboard/Dashboard';
import ProfileCompletionGuard from '../components/Auth/ProfileCompletionGuard';

const Index: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <ProfileCompletionGuard>
      <Dashboard />
    </ProfileCompletionGuard>
  );
};

export default Index;
