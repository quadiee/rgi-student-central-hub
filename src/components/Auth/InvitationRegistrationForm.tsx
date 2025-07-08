
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, User, Lock, GraduationCap } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { useToast } from '../ui/use-toast';
import { supabase } from '../../integrations/supabase/client';
import { InvitationData, InvitationFormData } from '../../types/invitation';

interface InvitationRegistrationFormProps {
  invitationData: InvitationData;
}

const InvitationRegistrationForm: React.FC<InvitationRegistrationFormProps> = ({ invitationData }) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [formData, setFormData] = useState<InvitationFormData>({
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

export default InvitationRegistrationForm;
