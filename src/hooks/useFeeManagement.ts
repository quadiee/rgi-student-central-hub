
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/SupabaseAuthContext';
import { supabase } from '../integrations/supabase/client';
import { useToast } from '../components/ui/use-toast';

export const useFeeManagement = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [feeRecords, setFeeRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadFeeRecords = async (filters?: any) => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      // Direct query to fee_records with proper joins
      const { data, error: queryError } = await supabase
        .from('fee_records')
        .select(`
          id,
          academic_year,
          semester,
          original_amount,
          final_amount,
          paid_amount,
          status,
          due_date,
          created_at,
          profiles!fee_records_student_id_fkey(
            name,
            roll_number,
            departments!profiles_department_id_fkey(name)
          )
        `)
        .order('created_at', { ascending: false });

      if (queryError) throw queryError;

      // Transform the data
      const transformedRecords = data?.map(record => ({
        id: record.id,
        student_name: record.profiles?.name || 'Unknown',
        roll_number: record.profiles?.roll_number || '',
        department_name: record.profiles?.departments?.name || '',
        academic_year: record.academic_year,
        semester: record.semester,
        original_amount: record.original_amount,
        final_amount: record.final_amount,
        paid_amount: record.paid_amount || 0,
        status: record.status || 'Pending',
        due_date: record.due_date,
        created_at: record.created_at
      })) || [];

      setFeeRecords(transformedRecords);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load fee records';
      setError(errorMessage);
      console.error('Error loading fee records:', err);
    } finally {
      setLoading(false);
    }
  };

  const processPayment = async (payment: any): Promise<boolean> => {
    if (!user) return false;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('payment_transactions')
        .insert({
          ...payment,
          student_id: user.id,
          processed_by: user.id,
          status: 'Success'
        });

      if (error) throw error;

      toast({
        title: "Payment Processed",
        description: `Payment of ₹${payment.amount} processed successfully`,
      });

      await loadFeeRecords();
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Payment processing failed';
      setError(errorMessage);
      toast({
        title: "Payment Failed",
        description: errorMessage,
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async (reportConfig: any) => {
    if (!user) return null;

    setLoading(true);
    try {
      // Simple report generation based on current fee records
      const report = {
        totalRecords: feeRecords.length,
        totalAmount: feeRecords.reduce((sum, record) => sum + record.final_amount, 0),
        paidAmount: feeRecords.reduce((sum, record) => sum + (record.paid_amount || 0), 0),
        pendingAmount: feeRecords.reduce((sum, record) => sum + (record.final_amount - (record.paid_amount || 0)), 0)
      };

      toast({
        title: "Report Generated",
        description: "Fee report has been generated successfully",
      });

      return report;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Report generation failed';
      setError(errorMessage);
      toast({
        title: "Report Generation Failed",
        description: errorMessage,
        variant: "destructive"
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getPermissions = () => {
    if (!user) return null;
    
    return {
      canCreate: ['admin', 'principal', 'chairman'].includes(user.role || ''),
      canEdit: ['admin', 'principal', 'chairman'].includes(user.role || ''),
      canDelete: ['admin', 'principal'].includes(user.role || ''),
      canViewAll: ['admin', 'principal', 'chairman'].includes(user.role || ''),
      canViewDepartment: user.role === 'hod'
    };
  };

  // Load initial data when user changes
  useEffect(() => {
    if (user) {
      loadFeeRecords();
    }
  }, [user?.id]);

  return {
    feeRecords,
    loading,
    error,
    loadFeeRecords,
    processPayment,
    generateReport,
    getPermissions: getPermissions()
  };
};
