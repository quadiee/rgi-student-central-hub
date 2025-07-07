
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useAuth } from '../../contexts/SupabaseAuthContext';
import { useToast } from '../ui/use-toast';
import { supabase } from '../../integrations/supabase/client';
import { Database } from '../../integrations/supabase/types';

type FeeStatus = Database['public']['Enums']['fee_status'];

interface FeeRecord {
  id: string;
  student_id: string;
  student_name: string;
  roll_number: string;
  department_name: string;
  year: number;
  semester: number;
  fee_type_name: string;
  academic_year: string;
  original_amount: number;
  final_amount: number;
  paid_amount: number;
  status: string;
  due_date: string;
  created_at: string;
}

interface FeeType {
  id: string;
  name: string;
}

interface FeeRecordEditDialogProps {
  record: FeeRecord;
  feeTypes: FeeType[];
  onClose: () => void;
  onSave: () => void;
}

const FeeRecordEditDialog: React.FC<FeeRecordEditDialogProps> = ({
  record,
  feeTypes,
  onClose,
  onSave
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    original_amount: record.original_amount,
    final_amount: record.final_amount,
    paid_amount: record.paid_amount,
    status: record.status as FeeStatus,
    due_date: record.due_date.split('T')[0], // Convert to YYYY-MM-DD format
    fee_type_id: 'default', // Will be populated from current fee type
  });

  React.useEffect(() => {
    // Find the fee type ID from the name
    const feeType = feeTypes.find(ft => ft.name === record.fee_type_name);
    if (feeType?.id) {
      setFormData(prev => ({ ...prev, fee_type_id: feeType.id }));
    }
  }, [feeTypes, record.fee_type_name]);

  const handleSave = async () => {
    if (!user || !['admin', 'principal'].includes(user.role)) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to edit fee records",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('fee_records')
        .update({
          original_amount: formData.original_amount,
          final_amount: formData.final_amount,
          paid_amount: formData.paid_amount,
          status: formData.status,
          due_date: formData.due_date,
          fee_type_id: formData.fee_type_id === 'default' ? null : formData.fee_type_id,
          updated_at: new Date().toISOString()
        })
        .eq('id', record.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Fee record updated successfully",
      });

      onSave();
      onClose();
    } catch (error) {
      console.error('Error updating fee record:', error);
      toast({
        title: "Error",
        description: "Failed to update fee record",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const canEdit = user?.role && ['admin', 'principal'].includes(user.role);

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Fee Record</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <strong>Student:</strong> {record.student_name}
            </div>
            <div>
              <strong>Roll Number:</strong> {record.roll_number}
            </div>
            <div>
              <strong>Department:</strong> {record.department_name}
            </div>
            <div>
              <strong>Year:</strong> {record.year}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="fee_type">Fee Type</Label>
              <Select 
                value={formData.fee_type_id} 
                onValueChange={(value) => setFormData({...formData, fee_type_id: value})}
                disabled={!canEdit}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select fee type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Select fee type</SelectItem>
                  {feeTypes.map(type => (
                    <SelectItem key={type.id} value={type.id}>{type.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="original_amount">Original Amount</Label>
                <Input
                  id="original_amount"
                  type="number"
                  value={formData.original_amount}
                  onChange={(e) => setFormData({...formData, original_amount: parseFloat(e.target.value) || 0})}
                  disabled={!canEdit}
                />
              </div>
              <div>
                <Label htmlFor="final_amount">Final Amount</Label>
                <Input
                  id="final_amount"
                  type="number"
                  value={formData.final_amount}
                  onChange={(e) => setFormData({...formData, final_amount: parseFloat(e.target.value) || 0})}
                  disabled={!canEdit}
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
                  onChange={(e) => setFormData({...formData, paid_amount: parseFloat(e.target.value) || 0})}
                  disabled={!canEdit}
                />
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <Select 
                  value={formData.status} 
                  onValueChange={(value: FeeStatus) => setFormData({...formData, status: value})}
                  disabled={!canEdit}
                >
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

            <div>
              <Label htmlFor="due_date">Due Date</Label>
              <Input
                id="due_date"
                type="date"
                value={formData.due_date}
                onChange={(e) => setFormData({...formData, due_date: e.target.value})}
                disabled={!canEdit}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          {canEdit && (
            <Button onClick={handleSave} disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FeeRecordEditDialog;
