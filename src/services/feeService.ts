
import { User, FeeRecord, PaymentTransaction, FeeReport } from '../types';
import { mockUsers } from '../data/mockData';

export interface FeePermissions {
  canViewAllStudents: boolean;
  canViewDepartmentStudents: boolean;
  canViewOwnFees: boolean;
  canProcessPayments: boolean;
  canModifyFeeStructure: boolean;
  canGenerateReports: boolean;
  canApproveWaivers: boolean;
  allowedDepartments: string[];
}

export class FeeService {
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
        allowedDepartments: [user.department_name || 'Unknown'] // Fixed: use department_name
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
    // Mock implementation - replace with actual API call
    const permissions = this.getFeePermissions(user);
    
    let records: FeeRecord[] = [];
    
    if (permissions.canViewOwnFees) {
      // Student can only see their own records
      records = []; // Would filter by user.id
    } else if (permissions.canViewDepartmentStudents) {
      // HOD can see department records
      const departmentUsers = mockUsers.filter(u => u.department_name === user.department_name); // Fixed: use department_name
      records = []; // Would filter by department users
    } else if (permissions.canViewAllStudents) {
      // Admin/Principal can see all records
      records = []; // Would return all records
    }
    
    return records;
  }

  static async processPayment(user: User, payment: Partial<PaymentTransaction>): Promise<PaymentTransaction> {
    const permissions = this.getFeePermissions(user);
    
    if (!permissions.canProcessPayments) {
      throw new Error('Insufficient permissions to process payments');
    }
    
    // Simulate payment processing
    const transaction: PaymentTransaction = {
      id: Date.now().toString(),
      student_id: payment.student_id || payment.studentId!,
      fee_record_id: payment.fee_record_id || payment.feeRecordId!,
      amount: payment.amount!,
      payment_method: payment.payment_method || payment.paymentMethod!,
      transaction_id: `TXN${Date.now()}`,
      status: Math.random() > 0.1 ? 'Success' : 'Failed',
      processed_at: new Date().toISOString(),
      processed_by: user.id,
      receipt_number: `RCP${Date.now()}`,
      created_at: new Date().toISOString(),
      gateway: (payment.payment_method || payment.paymentMethod) === 'Online' ? 'RGCE_Gateway' : undefined,
      failure_reason: Math.random() <= 0.1 ? 'Insufficient funds' : undefined
    };
    
    return transaction;
  }

  static async generateReport(user: User, reportConfig: Partial<FeeReport>): Promise<FeeReport> {
    const permissions = this.getFeePermissions(user);
    
    if (!permissions.canGenerateReports) {
      throw new Error('Insufficient permissions to generate reports');
    }
    
    // Mock report generation
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
      data: {},
      totalRevenue: Math.floor(Math.random() * 10000000) + 5000000,
      totalOutstanding: Math.floor(Math.random() * 2000000) + 500000
    };
    
    return report;
  }
}
