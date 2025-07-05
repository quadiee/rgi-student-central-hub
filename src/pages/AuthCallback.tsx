
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/SupabaseAuthContext';
import { useToast } from '../components/ui/use-toast';

const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const handleAuthCallback = async () => {
      // Wait a moment for auth state to settle
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (user) {
        toast({
          title: "Authentication Successful",
          description: "Welcome to RGCE Portal!",
        });
        navigate('/dashboard');
      } else {
        toast({
          title: "Authentication Failed",
          description: "There was an issue with your authentication. Please try again.",
          variant: "destructive"
        });
        navigate('/auth');
      }
    };

    handleAuthCallback();
  }, [user, navigate, toast]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p>Completing authentication...</p>
      </div>
    </div>
  );
};

export default AuthCallback;
