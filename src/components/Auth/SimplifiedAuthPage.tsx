
import React, { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, GraduationCap, User, Settings } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { useAuth } from '../../contexts/SupabaseAuthContext';
import { useToast } from '../ui/use-toast';
import { createDirectAdminAccount } from '../../utils/initializeAdmin';

const SimplifiedAuthPage: React.FC = () => {
  const { signIn, signUp, getInvitationDetails } = useAuth();
  const { toast } = useToast();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [creatingAdmin, setCreatingAdmin] = useState(false);
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    confirmPassword: ''
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await signIn(formData.email, formData.password);

    if (error) {
      let errorMessage = error.message;
      
      // Provide more user-friendly error messages
      if (error.message.includes('Invalid login credentials')) {
        errorMessage = 'Invalid email or password. Please check your credentials or create an account.';
      } else if (error.message.includes('Email not confirmed')) {
        errorMessage = 'Please check your email and confirm your account before logging in.';
      } else if (error.message.includes('User not found')) {
        errorMessage = 'No account found with this email. Please sign up first.';
      }

      toast({
        title: "Login Failed",
        description: errorMessage,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Login Successful",
        description: "Welcome back!"
      });
    }

    setLoading(false);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      // Check for invitation
      const { data: invitation, error: invitationError } = await getInvitationDetails(formData.email);
      
      if (invitationError || !invitation || !invitation.is_valid) {
        toast({
          title: "No Valid Invitation",
          description: "You need a valid invitation to register. Contact your administrator or use the admin setup if you're setting up the system.",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }

      // Prepare user metadata based on invitation
      const userData = {
        name: formData.name,
        role: invitation.role,
        department: invitation.department,
        ...(invitation.roll_number && { roll_number: invitation.roll_number }),
        ...(invitation.employee_id && { employee_id: invitation.employee_id })
      };

      const { error } = await signUp(formData.email, formData.password, userData);

      if (error) {
        toast({
          title: "Registration Failed",
          description: error.message,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Registration Successful",
          description: "Account created successfully! You can now login."
        });
        setIsLogin(true);
        setFormData({ email: formData.email, password: '', name: '', confirmPassword: '' });
      }
    } catch (error: any) {
      toast({
        title: "Registration Error",
        description: error.message || "An unexpected error occurred",
        variant: "destructive"
      });
    }

    setLoading(false);
  };

  const handleCreateDirectAdmin = async () => {
    setCreatingAdmin(true);
    
    try {
      const result = await createDirectAdminAccount('admin123');
      
      if (result.success) {
        toast({
          title: "Admin Account Created",
          description: "Admin account created successfully! You can now login with praveen@rgce.edu.in and password: admin123"
        });
        
        // Pre-fill login form
        setFormData({
          email: 'praveen@rgce.edu.in',
          password: 'admin123',
          name: '',
          confirmPassword: ''
        });
        setIsLogin(true);
      } else {
        toast({
          title: "Admin Creation Failed",
          description: result.error?.message || "Failed to create admin account",
          variant: "destructive"
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An unexpected error occurred",
        variant: "destructive"
      });
    }
    
    setCreatingAdmin(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md mx-auto bg-white rounded-xl shadow-lg p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">RGCE Finance Portal</h2>
          <p className="text-gray-600">
            {isLogin ? 'Sign in to your account' : 'Create your account'}
          </p>
        </div>

        <form onSubmit={isLogin ? handleLogin : handleSignup} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="your.email@rgce.edu.in"
                className="pl-10"
                required
              />
            </div>
          </div>

          {!isLogin && (
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter your full name"
                  className="pl-10"
                  required
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Enter your password"
                className="pl-10 pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {!isLogin && (
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  placeholder="Confirm your password"
                  className="pl-10"
                  required
                />
              </div>
            </div>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>{isLogin ? 'Signing in...' : 'Creating account...'}</span>
              </div>
            ) : (
              <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
            )}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              {isLogin ? 'Sign up here' : 'Sign in here'}
            </button>
          </p>
        </div>

        {/* Admin Setup Section */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center space-x-2 mb-3">
            <Settings className="w-5 h-5 text-blue-600" />
            <p className="text-sm text-blue-700 font-medium">System Setup</p>
          </div>
          <p className="text-xs text-blue-600 mb-3">
            First time setting up the system? Create the admin account to get started.
          </p>
          <Button
            onClick={handleCreateDirectAdmin}
            disabled={creatingAdmin}
            variant="outline"
            size="sm"
            className="w-full text-blue-700 border-blue-300 hover:bg-blue-100"
          >
            {creatingAdmin ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
                <span>Creating Admin Account...</span>
              </div>
            ) : (
              'Create Admin Account'
            )}
          </Button>
          <p className="text-xs text-blue-600 mt-2">
            This will create an admin account with email: praveen@rgce.edu.in
          </p>
        </div>
      </div>
    </div>
  );
};

export default SimplifiedAuthPage;
