
import React, { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';
import { useToast } from '../ui/use-toast';
import { supabase } from '../../integrations/supabase/client';
import { ScholarshipWithProfile } from '../../types/user-student-fees';

interface ScholarshipDeleteDialogProps {
  scholarship: ScholarshipWithProfile | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onScholarshipDeleted: () => void;
}

const ScholarshipDeleteDialog: React.FC<ScholarshipDeleteDialogProps> = ({
  scholarship,
  open,
  onOpenChange,
  onScholarshipDeleted
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!scholarship) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('scholarships')
        .delete()
        .eq('id', scholarship.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Scholarship record deleted successfully"
      });

      onOpenChange(false);
      onScholarshipDeleted();
    } catch (error) {
      console.error('Error deleting scholarship:', error);
      toast({
        title: "Error",
        description: "Failed to delete scholarship record",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (!scholarship) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Scholarship</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this scholarship record?
            <br /><br />
            <strong>Student:</strong> {scholarship.profiles?.name} ({scholarship.profiles?.roll_number})
            <br />
            <strong>Type:</strong> {scholarship.scholarship_type === 'PMSS' ? 'PMSS (SC/ST)' : 'First Generation'}
            <br />
            <strong>Amount:</strong> ₹{scholarship.eligible_amount.toLocaleString()}
            <br /><br />
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={loading}
            className="bg-red-600 hover:bg-red-700"
          >
            {loading ? 'Deleting...' : 'Delete'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ScholarshipDeleteDialog;
