
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Checkbox } from '../ui/checkbox';
import { Textarea } from '../ui/textarea';
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

interface Scholarship {
  id: string;
  scholarship_type: 'PMSS' | 'FG';
  eligible_amount: number;
  applied_status: boolean;
  application_date: string | null;
  received_by_institution: boolean;
  receipt_date: string | null;
  remarks: string | null;
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
  const [scholarship, setScholarship] = useState<Scholarship | null>(null);
  const [scholarshipLoading, setScholarshipLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    original_amount: record.original_amount,
    final_amount: record.final_amount,
    paid_amount: record.paid_amount,
    status: record.status as FeeStatus,
    due_date: record.due_date.split('T')[0], // Convert to YYYY-MM-DD format
    fee_type_id: 'default', // Will be populated from current fee type
  });

  const [scholarshipData, setScholarshipData] = useState({
    scholarship_type: 'PMSS' as 'PMSS' | 'FG',
    eligible_amount: 0,
    applied_status: false,
    application_date: '',
    received_by_institution: false,
    receipt_date: '',
    remarks: ''
  });

  React.useEffect(() => {
    // Find the fee type ID from the name
    const feeType = feeTypes.find(ft => ft.name === record.fee_type_name);
    if (feeType?.id) {
      setFormData(prev => ({ ...prev, fee_type_id: feeType.id }));
    }

    // Fetch scholarship data for this student
    fetchScholarshipData();
  }, [feeTypes, record.fee_type_name, record.student_id]);

  const fetchScholarshipData = async () => {
    try {
      const { data, error } = await supabase
        .from('scholarships')
        .select('*')
        .eq('student_id', record.student_id)
        .eq('academic_year', record.academic_year)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching scholarship:', error);
        return;
      }

      if (data) {
        // Properly cast the scholarship_type to the expected union type
        const scholarshipWithTypedType: Scholarship = {
          ...data,
          scholarship_type: data.scholarship_type as 'PMSS' | 'FG'
        };
        
        setScholarship(scholarshipWithTypedType);
        setScholarshipData({
          scholarship_type: data.scholarship_type as 'PMSS' | 'FG',
          eligible_amount: data.eligible_amount,
          applied_status: data.applied_status,
          application_date: data.application_date || '',
          received_by_institution: data.received_by_institution,
          receipt_date: data.receipt_date || '',
          remarks: data.remarks || ''
        });
      }
    } catch (error) {
      console.error('Error fetching scholarship data:', error);
    } finally {
      setScholarshipLoading(false);
    }
  };

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
      // Update fee record
      const { error: feeError } = await supabase
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

      if (feeError) throw feeError;

      // Update scholarship if it exists
      if (scholarship) {
        const scholarshipUpdateData: any = {
          scholarship_type: scholarshipData.scholarship_type,
          eligible_amount: scholarshipData.eligible_amount,
          applied_status: scholarshipData.applied_status,
          received_by_institution: scholarshipData.received_by_institution,
          remarks: scholarshipData.remarks,
          updated_at: new Date().toISOString()
        };

        if (scholarshipData.application_date) {
          scholarshipUpdateData.application_date = scholarshipData.application_date;
        }

        if (scholarshipData.receipt_date) {
          scholarshipUpdateData.receipt_date = scholarshipData.receipt_date;
        }

        const { error: scholarshipError } = await supabase
          .from('scholarships')
          .update(scholarshipUpdateData)
          .eq('id', scholarship.id);

        if (scholarshipError) throw scholarshipError;
      }

      toast({
        title: "Success",
        description: "Fee record and scholarship updated successfully",
      });

      onSave();
      onClose();
    } catch (error) {
      console.error('Error updating records:', error);
      toast({
        title: "Error",
        description: "Failed to update records",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const canEdit = user?.role && ['admin', 'principal'].includes(user.role);

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Fee Record & Scholarship</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Student Info */}
          <div className="grid grid-cols-2 gap-4 text-sm bg-gray-50 p-4 rounded-lg">
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

          {/* Fee Details Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Fee Details</h3>
            
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

          {/* Scholarship Details Section */}
          {scholarshipLoading ? (
            <div className="flex items-center justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="ml-2">Loading scholarship data...</span>
            </div>
          ) : scholarship ? (
            <div className="space-y-4 border-t pt-4">
              <h3 className="text-lg font-semibold text-gray-900">Scholarship Details</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="scholarship_type">Scholarship Type</Label>
                  <Select 
                    value={scholarshipData.scholarship_type} 
                    onValueChange={(value: 'PMSS' | 'FG') => setScholarshipData({...scholarshipData, scholarship_type: value})}
                    disabled={!canEdit}
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
                    value={scholarshipData.eligible_amount}
                    onChange={(e) => setScholarshipData({...scholarshipData, eligible_amount: parseFloat(e.target.value) || 0})}
                    disabled={!canEdit}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="applied_status"
                    checked={scholarshipData.applied_status}
                    onCheckedChange={(checked) => setScholarshipData({...scholarshipData, applied_status: checked as boolean})}
                    disabled={!canEdit}
                  />
                  <Label htmlFor="applied_status">Application Submitted</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="received_by_institution"
                    checked={scholarshipData.received_by_institution}
                    onCheckedChange={(checked) => setScholarshipData({...scholarshipData, received_by_institution: checked as boolean})}
                    disabled={!canEdit}
                  />
                  <Label htmlFor="received_by_institution">Received by Institution</Label>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="application_date">Application Date</Label>
                  <Input
                    id="application_date"
                    type="date"
                    value={scholarshipData.application_date}
                    onChange={(e) => setScholarshipData({...scholarshipData, application_date: e.target.value})}
                    disabled={!canEdit}
                  />
                </div>
                <div>
                  <Label htmlFor="receipt_date">Receipt Date</Label>
                  <Input
                    id="receipt_date"
                    type="date"
                    value={scholarshipData.receipt_date}
                    onChange={(e) => setScholarshipData({...scholarshipData, receipt_date: e.target.value})}
                    disabled={!canEdit}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="remarks">Remarks</Label>
                <Textarea
                  id="remarks"
                  value={scholarshipData.remarks}
                  onChange={(e) => setScholarshipData({...scholarshipData, remarks: e.target.value})}
                  disabled={!canEdit}
                  placeholder="Add any additional notes about the scholarship..."
                  rows={3}
                />
              </div>
            </div>
          ) : (
            <div className="border-t pt-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Scholarship Details</h3>
              <p className="text-gray-600">No scholarship found for this student.</p>
            </div>
          )}
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
