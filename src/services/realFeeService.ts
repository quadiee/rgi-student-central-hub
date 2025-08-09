
import { supabase } from '../integrations/supabase/client';

export interface DepartmentAnalytics {
  department_id: string;
  department_name: string;
  department_code: string;
  total_students: number;
  total_fee_records: number;
  total_fees: number;
  total_collected: number;
  total_pending: number;
  collection_percentage: number;
  overdue_records: number;
  avg_fee_per_student: number;
  last_updated: string;
}

export interface FeeTypeAnalytics {
  fee_type_id: string;
  fee_type_name: string;
  fee_type_description: string;
  is_mandatory: boolean;
  total_students: number;
  total_fee_records: number;
  total_fees: number;
  total_collected: number;
  total_pending: number;
  collection_percentage: number;
  overdue_records: number;
  avg_fee_per_student: number;
  last_updated: string;
}

export interface PaymentTrend {
  date: string;
  amount: number;
  count: number;
}

export class RealFeeService {
  static async getDepartmentAnalytics(filters?: any): Promise<DepartmentAnalytics[]> {
    try {
      const { data, error } = await supabase
        .rpc('get_department_analytics_filtered', {
          p_from_date: filters?.fromDate || null,
          p_to_date: filters?.toDate || null,
          p_date_filter_type: filters?.dateFilterType || 'created_at',
          p_department_ids: filters?.departmentIds || null,
          p_status_filter: filters?.statusFilter || null,
          p_min_amount: filters?.minAmount || null,
          p_max_amount: filters?.maxAmount || null
        });

      if (error) {
        console.error('Error fetching department analytics:', error);
        throw new Error(error.message);
      }

      return data || [];
    } catch (error) {
      console.error('Failed to fetch department analytics:', error);
      throw error;
    }
  }

  static async getFeeTypeAnalytics(filters?: any): Promise<FeeTypeAnalytics[]> {
    try {
      const { data, error } = await supabase
        .rpc('get_fee_type_analytics_filtered', {
          p_from_date: filters?.fromDate || null,
          p_to_date: filters?.toDate || null,
          p_date_filter_type: filters?.dateFilterType || 'created_at',
          p_department_ids: filters?.departmentIds || null,
          p_status_filter: filters?.statusFilter || null,
          p_min_amount: filters?.minAmount || null,
          p_max_amount: filters?.maxAmount || null
        });

      if (error) {
        console.error('Error fetching fee type analytics:', error);
        throw new Error(error.message);
      }

      return data || [];
    } catch (error) {
      console.error('Failed to fetch fee type analytics:', error);
      throw error;
    }
  }

  static async getPaymentTrends(days: number = 30): Promise<PaymentTrend[]> {
    try {
      const fromDate = new Date();
      fromDate.setDate(fromDate.getDate() - days);

      const { data, error } = await supabase
        .from('payment_transactions')
        .select('processed_at, amount')
        .eq('status', 'Success')
        .gte('processed_at', fromDate.toISOString())
        .order('processed_at', { ascending: true });

      if (error) {
        console.error('Error fetching payment trends:', error);
        throw new Error(error.message);
      }

      // Group by date and aggregate
      const dailyTrends = new Map<string, { amount: number; count: number }>();
      
      (data || []).forEach(payment => {
        const date = new Date(payment.processed_at).toISOString().split('T')[0];
        const existing = dailyTrends.get(date) || { amount: 0, count: 0 };
        existing.amount += Number(payment.amount);
        existing.count += 1;
        dailyTrends.set(date, existing);
      });

      return Array.from(dailyTrends.entries()).map(([date, { amount, count }]) => ({
        date,
        amount,
        count
      }));
    } catch (error) {
      console.error('Failed to fetch payment trends:', error);
      throw error;
    }
  }

  static async getOverallStats() {
    try {
      // Use maybeSingle() instead of single() for safety
      const { data: feeStats, error: feeError } = await supabase
        .from('fee_records')
        .select('final_amount, paid_amount, status')
        .maybeSingle();

      const { data: paymentStats, error: paymentError } = await supabase
        .from('payment_transactions')
        .select('amount, status')
        .eq('status', 'Success')
        .maybeSingle();

      if (feeError && feeError.code !== 'PGRST116') {
        console.error('Error fetching fee stats:', feeError);
        throw new Error(feeError.message);
      }

      if (paymentError && paymentError.code !== 'PGRST116') {
        console.error('Error fetching payment stats:', paymentError);
        throw new Error(paymentError.message);
      }

      // Provide safe fallbacks
      return {
        totalRevenue: paymentStats?.amount || 0,
        pendingAmount: (feeStats?.final_amount || 0) - (feeStats?.paid_amount || 0),
        collectionRate: feeStats?.final_amount > 0 
          ? ((feeStats.paid_amount || 0) / feeStats.final_amount) * 100 
          : 0
      };
    } catch (error) {
      console.error('Failed to fetch overall stats:', error);
      return {
        totalRevenue: 0,
        pendingAmount: 0,
        collectionRate: 0
      };
    }
  }

  static async getRecentTransactions(limit: number = 10) {
    try {
      const { data, error } = await supabase
        .from('payment_transactions')
        .select(`
          id,
          amount,
          payment_method,
          status,
          processed_at,
          receipt_number,
          fee_records!inner(
            student_id,
            profiles!inner(name, roll_number)
          )
        `)
        .order('processed_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching recent transactions:', error);
        throw new Error(error.message);
      }

      return data || [];
    } catch (error) {
      console.error('Failed to fetch recent transactions:', error);
      return [];
    }
  }
}

export default RealFeeService;
