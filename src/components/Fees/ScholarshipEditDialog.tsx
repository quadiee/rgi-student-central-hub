
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Checkbox } from '../ui/checkbox';
import { useToast } from '../ui/use-toast';
import { supabase } from '../../integrations/supabase/client';
import { ScholarshipWithProfile } from '../../types/user-student-fees';

interface ScholarshipEditDialogProps {
  scholarship: ScholarshipWithProfile | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onScholarshipUpdated: () => void;
}

const ScholarshipEditDialog: React.FC<ScholarshipEditDialogProps> = ({
  scholarship,
  open,
  onOpenChange,
  onScholarshipUpdated
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    scholarship_type: scholarship?.scholarship_type || '',
    eligible_amount: scholarship?.eligible_amount || 0,
    academic_year: scholarship?.academic_year || '',
    semester: scholarship?.semester || 5,
    applied_status: scholarship?.applied_status || false,
    application_date: scholarship?.application_date || '',
    received_by_institution: scholarship?.received_by_institution || false,
    receipt_date: scholarship?.receipt_date || '',
    remarks: scholarship?.remarks || ''
  });

  React.useEffect(() => {
    if (scholarship) {
      setFormData({
        scholarship_type: scholarship.scholarship_type,
        eligible_amount: scholarship.eligible_amount,
        academic_year: scholarship.academic_year,
        semester: scholarship.semester || 5,
        applied_status: scholarship.applied_status || false,
        application_date: scholarship.application_date || '',
        received_by_institution: scholarship.received_by_institution || false,
        receipt_date: scholarship.receipt_date || '',
        remarks: scholarship.remarks || ''
      });
    }
  }, [scholarship]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scholarship) return;

    setLoading(true);
    try {
      const updateData: any = {
        scholarship_type: formData.scholarship_type,
        eligible_amount: formData.eligible_amount,
        academic_year: formData.academic_year,
        semester: formData.semester,
        applied_status: formData.applied_status,
        received_by_institution: formData.received_by_institution,
        remarks: formData.remarks || null,
        updated_at: new Date().toISOString()
      };

      if (formData.applied_status && formData.application_date) {
        updateData.application_date = formData.application_date;
      }

      if (formData.received_by_institution && formData.receipt_date) {
        updateData.receipt_date = formData.receipt_date;
      }

      const { error } = await supabase
        .from('scholarships')
        .update(updateData)
        .eq('id', scholarship.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Scholarship updated successfully"
      });

      onOpenChange(false);
      onScholarshipUpdated();
    } catch (error) {
      console.error('Error updating scholarship:', error);
      toast({
        title: "Error",
        description: "Failed to update scholarship",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (!scholarship) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Scholarship</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Student</Label>
            <Input
              value={`${scholarship.profiles?.name} (${scholarship.profiles?.roll_number})`}
              readOnly
              className="bg-gray-50"
            />
          </div>

          <div>
            <Label htmlFor="scholarship_type">Scholarship Type</Label>
            <Select 
              value={formData.scholarship_type} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, scholarship_type: value }))}
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
              onChange={(e) => setFormData(prev => ({ ...prev, eligible_amount: parseInt(e.target.value) || 0 }))}
            />
          </div>

          <div>
            <Label htmlFor="academic_year">Academic Year</Label>
            <Input
              id="academic_year"
              value={formData.academic_year}
              onChange={(e) => setFormData(prev => ({ ...prev, academic_year: e.target.value }))}
            />
          </div>

          <div>
            <Label htmlFor="semester">Semester</Label>
            <Select 
              value={formData.semester?.toString() || '5'} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, semester: parseInt(value) }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                  <SelectItem key={sem} value={sem.toString()}>Semester {sem}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="applied_status"
              checked={formData.applied_status}
              onCheckedChange={(checked) => setFormData(prev => ({ 
                ...prev, 
                applied_status: !!checked,
                application_date: checked ? (prev.application_date || new Date().toISOString().split('T')[0]) : ''
              }))}
            />
            <Label htmlFor="applied_status">Application Submitted</Label>
          </div>

          {formData.applied_status && (
            <div>
              <Label htmlFor="application_date">Application Date</Label>
              <Input
                id="application_date"
                type="date"
                value={formData.application_date}
                onChange={(e) => setFormData(prev => ({ ...prev, application_date: e.target.value }))}
              />
            </div>
          )}

          <div className="flex items-center space-x-2">
            <Checkbox
              id="received_by_institution"
              checked={formData.received_by_institution}
              onCheckedChange={(checked) => setFormData(prev => ({ 
                ...prev, 
                received_by_institution: !!checked,
                receipt_date: checked ? (prev.receipt_date || new Date().toISOString().split('T')[0]) : ''
              }))}
            />
            <Label htmlFor="received_by_institution">Received by Institution</Label>
          </div>

          {formData.received_by_institution && (
            <div>
              <Label htmlFor="receipt_date">Receipt Date</Label>
              <Input
                id="receipt_date"
                type="date"
                value={formData.receipt_date}
                onChange={(e) => setFormData(prev => ({ ...prev, receipt_date: e.target.value }))}
              />
            </div>
          )}

          <div>
            <Label htmlFor="remarks">Remarks</Label>
            <Textarea
              id="remarks"
              value={formData.remarks}
              onChange={(e) => setFormData(prev => ({ ...prev, remarks: e.target.value }))}
              placeholder="Additional notes or comments"
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Updating...' : 'Update Scholarship'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ScholarshipEditDialog;
