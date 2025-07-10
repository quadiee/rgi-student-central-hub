
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { useToast } from '../ui/use-toast';
import { supabase } from '../../integrations/supabase/client';
import { useAuth } from '../../contexts/SupabaseAuthContext';
import { Edit, Save, X } from 'lucide-react';

interface AdminDataEditorProps {
  type: 'fee_record' | 'scholarship' | 'student';
  data: any;
  onSave: () => void;
  onCancel: () => void;
}

const AdminDataEditor: React.FC<AdminDataEditorProps> = ({
  type,
  data,
  onSave,
  onCancel
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState(data);

  const handleSave = async () => {
    if (!user || !['admin', 'principal', 'chairman'].includes(user.role)) {
      toast({
        title: "Access Denied",
        description: "Only admins can edit this data",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      let table, updateData;

      switch (type) {
        case 'fee_record':
          table = 'fee_records';
          updateData = {
            original_amount: parseFloat(formData.original_amount) || 0,
            final_amount: parseFloat(formData.final_amount) || 0,
            paid_amount: parseFloat(formData.paid_amount) || 0,
            status: formData.status,
            due_date: formData.due_date,
            academic_year: formData.academic_year,
            semester: parseInt(formData.semester) || 1,
            updated_at: new Date().toISOString()
          };
          break;

        case 'scholarship':
          table = 'scholarships';
          updateData = {
            scholarship_type: formData.scholarship_type,
            eligible_amount: parseFloat(formData.eligible_amount) || 0,
            academic_year: formData.academic_year,
            semester: parseInt(formData.semester) || 1,
            applied_status: formData.applied_status,
            application_date: formData.application_date || null,
            received_by_institution: formData.received_by_institution,
            receipt_date: formData.receipt_date || null,
            remarks: formData.remarks || null,
            updated_at: new Date().toISOString()
          };
          break;

        case 'student':
          table = 'profiles';
          updateData = {
            name: formData.name,
            roll_number: formData.roll_number,
            email: formData.email,
            year: parseInt(formData.year) || 1,
            semester: parseInt(formData.semester) || 1,
            phone: formData.phone,
            address: formData.address,
            community: formData.community,
            first_generation: formData.first_generation,
            updated_at: new Date().toISOString()
          };
          break;
      }

      const { error } = await supabase
        .from(table)
        .update(updateData)
        .eq('id', data.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Data updated successfully"
      });

      onSave();
    } catch (error) {
      console.error('Error updating data:', error);
      toast({
        title: "Error",
        description: "Failed to update data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const renderFeeRecordFields = () => (
    <>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="original_amount">Original Amount</Label>
          <Input
            id="original_amount"
            type="number"
            value={formData.original_amount}
            onChange={(e) => setFormData({...formData, original_amount: e.target.value})}
          />
        </div>
        <div>
          <Label htmlFor="final_amount">Final Amount</Label>
          <Input
            id="final_amount"
            type="number"
            value={formData.final_amount}
            onChange={(e) => setFormData({...formData, final_amount: e.target.value})}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="paid_amount">Paid Amount</Label>
          <Input
            id="paid_amount"
            type="number"
            value={formData.paid_amount}
            onChange={(e) => setFormData({...formData, paid_amount: e.target.value})}
          />
        </div>
        <div>
          <Label htmlFor="status">Status</Label>
          <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value})}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Paid">Paid</SelectItem>
              <SelectItem value="Partial">Partial</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Overdue">Overdue</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="due_date">Due Date</Label>
          <Input
            id="due_date"
            type="date"
            value={formData.due_date}
            onChange={(e) => setFormData({...formData, due_date: e.target.value})}
          />
        </div>
        <div>
          <Label htmlFor="academic_year">Academic Year</Label>
          <Input
            id="academic_year"
            value={formData.academic_year}
            onChange={(e) => setFormData({...formData, academic_year: e.target.value})}
          />
        </div>
      </div>
    </>
  );

  const renderScholarshipFields = () => (
    <>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="scholarship_type">Scholarship Type</Label>
          <Select 
            value={formData.scholarship_type} 
            onValueChange={(value) => setFormData({...formData, scholarship_type: value})}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PMSS">PMSS (SC/ST)</SelectItem>
              <SelectItem value="FG">First Generation</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="eligible_amount">Eligible Amount</Label>
          <Input
            id="eligible_amount"
            type="number"
            value={formData.eligible_amount}
            onChange={(e) => setFormData({...formData, eligible_amount: e.target.value})}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Applied Status</Label>
          <Select 
            value={formData.applied_status?.toString()} 
            onValueChange={(value) => setFormData({...formData, applied_status: value === 'true'})}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="false">Not Applied</SelectItem>
              <SelectItem value="true">Applied</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="application_date">Application Date</Label>
          <Input
            id="application_date"
            type="date"
            value={formData.application_date || ''}
            onChange={(e) => setFormData({...formData, application_date: e.target.value})}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Received by Institution</Label>
          <Select 
            value={formData.received_by_institution?.toString()} 
            onValueChange={(value) => setFormData({...formData, received_by_institution: value === 'true'})}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="false">Not Received</SelectItem>
              <SelectItem value="true">Received</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="receipt_date">Receipt Date</Label>
          <Input
            id="receipt_date"
            type="date"
            value={formData.receipt_date || ''}
            onChange={(e) => setFormData({...formData, receipt_date: e.target.value})}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="remarks">Remarks</Label>
        <Textarea
          id="remarks"
          value={formData.remarks || ''}
          onChange={(e) => setFormData({...formData, remarks: e.target.value})}
          placeholder="Additional notes..."
        />
      </div>
    </>
  );

  const renderStudentFields = () => (
    <>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
          />
        </div>
        <div>
          <Label htmlFor="roll_number">Roll Number</Label>
          <Input
            id="roll_number"
            value={formData.roll_number}
            onChange={(e) => setFormData({...formData, roll_number: e.target.value})}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
          />
        </div>
        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            value={formData.phone || ''}
            onChange={(e) => setFormData({...formData, phone: e.target.value})}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="year">Year</Label>
          <Input
            id="year"
            type="number"
            value={formData.year}
            onChange={(e) => setFormData({...formData, year: e.target.value})}
          />
        </div>
        <div>
          <Label htmlFor="semester">Semester</Label>
          <Input
            id="semester"
            type="number"
            value={formData.semester}
            onChange={(e) => setFormData({...formData, semester: e.target.value})}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="community">Community</Label>
          <Select 
            value={formData.community || ''} 
            onValueChange={(value) => setFormData({...formData, community: value})}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select community" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="General">General</SelectItem>
              <SelectItem value="OBC">OBC</SelectItem>
              <SelectItem value="SC">SC</SelectItem>
              <SelectItem value="ST">ST</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>First Generation</Label>
          <Select 
            value={formData.first_generation?.toString()} 
            onValueChange={(value) => setFormData({...formData, first_generation: value === 'true'})}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="false">No</SelectItem>
              <SelectItem value="true">Yes</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="address">Address</Label>
        <Textarea
          id="address"
          value={formData.address || ''}
          onChange={(e) => setFormData({...formData, address: e.target.value})}
          placeholder="Student address..."
        />
      </div>
    </>
  );

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Edit className="w-5 h-5" />
          Edit {type.replace('_', ' ').toUpperCase()}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {type === 'fee_record' && renderFeeRecordFields()}
        {type === 'scholarship' && renderScholarshipFields()}
        {type === 'student' && renderStudentFields()}

        <div className="flex gap-2 pt-4">
          <Button onClick={handleSave} disabled={loading}>
            <Save className="w-4 h-4 mr-2" />
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
          <Button variant="outline" onClick={onCancel}>
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminDataEditor;
