
import React, { useState, useEffect } from 'react';
import { useSearchParams, useParams, useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';
import { Loader2, CheckCircle, AlertCircle, Mail } from 'lucide-react';
import { supabase } from '../../integrations/supabase/client';
import { toast } from 'sonner';

interface InvitationData {
  id: string;
  email: string;
  role: string;
  department_id?: string;
  department?: string; // Legacy field - current schema
  department_name?: string;
  department_code?: string;
  roll_number?: string;
  employee_id?: string;
  is_valid: boolean;
  token: string;
}

const InvitationSignup: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { token } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(true);
  const [invitationData, setInvitationData] = useState<InvitationData | null>(null);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    password: '',
    confirmPassword: '',
    phone: '',
    address: '',
    guardian_name: '',
    guardian_phone: ''
  });

  useEffect(() => {
    // Get token from URL params or search params
    const invitationToken = token || searchParams.get('token');
    const email = searchParams.get('email');

    if (invitationToken) {
      validateInvitationByToken(invitationToken);
    } else if (email) {
      // Fallback to email-based validation for backward compatibility
      validateInvitationByEmail(email);
    } else {
      setError('Invalid invitation link - missing token or email parameter');
      setValidating(false);
    }
  }, [token, searchParams]);

  const validateInvitationByToken = async (invitationToken: string) => {
    try {
      setValidating(true);
      console.log('Validating invitation token:', invitationToken);
      
      const { data, error } = await supabase
        .rpc('validate_invitation_token', { p_token: invitationToken });

      if (error) {
        console.error('Token validation error:', error);
        setError(error.message || 'Failed to validate invitation');
        return;
      }

      if (!data || data.length === 0) {
        setError('Invalid invitation token');
        return;
      }

      const invitation = data[0];
      if (!invitation.is_valid) {
        setError(invitation.error_message || 'Invalid or expired invitation');
        return;
      }

      // Check if user already exists by checking profiles table
      const { data: existingProfile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', invitation.email)
        .single();

      if (existingProfile && !profileError) {
        setError('User already exists. Please use the login page instead.');
        return;
      }

      // Get department details - handle both old and new structure
      let departmentName = 'Unknown Department';
      let departmentCode = 'UNK';
      let departmentId = invitation.department_id;
      
      // If we have department_id, fetch department details
      if (invitation.department_id) {
        try {
          const { data: deptData } = await supabase
            .from('departments')
            .select('name, code')
            .eq('id', invitation.department_id)
            .single();

          if (deptData) {
            departmentName = deptData.name;
            departmentCode = deptData.code;
          }
        } catch (error) {
          console.error('Error fetching department:', error);
        }
      }
      // Fallback to old department enum if no department_id
      else if (invitation.department) {
        try {
          const { data: deptData } = await supabase
            .from('departments')
            .select('id, name, code')
            .eq('code', invitation.department)
            .single();

          if (deptData) {
            departmentId = deptData.id;
            departmentName = deptData.name;
            departmentCode = deptData.code;
          }
        } catch (error) {
          console.error('Error fetching department by code:', error);
        }
      }

      setInvitationData({
        id: invitation.id,
        email: invitation.email,
        role: invitation.role,
        department_id: departmentId,
        department: invitation.department,
        department_name: departmentName,
        department_code: departmentCode,
        roll_number: invitation.roll_number,
        employee_id: invitation.employee_id,
        is_valid: true,
        token: invitationToken
      });
    } catch (error: any) {
      console.error('Error validating invitation:', error);
      setError('Failed to validate invitation');
    } finally {
      setValidating(false);
    }
  };

  const validateInvitationByEmail = async (email: string) => {
    try {
      setValidating(true);
      
      const { data, error } = await supabase
        .from('user_invitations')
        .select(`
          id,
          email,
          role,
          department_id,
          department,
          roll_number,
          employee_id,
          token,
          is_active,
          expires_at,
          used_at
        `)
        .eq('email', email)
        .eq('is_active', true)
        .gt('expires_at', new Date().toISOString())
        .is('used_at', null)
        .single();

      if (error || !data) {
        setError('Invalid or expired invitation');
        return;
      }

      // Check if user already exists
      const { data: existingProfile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .single();

      if (existingProfile && !profileError) {
        setError('User already exists. Please use the login page instead.');
        return;
      }

      // Get department details - handle both old and new structure
      let departmentName = 'Unknown Department';
      let departmentCode = 'UNK';
      let departmentId = data.department_id;
      
      if (data.department_id) {
        try {
          const { data: deptData } = await supabase
            .from('departments')
            .select('name, code')
            .eq('id', data.department_id)
            .single();

          if (deptData) {
            departmentName = deptData.name;
            departmentCode = deptData.code;
          }
        } catch (error) {
          console.error('Error fetching department:', error);
        }
      } else if (data.department) {
        // Fallback for old structure
        try {
          const { data: deptData } = await supabase
            .from('departments')
            .select('id, name, code')
            .eq('code', data.department)
            .single();

          if (deptData) {
            departmentId = deptData.id;
            departmentName = deptData.name;
            departmentCode = deptData.code;
          }
        } catch (error) {
          console.error('Error fetching department by code:', error);
        }
      }

      setInvitationData({
        id: data.id,
        email: data.email,
        role: data.role,
        department_id: departmentId,
        department: data.department,
        department_name: departmentName,
        department_code: departmentCode,
        roll_number: data.roll_number,
        employee_id: data.employee_id,
        is_valid: true,
        token: data.token || ''
      });
    } catch (error: any) {
      console.error('Error validating invitation:', error);
      setError('Failed to validate invitation');
    } finally {
      setValidating(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!invitationData) {
      setError('Invalid invitation data');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    try {
      setLoading(true);
      setError('');

      console.log('Starting signup process for:', invitationData.email);

      // Step 1: Sign up the user
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: invitationData.email,
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
          data: {
            name: formData.name,
            role: invitationData.role,
            department_id: invitationData.department_id,
            phone: formData.phone,
            roll_number: invitationData.roll_number,
            employee_id: invitationData.employee_id,
            guardian_name: formData.guardian_name,
            guardian_phone: formData.guardian_phone,
            address: formData.address
          }
        }
      });

      if (signUpError) {
        console.error('Signup error:', signUpError);
        throw signUpError;
      }

      if (!authData.user) {
        throw new Error('User creation failed');
      }

      console.log('User created successfully:', authData.user.id);

      // Step 2: Complete profile setup using the database function
      const { error: profileError } = await supabase.rpc('complete_invitation_profile', {
        p_user_id: authData.user.id,
        p_invitation_id: invitationData.id,
        p_profile_data: {
          name: formData.name,
          phone: formData.phone,
          roll_number: invitationData.roll_number,
          employee_id: invitationData.employee_id,
          guardian_name: formData.guardian_name,
          guardian_phone: formData.guardian_phone,
          address: formData.address
        }
      });

      if (profileError) {
        console.error('Profile completion error:', profileError);
        throw profileError;
      }

      console.log('Profile completed successfully');

      // Step 3: For faculty, link the faculty profile
      if (invitationData.role === 'faculty' && invitationData.employee_id) {
        console.log('Linking faculty profile...');
        
        try {
          const { data: linkResult, error: linkError } = await supabase.functions.invoke('link_faculty_profile', {
            body: {
              userId: authData.user.id,
              email: invitationData.email,
              employeeId: invitationData.employee_id
            }
          });

          if (linkError) {
            console.error('Faculty profile linking error:', linkError);
            toast.error('Account created but faculty profile linking failed');
          } else if (linkResult?.success) {
            console.log('Faculty profile linked successfully');
            toast.success('Faculty account created and profile linked successfully!');
          }
        } catch (linkError) {
          console.error('Faculty profile linking error:', linkError);
          toast.error('Account created but faculty profile linking failed');
        }
      }

      // Success! Redirect based on role
      toast.success('Account created successfully! Please check your email to verify your account.');
      
      // Redirect to appropriate dashboard based on role
      const redirectPath = invitationData.role === 'student' ? '/dashboard' : 
                          invitationData.role === 'faculty' ? '/faculty' : '/dashboard';
      
      setTimeout(() => {
        navigate(redirectPath);
      }, 2000);

    } catch (error: any) {
      console.error('Signup process error:', error);
      setError(error.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  if (validating) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-4" />
            <p className="text-gray-600">Validating invitation...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              Invitation Error
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
            <Button 
              className="w-full mt-4" 
              onClick={() => navigate('/auth?mode=login')}
            >
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!invitationData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center p-8">
            <AlertCircle className="h-8 w-8 text-red-600 mb-4" />
            <p className="text-gray-600">Invalid invitation data</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-center">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Complete Your Registration
          </CardTitle>
          <div className="text-center text-sm text-gray-600">
            <p>You've been invited as: <strong className="capitalize">{invitationData.role}</strong></p>
            <p>Email: <strong>{invitationData.email}</strong></p>
            <p>Department: <strong>{invitationData.department_name} ({invitationData.department_code})</strong></p>
            {invitationData.employee_id && (
              <p>Employee ID: <strong>{invitationData.employee_id}</strong></p>
            )}
            {invitationData.roll_number && (
              <p>Roll Number: <strong>{invitationData.roll_number}</strong></p>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <Label htmlFor="password">Password *</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                required
                minLength={6}
                placeholder="Minimum 6 characters"
              />
            </div>

            <div>
              <Label htmlFor="confirmPassword">Confirm Password *</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                required
                minLength={6}
                placeholder="Re-enter your password"
              />
            </div>

            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                placeholder="Your phone number"
              />
            </div>

            {invitationData.role === 'student' && (
              <>
                <div>
                  <Label htmlFor="guardian_name">Guardian Name</Label>
                  <Input
                    id="guardian_name"
                    type="text"
                    value={formData.guardian_name}
                    onChange={(e) => setFormData({...formData, guardian_name: e.target.value})}
                    placeholder="Parent/Guardian name"
                  />
                </div>

                <div>
                  <Label htmlFor="guardian_phone">Guardian Phone</Label>
                  <Input
                    id="guardian_phone"
                    type="tel"
                    value={formData.guardian_phone}
                    onChange={(e) => setFormData({...formData, guardian_phone: e.target.value})}
                    placeholder="Parent/Guardian phone number"
                  />
                </div>
              </>
            )}

            <div>
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
                placeholder="Your address"
              />
            </div>

            {error && (
              <Alert variant="destructive">
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
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Complete Registration
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default InvitationSignup;
