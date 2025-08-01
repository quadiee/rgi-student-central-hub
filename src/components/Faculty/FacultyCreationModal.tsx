
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useToast } from '../../hooks/use-toast';
import { supabase } from '../../integrations/supabase/client';
import { useAuth } from '../../contexts/SupabaseAuthContext';
import { Loader2, Mail, CheckCircle, AlertTriangle } from 'lucide-react';

interface FacultyCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const FacultyCreationModal: React.FC<FacultyCreationModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [emailSending, setEmailSending] = useState(false);
  const [invitationSent, setInvitationSent] = useState(false);
  const [existingInvitation, setExistingInvitation] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    employee_code: '',
    designation: '',
    department_id: '',
    phone: '',
    gender: ''
  });

  const [departments, setDepartments] = useState<any[]>([]);

  React.useEffect(() => {
    if (isOpen) {
      fetchDepartments();
      setInvitationSent(false);
      setExistingInvitation(null);
    }
  }, [isOpen]);

  const fetchDepartments = async () => {
    try {
      const { data, error } = await supabase
        .from('departments')
        .select('id, name, code')
        .eq('is_active', true);
      
      if (error) throw error;
      setDepartments(data || []);
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  const checkExistingInvitation = async (email: string) => {
    try {
      const { data, error } = await supabase
        .from('user_invitations')
        .select(`
          id, 
          email, 
          role, 
          department_id, 
          employee_id,
          is_active,
          expires_at,
          used_at,
          email_sent,
          departments:department_id (
            name,
            code
          )
        `)
        .eq('email', email.trim().toLowerCase())
        .eq('is_active', true)
        .maybeSingle();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error checking existing invitation:', error);
      return null;
    }
  };

  const generateInvitationToken = () => {
    return `inv_${Date.now()}_${Math.random().toString(36).substr(2, 16)}`;
  };

  const resendExistingInvitation = async () => {
    if (!existingInvitation || !user) return;

    setEmailSending(true);
    try {
      const { error: emailError } = await supabase.functions.invoke('send-invitation-email', {
        body: {
          email: existingInvitation.email,
          role: 'faculty',
          departmentId: existingInvitation.department_id,
          invitedBy: user.id,
          invitationId: existingInvitation.id,
          employeeId: existingInvitation.employee_id,
          name: formData.name,
          designation: formData.designation
        }
      });

      if (emailError) {
        console.error('Error sending invitation email:', emailError);
        toast({
          title: "Email Error",
          description: "Invitation exists but email could not be resent. Please contact the faculty member directly.",
          variant: "default"
        });
      } else {
        toast({
          title: "Success",
          description: "Existing invitation email resent successfully!"
        });
        setInvitationSent(true);
      }

      onSuccess();
      
      // Close modal after a brief delay
      setTimeout(() => {
        onClose();
        setInvitationSent(false);
        setExistingInvitation(null);
      }, 2000);

    } catch (error: any) {
      console.error('Error resending invitation:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to resend invitation",
        variant: "destructive"
      });
    } finally {
      setEmailSending(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    // First check if invitation already exists
    const existing = await checkExistingInvitation(formData.email);
    if (existing) {
      setExistingInvitation(existing);
      return;
    }

    setLoading(true);
    try {
      // Get department details
      const department = departments.find(d => d.id === formData.department_id);
      if (!department) {
        throw new Error('Please select a department');
      }

      // Generate secure token
      const invitationToken = generateInvitationToken();

      // Create user invitation with department_id
      const { data: invitationData, error: invitationError } = await supabase
        .from('user_invitations')
        .insert({
          email: formData.email,
          role: 'faculty' as const,
          department_id: formData.department_id,
          employee_id: formData.employee_code,
          invited_by: user.id,
          is_active: true,
          token: invitationToken,
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        })
        .select()
        .single();

      if (invitationError) {
        console.error('Invitation creation error:', invitationError);
        throw invitationError;
      }

      console.log('Invitation created successfully:', invitationData);

      // Send invitation email
      setEmailSending(true);
      const { error: emailError } = await supabase.functions.invoke('send-invitation-email', {
        body: {
          email: formData.email,
          role: 'faculty',
          departmentId: formData.department_id,
          invitedBy: user.id,
          invitationId: invitationData.id,
          employeeId: formData.employee_code,
          token: invitationToken,
          name: formData.name,
          designation: formData.designation
        }
      });

      if (emailError) {
        console.error('Error sending invitation email:', emailError);
        toast({
          title: "Invitation Created",
          description: "Faculty invitation created but email could not be sent. Please contact the faculty member directly.",
          variant: "default"
        });
      } else {
        console.log('Invitation email sent successfully');
        toast({
          title: "Success",
          description: "Faculty invitation created and email sent successfully!"
        });
        setInvitationSent(true);
      }

      onSuccess();
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        employee_code: '',
        designation: '',
        department_id: '',
        phone: '',
        gender: ''
      });

      // Close modal after a brief delay to show success state
      setTimeout(() => {
        onClose();
        setInvitationSent(false);
      }, 2000);

    } catch (error: any) {
      console.error('Faculty invitation error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create faculty invitation",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
      setEmailSending(false);
    }
  };

  const handleClose = () => {
    if (!loading && !emailSending) {
      onClose();
      setInvitationSent(false);
      setExistingInvitation(null);
    }
  };

  // Show existing invitation dialog
  if (existingInvitation) {
    const isExpired = new Date(existingInvitation.expires_at) < new Date();
    const isUsed = !!existingInvitation.used_at;

    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              Invitation Already Exists
            </DialogTitle>
            <DialogDescription>
              An invitation for <strong>{existingInvitation.email}</strong> already exists.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="space-y-2 text-sm">
                <p><strong>Email:</strong> {existingInvitation.email}</p>
                <p><strong>Role:</strong> Faculty</p>
                <p><strong>Department:</strong> {existingInvitation.departments?.name} ({existingInvitation.departments?.code})</p>
                <p><strong>Employee ID:</strong> {existingInvitation.employee_id || 'Not specified'}</p>
                <p><strong>Status:</strong> 
                  {isUsed ? (
                    <span className="text-green-600 font-medium"> Used</span>
                  ) : isExpired ? (
                    <span className="text-red-600 font-medium"> Expired</span>
                  ) : existingInvitation.email_sent ? (
                    <span className="text-blue-600 font-medium"> Email Sent</span>
                  ) : (
                    <span className="text-orange-600 font-medium"> Email Pending</span>
                  )}
                </p>
                <p><strong>Expires:</strong> {new Date(existingInvitation.expires_at).toLocaleDateString()}</p>
              </div>
            </div>

            {!isUsed && !isExpired && (
              <div className="flex justify-end space-x-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleClose}
                  disabled={emailSending}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={resendExistingInvitation}
                  disabled={emailSending}
                >
                  {emailSending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Resending...
                    </>
                  ) : (
                    <>
                      <Mail className="mr-2 h-4 w-4" />
                      Resend Invitation
                    </>
                  )}
                </Button>
              </div>
            )}

            {(isUsed || isExpired) && (
              <div className="flex justify-end">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleClose}
                >
                  Close
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {invitationSent ? (
              <>
                <CheckCircle className="h-5 w-5 text-green-600" />
                Invitation Sent Successfully!
              </>
            ) : (
              <>
                <Mail className="h-5 w-5" />
                Invite New Faculty Member
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {invitationSent 
              ? "The faculty member will receive an invitation email to complete their profile."
              : "Enter the faculty member's information. They will receive an invitation email to complete their profile."
            }
          </DialogDescription>
        </DialogHeader>
        
        {!invitationSent ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  disabled={loading || emailSending}
                />
              </div>
              <div>
                <Label htmlFor="employee_code">Employee Code *</Label>
                <Input
                  id="employee_code"
                  value={formData.employee_code}
                  onChange={(e) => setFormData({ ...formData, employee_code: e.target.value })}
                  required
                  disabled={loading || emailSending}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                disabled={loading || emailSending}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="designation">Designation *</Label>
                <Select 
                  value={formData.designation} 
                  onValueChange={(value) => setFormData({ ...formData, designation: value })}
                  disabled={loading || emailSending}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select designation" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Professor">Professor</SelectItem>
                    <SelectItem value="Associate Professor">Associate Professor</SelectItem>
                    <SelectItem value="Assistant Professor">Assistant Professor</SelectItem>
                    <SelectItem value="Lecturer">Lecturer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="department">Department *</Label>
                <Select 
                  value={formData.department_id} 
                  onValueChange={(value) => setFormData({ ...formData, department_id: value })}
                  disabled={loading || emailSending}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept.id} value={dept.id}>
                        {dept.name} ({dept.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  disabled={loading || emailSending}
                />
              </div>
              <div>
                <Label htmlFor="gender">Gender</Label>
                <Select 
                  value={formData.gender} 
                  onValueChange={(value) => setFormData({ ...formData, gender: value })}
                  disabled={loading || emailSending}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleClose}
                disabled={loading || emailSending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading || emailSending}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Invitation...
                  </>
                ) : emailSending ? (
                  <>
                    <Mail className="mr-2 h-4 w-4 animate-pulse" />
                    Sending Email...
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    Send Invitation
                  </>
                )}
              </Button>
            </div>
          </form>
        ) : (
          <div className="text-center py-6">
            <CheckCircle className="mx-auto h-16 w-16 text-green-600 mb-4" />
            <p className="text-sm text-muted-foreground">
              Invitation email has been sent to <strong>{formData.email}</strong>
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default FacultyCreationModal;
