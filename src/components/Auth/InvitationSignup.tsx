
import React, { useState, useEffect } from 'react';
import { supabase } from '../../integrations/supabase/client';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import { Alert, AlertDescription } from '../ui/alert';
import { Loader2, UserPlus, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

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

const InvitationSignup: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [invitation, setInvitation] = useState<InvitationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [guardianName, setGuardianName] = useState('');
  const [guardianPhone, setGuardianPhone] = useState('');

  useEffect(() => {
    if (token) {
      validateToken();
    }
  }, [token]);

  const validateToken = async () => {
    try {
      const { data, error } = await supabase.rpc('validate_invitation_token', {
        p_token: token
      });

      if (error) {
        console.error('Token validation error:', error);
        toast.error('Invalid invitation token');
        return;
      }

      if (data && data.length > 0) {
        const invitationData = data[0];
        setInvitation(invitationData);
        
        if (!invitationData.is_valid) {
          toast.error(invitationData.error_message || 'Invalid invitation');
        }
      }
    } catch (error) {
      console.error('Error validating token:', error);
      toast.error('Error validating invitation');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!invitation || !invitation.is_valid) {
      toast.error('Invalid invitation');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setSubmitting(true);

    try {
      // Step 1: Sign up the user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: invitation.email,
        password,
        options: {
          data: {
            name,
            phone,
            role: invitation.role,
            department: invitation.department,
            roll_number: invitation.roll_number,
            employee_id: invitation.employee_id,
            guardian_name: guardianName,
            guardian_phone: guardianPhone,
            address,
          }
        }
      });

      if (authError) {
        console.error('Auth error:', authError);
        toast.error(authError.message);
        return;
      }

      if (!authData.user) {
        toast.error('Failed to create user account');
        return;
      }

      // Step 2: If this is a faculty member, link their faculty profile
      if (invitation.role === 'faculty' && invitation.employee_id) {
        try {
          const { error: linkError } = await supabase.functions.invoke('link_faculty_profile', {
            body: {
              userId: authData.user.id,
              email: invitation.email,
              employeeId: invitation.employee_id
            }
          });

          if (linkError) {
            console.error('Faculty profile linking error:', linkError);
            toast.error('Account created but faculty profile linking failed');
          } else {
            console.log('Faculty profile linked successfully');
          }
        } catch (linkingError) {
          console.error('Error linking faculty profile:', linkingError);
          toast.error('Account created but faculty profile linking failed');
        }
      }

      // Step 3: Complete the invitation profile
      const { error: completeError } = await supabase.rpc('complete_invitation_profile', {
        p_user_id: authData.user.id,
        p_invitation_id: invitation.id,
        p_profile_data: {
          name,
          phone,
          roll_number: invitation.roll_number,
          employee_id: invitation.employee_id,
          guardian_name: guardianName,
          guardian_phone: guardianPhone,
          address
        }
      });

      if (completeError) {
        console.error('Profile completion error:', completeError);
        toast.error('Account created but profile completion failed');
      }

      toast.success('Account created successfully! Please check your email for verification.');
      navigate('/auth');

    } catch (error) {
      console.error('Signup error:', error);
      toast.error('Failed to create account');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">Validating invitation...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!invitation || !invitation.is_valid) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              Invalid Invitation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Alert>
              <AlertDescription>
                {invitation?.error_message || 'This invitation is invalid or has expired.'}
              </AlertDescription>
            </Alert>
            <Button 
              onClick={() => navigate('/auth')} 
              className="w-full mt-4"
              variant="outline"
            >
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Complete Your Registration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-6 p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">
              You've been invited as a <strong>{invitation.role}</strong> 
              {invitation.department && ` in ${invitation.department}`}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Email: <strong>{invitation.email}</strong>
            </p>
            {invitation.roll_number && (
              <p className="text-sm text-muted-foreground mt-1">
                Roll Number: <strong>{invitation.roll_number}</strong>
              </p>
            )}
            {invitation.employee_id && (
              <p className="text-sm text-muted-foreground mt-1">
                Employee ID: <strong>{invitation.employee_id}</strong>
              </p>
            )}
          </div>

          <form onSubmit={handleSignup} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Enter your full name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Enter your phone number"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password *</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter your password"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password *</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="Confirm your password"
              />
            </div>

            {invitation.role === 'student' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="guardianName">Guardian Name</Label>
                  <Input
                    id="guardianName"
                    value={guardianName}
                    onChange={(e) => setGuardianName(e.target.value)}
                    placeholder="Enter guardian's name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="guardianPhone">Guardian Phone</Label>
                  <Input
                    id="guardianPhone"
                    value={guardianPhone}
                    onChange={(e) => setGuardianPhone(e.target.value)}
                    placeholder="Enter guardian's phone number"
                  />
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Enter your address"
              />
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={submitting}
            >
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Complete Registration
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default InvitationSignup;
