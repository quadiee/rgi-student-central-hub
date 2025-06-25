
import { supabase } from '../integrations/supabase/client';
import { EnhancedUser, StudentFeeSummary, HODDepartmentSummary, PrincipalInstitutionSummary } from '../types/enhancedTypes';
import { FeeRecord, PaymentTransaction } from '../types';

export class EnhancedFeeService {
  // Get student fee summary using the optimized view
  static async getStudentFeeSummary(user: EnhancedUser, studentId?: string): Promise<StudentFeeSummary[]> {
    try {
      let query = supabase.from('student_fee_summary').select('*');
      
      // If specific student requested
      if (studentId) {
        query = query.eq('student_id', studentId);
      }
      // If user is a student, only show their data
      else if (user.role === 'student') {
        query = query.eq('student_id', user.id);
      }
      // If user is HOD, show department students
      else if (user.role === 'hod' && user.department_id) {
        query = query.eq('department_id', user.department_id);
      }
      // Principal and admin see all students

      const { data, error } = await query.order('pending_amount', { ascending: false });
      
      if (error) throw error;
      
      // Cast to proper type with payment_status conversion
      return (data || []).map(record => ({
        ...record,
        payment_status: record.payment_status as 'No Fees' | 'Fully Paid' | 'Partially Paid' | 'Unpaid'
      })) as StudentFeeSummary[];
    } catch (error) {
      console.error('Error fetching student fee summary:', error);
      return [];
    }
  }

  // Get HOD department summary using the optimized view
  static async getHODDepartmentSummary(user: EnhancedUser, departmentId?: string): Promise<HODDepartmentSummary[]> {
    try {
      let query = supabase.from('hod_department_summary').select('*');
      
      // If specific department requested
      if (departmentId) {
        query = query.eq('department_id', departmentId);
      }
      // If user is HOD, only show their department
      else if (user.role === 'hod' && user.department_id) {
        query = query.eq('department_id', user.department_id);
      }
      // Principal and admin see all departments

      const { data, error } = await query.order('collection_percentage', { ascending: true });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching HOD department summary:', error);
      return [];
    }
  }

  // Get principal institution summary using the optimized view
  static async getPrincipalInstitutionSummary(): Promise<PrincipalInstitutionSummary | null> {
    try {
      const { data, error } = await supabase
        .from('principal_institution_summary')
        .select('*')
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching principal institution summary:', error);
      return null;
    }
  }

  // Get top 10 students with pending fees (with photos)
  static async getTop10PendingStudents(user: EnhancedUser): Promise<StudentFeeSummary[]> {
    try {
      let query = supabase
        .from('student_fee_summary')
        .select('*')
        .gt('pending_amount', 0);
      
      // Apply department filter for HODs
      if (user.role === 'hod' && user.department_id) {
        query = query.eq('department_id', user.department_id);
      }

      const { data, error } = await query
        .order('pending_amount', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      
      // Cast to proper type with payment_status conversion
      return (data || []).map(record => ({
        ...record,
        payment_status: record.payment_status as 'No Fees' | 'Fully Paid' | 'Partially Paid' | 'Unpaid'
      })) as StudentFeeSummary[];
    } catch (error) {
      console.error('Error fetching top 10 pending students:', error);
      return [];
    }
  }

  // Enhanced fee records with department context
  static async getFeeRecords(user: EnhancedUser, filters?: any): Promise<FeeRecord[]> {
    try {
      let query = supabase
        .from('fee_records')
        .select(`
          *,
          profiles!student_id (
            id,
            name,
            email,
            roll_number,
            department_id,
            departments!department_id (name, code)
          ),
          fee_structures!fee_structure_id (
            academic_year,
            semester,
            department_id,
            departments!department_id (name, code)
          )
        `);

      // Apply role-based filters
      if (user.role === 'student') {
        query = query.eq('student_id', user.id);
      } else if (user.role === 'hod' && user.department_id) {
        // Get students from user's department
        const { data: deptStudents } = await supabase
          .from('profiles')
          .select('id')
          .eq('department_id', user.department_id)
          .eq('role', 'student');
        
        if (deptStudents) {
          const studentIds = deptStudents.map(s => s.id);
          query = query.in('student_id', studentIds);
        }
      }

      // Apply additional filters
      if (filters?.semester) query = query.eq('semester', filters.semester);
      if (filters?.status) query = query.eq('status', filters.status);
      if (filters?.academic_year) query = query.eq('academic_year', filters.academic_year);

      const { data, error } = await query.order('due_date', { ascending: false });

      if (error) throw error;

      // Transform to match existing FeeRecord interface
      return (data || []).map(record => ({
        id: record.id,
        studentId: record.student_id || '',
        feeType: 'Semester Fee',
        amount: Number(record.final_amount),
        dueDate: record.due_date,
        paidDate: record.last_payment_date || undefined,
        status: record.status === 'Paid' ? 'Paid' as const : 
                record.status === 'Overdue' ? 'Overdue' as const : 'Pending' as const,
        semester: record.semester,
        academicYear: record.academic_year,
        paidAmount: Number(record.paid_amount || 0),
        lastPaymentDate: record.last_payment_date || undefined
      }));
    } catch (error) {
      console.error('Error fetching enhanced fee records:', error);
      return [];
    }
  }

  // Enhanced payment processing with better tracking
  static async processPayment(user: EnhancedUser, payment: Partial<PaymentTransaction>): Promise<PaymentTransaction> {
    try {
      const transactionData = {
        fee_record_id: payment.fee_record_id || payment.feeRecordId!,
        student_id: payment.student_id || payment.studentId!,
        amount: payment.amount!,
        payment_method: (payment.payment_method || payment.paymentMethod!) as any,
        transaction_id: `TXN${Date.now()}${Math.floor(Math.random() * 1000)}`,
        status: (Math.random() > 0.05 ? 'Success' : 'Failed') as any,
        receipt_number: `RCP-${Date.now()}${Math.floor(Math.random() * 1000)}`,
        processed_by: user.id,
        gateway: (payment.payment_method || payment.paymentMethod) === 'Online' ? 'RGCE_Gateway' : undefined,
        processed_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('payment_transactions')
        .insert(transactionData)
        .select()
        .single();

      if (error) throw error;

      // The trigger will automatically update the fee record
      return {
        id: data.id,
        student_id: data.student_id!,
        fee_record_id: data.fee_record_id!,
        amount: Number(data.amount),
        payment_method: data.payment_method as any,
        transaction_id: data.transaction_id!,
        status: data.status! as any,
        processed_at: data.processed_at!,
        processed_by: data.processed_by!,
        receipt_number: data.receipt_number,
        gateway: data.gateway || undefined,
        failure_reason: data.failure_reason || undefined,
        created_at: data.created_at || new Date().toISOString()
      };
    } catch (error) {
      console.error('Error processing payment:', error);
      throw error;
    }
  }

  // Get department performance metrics
  static async getDepartmentMetrics(user: EnhancedUser): Promise<any> {
    try {
      const summary = await this.getHODDepartmentSummary(user);
      const pendingStudents = await this.getTop10PendingStudents(user);
      
      return {
        departmentSummary: summary,
        topPendingStudents: pendingStudents,
        collectionTrend: await this.getCollectionTrend(user)
      };
    } catch (error) {
      console.error('Error fetching department metrics:', error);
      return null;
    }
  }

  // Get collection trend data (placeholder for future implementation)
  private static async getCollectionTrend(user: EnhancedUser): Promise<any[]> {
    // This would implement trend analysis based on payment_transactions
    // For now, return empty array
    return [];
  }
}
