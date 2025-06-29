export interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'hod' | 'principal' | 'admin';
  department_id: string;
  department_name?: string;
  avatar: string;
  rollNumber?: string;
  employeeId?: string;
  yearSection?: string;
  studentId?: string;
  facultyId?: string;
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
  section?: string;
  totalFees?: number;
  paidAmount?: number;
  dueAmount?: number;
  feeStatus?: string;
}
