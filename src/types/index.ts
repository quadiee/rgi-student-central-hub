
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
  yearSection: string; // e.g., "3-A", "2-B"
}

export interface Faculty {
  id: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  designation: string;
  employeeId: string;
  subjects: string[];
  profileImage?: string;
  assignedCourses: string[]; // Course codes they teach
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  department: string;
  semester: number;
  credits: number;
  type: 'Theory' | 'Practical' | 'Lab';
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
}

// Enhanced User with department and RGCE-specific fields
export type UserRole = 'student' | 'hod' | 'principal' | 'admin';

// Updated Department types to match current Supabase database schema
export type Department = 
  // Current database departments
  | 'CSE' | 'ECE' | 'EEE' | 'MECH' | 'CIVIL' | 'IT' | 'ADMIN';

export interface User {
  id: string;
  name: string;
  email: string; // Must be @rgce.edu.in
  role: UserRole;
  department: Department;
  rollNumber?: string; // For students
  yearSection?: string; // For students
  studentId?: string;
  facultyId?: string;
  profileImage?: string;
  permissions?: string[];
  isActive?: boolean;
  lastLogin?: string;
  createdAt?: string;
  avatar?: string;
}

// System Settings for RGCE
export interface SystemSettings {
  attendanceThreshold: number; // Default 75%
  semesterStartDate: string;
  semesterEndDate: string;
  hoursPerDay: number; // Default 8
  workingDays: string[]; // ['Monday', 'Tuesday', ...]
  emailDomain: string; // '@rgce.edu.in'
}
