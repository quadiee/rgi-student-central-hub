import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../../integrations/supabase/client';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';
import { Loader2, CheckCircle, AlertCircle, User } from 'lucide-react';
import { toast } from 'sonner';

const InvitationSignup = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(true);
  const [invitationData, setInvitationData] = useState<any>(null);
  const [error, setError] = useState('');
  const [step, setStep] = useState<'validate' | 'signup' | 'complete'>('validate');

  const [signupForm, setSignupForm] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [profileForm, setProfileForm] = useState({
    name: '',
    phone: '',
    address: '',
    gender: '',
    age: ''
  });

  useEffect(() => {
    if (token) {
      validateInvitation();
    } else {
      setError('Invalid invitation link - no token provided');
      setValidating(false);
    }
  }, [token]);

  const validateInvitation = async () => {
    try {
      console.log('Validating invitation token:', token);
      
      // Call the database function directly to validate the invitation
      const { data, error } = await supabase.rpc('validate_invitation_token', {
        p_token: token
      });

      console.log('Validation result:', { data, error });

      if (error) {
        console.error('RPC error:', error);
        setError(`Validation failed: ${error.message}`);
        return;
      }

      if (!data || data.length === 0) {
        setError('Invalid or expired invitation');
        return;
      }

      const invitation = data[0];
      
      if (!invitation.is_valid) {
        setError(invitation.error_message || 'Invalid invitation');
        return;
      }

      // Use type assertion to handle the mismatch between actual return and TypeScript types
      const invitationWithDept = invitation as any;

      // Set invitation data with proper structure - handle both old and new formats
      const invitationInfo = {
        id: invitation.id,
        email: invitation.email,
        role: invitation.role,
        // Safely access properties using type assertion
        department_id: invitationWithDept.department_id || null,
        department_name: invitationWithDept.department_name || (invitation.department ? invitation.department : null),
        department_code: invitationWithDept.department_code || (invitation.department ? invitation.department : null),
        employee_id: invitation.employee_id,
        roll_number: invitation.roll_number
      };

      setInvitationData(invitationInfo);
      setSignupForm(prev => ({ ...prev, email: invitation.email }));
      setStep('signup');
      
    } catch (err: any) {
      console.error('Invitation validation error:', err);
      setError(`Failed to validate invitation: ${err.message}`);
    } finally {
      setValidating(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (signupForm.password !== signupForm.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (signupForm.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: signupForm.email,
        password: signupForm.password,
        options: {
          data: {
            role: invitationData.role,
            employee_id: invitationData.employee_id,
            roll_number: invitationData.roll_number,
            invitation_id: invitationData.id,
            department_id: invitationData.department_id
          }
        }
      });

      if (authError) throw authError;

      if (authData.user) {
        console.log('User signed up successfully:', authData.user.id);
        setStep('complete');
      }
    } catch (err: any) {
      console.error('Signup error:', err);
      setError(err.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileCompletion = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not found');
      }

      console.log('Completing profile for user:', user.id);

      // Update user profile with proper department_id
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          name: profileForm.name,
          phone: profileForm.phone,
          address: profileForm.address,
          gender: profileForm.gender,
          age: profileForm.age ? parseInt(profileForm.age) : null,
          department_id: invitationData.department_id,
          employee_id: invitationData.employee_id,
          roll_number: invitationData.roll_number,
          is_active: true,
          profile_completed: true
        })
        .eq('id', user.id);

      if (profileError) {
        console.error('Profile update error:', profileError);
        throw profileError;
      }

      console.log('Profile updated successfully');

      // For faculty members, create or link faculty profile
      if (invitationData.role === 'faculty') {
        console.log('Creating faculty profile for:', user.id);
        
        const { data: facultyResult, error: facultyError } = await supabase.functions.invoke(
          'create_or_link_faculty_profile',
          {
            body: {
              userId: user.id,
              email: user.email,
              employeeId: invitationData.employee_id,
              name: profileForm.name,
              designation: 'Faculty', // Default designation, can be updated later
              departmentId: invitationData.department_id
            }
          }
        );

        if (facultyError) {
          console.error('Faculty profile creation error:', facultyError);
          // Don't fail the entire process, just log the error
          toast.error('Profile created but faculty profile linking failed');
        } else if (facultyResult?.success) {
          console.log('Faculty profile created/linked successfully:', facultyResult);
          toast.success('Faculty profile created successfully!');
        }
      }

      // Mark invitation as used
      const { error: invitationError } = await supabase
        .from('user_invitations')
        .update({ used_at: new Date().toISOString() })
        .eq('id', invitationData.id);

      if (invitationError) {
        console.error('Error marking invitation as used:', invitationError);
      }

      toast.success('Profile completed successfully!');
      
      // Redirect to appropriate dashboard
      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);

    } catch (err: any) {
      console.error('Profile completion error:', err);
      setError(err.message || 'Failed to complete profile');
    } finally {
      setLoading(false);
    }
  };

  if (validating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-600 mb-4" />
              <h2 className="text-xl font-semibold mb-2">Validating Invitation</h2>
              <p className="text-gray-600">Please wait while we verify your invitation...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="mx-auto h-12 w-12 text-red-600 mb-4" />
              <h2 className="text-xl font-semibold mb-2 text-red-600">Invitation Error</h2>
              <p className="text-gray-600 mb-4">{error}</p>
              <Button variant="outline" onClick={() => navigate('/auth')}>
                Go to Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">
            {step === 'signup' && 'Create Your Account'}
            {step === 'complete' && 'Complete Your Profile'}
          </CardTitle>
          {invitationData && (
            <div className="text-center text-sm text-gray-600">
              <p>Invited as: <span className="font-semibold capitalize">{invitationData.role}</span></p>
              <p>Department: <span className="font-semibold">{invitationData.department_name || invitationData.department_code}</span></p>
              {invitationData.employee_id && (
                <p>Employee ID: <span className="font-semibold">{invitationData.employee_id}</span></p>
              )}
              {invitationData.roll_number && (
                <p>Roll Number: <span className="font-semibold">{invitationData.roll_number}</span></p>
              )}
            </div>
          )}
        </CardHeader>
        
        <CardContent>
          {step === 'signup' && (
            <form onSubmit={handleSignup} className="space-y-4">
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={signupForm.email}
                  disabled
                  className="bg-gray-50"
                />
              </div>

              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={signupForm.password}
                  onChange={(e) => setSignupForm(prev => ({ ...prev, password: e.target.value }))}
                  required
                  minLength={6}
                  disabled={loading}
                />
              </div>

              <div>
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={signupForm.confirmPassword}
                  onChange={(e) => setSignupForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  required
                  minLength={6}
                  disabled={loading}
                />
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  <>
                    <User className="mr-2 h-4 w-4" />
                    Create Account
                  </>
                )}
              </Button>
            </form>
          )}

          {step === 'complete' && (
            <form onSubmit={handleProfileCompletion} className="space-y-4">
              <div className="text-center mb-4">
                <CheckCircle className="mx-auto h-8 w-8 text-green-600 mb-2" />
                <p className="text-sm text-gray-600">Account created successfully! Please complete your profile.</p>
              </div>

              <div>
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={profileForm.name}
                  onChange={(e) => setProfileForm(prev => ({ ...prev, name: e.target.value }))}
                  required
                  disabled={loading}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, phone: e.target.value }))}
                    disabled={loading}
                  />
                </div>
                <div>
                  <Label htmlFor="age">Age</Label>
                  <Input
                    id="age"
                    type="number"
                    value={profileForm.age}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, age: e.target.value }))}
                    disabled={loading}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="gender">Gender</Label>
                <select
                  id="gender"
                  value={profileForm.gender}
                  onChange={(e) => setProfileForm(prev => ({ ...prev, gender: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={loading}
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={profileForm.address}
                  onChange={(e) => setProfileForm(prev => ({ ...prev, address: e.target.value }))}
                  disabled={loading}
                />
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Completing Profile...
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Complete Profile
                  </>
                )}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default InvitationSignup;
