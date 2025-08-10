
import { supabase } from '../integrations/supabase/client';
import { FeeRecord } from '../types';

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

  static async getFeeRecords(user: any): Promise<FeeRecord[]> {
    try {
      let query = supabase
        .from('fee_records')
        .select(`
          *,
          fee_types(name),
          profiles!inner(name, roll_number)
        `);

      if (user?.id) {
        query = query.eq('student_id', user.id);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching fee records:', error);
        throw new Error(error.message);
      }

      // Transform to match the expected FeeRecord interface
      return (data || []).map((record: any) => ({
        id: record.id,
        studentId: record.student_id,
        feeType: record.fee_types?.name || 'Semester Fee',
        amount: Number(record.final_amount),
        dueDate: record.due_date,
        paidDate: record.last_payment_date,
        status: record.status === 'Paid' ? 'Paid' : 
                record.status === 'Overdue' ? 'Overdue' : 'Pending',
        semester: record.semester,
        academicYear: record.academic_year,
        paymentMethod: undefined,
        receiptNumber: undefined
      }));
    } catch (error) {
      console.error('Failed to fetch fee records:', error);
      throw error;
    }
  }

  static async processPayment(
    user: any,
    paymentData: {
      feeRecordId: string;
      studentId: string;
      amount: number;
      paymentMethod: string;
    }
  ): Promise<{ success: boolean; transactionId?: string; error?: string }> {
    try {
      // Validate payment method
      const validPaymentMethods = ['Online', 'Cash', 'Cheque', 'DD', 'UPI', 'Scholarship'];
      const paymentMethod = validPaymentMethods.includes(paymentData.paymentMethod) 
        ? paymentData.paymentMethod as 'Online' | 'Cash' | 'Cheque' | 'DD' | 'UPI' | 'Scholarship'
        : 'Online';

      const { data, error } = await supabase
        .from('payment_transactions')
        .insert({
          fee_record_id: paymentData.feeRecordId,
          student_id: paymentData.studentId,
          amount: paymentData.amount,
          payment_method: paymentMethod,
          status: 'Success',
          receipt_number: `RCP-${Date.now()}`,
          processed_at: new Date().toISOString(),
          processed_by: user?.id
        })
        .select()
        .single();

      if (error) {
        console.error('Error processing payment:', error);
        return { success: false, error: error.message };
      }

      // Update fee record paid amount
      await supabase
        .from('fee_records')
        .update({ 
          paid_amount: paymentData.amount,
          status: 'Paid',
          last_payment_date: new Date().toISOString()
        })
        .eq('id', paymentData.feeRecordId);

      return { success: true, transactionId: data.id };
    } catch (error) {
      console.error('Failed to process payment:', error);
      return { success: false, error: 'Payment processing failed' };
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
      // Use aggregate queries for better performance
      const { data: feeStats, error: feeError } = await supabase
        .from('fee_records')
        .select('final_amount, paid_amount, status');

      const { data: paymentStats, error: paymentError } = await supabase
        .from('payment_transactions')
        .select('amount')
        .eq('status', 'Success');

      if (feeError && feeError.code !== 'PGRST116') {
        console.error('Error fetching fee stats:', feeError);
        throw new Error(feeError.message);
      }

      if (paymentError && paymentError.code !== 'PGRST116') {
        console.error('Error fetching payment stats:', paymentError);
        throw new Error(paymentError.message);
      }

      // Calculate totals
      const totalRevenue = (paymentStats || []).reduce((sum, payment) => sum + Number(payment.amount), 0);
      const totalFees = (feeStats || []).reduce((sum, fee) => sum + Number(fee.final_amount), 0);
      const totalPaid = (feeStats || []).reduce((sum, fee) => sum + Number(fee.paid_amount || 0), 0);
      const pendingAmount = totalFees - totalPaid;
      const collectionRate = totalFees > 0 ? (totalPaid / totalFees) * 100 : 0;

      return {
        totalRevenue,
        pendingAmount,
        collectionRate
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
