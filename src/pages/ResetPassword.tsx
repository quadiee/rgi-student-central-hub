import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import PasswordSetupForm from '../components/Auth/PasswordSetupForm';
import { useAuth } from '../contexts/SupabaseAuthContext';
import { useToast } from '../components/ui/use-toast';

const ResetPassword: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);

  const isInvitation   = searchParams.get('invitation') === 'true';
  const accessToken    = searchParams.get('access_token');
  const type           = searchParams.get('type');

  useEffect(() => {
    // We’re done loading whether or not user is already signed in
    setLoading(false);

    // If there's no access_token or it's not a recovery link, bounce to login
    if (!accessToken || type !== 'recovery') {
      toast({
        title: "Invalid Reset Link",
        description: "This password reset link is invalid or has expired.",
        variant: "destructive"
      });
      navigate('/auth');
    }
  }, [accessToken, type, navigate, toast]);

  const handlePasswordSetupSuccess = () => {
    if (isInvitation && accessToken) {
      toast({
        title: "Setup Complete",
        description: "Your account has been activated successfully!",
      });
    } else {
      toast({
        title: "Password Updated",
        description: "Your password has been updated successfully!",
      });
    }
    navigate('/dashboard');
  };

  const handleCancel = () => {
    navigate('/auth');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <PasswordSetupForm 
        email={user?.email}
        token={accessToken!}            // pass the real recovery token here
        onSuccess={handlePasswordSetupSuccess}
        onCancel={handleCancel}
      />
    </div>
  );
};

export default ResetPassword;
