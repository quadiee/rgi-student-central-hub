import React, { useState } from 'react';
import { useQuickAuth } from '../../hooks/useQuickAuth';
import { useAuth } from '../../contexts/SupabaseAuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { GraduationCap, Users, BookOpen, Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { useToast } from '../ui/use-toast';
import SecureAdminButton from './SecureAdminButton';
import { ErrorBoundary } from './ErrorBoundary';
import { ProfileLoadingSkeleton, ProgressiveLoader } from './LoadingStates';
import { supabase } from '../../integrations/supabase/client';
import { resetPassword } from '../../lib/resetPassword';

const SupabaseAuthPage = () => {
  const { isAuthenticated, loading: quickAuthLoading } = useQuickAuth();
  const { profileLoading } = useAuth();
  const { toast } = useToast();
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  // Show progressive loading for authenticated users while profile loads
  if (isAuthenticated && profileLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <ProgressiveLoader authLoaded={true} profileLoaded={false} />
        <div className="flex items-center justify-center min-h-screen p-4">
          <div className="text-center space-y-6">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto">
              <GraduationCap className="w-8 h-8 text-white" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-gray-900">Loading your profile...</h2>
              <p className="text-gray-600">Setting up your RGCE portal experience</p>
            </div>
            <ProfileLoadingSkeleton />
          </div>
        </div>
      </div>
    );
  }

  // Show loading only for the initial quick auth check
  if (quickAuthLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <ProgressiveLoader authLoaded={false} profileLoaded={false} />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
              <GraduationCap className="w-8 h-8 text-white" />
            </div>
            <p className="text-gray-600">Loading RGCE Portal...</p>
          </div>
        </div>
      </div>
    );
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    
    try {
      if (!loginEmail.endsWith('@rgce.edu.in')) {
        toast({
          title: "Invalid Email",
          description: "Please use your RGCE email address (@rgce.edu.in)",
          variant: "destructive"
        });
        return;
      }
      
      const { error } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: loginPassword
      });
      
      if (error) {
        toast({
          title: "Login Failed",
          description: error.message,
          variant: "destructive"
        });
      } else {
        console.log('Login successful, redirecting...');
      }
    } catch (err: any) {
      toast({
        title: "Login Error",
        description: err?.message || "An unexpected error occurred during login.",
        variant: "destructive"
      });
    } finally {
      setLoginLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!loginEmail) {
      toast({
        title: "Email Required",
        description: "Please enter your email address first",
        variant: "destructive"
      });
      return;
    }

    if (!loginEmail.endsWith('@rgce.edu.in')) {
      toast({
        title: "Invalid Email",
        description: "Please use your RGCE email address (@rgce.edu.in)",
        variant: "destructive"
      });
      return;
    }

    setResetLoading(true);
    
    try {
      const error = await resetPassword(loginEmail);
      
      if (error) {
        toast({
          title: "Reset Failed",
          description: error.message || "Failed to send reset email",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Reset Email Sent",
          description: "Check your email for password reset instructions",
        });
      }
    } catch (err: any) {
      toast({
        title: "Reset Error",
        description: "An error occurred while sending reset email",
        variant: "destructive"
      });
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
              <GraduationCap className="w-8 h-8 text-white" />
            </div>
          </div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
            RGCE Portal
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">Rajiv Gandhi College of Engineering</p>
        </div>

        {/* Auth Form */}
        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl text-center">Welcome</CardTitle>
              <CardDescription className="text-center">
                Sign in to access your academic portal
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      id="login-email"
                      type="email"
                      value={loginEmail}
                      onChange={e => setLoginEmail(e.target.value)}
                      placeholder="your.name@rgce.edu.in"
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="login-password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      id="login-password"
                      type={showLoginPassword ? 'text' : 'password'}
                      value={loginPassword}
                      onChange={e => setLoginPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="pl-10 pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showLoginPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={loginLoading}>
                  {loginLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Signing in...</span>
                    </div>
                  ) : (
                    'Sign In'
                  )}
                </Button>

                <Button 
                  type="button" 
                  variant="ghost" 
                  className="w-full text-sm"
                  onClick={handleForgotPassword}
                  disabled={resetLoading}
                >
                  {resetLoading ? 'Sending...' : 'Forgot Password?'}
                </Button>
              </form>
              
              {/* Admin Setup Section */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="space-y-3">
                  <p className="text-sm text-gray-600 text-center">
                    First time setup? Create admin account to get started.
                  </p>
                  <SecureAdminButton />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Features */}
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="text-center p-4 bg-white/60 backdrop-blur-sm rounded-lg">
              <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <h3 className="font-semibold text-sm">Student Management</h3>
            </div>
            <div className="text-center p-4 bg-white/60 backdrop-blur-sm rounded-lg">
              <BookOpen className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <h3 className="font-semibold text-sm">Fee Management</h3>
            </div>
            <div className="text-center p-4 bg-white/60 backdrop-blur-sm rounded-lg">
              <GraduationCap className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <h3 className="font-semibold text-sm">Academic Portal</h3>
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default SupabaseAuthPage;
