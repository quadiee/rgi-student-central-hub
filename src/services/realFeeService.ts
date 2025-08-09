
import { SupabaseFeeService } from './supabaseFeeService';
import { User, FeeRecord } from '../types';
import { FeeStructure, PaymentTransaction, FeeReport, FeePermissions } from '../types/feeTypes';

// This service now uses the real Supabase backend instead of mock data
export class RealFeeService {
  static getFeePermissions(user: User): FeePermissions {
    return SupabaseFeeService.getFeePermissions(user);
  }

  static async getFeeRecords(user: User, filters?: any): Promise<FeeRecord[]> {
    try {
      return await SupabaseFeeService.getFeeRecords(user, filters);
    } catch (error) {
      console.error('Error fetching fee records:', error);
      return [];
    }
  }

  static async processPayment(user: User, payment: Partial<PaymentTransaction>): Promise<PaymentTransaction> {
    return await SupabaseFeeService.processPayment(user, payment);
  }

  static async generateReport(user: User, reportConfig: Partial<FeeReport>): Promise<FeeReport> {
    return await SupabaseFeeService.generateReport(user, reportConfig);
  }

  static async getFeeStructures(department?: string): Promise<FeeStructure[]> {
    return await SupabaseFeeService.getFeeStructures(department);
  }

  static async createFeeStructure(user: User, feeStructure: Partial<FeeStructure>): Promise<FeeStructure> {
    return await SupabaseFeeService.createFeeStructure(user, feeStructure);
  }

  // Revenue and analytics methods - now using real Supabase data
  static async getTotalRevenue(user: User, dateRange?: { from: string; to: string }): Promise<number> {
    const permissions = this.getFeePermissions(user);
    
    if (!permissions.canGenerateReports) {
      throw new Error('Insufficient permissions to view revenue data');
    }

    const report = await this.generateReport(user, {
      type: 'Revenue',
      dateRange: dateRange || {
        from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        to: new Date().toISOString().split('T')[0]
      }
    });

    return report.totalRevenue;
  }

  static async getOutstandingAmount(user: User): Promise<number> {
    const permissions = this.getFeePermissions(user);
    
    if (!permissions.canGenerateReports) {
      throw new Error('Insufficient permissions to view outstanding data');
    }

    const report = await this.generateReport(user, {
      type: 'Outstanding'
    });

    return report.totalOutstanding;
  }

  static async getDepartmentRevenue(user: User, department: string): Promise<number> {
    const permissions = this.getFeePermissions(user);
    
    if (!permissions.canViewDepartmentStudents && !permissions.canViewAllStudents) {
      throw new Error('Insufficient permissions to view department revenue');
    }

    const report = await this.generateReport(user, {
      type: 'Department',
      filters: { department }
    });

    return report.totalRevenue;
  }

  // Fee calculation utilities - these remain client-side for performance
  static calculateLateFee(originalAmount: number, dueDate: string, penaltyPercentage: number = 5): number {
    const today = new Date();
    const due = new Date(dueDate);
    
    if (today <= due) {
      return 0;
    }

    const daysOverdue = Math.floor((today.getTime() - due.getTime()) / (1000 * 60 * 60 * 24));
    const monthsOverdue = daysOverdue / 30;
    
    return (originalAmount * penaltyPercentage / 100) * monthsOverdue;
  }

  static calculateFinalAmount(originalAmount: number, discountAmount: number = 0, penaltyAmount: number = 0): number {
    return originalAmount - discountAmount + penaltyAmount;
  }

  // Installment utilities - these remain client-side for performance
  static calculateInstallmentAmounts(totalAmount: number, numInstallments: number): number[] {
    const baseAmount = Math.floor(totalAmount / numInstallments * 100) / 100;
    const remainder = totalAmount - (baseAmount * (numInstallments - 1));
    
    const installments = new Array(numInstallments - 1).fill(baseAmount);
    installments.push(remainder);
    
    return installments;
  }

  static generateInstallmentDates(firstDueDate: string, numInstallments: number): string[] {
    const dates = [];
    const startDate = new Date(firstDueDate);
    
    for (let i = 0; i < numInstallments; i++) {
      const dueDate = new Date(startDate);
      dueDate.setMonth(dueDate.getMonth() + i);
      dates.push(dueDate.toISOString().split('T')[0]);
    }
    
    return dates;
  }

  // Real-time analytics methods
  static async getRealTimeAnalytics(user: User) {
    const permissions = this.getFeePermissions(user);
    
    if (!permissions.canGenerateReports) {
      throw new Error('Insufficient permissions to view analytics');
    }

    try {
      // This replaces any mock data with real backend calls
      const [revenueReport, outstandingReport] = await Promise.all([
        this.generateReport(user, { type: 'Revenue' }),
        this.generateReport(user, { type: 'Outstanding' })
      ]);

      return {
        totalRevenue: revenueReport.totalRevenue,
        totalOutstanding: outstandingReport.totalOutstanding,
        collectionRate: revenueReport.totalRevenue > 0 ? 
          (revenueReport.totalRevenue / (revenueReport.totalRevenue + outstandingReport.totalOutstanding)) * 100 : 0,
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error fetching real-time analytics:', error);
      throw error;
    }
  }
}
