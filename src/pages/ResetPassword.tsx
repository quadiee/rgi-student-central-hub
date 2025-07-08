
import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import PasswordSetupForm from '../components/Auth/PasswordSetupForm';
import { useAuth } from '../contexts/SupabaseAuthContext';
import { useToast } from '../components/ui/use-toast';
import { supabase } from '../integrations/supabase/client';

const ResetPassword: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);

  const token = searchParams.get('token');
  const type = searchParams.get('type');
  const accessToken = searchParams.get('access_token');
  const refreshToken = searchParams.get('refresh_token');

  useEffect(() => {
    const handlePasswordReset = async () => {
      try {
        // If we have access_token and refresh_token from the URL, set the session
        if (accessToken && refreshToken) {
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (error) {
            console.error('Session error:', error);
            toast({
              title: "Invalid Reset Link",
              description: "This password reset link is invalid or has expired.",
              variant: "destructive"
            });
            navigate('/auth');
            return;
          }

          if (data.session) {
            setTokenValid(true);
            setLoading(false);
            return;
          }
        }

        // Check if user is already authenticated
        if (user) {
          setTokenValid(true);
          setLoading(false);
          return;
        }

        // If no tokens in URL and no user, redirect to auth
        toast({
          title: "Invalid Reset Link",
          description: "This password reset link is invalid or has expired.",
          variant: "destructive"
        });
        navigate('/auth');
      } catch (error) {
        console.error('Password reset error:', error);
        toast({
          title: "Error",
          description: "An error occurred while processing your reset link.",
          variant: "destructive"
        });
        navigate('/auth');
      } finally {
        setLoading(false);
      }
    };

    handlePasswordReset();
  }, [accessToken, refreshToken, user, navigate, toast]);

  const handlePasswordSetupSuccess = () => {
    toast({
      title: "Password Updated",
      description: "Your password has been updated successfully!",
    });
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
          <p>Verifying reset link...</p>
        </div>
      </div>
    );
  }

  if (!tokenValid) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold text-red-600 mb-4">Invalid Reset Link</h2>
          <p className="text-gray-600 mb-4">This password reset link is invalid or has expired.</p>
          <button 
            onClick={() => navigate('/auth')}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Back to Login
          </button>
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
        isReset={true}
      />
    </div>
  );
};

export default ResetPassword;
