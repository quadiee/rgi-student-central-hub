
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Eye, EyeOff, User, Lock, GraduationCap, Mail } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { useAuth } from '../../contexts/SupabaseAuthContext';
import { useToast } from '../ui/use-toast';
import { authUtils } from '../../lib/auth-utils';

const InvitationSignup: React.FC = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

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
  const [invitationData, setInvitationData] = useState<any>(null);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [loadingInvitation, setLoadingInvitation] = useState(true);
  const [userExists, setUserExists] = useState<boolean>(false);

  useEffect(() => {
    if (!token) {
      setInviteError("Missing invitation token.");
      setLoadingInvitation(false);
      return;
    }
    loadInvitationDetails();
  }, [token]);

  const loadInvitationDetails = async () => {
    try {
      setLoadingInvitation(true);
      
      // Validate invitation token using the new function
      const { data, error } = await authUtils.validateInvitationToken(token!);
      
      if (error || !data) {
        setInviteError("Failed to validate invitation token.");
        setLoadingInvitation(false);
        return;
      }

      if (!data.is_valid) {
        setInviteError(data.error_message || "This invitation is invalid or has expired.");
        setLoadingInvitation(false);
        return;
      }

      setInvitationData(data);

      // Check if user exists
      const exists = await authUtils.checkUserExists(data.email);
      setUserExists(exists);
      setInviteError(null);
      setLoadingInvitation(false);
    } catch (err: any) {
      console.error('Error loading invitation details:', err);
      setInviteError("Something went wrong while verifying your invitation.");
      setLoadingInvitation(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
      const userData = {
        name: formData.name,
        role: invitationData.role,
        department: invitationData.department,
        phone: formData.phone,
        roll_number: invitationData.role === 'student' ? (formData.rollNumber || invitationData.roll_number) : null,
        employee_id: invitationData.role !== 'student' ? (formData.employeeId || invitationData.employee_id) : null,
        guardian_name: invitationData.role === 'student' ? formData.guardianName : null,
        guardian_phone: invitationData.role === 'student' ? formData.guardianPhone : null,
        address: formData.address
      };

      const { error } = await authUtils.signUpWithProfile(invitationData.email, formData.password, userData);
      
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
        navigate("/auth");
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

  const handlePasswordSetup = async () => {
    setLoading(true);
    try {
      const { error } = await authUtils.sendPasswordReset(invitationData.email);
      
      if (error) {
        toast({
          title: "Error",
          description: "Failed to send password setup email.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Password Setup Email Sent",
          description: "Please check your email to set up your password.",
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

  if (loadingInvitation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Validating invitation...</p>
        </div>
      </div>
    );
  }

  if (inviteError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="max-w-md mx-auto bg-white border border-red-200 rounded-xl shadow-lg p-8 text-center">
          <h2 className="text-xl font-bold text-red-700 mb-3">Invitation Invalid</h2>
          <p className="text-gray-600 mb-4">{inviteError}</p>
          <Button onClick={() => navigate("/auth")} className="mt-4">
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  if (userExists) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md mx-auto bg-white rounded-xl shadow-lg p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-green-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Complete Your Setup</h2>
            <p className="text-gray-600">Account exists for <strong>{invitationData.email}</strong></p>
            <p className="text-gray-600 mb-6">Click below to receive a password setup link</p>
          </div>
          <div className="space-y-3">
            <Button
              onClick={handlePasswordSetup}
              className="w-full"
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

  if (!invitationData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">Loading invitation details...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md mx-auto bg-white rounded-xl shadow-lg p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-green-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Complete Your Registration</h2>
          <p className="text-gray-600">Fill in your details to activate your account</p>
          <div className="mt-2 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Role:</strong> {invitationData.role.charAt(0).toUpperCase() + invitationData.role.slice(1)}
            </p>
            <p className="text-sm text-blue-800">
              <strong>Department:</strong> {invitationData.department}
            </p>
            <p className="text-sm text-blue-800">
              <strong>Email:</strong> {invitationData.email}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
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

          {invitationData.role === 'student' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="rollNumber">Roll Number</Label>
                <Input
                  id="rollNumber"
                  name="rollNumber"
                  type="text"
                  value={formData.rollNumber}
                  onChange={handleChange}
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

          {invitationData.role !== 'student' && (
            <div className="space-y-2">
              <Label htmlFor="employeeId">Employee ID</Label>
              <Input
                id="employeeId"
                name="employeeId"
                type="text"
                value={formData.employeeId}
                onChange={handleChange}
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
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleChange}
                placeholder="Create a password"
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

          <div className="space-y-3 pt-4">
            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? 'Creating Account...' : 'Create Account'}
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
};

export default InvitationSignup;
