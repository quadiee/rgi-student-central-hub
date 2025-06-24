import { User, FeeRecord, Department } from '../types';
import { FeeStructure, PaymentTransaction, FeeReport, FeePermissions } from '../types/feeTypes';
import { databaseService } from './database';

export class FeeService {
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
    const permissions = this.getFeePermissions(user);
    
    if (permissions.canViewOwnFees && user.studentId) {
      return await databaseService.getFeeRecords({ studentId: user.studentId, ...filters });
    }
    
    if (permissions.canViewDepartmentStudents) {
      return await databaseService.getFeeRecords({ 
        department: user.department, 
        ...filters 
      });
    }
    
    if (permissions.canViewAllStudents) {
      return await databaseService.getFeeRecords(filters);
    }
    
    throw new Error('Insufficient permissions to view fee records');
  }

  static async processPayment(user: User, payment: Partial<PaymentTransaction>): Promise<PaymentTransaction> {
    const permissions = this.getFeePermissions(user);
    
    if (!permissions.canProcessPayments) {
      throw new Error('Insufficient permissions to process payments');
    }
    
    // Simulate payment processing
    const transaction: PaymentTransaction = {
      id: Date.now().toString(),
      studentId: payment.studentId!,
      feeRecordId: payment.feeRecordId!,
      amount: payment.amount!,
      paymentMethod: payment.paymentMethod!,
      transactionId: `TXN${Date.now()}`,
      status: Math.random() > 0.1 ? 'Success' : 'Failed',
      processedAt: new Date().toISOString(),
      processedBy: user.id,
      receiptNumber: `RCP${Date.now()}`,
      gateway: payment.paymentMethod === 'Online' ? 'RGCE_Gateway' : undefined
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
