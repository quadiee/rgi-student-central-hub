
import { supabase } from '../integrations/supabase/client';
import { User, FeeRecord } from '../types';
import { FeeStructure, PaymentTransaction, FeeReport, FeePermissions, FeeCategory } from '../types/feeTypes';
import { Database } from '../integrations/supabase/types';

type DbFeeRecord = Database['public']['Tables']['fee_records']['Row'];
type DbFeeStructure = Database['public']['Tables']['fee_structures']['Row'];
type DbPaymentTransaction = Database['public']['Tables']['payment_transactions']['Row'];
type Department = Database['public']['Enums']['department'];
type PaymentMethod = Database['public']['Enums']['payment_method'];
type PaymentStatus = Database['public']['Enums']['payment_status'];

export class SupabaseFeeService {
  static getFeePermissions(user: User): FeePermissions {
    const permissions = {
      student: {
        canViewAllStudents: false,
        canViewDepartmentStudents: false,
        canViewOwnFees: true,
        canProcessPayments: true,
        canModifyFeeStructure: false,
        canGenerateReports: false,
        canApproveWaivers: false,
        allowedDepartments: []
      },
      hod: {
        canViewAllStudents: false,
        canViewDepartmentStudents: true,
        canViewOwnFees: false,
        canProcessPayments: true,
        canModifyFeeStructure: false,
        canGenerateReports: true,
        canApproveWaivers: true,
        allowedDepartments: [user.department]
      },
      principal: {
        canViewAllStudents: true,
        canViewDepartmentStudents: true,
        canViewOwnFees: false,
        canProcessPayments: true,
        canModifyFeeStructure: true,
        canGenerateReports: true,
        canApproveWaivers: true,
        allowedDepartments: ['CSE', 'ECE', 'MECH', 'CIVIL', 'EEE', 'IT']
      },
      admin: {
        canViewAllStudents: true,
        canViewDepartmentStudents: true,
        canViewOwnFees: false,
        canProcessPayments: true,
        canModifyFeeStructure: true,
        canGenerateReports: true,
        canApproveWaivers: true,
        allowedDepartments: ['CSE', 'ECE', 'MECH', 'CIVIL', 'EEE', 'IT', 'ADMIN']
      }
    };

    return permissions[user.role] || permissions.student;
  }

