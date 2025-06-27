
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/SupabaseAuthContext';
import { SupabaseFeeService } from '../services/supabaseFeeService';
import { FeeRecord } from '../types';
import { PaymentTransaction } from '../types';
import { useToast } from '../components/ui/use-toast';
import { useUserConversion } from './useUserConversion';

export const useFeeManagement = () => {
  const { user } = useAuth();
  const { convertUserProfileToUser } = useUserConversion();
  const { toast } = useToast();
  const [feeRecords, setFeeRecords] = useState<FeeRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadFeeRecords = async (filters?: any) => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const convertedUser = convertUserProfileToUser(user);
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
    if (!user) return false;

    setLoading(true);
    try {
      const convertedUser = convertUserProfileToUser(user);
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
          description: result.failure_reason || "Payment processing failed",
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
    if (!user) return null;

    setLoading(true);
    try {
      const convertedUser = convertUserProfileToUser(user);
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
    if (!user) return null;
    const convertedUser = convertUserProfileToUser(user);
    return SupabaseFeeService.getFeePermissions(convertedUser);
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
