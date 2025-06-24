
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
    switch (user.role) {
      case 'student':
        return {
          canViewAllStudents: false,
          canViewDepartmentStudents: false,
          canViewOwnFees: true,
          canProcessPayments: true,
          canModifyFeeStructure: false,
          canGenerateReports: false,
          canApproveWaivers: false,
          allowedDepartments: []
        };
      
      case 'faculty':
        return {
          canViewAllStudents: false,
          canViewDepartmentStudents: true,
          canViewOwnFees: false,
          canProcessPayments: false,
          canModifyFeeStructure: false,
          canGenerateReports: true,
          canApproveWaivers: false,
          allowedDepartments: [user.department]
        };
      
      case 'hod':
        return {
          canViewAllStudents: false,
          canViewDepartmentStudents: true,
          canViewOwnFees: false,
          canProcessPayments: true,
          canModifyFeeStructure: false,
          canGenerateReports: true,
          canApproveWaivers: true,
          allowedDepartments: [user.department]
        };
      
      case 'principal':
        return {
          canViewAllStudents: true,
          canViewDepartmentStudents: true,
          canViewOwnFees: false,
          canProcessPayments: true,
          canModifyFeeStructure: true,
          canGenerateReports: true,
          canApproveWaivers: true,
          allowedDepartments: ['CSE', 'ECE', 'MECH', 'CIVIL', 'EEE', 'IT']
        };
      
      case 'admin':
        return {
          canViewAllStudents: true,
          canViewDepartmentStudents: true,
          canViewOwnFees: false,
          canProcessPayments: true,
          canModifyFeeStructure: true,
          canGenerateReports: true,
          canApproveWaivers: true,
          allowedDepartments: ['CSE', 'ECE', 'MECH', 'CIVIL', 'EEE', 'IT', 'ADMIN']
        };
      
      default:
        return {
          canViewAllStudents: false,
          canViewDepartmentStudents: false,
          canViewOwnFees: false,
          canProcessPayments: false,
          canModifyFeeStructure: false,
          canGenerateReports: false,
          canApproveWaivers: false,
          allowedDepartments: []
        };
    }
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
        `);

      // Apply filters based on user permissions
      const permissions = this.getFeePermissions(user);
      
      if (permissions.canViewOwnFees && user.role === 'student') {
        query = query.eq('student_id', user.id);
      } else if (permissions.canViewDepartmentStudents && !permissions.canViewAllStudents) {
        // Get students from user's department
        const { data: departmentStudents } = await supabase
          .from('profiles')
          .select('id')
          .eq('department', user.department)
          .eq('role', 'student');
        
        if (departmentStudents && departmentStudents.length > 0) {
          const studentIds = departmentStudents.map(s => s.id);
          query = query.in('student_id', studentIds);
        } else {
          // No students in department, return empty
          return [];
        }
      }

      // Apply additional filters
      if (filters?.semester) {
        query = query.eq('semester', filters.semester);
      }
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.academicYear) {
        query = query.eq('academic_year', filters.academicYear);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching fee records:', error);
        throw error;
      }

      // Transform database records to FeeRecord format
      const records: any[] = data || [];
      return records.map(this.transformDbFeeRecord);
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
      // Generate receipt number using database function
      const { data: receiptData, error: receiptError } = await supabase.rpc('generate_receipt_number');
      if (receiptError) throw receiptError;
      
      const receiptNumber = receiptData || `RCP-${Date.now()}`;

      const transactionData = {
        fee_record_id: payment.feeRecordId!,
        student_id: payment.studentId!,
        amount: payment.amount!,
        payment_method: payment.paymentMethod! as PaymentMethod,
        transaction_id: `TXN${Date.now()}${Math.floor(Math.random() * 1000)}`,
        status: (Math.random() > 0.05 ? 'Success' : 'Failed') as PaymentStatus, // 95% success rate
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

      if (error) {
        console.error('Error processing payment:', error);
        throw error;
      }

      // Update fee record with new payment amount manually
      if (data.status === 'Success') {
        // Get current fee record
        const { data: feeRecord } = await supabase
          .from('fee_records')
          .select('paid_amount, final_amount')
          .eq('id', payment.feeRecordId!)
          .single();

        if (feeRecord) {
          const newPaidAmount = Number(feeRecord.paid_amount || 0) + Number(payment.amount!);
          const finalAmount = Number(feeRecord.final_amount);
          
          // Determine new status
          let newStatus: Database['public']['Enums']['fee_status'] = 'Pending';
          if (newPaidAmount >= finalAmount) {
            newStatus = 'Paid';
          } else if (newPaidAmount > 0) {
            newStatus = 'Partial';
          }

          // Update fee record
          const { error: updateError } = await supabase
            .from('fee_records')
            .update({
              paid_amount: newPaidAmount,
              last_payment_date: new Date().toISOString(),
              status: newStatus
            })
            .eq('id', payment.feeRecordId!);
          
          if (updateError) {
            console.error('Error updating fee record:', updateError);
            // Don't throw here as payment was successful
          }
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
      // Get fee records based on user permissions
      const feeRecords = await this.getFeeRecords(user, reportConfig.filters);
      
      // Calculate total revenue from successful payments
      const { data: revenueData, error: revenueError } = await supabase
        .from('payment_transactions')
        .select('amount')
        .eq('status', 'Success');

      if (revenueError) throw revenueError;

      // Calculate outstanding amounts
      const { data: outstandingData, error: outstandingError } = await supabase
        .from('fee_records')
        .select('final_amount, paid_amount')
        .in('status', ['Pending', 'Overdue', 'Partial']);

      if (outstandingError) throw outstandingError;

      const totalRevenue = revenueData?.reduce((sum, tx) => sum + Number(tx.amount), 0) || 0;
      const totalOutstanding = outstandingData?.reduce((sum, record) => 
        sum + (Number(record.final_amount) - Number(record.paid_amount || 0)), 0) || 0;

      const report: FeeReport = {
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
        data: {
          revenue: revenueData,
          outstanding: outstandingData,
          feeRecords
        },
        totalRevenue,
        totalOutstanding
      };

      return report;
    } catch (error) {
      console.error('Error generating report:', error);
      throw error;
    }
  }

  // Helper methods to transform database records
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
      department: 'CSE', // Default value since fee_structures table doesn't have department column yet
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
        .eq('is_active', true);

      if (department) {
        // Note: fee_structures table doesn't have department column yet
        // This filter will be ignored for now
        console.log('Department filter not yet supported in fee_structures');
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching fee structures:', error);
        throw error;
      }

      const structures: DbFeeStructure[] = data || [];
      return structures.map(this.transformDbFeeStructure);
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

      if (error) {
        console.error('Error creating fee structure:', error);
        throw error;
      }

      return this.transformDbFeeStructure(data);
    } catch (error) {
      console.error('Error in createFeeStructure:', error);
      throw error;
    }
  }
}
