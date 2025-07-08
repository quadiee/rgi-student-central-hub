
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/SupabaseAuthContext';
import { useToast } from '../components/ui/use-toast';
import { supabase } from '../integrations/supabase/client';

const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const [processing, setProcessing] = useState(true);

  useEffect(() => {
    const handleAuthCallback = async () => {
      console.log('AuthCallback: Processing authentication callback');
      
      try {
        // Get the session from the URL hash/params
        const { data: { session }, error } = await supabase.auth.getSession();
        
        console.log('AuthCallback: Session check result:', { session: !!session, error });
        
        if (error) {
          console.error('AuthCallback: Error getting session:', error);
          toast({
            title: "Authentication Error",
            description: error.message || "There was an issue with your authentication.",
            variant: "destructive"
          });
          navigate('/auth');
          return;
        }

        // Check if this is a password recovery callback
        const type = searchParams.get('type');
        const isPasswordRecovery = type === 'recovery' || window.location.hash.includes('type=recovery');
        
        console.log('AuthCallback: Callback type detection:', { type, isPasswordRecovery, hash: window.location.hash });

        if (session?.user) {
          if (isPasswordRecovery) {
            // This is a password reset flow
            console.log('AuthCallback: Password recovery detected, redirecting to reset password page');
            toast({
              title: "Password Reset",
              description: "Please set your new password below.",
            });
            navigate('/reset-password');
          } else {
            // Regular login flow
            console.log('AuthCallback: Regular login detected, redirecting to dashboard');
            toast({
              title: "Authentication Successful",
              description: "Welcome to RGCE Portal!",
            });
            navigate('/dashboard');
          }
        } else {
          // No session found
          console.log('AuthCallback: No session found, redirecting to auth page');
          toast({
            title: "Authentication Required",
            description: "Please sign in to continue.",
            variant: "destructive"
          });
          navigate('/auth');
        }
      } catch (error: any) {
        console.error('AuthCallback: Unexpected error:', error);
        toast({
          title: "Authentication Error",
          description: "An unexpected error occurred during authentication.",
          variant: "destructive"
        });
        navigate('/auth');
      } finally {
        setProcessing(false);
      }
    };

    // Add a small delay to ensure auth state has settled
    const timer = setTimeout(handleAuthCallback, 500);
    
    return () => clearTimeout(timer);
  }, [navigate, toast, searchParams]);

  if (processing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Processing authentication...</p>
        </div>
      </div>
    );
  }

  return null;
};

export default AuthCallback;
