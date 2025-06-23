
import React, { useState } from 'react';
import LoginForm from './LoginForm';
import SignupForm from './SignupForm';

const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  const handleSwitchToSignup = () => {
    setIsLogin(false);
    setShowSuccessMessage(false);
  };

  const handleSwitchToLogin = () => {
    setIsLogin(true);
    setShowSuccessMessage(false);
  };

  const handleSignupSuccess = () => {
    setShowSuccessMessage(true);
    setTimeout(() => {
      setIsLogin(true);
      setShowSuccessMessage(false);
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {showSuccessMessage ? (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Account Created!</h3>
            <p className="text-gray-600 mb-4">Your account has been created successfully. Redirecting to login...</p>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-green-600 h-2 rounded-full animate-pulse" style={{ width: '100%' }}></div>
            </div>
          </div>
        ) : (
          <>
            {isLogin ? (
              <LoginForm onSwitchToSignup={handleSwitchToSignup} />
            ) : (
              <SignupForm 
                onSwitchToLogin={handleSwitchToLogin}
                onSignupSuccess={handleSignupSuccess}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AuthPage;
