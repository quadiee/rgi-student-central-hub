
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useToast } from '../../hooks/use-toast';
import { supabase } from '../../integrations/supabase/client';
import { useAuth } from '../../contexts/SupabaseAuthContext';
import { Loader2, Mail, CheckCircle } from 'lucide-react';

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

  const generateInvitationToken = () => {
    return `inv_${Date.now()}_${Math.random().toString(36).substr(2, 16)}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      // Get department details
      const department = departments.find(d => d.id === formData.department_id);
      if (!department) {
        throw new Error('Please select a department');
      }

      // Generate secure token
      const invitationToken = generateInvitationToken();

      // Create user invitation with department_id instead of department enum
      const { data: invitationData, error: invitationError } = await supabase
        .from('user_invitations')
        .insert({
          email: formData.email,
          role: 'faculty' as const,
          department_id: formData.department_id, // Use department_id directly
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
      const { data: emailResult, error: emailError } = await supabase.functions.invoke('send-invitation-email', {
        body: {
          email: formData.email,
          role: 'faculty',
          department_id: formData.department_id,
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
        console.log('Invitation email sent successfully:', emailResult);
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
    }
  };

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
