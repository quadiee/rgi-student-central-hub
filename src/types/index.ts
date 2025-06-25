

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'hod' | 'principal' | 'admin';
  department: string;
  avatar: string;
  rollNumber?: string;
  employeeId?: string;
  yearSection?: string;
  studentId?: string;
  isActive?: boolean;
  lastLogin?: string;
  createdAt?: string;
}

export interface Student {
  id: string;
  name: string;
  rollNumber: string;
  course: string;
  year: number;
  semester: number;
  email: string;
  phone: string;
  profileImage?: string;
  admissionDate: string;
  guardianName: string;
  guardianPhone: string;
  address: string;
  bloodGroup?: string;
  emergencyContact: string;
  department: string;
  yearSection: string;
}

export interface FeeRecord {
  id: string;
  studentId: string;
  feeType: string;
  amount: number;
  dueDate: string;
  paidDate?: string;
  status: 'Paid' | 'Pending' | 'Overdue';
  semester: number;
  academicYear: string;
  paymentMethod?: 'Cash' | 'Online' | 'Cheque' | 'DD';
  receiptNumber?: string;
  paidAmount?: number;
  lastPaymentDate?: string;
}

export interface LeaveRequest {
  id: string;
  studentId: string;
  fromDate: string;
  toDate: string;
  reason: string;
  courseCode?: string;
  facultyApproval: 'Pending' | 'Approved' | 'Denied';
  hodApproval: 'Pending' | 'Approved' | 'Denied';
  requestedOn: string;
}

export interface PaymentTransaction {
  id: string;
  fee_record_id: string;
  student_id: string;
  amount: number;
  payment_method: 'Online' | 'Cash' | 'UPI' | 'Cheque';
  transaction_id?: string;
  status: 'Pending' | 'Success' | 'Failed';
  receipt_number: string;
  processed_by?: string;
  processed_at?: string;
  created_at: string;
  gateway?: string;
  failure_reason?: string;
  // Add camelCase aliases for backward compatibility
  feeRecordId?: string;
  studentId?: string;
  paymentMethod?: 'Online' | 'Cash' | 'UPI' | 'Cheque';
}

export type UserRole = 'student' | 'hod' | 'principal' | 'admin';

export type Department = 'CSE' | 'ECE' | 'EEE' | 'MECH' | 'CIVIL' | 'IT' | 'ADMIN';

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

