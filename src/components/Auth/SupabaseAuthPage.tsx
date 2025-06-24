
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/SupabaseAuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { GraduationCap, Users, BookOpen, Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { useToast } from '../ui/use-toast';
import SecureAdminButton from './SecureAdminButton';

const SupabaseAuthPage = () => {
  const { loading, signIn, signUp, getInvitationDetails } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('login');

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);

  // Signup form state
  const [signupEmail, setSignupEmail] = useState('');
  const [signupStep, setSignupStep] = useState<'email' | 'form'>('email');
  const [invitationData, setInvitationData] = useState<any>(null);
  const [signupFormData, setSignupFormData] = useState({
    name: '',
    password: '',
    confirmPassword: '',
    phone: '',
    rollNumber: '',
    employeeId: '',
    guardianName: '',
    guardianPhone: '',
    address: ''
  });
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [signupLoading, setSignupLoading] = useState(false);

  // Show loading state
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

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignupLoading(true);

    if (!signupEmail.endsWith('@rgce.edu.in')) {
      toast({
        title: "Invalid Email",
        description: "Please use your RGCE email address (@rgce.edu.in)",
        variant: "destructive"
      });
      setSignupLoading(false);
      return;
    }

    const { data, error } = await getInvitationDetails(signupEmail);
    
    if (error || !data?.is_valid) {
      toast({
        title: "Invalid Invitation",
        description: "No valid invitation found for this email address.",
        variant: "destructive"
      });
      setSignupLoading(false);
      return;
    }

    setInvitationData(data);
    setSignupStep('form');
    setSignupLoading(false);
  };

  const handleSignupFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSignupFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignupLoading(true);

    if (signupFormData.password !== signupFormData.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match",
        variant: "destructive"
      });
      setSignupLoading(false);
      return;
    }

    if (signupFormData.password.length < 6) {
      toast({
        title: "Weak Password",
        description: "Password must be at least 6 characters",
        variant: "destructive"
      });
      setSignupLoading(false);
      return;
    }

    const userData = {
      name: signupFormData.name,
      role: invitationData.role,
      department: invitationData.department,
      phone: signupFormData.phone,
      roll_number: invitationData.role === 'student' ? (signupFormData.rollNumber || invitationData.roll_number) : null,
      employee_id: invitationData.role !== 'student' ? (signupFormData.employeeId || invitationData.employee_id) : null,
      guardian_name: invitationData.role === 'student' ? signupFormData.guardianName : null,
      guardian_phone: invitationData.role === 'student' ? signupFormData.guardianPhone : null,
      address: signupFormData.address
    };

    const { error } = await signUp(signupEmail, signupFormData.password, userData);

    if (error) {
      toast({
        title: "Signup Failed",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Account Created",
        description: "Your account has been created successfully. Please check your email for verification.",
      });
      // Reset form
      setSignupStep('email');
      setSignupEmail('');
      setSignupFormData({
        name: '',
        password: '',
        confirmPassword: '',
        phone: '',
        rollNumber: '',
        employeeId: '',
        guardianName: '',
        guardianPhone: '',
        address: ''
      });
      setActiveTab('login');
    }

    setSignupLoading(false);
  };

  const resetSignupForm = () => {
    setSignupStep('email');
    setSignupEmail('');
    setInvitationData(null);
    setSignupFormData({
      name: '',
      password: '',
      confirmPassword: '',
      phone: '',
      rollNumber: '',
      employeeId: '',
      guardianName: '',
      guardianPhone: '',
      address: ''
    });
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
        <p className="mt-2 text-center text-sm text-gray-600">
          Rajalakshmi Government College of Engineering
        </p>
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
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Join</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login" className="space-y-4">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <Input
                        id="login-email"
                        type="email"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
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
                        onChange={(e) => setLoginPassword(e.target.value)}
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
              </TabsContent>
              
              <TabsContent value="signup" className="space-y-4">
                {signupStep === 'email' ? (
                  <form onSubmit={handleEmailSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-email">Email Address</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <Input
                          id="signup-email"
                          type="email"
                          value={signupEmail}
                          onChange={(e) => setSignupEmail(e.target.value)}
                          placeholder="your.name@rgce.edu.in"
                          className="pl-10"
                          required
                        />
                      </div>
                      <p className="text-sm text-gray-600">
                        Enter your RGCE email to check for invitation
                      </p>
                    </div>

                    <Button type="submit" className="w-full" disabled={signupLoading}>
                      {signupLoading ? 'Checking...' : 'Check Invitation'}
                    </Button>
                  </form>
                ) : (
                  <form onSubmit={handleSignupSubmit} className="space-y-4">
                    <div className="p-3 bg-blue-50 rounded-lg mb-4">
                      <p className="text-sm text-blue-800">
                        <strong>Role:</strong> {invitationData?.role?.charAt(0).toUpperCase() + invitationData?.role?.slice(1)}
                      </p>
                      <p className="text-sm text-blue-800">
                        <strong>Department:</strong> {invitationData?.department}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        name="name"
                        type="text"
                        value={signupFormData.name}
                        onChange={handleSignupFormChange}
                        placeholder="Enter your full name"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={signupFormData.phone}
                        onChange={handleSignupFormChange}
                        placeholder="Enter your phone number"
                      />
                    </div>

                    {invitationData?.role === 'student' && (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="rollNumber">Roll Number</Label>
                          <Input
                            id="rollNumber"
                            name="rollNumber"
                            type="text"
                            value={signupFormData.rollNumber}
                            onChange={handleSignupFormChange}
                            placeholder={invitationData.roll_number || "Enter roll number"}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="guardianName">Guardian Name</Label>
                            <Input
                              id="guardianName"
                              name="guardianName"
                              type="text"
                              value={signupFormData.guardianName}
                              onChange={handleSignupFormChange}
                              placeholder="Guardian's name"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="guardianPhone">Guardian Phone</Label>
                            <Input
                              id="guardianPhone"
                              name="guardianPhone"
                              type="tel"
                              value={signupFormData.guardianPhone}
                              onChange={handleSignupFormChange}
                              placeholder="Guardian's phone"
                            />
                          </div>
                        </div>
                      </>
                    )}

                    {invitationData?.role !== 'student' && (
                      <div className="space-y-2">
                        <Label htmlFor="employeeId">Employee ID</Label>
                        <Input
                          id="employeeId"
                          name="employeeId"
                          type="text"
                          value={signupFormData.employeeId}
                          onChange={handleSignupFormChange}
                          placeholder={invitationData.employee_id || "Enter employee ID"}
                        />
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="password">Password *</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <Input
                          id="password"
                          name="password"
                          type={showSignupPassword ? 'text' : 'password'}
                          value={signupFormData.password}
                          onChange={handleSignupFormChange}
                          placeholder="Create a password"
                          className="pl-10 pr-10"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowSignupPassword(!showSignupPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showSignupPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm Password *</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <Input
                          id="confirmPassword"
                          name="confirmPassword"
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={signupFormData.confirmPassword}
                          onChange={handleSignupFormChange}
                          placeholder="Confirm your password"
                          className="pl-10 pr-10"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="address">Address</Label>
                      <Input
                        id="address"
                        name="address"
                        type="text"
                        value={signupFormData.address}
                        onChange={handleSignupFormChange}
                        placeholder="Enter your address"
                      />
                    </div>

                    <div className="space-y-3 pt-4">
                      <Button type="submit" className="w-full" disabled={signupLoading}>
                        {signupLoading ? 'Creating Account...' : 'Create Account'}
                      </Button>
                      
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full"
                        onClick={resetSignupForm}
                        disabled={signupLoading}
                      >
                        Back to Email
                      </Button>
                    </div>
                  </form>
                )}
              </TabsContent>
            </Tabs>
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
