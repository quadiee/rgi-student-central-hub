
import { supabase } from '../integrations/supabase/client';
import { User } from '../types';

export interface StudentFeeRecord {
  id: string;
  academic_year: string;
  semester: number;
  original_amount: number;
  discount_amount: number;
  penalty_amount: number;
  final_amount: number;
  paid_amount: number;
  status: 'Pending' | 'Paid' | 'Partial' | 'Overdue';
  due_date: string;
  last_payment_date?: string;
  created_at: string;
}

export interface StudentFeeWithPayments extends StudentFeeRecord {
  payment_transactions: {
    id: string;
    amount: number;
    payment_method: string;
    status: string;
    processed_at: string;
    receipt_number: string;
  }[];
}

export class RealStudentFeeService {
  static async getStudentFeeRecords(studentId: string): Promise<StudentFeeWithPayments[]> {
    try {
      const { data, error } = await supabase
        .from('fee_records')
        .select(`
          *,
          payment_transactions (
            id,
            amount,
            payment_method,
            status,
            processed_at,
            receipt_number
          )
        `)
        .eq('student_id', studentId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching student fee records:', error);
        return [];
      }

      return (data || []).map(record => ({
        id: record.id,
        academic_year: record.academic_year,
        semester: record.semester,
        original_amount: Number(record.original_amount),
        discount_amount: Number(record.discount_amount || 0),
        penalty_amount: Number(record.penalty_amount || 0),
        final_amount: Number(record.final_amount),
        paid_amount: Number(record.paid_amount || 0),
        status: record.status as any,
        due_date: record.due_date,
        last_payment_date: record.last_payment_date,
        created_at: record.created_at,
        payment_transactions: record.payment_transactions || []
      }));
    } catch (error) {
      console.error('Error in getStudentFeeRecords:', error);
      return [];
    }
  }

  static async getStudentFeeSummary(studentId: string) {
    try {
      const feeRecords = await this.getStudentFeeRecords(studentId);
      
      const totalFees = feeRecords.reduce((sum, record) => sum + record.final_amount, 0);
      const totalPaid = feeRecords.reduce((sum, record) => sum + record.paid_amount, 0);
      const totalDue = totalFees - totalPaid;
      
      const overdueFees = feeRecords.filter(record => 
        record.status === 'Overdue' || 
        (record.status === 'Pending' && new Date(record.due_date) < new Date())
      ).reduce((sum, record) => sum + (record.final_amount - record.paid_amount), 0);

      return {
        totalFees,
        totalPaid,
        totalDue,
        overdueFees,
        feeRecords
      };
    } catch (error) {
      console.error('Error in getStudentFeeSummary:', error);
      return {
        totalFees: 0,
        totalPaid: 0,
        totalDue: 0,
        overdueFees: 0,
        feeRecords: []
      };
    }
  }

  static async getAllStudentsWithFees(user: User) {
    try {
      // Check if user has permission to view all students
      if (!['admin', 'principal', 'chairman'].includes(user.role || '')) {
        throw new Error('Insufficient permissions');
      }

      const { data, error } = await supabase
        .from('student_fee_summary')
        .select('*')
        .order('pending_amount', { ascending: false });

      if (error) {
        console.error('Error fetching students with fees:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getAllStudentsWithFees:', error);
      return [];
    }
  }

  static formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }

  static getPaymentStatusColor(status: string): string {
    switch (status) {
      case 'Paid':
        return 'text-green-600';
      case 'Partial':
        return 'text-yellow-600';
      case 'Overdue':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  }

  static getPaymentStatusBadge(status: string): string {
    switch (status) {
      case 'Paid':
        return 'bg-green-100 text-green-800';
      case 'Partial':
        return 'bg-yellow-100 text-yellow-800';
      case 'Overdue':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }
}
