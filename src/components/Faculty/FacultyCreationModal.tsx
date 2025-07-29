
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useToast } from '../../hooks/use-toast';
import { supabase } from '../../integrations/supabase/client';
import { useAuth } from '../../contexts/SupabaseAuthContext';

interface FacultyCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const FacultyCreationModal: React.FC<FacultyCreationModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      // First create the profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .insert([{
          name: formData.name,
          email: formData.email,
          role: 'faculty',
          department_id: formData.department_id,
          phone: formData.phone,
          employee_id: formData.employee_code,
          is_active: true
        }])
        .select()
        .single();

      if (profileError) throw profileError;

      // Then create the faculty profile
      const { error: facultyError } = await supabase
        .from('faculty_profiles')
        .insert([{
          user_id: profileData.id,
          employee_code: formData.employee_code,
          designation: formData.designation,
          joining_date: new Date().toISOString().split('T')[0],
          is_active: true
        }]);

      if (facultyError) throw facultyError;

      toast({
        title: "Success",
        description: "Faculty member created successfully"
      });

      onSuccess();
      onClose();
      setFormData({
        name: '',
        email: '',
        employee_code: '',
        designation: '',
        department_id: '',
        phone: '',
        gender: ''
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create faculty member",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Faculty Member</DialogTitle>
          <DialogDescription>
            Enter the faculty member's information below.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="employee_code">Employee Code</Label>
              <Input
                id="employee_code"
                value={formData.employee_code}
                onChange={(e) => setFormData({ ...formData, employee_code: e.target.value })}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="designation">Designation</Label>
              <Select value={formData.designation} onValueChange={(value) => setFormData({ ...formData, designation: value })}>
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
              <Label htmlFor="department">Department</Label>
              <Select value={formData.department_id} onValueChange={(value) => setFormData({ ...formData, department_id: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
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
              />
            </div>
            <div>
              <Label htmlFor="gender">Gender</Label>
              <Select value={formData.gender} onValueChange={(value) => setFormData({ ...formData, gender: value })}>
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
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Faculty'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default FacultyCreationModal;
