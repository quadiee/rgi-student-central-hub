import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Eye, EyeOff, User, Lock, GraduationCap, Mail } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { useAuth } from '../../contexts/SupabaseAuthContext';
import { useToast } from '../ui/use-toast';
import { supabase } from '../../integrations/supabase/client';

interface InvitationData {
  id: string;
  email: string;
  role: string;
  department: string;
  roll_number?: string;
  employee_id?: string;
  is_valid: boolean;
  error_message?: string;
}

// Type for the database function response - matches exactly what the RPC returns
type ValidateInvitationResponse = {
  id: string;
  email: string;
  role: string;
  department: string;
  roll_number: string | null;
  employee_id: string | null;
  is_valid: boolean;
  error_message: string | null;
};

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
  const [invitationData, setInvitationData] = useState<InvitationData | null>(null);
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
      
      const { data, error } = await supabase.rpc('validate_invitation_token', {
        p_token: token!
      });
      
      if (error) {
        console.error('RPC Error:', error);
        setInviteError("Failed to validate invitation token.");
        setLoadingInvitation(false);
        return;
      }

      if (!data || !Array.isArray(data) || data.length === 0) {
        setInviteError("Invalid invitation token.");
        setLoadingInvitation(false);
        return;
      }

      // Explicit type assertion with proper validation
      const inviteData = data[0] as ValidateInvitationResponse;
      
      // Validate the response structure
      if (!inviteData || typeof inviteData !== 'object' || !inviteData.email) {
        setInviteError("Invalid invitation response format.");
        setLoadingInvitation(false);
        return;
      }

      if (!inviteData.is_valid) {
        setInviteError(inviteData.error_message || "This invitation is invalid or has expired.");
        setLoadingInvitation(false);
        return;
      }

      // Convert to our internal type format
      const processedInvitationData: InvitationData = {
        id: inviteData.id,
        email: inviteData.email,
        role: inviteData.role,
        department: inviteData.department,
        roll_number: inviteData.roll_number || undefined,
        employee_id: inviteData.employee_id || undefined,
        is_valid: inviteData.is_valid,
        error_message: inviteData.error_message || undefined
      };

      setInvitationData(processedInvitationData);

      // Check if user already exists in auth.users
      const { data: { users }, error: userError } = await supabase.auth.admin.listUsers();
      if (!userError && users) {
        const existingUser = users.find(u => u.email === inviteData.email);
        setUserExists(!!existingUser);
      }

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

    if (!invitationData) {
      toast({
        title: "Error",
        description: "Invitation data not found",
        variant: "destructive"
      });
      setLoading(false);
      return;
    }

    try {
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: invitationData.email,
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth`
        }
      });
      
      if (signUpError) {
        toast({
          title: "Signup Failed",
          description: signUpError.message,
          variant: "destructive"
        });
        setLoading(false);
        return;
      }

      const profileData = {
        name: formData.name,
        phone: formData.phone,
        roll_number: invitationData.role === 'student' ? (formData.rollNumber || invitationData.roll_number) : null,
        employee_id: invitationData.role !== 'student' ? (formData.employeeId || invitationData.employee_id) : null,
        guardian_name: invitationData.role === 'student' ? formData.guardianName : null,
        guardian_phone: invitationData.role === 'student' ? formData.guardianPhone : null,
        address: formData.address
      };

      const { data: completionResult, error: completionError } = await supabase.rpc('complete_invitation_profile', {
        p_user_id: authData.user?.id,
        p_invitation_id: invitationData.id,
        p_profile_data: profileData
      });

      if (completionError) {
        console.error('Profile completion error:', completionError);
        toast({
          title: "Profile Setup Failed",
          description: "Account created but profile setup failed. Please contact admin.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Account Created Successfully",
          description: "Your account has been created and profile completed. You can now log in.",
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
    // Explicit type guard with proper null checks
    if (!invitationData || !invitationData.email) {
      toast({
        title: "Error",
        description: "Invalid invitation data or missing email.",
        variant: "destructive"
      });
      return;
    }
    
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(invitationData.email, {
        redirectTo: `${window.location.origin}/reset-password`
      });
      
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

  if (userExists && invitationData) {
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
