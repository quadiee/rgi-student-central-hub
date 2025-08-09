
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/SupabaseAuthContext';
import { supabase } from '../integrations/supabase/client';
import { useToast } from '../components/ui/use-toast';

interface FeeAnalytics {
  totalRevenue: number;
  totalPending: number;
  totalRecords: number;
  collectionRate: number;
  departmentBreakdown: any[];
  monthlyTrend: any[];
  paymentMethods: any[];
}

export const useRealFeeData = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [analytics, setAnalytics] = useState<FeeAnalytics>({
    totalRevenue: 0,
    totalPending: 0,
    totalRecords: 0,
    collectionRate: 0,
    departmentBreakdown: [],
    monthlyTrend: [],
    paymentMethods: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRealData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      // Fetch department analytics
      const { data: departmentData, error: deptError } = await supabase
        .rpc('get_department_analytics_filtered', {
          p_from_date: null,
          p_to_date: null,
          p_date_filter_type: 'created_at',
          p_department_ids: null,
          p_status_filter: null,
          p_min_amount: null,
          p_max_amount: null
        });

      if (deptError) throw deptError;

      // Fetch fee type analytics
      const { data: feeTypeData, error: feeError } = await supabase
        .rpc('get_fee_type_analytics_filtered', {
          p_from_date: null,
          p_to_date: null,
          p_date_filter_type: 'created_at',
          p_department_ids: null,
          p_status_filter: null,
          p_min_amount: null,
          p_max_amount: null
        });

      if (feeError) throw feeError;

      // Fetch payment transactions for monthly trend and payment methods
      const { data: paymentData, error: payError } = await supabase
        .from('payment_transactions')
        .select('amount, payment_method, processed_at, status')
        .eq('status', 'Success')
        .order('processed_at', { ascending: false })
        .limit(1000);

      if (payError) throw payError;

      // Calculate totals
      const totalRevenue = (departmentData || []).reduce((sum: number, dept: any) => sum + (dept.total_collected || 0), 0);
      const totalPending = (departmentData || []).reduce((sum: number, dept: any) => sum + (dept.total_pending || 0), 0);
      const totalFees = totalRevenue + totalPending;
      const totalRecords = (departmentData || []).reduce((sum: number, dept: any) => sum + (dept.total_fee_records || 0), 0);

      // Process monthly trend from payment data
      const monthlyTrend = processMonthlyTrend(paymentData || []);
      
      // Process payment methods breakdown
      const paymentMethods = processPaymentMethods(paymentData || []);

      setAnalytics({
        totalRevenue,
        totalPending,
        totalRecords,
        collectionRate: totalFees > 0 ? (totalRevenue / totalFees) * 100 : 0,
        departmentBreakdown: departmentData || [],
        monthlyTrend,
        paymentMethods
      });

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch real fee data';
      setError(errorMessage);
      console.error('Error fetching real fee data:', err);
    } finally {
      setLoading(false);
    }
  };

  const processMonthlyTrend = (payments: any[]) => {
    const monthlyData: { [key: string]: number } = {};
    
    payments.forEach(payment => {
      if (payment.processed_at) {
        const month = new Date(payment.processed_at).toISOString().substring(0, 7); // YYYY-MM
        monthlyData[month] = (monthlyData[month] || 0) + Number(payment.amount);
      }
    });

    return Object.entries(monthlyData)
      .map(([month, amount]) => ({ month, amount }))
      .sort((a, b) => a.month.localeCompare(b.month))
      .slice(-12); // Last 12 months
  };

  const processPaymentMethods = (payments: any[]) => {
    const methodData: { [key: string]: { count: number; amount: number } } = {};
    
    payments.forEach(payment => {
      const method = payment.payment_method || 'Unknown';
      if (!methodData[method]) {
        methodData[method] = { count: 0, amount: 0 };
      }
      methodData[method].count += 1;
      methodData[method].amount += Number(payment.amount);
    });

    return Object.entries(methodData)
      .map(([method, data]) => ({
        method,
        count: data.count,
        amount: data.amount,
        percentage: payments.length > 0 ? (data.count / payments.length) * 100 : 0
      }))
      .sort((a, b) => b.amount - a.amount);
  };

  useEffect(() => {
    if (user) {
      fetchRealData();
    }
  }, [user]);

  const refresh = () => fetchRealData();

  return {
    analytics,
    loading,
    error,
    refresh
  };
};
