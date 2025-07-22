
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/SupabaseAuthContext';
import { UserRole } from '../../types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  fallback?: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  allowedRoles,
  fallback 
}) => {
  const { user, loading } = useAuth();

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to auth page if not authenticated
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Check role permissions if specified
  if (allowedRoles && !allowedRoles.includes(user.role as UserRole)) {
    return fallback || (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Insufficient Permissions</h2>
          <p className="text-gray-600">You don't have permission to access this page.</p>
          <button 
            onClick={() => window.history.back()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
