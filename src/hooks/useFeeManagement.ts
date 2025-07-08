
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/SupabaseAuthContext';
import { SupabaseFeeService } from '../services/supabaseFeeService';
import { FeeRecord, PaymentTransaction } from '../types';
import { useToast } from '../components/ui/use-toast';

export const useFeeManagement = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [feeRecords, setFeeRecords] = useState<FeeRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const convertProfileToUser = (profile: any) => {
    return {
      id: profile.id,
      name: profile.name,
      email: profile.email,
      role: profile.role as 'student' | 'hod' | 'principal' | 'admin',
      department_id: profile.department_id || '',
      department_name: profile.department_name,
      avatar: profile.profile_photo_url || '',
      rollNumber: profile.roll_number,
      employeeId: profile.employee_id,
      isActive: profile.is_active
    };
  };

  const loadFeeRecords = async (filters?: any) => {
    if (!profile) return;

    setLoading(true);
    setError(null);

    try {
      const convertedUser = convertProfileToUser(profile);
      const records = await SupabaseFeeService.getFeeRecords(convertedUser, filters);
      setFeeRecords(records);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load fee records';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const processPayment = async (payment: Partial<PaymentTransaction>): Promise<boolean> => {
    if (!profile) return false;

    setLoading(true);
    try {
      const convertedUser = convertProfileToUser(profile);
      const result = await SupabaseFeeService.processPayment(convertedUser, payment);
      
      if (result.status === 'Success') {
        toast({
          title: "Payment Processed",
          description: `Payment of ₹${payment.amount} processed successfully`,
        });

        // Reload fee records to reflect the payment
        await loadFeeRecords();
        return true;
      } else {
        toast({
          title: "Payment Failed",
          description: result.failureReason || "Payment processing failed",
          variant: "destructive"
        });
        return false;
      }
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
    if (!profile) return null;

    setLoading(true);
    try {
      const convertedUser = convertProfileToUser(profile);
      const report = await SupabaseFeeService.generateReport(convertedUser, reportConfig);
      
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
    if (!profile) return null;
    const convertedUser = convertProfileToUser(profile);
    return SupabaseFeeService.getFeePermissions(convertedUser);
  };

  // Load initial data when profile changes
  useEffect(() => {
    if (profile) {
      loadFeeRecords();
    }
  }, [profile?.id]);

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