  static async getFeeRecords(user: User, filters?: any): Promise<FeeRecord[]> {
    console.log('Fetching fee records for user:', user.id, 'filters:', filters);
    
    try {
      let query = supabase
        .from('fee_records')
        .select(`
          *,
          profiles!student_id (
            name,
            email,
            roll_number,
            department
          ),
          fee_structures (
            academic_year,
            semester,
            fee_categories
          )
        `)
        .limit(100); // Add limit for performance

      const permissions = this.getFeePermissions(user);
      
      if (permissions.canViewOwnFees && user.role === 'student') {
        query = query.eq('student_id', user.id);
      } else if (permissions.canViewDepartmentStudents && !permissions.canViewAllStudents) {
        // More efficient query - get students from department first
        const { data: departmentStudents } = await supabase
          .from('profiles')
          .select('id')
          .eq('department', user.department as any) // Cast to avoid strict type checking
          .eq('role', 'student')
          .limit(50);
        
        if (departmentStudents && departmentStudents.length > 0) {
          const studentIds = departmentStudents.map(s => s.id);
          query = query.in('student_id', studentIds);
        } else {
          return [];
        }
      }

      // Apply filters
      if (filters?.semester) query = query.eq('semester', filters.semester);
      if (filters?.status) query = query.eq('status', filters.status);
      if (filters?.academicYear) query = query.eq('academic_year', filters.academicYear);

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching fee records:', error);
        throw error;
      }

      return (data || []).map(this.transformDbFeeRecord);
    } catch (error) {
      console.error('Error in getFeeRecords:', error);
      return [];
    }
  }

  static async processPayment(user: User, payment: Partial<PaymentTransaction>): Promise<PaymentTransaction> {
    console.log('Processing payment:', payment);
    
    const permissions = this.getFeePermissions(user);
    
    if (!permissions.canProcessPayments && user.role !== 'student') {
      throw new Error('Insufficient permissions to process payments');
    }

    try {
      // Generate receipt number
      const receiptNumber = `RCP-${Date.now()}${Math.floor(Math.random() * 1000)}`;

      const transactionData = {
        fee_record_id: payment.feeRecordId!,
        student_id: payment.studentId!,
        amount: payment.amount!,
        payment_method: payment.paymentMethod! as PaymentMethod,
        transaction_id: `TXN${Date.now()}${Math.floor(Math.random() * 1000)}`,
        status: (Math.random() > 0.05 ? 'Success' : 'Failed') as PaymentStatus,
        receipt_number: receiptNumber,
        processed_by: user.id,
        gateway: payment.paymentMethod === 'Online' ? 'RGCE_Gateway' : undefined,
        processed_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('payment_transactions')
        .insert(transactionData)
        .select()
        .single();

      if (error) throw error;

      // Update fee record if payment successful
      if (data.status === 'Success') {
        const { data: feeRecord } = await supabase
          .from('fee_records')
          .select('paid_amount, final_amount')
          .eq('id', payment.feeRecordId!)
          .single();

        if (feeRecord) {
          const newPaidAmount = Number(feeRecord.paid_amount || 0) + Number(payment.amount!);
          const finalAmount = Number(feeRecord.final_amount);
          
          let newStatus: Database['public']['Enums']['fee_status'] = 'Pending';
          if (newPaidAmount >= finalAmount) {
            newStatus = 'Paid';
          } else if (newPaidAmount > 0) {
            newStatus = 'Partial';
          }

          await supabase
            .from('fee_records')
            .update({
              paid_amount: newPaidAmount,
              last_payment_date: new Date().toISOString(),
              status: newStatus
            })
            .eq('id', payment.feeRecordId!);
        }
      }

      return this.transformDbPaymentTransaction(data);
    } catch (error) {
      console.error('Error in processPayment:', error);
      throw error;
    }
  }

  static async generateReport(user: User, reportConfig: Partial<FeeReport>): Promise<FeeReport> {
    console.log('Generating report:', reportConfig);
    
    const permissions = this.getFeePermissions(user);
    
    if (!permissions.canGenerateReports) {
      throw new Error('Insufficient permissions to generate reports');
    }

    try {
      const feeRecords = await this.getFeeRecords(user, reportConfig.filters);
      
      // Optimized revenue calculation
      const { data: revenueData, error: revenueError } = await supabase
        .from('payment_transactions')
        .select('amount')
        .eq('status', 'Success')
        .limit(1000);

      if (revenueError) throw revenueError;

      // Optimized outstanding calculation
      const { data: outstandingData, error: outstandingError } = await supabase
        .from('fee_records')
        .select('final_amount, paid_amount')
        .in('status', ['Pending', 'Overdue', 'Partial'])
        .limit(1000);

      if (outstandingError) throw outstandingError;

      const totalRevenue = revenueData?.reduce((sum, tx) => sum + Number(tx.amount), 0) || 0;
      const totalOutstanding = outstandingData?.reduce((sum, record) => 
        sum + (Number(record.final_amount) - Number(record.paid_amount || 0)), 0) || 0;

      return {
        id: Date.now().toString(),
        title: reportConfig.title || 'Fee Report',
        type: reportConfig.type || 'Revenue',
        generatedBy: user.id,
        generatedAt: new Date().toISOString(),
        dateRange: reportConfig.dateRange || {
          from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          to: new Date().toISOString().split('T')[0]
        },
        filters: reportConfig.filters || {},
        data: { revenue: revenueData, outstanding: outstandingData, feeRecords },
        totalRevenue,
        totalOutstanding
      };
    } catch (error) {
      console.error('Error generating report:', error);
      throw error;
    }
  }

  // Helper methods
  private static transformDbFeeRecord(dbRecord: any): FeeRecord {
    return {
      id: dbRecord.id,
      studentId: dbRecord.student_id,
      feeType: 'Semester Fee',
      amount: Number(dbRecord.final_amount),
      dueDate: dbRecord.due_date,
      paidDate: dbRecord.last_payment_date,
      status: dbRecord.status === 'Paid' ? 'Paid' : dbRecord.status === 'Overdue' ? 'Overdue' : 'Pending',
      semester: dbRecord.semester,
      academicYear: dbRecord.academic_year,
      paymentMethod: undefined,
      receiptNumber: undefined
    };
  }

  private static transformDbFeeStructure(dbRecord: DbFeeStructure): FeeStructure {
    return {
      id: dbRecord.id,
      academicYear: dbRecord.academic_year,
      semester: dbRecord.semester,
      department: 'CSE',
      feeCategories: (dbRecord.fee_categories as unknown) as FeeCategory[],
      totalAmount: Number(dbRecord.total_amount),
      dueDate: dbRecord.due_date,
      createdAt: dbRecord.created_at || '',
      updatedAt: dbRecord.updated_at || ''
    };
  }

  private static transformDbPaymentTransaction(dbRecord: DbPaymentTransaction): PaymentTransaction {
    return {
      id: dbRecord.id,
      studentId: dbRecord.student_id!,
      feeRecordId: dbRecord.fee_record_id!,
      amount: Number(dbRecord.amount),
      paymentMethod: dbRecord.payment_method,
      transactionId: dbRecord.transaction_id,
      status: dbRecord.status!,
      processedAt: dbRecord.processed_at!,
      processedBy: dbRecord.processed_by!,
      receiptNumber: dbRecord.receipt_number,
      gateway: dbRecord.gateway,
      failureReason: dbRecord.failure_reason
    };
  }

  static async getFeeStructures(department?: string): Promise<FeeStructure[]> {
    console.log('Fetching fee structures for department:', department);
    
    try {
      let query = supabase
        .from('fee_structures')
        .select('*')
        .eq('is_active', true)
        .limit(50);

      const { data, error } = await query;

      if (error) throw error;

      return (data || []).map(this.transformDbFeeStructure);
    } catch (error) {
      console.error('Error in getFeeStructures:', error);
      return [];
    }
  }

  static async createFeeStructure(user: User, feeStructure: Partial<FeeStructure>): Promise<FeeStructure> {
    console.log('Creating fee structure:', feeStructure);
    
    const permissions = this.getFeePermissions(user);
    
    if (!permissions.canModifyFeeStructure) {
      throw new Error('Insufficient permissions to create fee structures');
    }

    try {
      const structureData = {
        academic_year: feeStructure.academicYear!,
        semester: feeStructure.semester!,
        fee_categories: feeStructure.feeCategories! as any,
        total_amount: feeStructure.totalAmount!,
        due_date: feeStructure.dueDate!,
        late_fee_percentage: 5.0,
        installment_allowed: false,
        max_installments: 1,
        is_active: true
      };

      const { data, error } = await supabase
        .from('fee_structures')
        .insert(structureData)
        .select()
        .single();

      if (error) throw error;

      return this.transformDbFeeStructure(data);
    } catch (error) {
      console.error('Error in createFeeStructure:', error);
      throw error;
    }
  }
}
