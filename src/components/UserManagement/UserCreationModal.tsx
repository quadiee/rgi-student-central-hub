
import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useToast } from '../ui/use-toast';
import { supabase } from '../../integrations/supabase/client';
import { UserPlus } from 'lucide-react';

interface Department {
  id: string;
  name: string;
  code: string;
}

interface UserCreationModalProps {
  onUserCreated: () => void;
}

const UserCreationModal: React.FC<UserCreationModalProps> = ({ onUserCreated }) => {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'student' as const,
    department_id: '',
    roll_number: '',
    employee_id: '',
    phone: '',
    year: '',
    section: ''
  });

  const roles = [
    { value: 'student', label: 'Student' },
    { value: 'faculty', label: 'Faculty' },
    { value: 'hod', label: 'Head of Department' },
    { value: 'principal', label: 'Principal' },
    { value: 'chairman', label: 'Chairman' },
    { value: 'admin', label: 'Administrator' }
  ];

  useEffect(() => {
    if (open) {
      loadDepartments();
    }
  }, [open]);

  const loadDepartments = async () => {
    try {
      const { data, error } = await supabase
        .from('departments')
        .select('id, name, code')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setDepartments(data || []);
    } catch (error) {
      console.error('Error loading departments:', error);
      toast({
        title: "Error",
        description: "Failed to load departments",
        variant: "destructive"
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.department_id) {
      toast({
        title: "Error",
        description: "Please select a department",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      console.log('Creating user with data:', formData);

      // First create the invitation record
      const { data: inviteData, error: inviteError } = await supabase
        .from('user_invitations')
        .insert({
          email: formData.email.trim().toLowerCase(),
          role: formData.role,
          department_id: formData.department_id,
          roll_number: formData.role === 'student' ? formData.roll_number || null : null,
          employee_id: formData.role !== 'student' ? formData.employee_id || null : null,
          is_active: true,
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        })
        .select()
        .single();

      if (inviteError) {
        console.error('Error creating invitation:', inviteError);
        if (inviteError.code === '23505') {
          toast({
            title: "Error",
            description: "An invitation for this email already exists.",
            variant: "destructive"
          });
        } else {
          toast({
            title: "Error",
            description: inviteError.message,
            variant: "destructive"
          });
        }
        return;
      }

      // Send invitation email
      try {
        const { error: emailError } = await supabase.functions.invoke('send-invitation-email', {
          body: {
            email: formData.email,
            role: formData.role,
            departmentId: formData.department_id,
            invitationId: inviteData.id,
            rollNumber: formData.roll_number,
            employeeId: formData.employee_id
          }
        });

        if (emailError) {
          console.error('Error sending invitation email:', emailError);
        }
      } catch (emailError) {
        console.error('Exception sending invitation email:', emailError);
      }

      toast({
        title: "Success",
        description: `User invitation created successfully for ${formData.email}`,
      });

      // Reset form
      setFormData({
        name: '',
        email: '',
        role: 'student',
        department_id: '',
        roll_number: '',
        employee_id: '',
        phone: '',
        year: '',
        section: ''
      });
      
      setOpen(false);
      onUserCreated();

    } catch (error) {
      console.error('Error creating user:', error);
      toast({
        title: "Error",
        description: "Failed to create user invitation. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      role: 'student',
      department_id: '',
      roll_number: '',
      employee_id: '',
      phone: '',
      year: '',
      section: ''
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button onClick={resetForm} className="w-full justify-start">
          <UserPlus className="w-4 h-4 mr-2" />
          Create New User
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New User Invitation</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter full name"
              />
            </div>

            <div>
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="user@rgce.edu.in"
                required
              />
            </div>

            <div>
              <Label htmlFor="role">Role *</Label>
              <Select value={formData.role} onValueChange={(value: any) => setFormData({ ...formData, role: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map(role => (
                    <SelectItem key={role.value} value={role.value}>
                      {role.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="department_id">Department *</Label>
              <Select value={formData.department_id} onValueChange={(value) => setFormData({ ...formData, department_id: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map(dept => (
                    <SelectItem key={dept.id} value={dept.id}>
                      {dept.name} ({dept.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {formData.role === 'student' ? (
              <>
                <div>
                  <Label htmlFor="roll_number">Roll Number</Label>
                  <Input
                    id="roll_number"
                    value={formData.roll_number}
                    onChange={(e) => setFormData({ ...formData, roll_number: e.target.value })}
                    placeholder="e.g., 21CSE001"
                  />
                </div>
                <div>
                  <Label htmlFor="year">Year</Label>
                  <Select value={formData.year} onValueChange={(value) => setFormData({ ...formData, year: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select year" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1st Year</SelectItem>
                      <SelectItem value="2">2nd Year</SelectItem>
                      <SelectItem value="3">3rd Year</SelectItem>
                      <SelectItem value="4">4th Year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            ) : (
              <div>
                <Label htmlFor="employee_id">Employee ID</Label>
                <Input
                  id="employee_id"
                  value={formData.employee_id}
                  onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}
                  placeholder="e.g., FAC001"
                />
              </div>
            )}

            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="e.g., +91 9876543210"
              />
            </div>

            {formData.role === 'student' && (
              <div>
                <Label htmlFor="section">Section</Label>
                <Input
                  id="section"
                  value={formData.section}
                  onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                  placeholder="e.g., A, B, C"
                />
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !formData.email || !formData.department_id}>
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Creating...</span>
                </div>
              ) : (
                'Create Invitation'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default UserCreationModal;
