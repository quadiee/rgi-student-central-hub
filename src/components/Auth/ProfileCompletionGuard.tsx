
import React from 'react';
import { useAuth } from '../../contexts/SupabaseAuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { AlertCircle } from 'lucide-react';

const ProfileCompletionGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, profile, profileLoading } = useAuth();
  const navigate = useNavigate();

  // Show loading state while profile is being fetched
  if (profileLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading your profile...</p>
        </div>
      </div>
    );
  }

  // If user is authenticated but profile is incomplete, show completion prompt
  if (user && profile && profile.profile_completed === false) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md mx-auto bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-orange-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Profile Incomplete</h2>
          <p className="text-gray-600 mb-6">
            Your account was created through an invitation, but your profile is not yet complete. 
            Please contact your administrator to complete your profile setup.
          </p>
          <div className="space-y-3">
            <Button
              onClick={() => navigate("/auth")}
              variant="outline"
              className="w-full"
            >
              Back to Login
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // If everything is okay, render children
  return <>{children}</>;
};

export default ProfileCompletionGuard;
