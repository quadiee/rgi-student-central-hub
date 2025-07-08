import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import PasswordSetupForm from '../components/Auth/PasswordSetupForm';
import { useAuth } from '../contexts/SupabaseAuthContext';
import { useToast } from '../components/ui/use-toast';
import { authUtils } from '../lib/auth-utils';

const ResetPassword: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [email, setEmail] = useState<string | null>(null);

  const token = searchParams.get('token');
  const type = searchParams.get('type');

  useEffect(() => {
    const processToken = async () => {
      if (user) {
        // Already logged in
        setTokenValid(true);
        setEmail(user.email ?? null);
        setLoading(false);
        return;
      }

      if (token && type === 'recovery') {
        const { error } = await authUtils.signInWithToken(token);
        if (error) {
          toast({
            title: "Invalid or Expired Token",
            description: "The password reset link is invalid or has expired.",
            variant: "destructive",
          });
          navigate('/auth');
        } else {
          // Supabase should now log the user in
          setTokenValid(true);
        }
      } else {
        toast({
          title: "Invalid Reset Link",
          description: "This password reset link is invalid or incomplete.",
          variant: "destructive"
        });
        navigate('/auth');
      }
      setLoading(false);
    };

    processToken();
  }, [token, type, user, navigate, toast]);

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
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!tokenValid) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <PasswordSetupForm 
        email={email ?? ''}
        token={token!}
        onSuccess={handlePasswordSetupSuccess}
        onCancel={handleCancel}
      />
    </div>
  );
};

export default ResetPassword;
