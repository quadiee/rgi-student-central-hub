
export interface FeeStructure {
  id: string;
  academicYear: string;
  semester: number;
  department: string;
  feeCategories: FeeCategory[];
  totalAmount: number;
  dueDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface FeeCategory {
  id: string;
  name: string;
  amount: number;
  mandatory: boolean;
  description?: string;
}

export interface PaymentTransaction {
  id: string;
  studentId: string;
  feeRecordId: string;
  amount: number;
  paymentMethod: 'Online' | 'Cash' | 'Cheque' | 'DD' | 'UPI';
  transactionId?: string;
  status: 'Pending' | 'Success' | 'Failed' | 'Cancelled';
  processedAt: string;
  processedBy: string;
  receiptNumber: string;
  gateway?: string;
  failureReason?: string;
}

export interface FeeInstallment {
  id: string;
  feeRecordId: string;
  installmentNumber: number;
  amount: number;
  dueDate: string;
  paidDate?: string;
  status: 'Pending' | 'Paid' | 'Overdue';
}

export interface FeeReport {
  id: string;
  title: string;
  type: 'Revenue' | 'Collection' | 'Outstanding' | 'Department' | 'Student';
  generatedBy: string;
  generatedAt: string;
  dateRange: {
    from: string;
    to: string;
  };
  filters: {
    department?: string;
    semester?: number;
    paymentStatus?: string;
  };
  data: any;
  totalRevenue: number;
  totalOutstanding: number;
}

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
