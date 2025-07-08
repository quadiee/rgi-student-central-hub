
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

  const isInvitation = searchParams.get('invitation') === 'true';

  useEffect(() => {
    // Check if user is authenticated (from password reset link)
    if (user) {
      setLoading(false);
    } else {
      // If no user, they might need to authenticate first
      setLoading(false);
      const token = searchParams.get('token');
      if (!token) {
        toast({
          title: "Invalid Reset Link",
          description: "This password reset link is invalid or has expired.",
          variant: "destructive"
        });
        navigate('/auth');
      }
    }
  }, [user, searchParams, navigate, toast]);

  const handlePasswordSetupSuccess = () => {
    if (isInvitation) {
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
        onSuccess={handlePasswordSetupSuccess}
        onCancel={handleCancel}
      />
    </div>
  );
};

export default ResetPassword;
