
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
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
    scholarship_type: '',
    eligible_amount: 0,
    academic_year: '',
    semester: 1,
    applied_status: false,
    application_date: '',
    received_by_institution: false,
    receipt_date: '',
    remarks: ''
  });

  useEffect(() => {
    if (scholarship && open) {
      setFormData({
        scholarship_type: scholarship.scholarship_type || '',
        eligible_amount: scholarship.eligible_amount || 0,
        academic_year: scholarship.academic_year || '',
        semester: scholarship.semester || 1,
        applied_status: scholarship.applied_status || false,
        application_date: scholarship.application_date || '',
        received_by_institution: scholarship.received_by_institution || false,
        receipt_date: scholarship.receipt_date || '',
        remarks: scholarship.remarks || ''
      });
    }
  }, [scholarship, open]);

  const handleScholarshipTypeChange = (scholarshipType: string) => {
    let eligibleAmount = formData.eligible_amount;
    
    // Set default amounts for scholarship types if amount is 0
    if (formData.eligible_amount === 0) {
      if (scholarshipType === 'PMSS') {
        eligibleAmount = 50000;
      } else if (scholarshipType === 'FG') {
        eligibleAmount = 25000;
      }
    }

    setFormData(prev => ({
      ...prev,
      scholarship_type: scholarshipType,
      eligible_amount: eligibleAmount
    }));
  };

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

      // Only set dates if they have values
      if (formData.application_date) {
        updateData.application_date = formData.application_date;
      }
      if (formData.receipt_date) {
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
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-sm text-gray-600">
              <strong>Student:</strong> {scholarship.profiles?.name} ({scholarship.profiles?.roll_number})
            </p>
          </div>

          <div>
            <Label htmlFor="scholarship_type">Scholarship Type</Label>
            <Select value={formData.scholarship_type} onValueChange={handleScholarshipTypeChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select scholarship type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PMSS">PMSS (SC/ST) - ₹50,000</SelectItem>
                <SelectItem value="FG">First Generation - ₹25,000</SelectItem>
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
            <Select value={formData.semester.toString()} onValueChange={(value) => setFormData(prev => ({ ...prev, semester: parseInt(value) }))}>
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Applied Status</Label>
              <Select 
                value={formData.applied_status.toString()} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, applied_status: value === 'true' }))}
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
                value={formData.application_date}
                onChange={(e) => setFormData(prev => ({ ...prev, application_date: e.target.value }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Received by Institution</Label>
              <Select 
                value={formData.received_by_institution.toString()} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, received_by_institution: value === 'true' }))}
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
                value={formData.receipt_date}
                onChange={(e) => setFormData(prev => ({ ...prev, receipt_date: e.target.value }))}
              />
            </div>
          </div>

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
