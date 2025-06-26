import React, { useState } from 'react';
import { useAuth } from '../../contexts/SupabaseAuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { GraduationCap, Users, BookOpen, Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { useToast } from '../ui/use-toast';
import SecureAdminButton from './SecureAdminButton';

const SupabaseAuthPage = () => {
  const { loading, signIn } = useAuth();
  const { toast } = useToast();
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <p className="text-gray-600">Loading RGCE Portal...</p>
        </div>
      </div>
    );
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    if (!loginEmail.endsWith('@rgce.edu.in')) {
      toast({
        title: "Invalid Email",
        description: "Please use your RGCE email address (@rgce.edu.in)",
        variant: "destructive"
      });
      setLoginLoading(false);
      return;
    }
    const { error } = await signIn(loginEmail, loginPassword);
    if (error) {
      toast({
        title: "Login Failed",
        description: error.message,
        variant: "destructive"
      });
    }
    setLoginLoading(false);
  };

  return (
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
                {loginLoading ? 'Signing in...' : 'Sign In'}
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
  );
};

export default SupabaseAuthPage;