
import { Database } from '../integrations/supabase/types';

// Enhanced types for the new database structure
export interface Department {
  id: string;
  name: string;
  code: string;
  description?: string;
  hod_id?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Role {
  id: string;
  name: string;
  description?: string;
  is_active: boolean;
  created_at: string;
}

export interface Permission {
  id: string;
  name: string;
  description?: string;
  resource_type: string;
  action_type: string;
  created_at: string;
}

export interface UserRole {
  id: string;
  user_id: string;
  role_id: string;
  department_id?: string;
  assigned_at: string;
  assigned_by?: string;
  is_active: boolean;
}

export interface FeeType {
  id: string;
  name: string;
  description?: string;
  is_mandatory: boolean;
  is_active: boolean;
  created_at: string;
}

// Enhanced fee structure with department linking
export interface EnhancedFeeStructure {
  id: string;
  academicYear: string;
  semester: number;
  department_id: string;
  feeCategories: any[];
  totalAmount: number;
  dueDate: string;
  late_fee_percentage?: number;
  installment_allowed: boolean;
  max_installments: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Dashboard summary interfaces matching the database views
export interface StudentFeeSummary {
  student_id: string;
  name: string;
  roll_number?: string;
  department_id?: string;
  department_name?: string;
  total_fee_records: number;
  total_fees: number;
  total_paid: number;
  pending_amount: number;
  payment_status: 'No Fees' | 'Fully Paid' | 'Partially Paid' | 'Unpaid';
}

export interface HODDepartmentSummary {
  department_id: string;
  department_name: string;
  department_code: string;
  total_students: number;
  total_fee_records: number;
  total_department_fees: number;
  total_collected: number;
  total_pending: number;
  collection_percentage: number;
}

export interface PrincipalInstitutionSummary {
  total_departments: number;
  total_students: number;
  total_fee_records: number;
  total_institution_fees: number;
  total_collected: number;
  total_pending: number;
  overall_collection_percentage: number;
  overdue_records: number;
}

export interface EnhancedUser {
  id: string;
  name: string;
  email: string;
  role: Database['public']['Enums']['user_role'];
  department: Database['public']['Enums']['department'];
  department_id?: string;
  rollNumber?: string;
  employeeId?: string;
  profileImage?: string;
  permissions?: string[];
  userRoles?: UserRole[];
  departmentDetails?: Department;
}
