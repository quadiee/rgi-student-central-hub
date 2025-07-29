
import React, { useState, useEffect } from 'react';
import { UserPlus } from 'lucide-react';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { useToast } from '../ui/use-toast';
import { supabase } from '../../integrations/supabase/client';

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
    email: '',
    role: '',
    department_id: '',
    name: '',
    roll_number: '',
    employee_id: '',
    phone: '',
    address: '',
    guardian_name: '',
    guardian_phone: ''
  });

  useEffect(() => {
    if (open) {
      fetchDepartments();
    }
  }, [open]);

  const fetchDepartments = async () => {
    try {
      const { data, error } = await supabase
        .from('departments')
        .select('id, name, code')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setDepartments(data || []);
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Create user invitation
      const invitationData = {
        email: formData.email,
        role: formData.role as any,
        department_id: formData.department_id,
        roll_number: formData.role === 'student' ? formData.roll_number : null,
        employee_id: formData.role !== 'student' ? formData.employee_id : null,
        is_active: true,
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
      };

      const { error: invitationError } = await supabase
        .from('user_invitations')
        .insert(invitationData);

      if (invitationError) throw invitationError;

      toast({
        title: "Success",
        description: "User invitation created successfully. The user can now sign up using this email.",
      });

      setOpen(false);
      setFormData({
        email: '',
        role: '',
        department_id: '',
        name: '',
        roll_number: '',
        employee_id: '',
        phone: '',
        address: '',
        guardian_name: '',
        guardian_phone: ''
      });
      onUserCreated();
    } catch (error: any) {
      console.error('Error creating user:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create user invitation",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="w-full justify-start">
          <UserPlus className="w-4 h-4 mr-2" />
          Create User
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New User</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="role">Role *</Label>
              <Select value={formData.role} onValueChange={(value) => handleInputChange('role', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="student">Student</SelectItem>
                  <SelectItem value="faculty">Faculty</SelectItem>
                  <SelectItem value="hod">HOD</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="principal">Principal</SelectItem>
                  <SelectItem value="chairman">Chairman</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="department_id">Department *</Label>
              <Select value={formData.department_id} onValueChange={(value) => handleInputChange('department_id', value)}>
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

            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Will be set during registration if empty"
              />
            </div>

            {formData.role === 'student' && (
              <div>
                <Label htmlFor="roll_number">Roll Number</Label>
                <Input
                  id="roll_number"
                  value={formData.roll_number}
                  onChange={(e) => handleInputChange('roll_number', e.target.value)}
                  placeholder="e.g., 21CSE001"
                />
              </div>
            )}

            {formData.role !== 'student' && (
              <div>
                <Label htmlFor="employee_id">Employee ID</Label>
                <Input
                  id="employee_id"
                  value={formData.employee_id}
                  onChange={(e) => handleInputChange('employee_id', e.target.value)}
                  placeholder="e.g., EMP001"
                />
              </div>
            )}

            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="+91-9876543210"
              />
            </div>

            {formData.role === 'student' && (
              <>
                <div>
                  <Label htmlFor="guardian_name">Guardian Name</Label>
                  <Input
                    id="guardian_name"
                    value={formData.guardian_name}
                    onChange={(e) => handleInputChange('guardian_name', e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="guardian_phone">Guardian Phone</Label>
                  <Input
                    id="guardian_phone"
                    value={formData.guardian_phone}
                    onChange={(e) => handleInputChange('guardian_phone', e.target.value)}
                    placeholder="+91-9876543210"
                  />
                </div>
              </>
            )}
          </div>

          <div>
            <Label htmlFor="address">Address</Label>
            <Textarea
              id="address"
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !formData.email || !formData.role || !formData.department_id}>
              {loading ? 'Creating...' : 'Create User Invitation'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default UserCreationModal;
