
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'hod' | 'principal' | 'admin';
  department: string;
  avatar: string;
  rollNumber?: string;
  employeeId?: string;
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
}

export type UserRole = 'student' | 'hod' | 'principal' | 'admin';

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}
