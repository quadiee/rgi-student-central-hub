
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff, User, Lock, GraduationCap, Mail } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { useAuth } from '../../contexts/SupabaseAuthContext';
import { useToast } from '../ui/use-toast';
import { supabase } from '../../integrations/supabase/client';
import { PersonalizedAuthService } from '../../lib/personalizedAuth';

const InvitationSignup: React.FC = () => {
  const { token } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const { toast } = useToast();

  // Get context from URL params for personalization
  const urlRole = searchParams.get('role');
  const urlDept = searchParams.get('dept');

  const [formData, setFormData] = useState({
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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [validationState, setValidationState] = useState<{
    loading: boolean;
    error?: string;
    redirect?: string;
    invitationData?: any;
  }>({ loading: true });

  useEffect(() => {
    if (!token) {
      setValidationState({
        loading: false,
        error: "Missing invitation token.",
        redirect: 'invalid'
      });
      return;
    }
    validateInvitation();
  }, [token]);

  const validateInvitation = async () => {
    try {
      setValidationState({ loading: true });
      
      const result = await PersonalizedAuthService.validateInvitationWithContext('', token);
      
      if (!result.success || result.error) {
        setValidationState({
          loading: false,
          error: result.error || "This invitation link is invalid or has expired.",
          redirect: result.redirect || 'invalid'
        });
        return;
      }

      setValidationState({
        loading: false,
        redirect: result.redirect,
        invitationData: result.invitationData
      });
    } catch (err: any) {
      console.error('Error validating invitation:', err);
      setValidationState({
        loading: false,
        error: "Something went wrong while verifying your invitation.",
        redirect: 'invalid'
      });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handlePasswordSetup = async () => {
    if (!validationState.invitationData?.email) return;
    
    setLoading(true);
    try {
      const result = await PersonalizedAuthService.sendPersonalizedPasswordReset(validationState.invitationData.email);
      
      if (!result.success) {
        toast({
          title: "Error",
          description: result.error || "Failed to send password setup email.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Password Setup Email Sent",
          description: result.message || "Please check your email to set up your password.",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive"
      });
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validationState.invitationData) return;

    setLoading(true);

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match",
        variant: "destructive"
      });
      setLoading(false);
      return;
    }
    
    if (formData.password.length < 6) {
      toast({
        title: "Weak Password",
        description: "Password must be at least 6 characters",
        variant: "destructive"
      });
      setLoading(false);
      return;
    }

    try {
      const invitationContext = {
        userRole: validationState.invitationData.role,
        department: validationState.invitationData.department,
        userData: validationState.invitationData
      };

      const userData = {
        name: formData.name,
        role: validationState.invitationData.role,
        department: validationState.invitationData.department,
        phone: formData.phone,
        roll_number: validationState.invitationData.role === 'student' ? (formData.rollNumber || validationState.invitationData.roll_number) : null,
        employee_id: validationState.invitationData.role !== 'student' ? (formData.employeeId || validationState.invitationData.employee_id) : null,
        guardian_name: validationState.invitationData.role === 'student' ? formData.guardianName : null,
        guardian_phone: validationState.invitationData.role === 'student' ? formData.guardianPhone : null,
        address: formData.address
      };

      const result = await PersonalizedAuthService.signUpWithPersonalizedProfile(
        validationState.invitationData.email,
        formData.password,
        userData,
        invitationContext
      );
      
      if (!result.success) {
        toast({
          title: "Signup Failed",
          description: result.error,
          variant: "destructive"
        });
      } else {
        // Mark invitation as used
        await supabase
          .from('user_invitations')
          .update({ used_at: new Date().toISOString() })
          .eq('id', validationState.invitationData.id);

        toast({
          title: "Account Created Successfully",
          description: result.message || "Your personalized account has been created.",
        });
        
        // Navigate to role-based dashboard
        navigate(result.redirectUrl || "/dashboard");
      }
    } catch (error: any) {
      console.error('Signup error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    }
    setLoading(false);
  };

  // Loading state with enhanced UI
  if (validationState.loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md mx-auto bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Validating Invitation</h2>
          <p className="text-gray-600 mb-4">Please wait while we verify your invitation...</p>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      </div>
    );
  }

  // Error state with enhanced UI
  if (validationState.error || validationState.redirect === 'invalid') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md mx-auto bg-white rounded-xl shadow-lg p-8 text-center border border-red-200">
          <div className="w-16 h-16 bg-gradient-to-r from-red-600 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-xl font-bold text-red-700 mb-3">Invitation Invalid or Expired</h2>
          <p className="text-gray-600 mb-6">{validationState.error}</p>
          <Button 
            onClick={() => navigate("/auth")} 
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  // Password setup for existing users with enhanced UI
  if (validationState.redirect === 'password-setup') {
    const roleInfo = validationState.invitationData?.role || 'user';
    const deptInfo = validationState.invitationData?.department || '';
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md mx-auto bg-white rounded-xl shadow-lg p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-green-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Complete Your Setup</h2>
            <p className="text-gray-600 mt-2">Account exists for</p>
            <p className="font-semibold text-blue-600">{validationState.invitationData?.email}</p>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
              <p className="text-sm text-blue-800">
                <strong>Role:</strong> {roleInfo.charAt(0).toUpperCase() + roleInfo.slice(1)}
                {deptInfo && <><br /><strong>Department:</strong> {deptInfo}</>}
              </p>
            </div>
            
            <p className="text-gray-600 mt-4">Click below to receive a personalized password setup link</p>
          </div>
          
          <div className="space-y-3">
            <Button
              onClick={handlePasswordSetup}
              className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
              disabled={loading}
            >
              {loading ? 'Sending Setup Link...' : 'Send Password Setup Link'}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => navigate("/auth")}
              disabled={loading}
            >
              Back to Login
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Enhanced signup form with role-specific personalization
  if (validationState.redirect === 'signup' && validationState.invitationData) {
    const roleInfo = validationState.invitationData.role;
    const deptInfo = validationState.invitationData.department;
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md mx-auto bg-white rounded-xl shadow-lg p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-green-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <GraduationCap className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Complete Your Registration</h2>
            <p className="text-gray-600">Fill in your details to activate your account</p>
            
            <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800">
                <strong>Role:</strong> <span className="px-2 py-1 bg-blue-600 text-white rounded text-xs font-semibold">{roleInfo.charAt(0).toUpperCase() + roleInfo.slice(1)}</span>
              </p>
              <p className="text-sm text-blue-800 mt-1">
                <strong>Department:</strong> {deptInfo}
              </p>
              <p className="text-sm text-blue-800 mt-1">
                <strong>Email:</strong> {validationState.invitationData.email}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name field */}
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  className="pl-10"
                  required
                />
              </div>
            </div>

            {/* Phone field */}
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Enter your phone number"
              />
            </div>

            {/* Role-specific fields */}
            {validationState.invitationData.role === 'student' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="rollNumber">Roll Number</Label>
                  <Input
                    id="rollNumber"
                    name="rollNumber"
                    type="text"
                    value={formData.rollNumber}
                    onChange={handleChange}
                    placeholder={validationState.invitationData.roll_number || "Enter roll number"}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="guardianName">Guardian Name</Label>
                    <Input
                      id="guardianName"
                      name="guardianName"
                      type="text"
                      value={formData.guardianName}
                      onChange={handleChange}
                      placeholder="Guardian's name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="guardianPhone">Guardian Phone</Label>
                    <Input
                      id="guardianPhone"
                      name="guardianPhone"
                      type="tel"
                      value={formData.guardianPhone}
                      onChange={handleChange}
                      placeholder="Guardian's phone"
                    />
                  </div>
                </div>
              </>
            )}

            {validationState.invitationData.role !== 'student' && (
              <div className="space-y-2">
                <Label htmlFor="employeeId">Employee ID</Label>
                <Input
                  id="employeeId"
                  name="employeeId"
                  type="text"
                  value={formData.employeeId}
                  onChange={handleChange}
                  placeholder={validationState.invitationData.employee_id || "Enter employee ID"}
                />
              </div>
            )}

            {/* Password fields */}
            <div className="space-y-2">
              <Label htmlFor="password">Password *</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create a secure password"
                  className="pl-10 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
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
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm your password"
                  className="pl-10 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  tabIndex={-1}
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Address field */}
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                name="address"
                type="text"
                value={formData.address}
                onChange={handleChange}
                placeholder="Enter your address"
              />
            </div>

            {/* Submit buttons */}
            <div className="space-y-3 pt-4">
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                disabled={loading}
              >
                {loading ? 'Creating Account...' : 'Create Account & Join RGCE'}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => navigate("/auth")}
                disabled={loading}
              >
                Back to Login
              </Button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Processing invitation...</p>
      </div>
    </div>
  );
};

export default InvitationSignup;
