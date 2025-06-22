
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
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  subject: string;
  date: string;
  status: 'Present' | 'Absent' | 'Late';
  faculty: string;
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
}

export interface ExamRecord {
  id: string;
  studentId: string;
  subject: string;
  examType: 'Mid-term' | 'Final' | 'Assignment' | 'Quiz';
  marksObtained: number;
  totalMarks: number;
  examDate: string;
  grade: string;
}

export type UserRole = 'student' | 'faculty' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  studentId?: string;
}
