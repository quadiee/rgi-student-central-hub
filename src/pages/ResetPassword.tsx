
import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import PasswordSetupForm from '../components/Auth/PasswordSetupForm';
import { useToast } from '../components/ui/use-toast';
import { supabase } from '../integrations/supabase/client';

const ResetPassword: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);

  // Extract tokens from URL hash or query params
  const accessToken = searchParams.get('access_token') || 
    new URLSearchParams(window.location.hash.substring(1)).get('access_token');
  const refreshToken = searchParams.get('refresh_token') || 
    new URLSearchParams(window.location.hash.substring(1)).get('refresh_token');
  const type = searchParams.get('type') || 
    new URLSearchParams(window.location.hash.substring(1)).get('type');

  const isInvitation = searchParams.get('invitation') === 'true';
  const isPasswordRecovery = type === 'recovery';

  useEffect(() => {
    console.log('ResetPassword page loaded');
    console.log('Access Token:', !!accessToken);
    console.log('Refresh Token:', !!refreshToken);
    console.log('Type:', type);
    console.log('Is password recovery:', isPasswordRecovery);

    const validateTokens = async () => {
      if (accessToken && refreshToken && isPasswordRecovery) {
        try {
          // Set the session using the tokens from the URL
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          });

          if (error) {
            console.error('Error setting session:', error);
            toast({
              title: "Invalid Reset Link",
              description: "This password reset link is invalid or has expired. Please request a new password reset link.",
              variant: "destructive"
            });
            navigate('/auth');
            return;
          }

          if (data.session) {
            console.log('Session established successfully');
            setTokenValid(true);
          }
        } catch (error) {
          console.error('Token validation error:', error);
          toast({
            title: "Reset Link Error",
            description: "There was an error processing your reset link. Please try again.",
            variant: "destructive"
          });
          navigate('/auth');
        }
      } else {
        console.log('No valid tokens found, redirecting to auth');
        toast({
          title: "Invalid Reset Link",
          description: "This password reset link is invalid or has expired. Please request a new password reset link.",
          variant: "destructive"
        });
        navigate('/auth');
      }
      setLoading(false);
    };

    validateTokens();
  }, [accessToken, refreshToken, type, isPasswordRecovery, navigate, toast]);

  const handlePasswordSetupSuccess = () => {
    if (isInvitation) {
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

  if (!tokenValid) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Invalid or expired reset link.</p>
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
          onSuccess={handlePasswordSetupSuccess}
          onCancel={handleCancel}
        />
      </div>
    </div>
  );
};

export default ResetPassword;
