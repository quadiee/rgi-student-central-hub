
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
  const token = searchParams.get('token');

  useEffect(() => {
    console.log('ResetPassword page loaded');
    console.log('User:', user);
    console.log('Token:', token);
    console.log('Is invitation:', isInvitation);

    // Check if user is authenticated (from password reset link)
    if (user) {
      console.log('User is authenticated, showing password setup form');
      setLoading(false);
    } else {
      // If no user but has token, they might need to authenticate first
      setLoading(false);
      if (!token) {
        console.log('No user and no token, showing error');
        toast({
          title: "Invalid Reset Link",
          description: "This password reset link is invalid or has expired. Please request a new password reset link.",
          variant: "destructive"
        });
        navigate('/auth');
      }
    }
  }, [user, token, navigate, toast]);

  const handlePasswordSetupSuccess = () => {
    if (isInvitation && token) {
      toast({
        title: "Account Setup Complete",
        description: "Your account has been activated successfully! You can now access the system.",
      });
    } else {
      toast({
        title: "Password Updated Successfully",
        description: "Your password has been updated. You can now log in with your new password.",
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
          <p className="text-gray-600">Verifying reset link...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            {isInvitation ? 'Complete Your Account Setup' : 'Reset Your Password'}
          </h1>
          <p className="text-gray-600">
            {isInvitation 
              ? 'Please set a secure password to complete your account setup.'
              : 'Enter a new secure password for your account.'
            }
          </p>
        </div>
        
        <PasswordSetupForm 
          email={user?.email}
          onSuccess={handlePasswordSetupSuccess}
          onCancel={handleCancel}
        />
      </div>
    </div>
  );
};

export default ResetPassword;
