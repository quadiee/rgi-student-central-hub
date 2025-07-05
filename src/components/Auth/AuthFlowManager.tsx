
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginForm from './LoginForm';
import SignupForm from './SignupForm';
import PasswordSetupForm from './PasswordSetupForm';
import { useAuth } from '../../contexts/SupabaseAuthContext';

type AuthMode = 'login' | 'signup' | 'password-setup';

interface AuthFlowManagerProps {
  initialMode?: AuthMode;
  email?: string;
}

const AuthFlowManager: React.FC<AuthFlowManagerProps> = ({ 
  initialMode = 'login',
  email 
}) => {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [userEmail, setUserEmail] = useState(email || '');
  const navigate = useNavigate();
  const { user } = useAuth();

  // Redirect if already authenticated
  React.useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleAuthSuccess = () => {
    navigate('/dashboard');
  };

  const renderCurrentMode = () => {
    switch (mode) {
      case 'login':
        return (
          <LoginForm 
            onSwitchToSignup={() => setMode('signup')}
          />
        );
      case 'signup':
        return (
          <SignupForm 
            onSwitchToLogin={() => setMode('login')}
            onSignupSuccess={handleAuthSuccess}
          />
        );
      case 'password-setup':
        return (
          <PasswordSetupForm 
            email={userEmail}
            onSuccess={handleAuthSuccess}
            onCancel={() => setMode('login')}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      {renderCurrentMode()}
    </div>
  );
};

export default AuthFlowManager;
