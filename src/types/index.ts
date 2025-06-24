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
  attendancePercentage?: number; // Calculated field
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

// New Course module for RGCE system
export interface Course {
  id: string;
  courseCode: string;
  courseName: string;
  department: string;
  facultyEmail: string;
  hoursPerWeek: number;
  semester: number;
  year: number;
  yearSection: string; // e.g., "3-A"
  avgAttendance?: number; // Calculated field
}

export interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
  period: number;
}

export interface TimetableEntry {
  id: string;
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  timeSlot: TimeSlot;
  subjectId: string;
  facultyId: string;
  classroomId: string;
  course: string;
  semester: number;
  year: number;
}

export interface Classroom {
  id: string;
  name: string;
  capacity: number;
  type: 'Lecture Hall' | 'Lab' | 'Tutorial Room';
  building: string;
  floor: number;
  facilities: string[];
}

// Enhanced Attendance Record for hourly tracking
export interface AttendanceRecord {
  id: string;
  studentId: string;
  courseCode: string;
  date: string;
  hourNumber: number; // 1-8 based on hoursPerWeek
  status: 'Present' | 'Absent' | 'Leave';
  facultyId: string;
  markedAt: string;
  markedBy: string;
  academicYear: string;
}

export interface AttendanceSession {
  id: string;
  subjectId: string;
  facultyId: string;
  date: string;
  timeSlot: string;
  period: number;
  className: string;
  totalStudents: number;
  presentCount: number;
  absentCount: number;
  lateCount: number;
  isActive: boolean;
  createdAt: string;
}

// New Leave Management System
export interface LeaveRequest {
  id: string;
  studentId: string;
  fromDate: string;
  toDate: string;
  reason: string;
  facultyApproval: 'Pending' | 'Approved' | 'Denied';
  hodApproval: 'Pending' | 'Approved' | 'Denied';
  finalStatus: 'Pending' | 'Approved' | 'Denied'; // Calculated field
  approvedBy?: string;
  requestedOn: string;
  courseCode?: string; // Optional: specific course leave
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

export interface ExamRecord {
  id: string;
  studentId: string;
  subject: string;
  subjectId: string;
  examType: 'Mid-term' | 'Final' | 'Assignment' | 'Quiz' | 'Internal';
  marksObtained: number;
  totalMarks: number;
  examDate: string;
  grade: string;
  percentage: number;
  remarks?: string;
}

// Enhanced User with department and RGCE-specific fields
export type UserRole = 'student' | 'faculty' | 'hod' | 'principal' | 'admin';

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
  attendancePercentage?: number; // For students
  studentId?: string;
  facultyId?: string;
  profileImage?: string;
  permissions?: string[];
  isActive?: boolean;
  lastLogin?: string;
  createdAt?: string;
  avatar?: string;
}

// Enhanced Attendance Statistics
export interface AttendanceStats {
  totalClasses: number;
  presentClasses: number;
  absentClasses: number;
  leaveClasses: number;
  attendancePercentage: number;
  courseWiseAttendance: {
    courseCode: string;
    courseName: string;
    totalHours: number;
    presentHours: number;
    percentage: number;
  }[];
  subjectWiseAttendance: {
    subject: string;
    percentage: number;
  }[];
  isAtRisk: boolean; // < 75% attendance
}

// Department Statistics for HOD/Principal dashboards
export interface DepartmentStats {
  department: Department;
  totalStudents: number;
  avgAttendance: number;
  atRiskStudents: number;
  totalCourses: number;
  activeFaculty: number;
}

export interface AcademicCalendar {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  type: 'Exam' | 'Holiday' | 'Event' | 'Academic';
  isPublic: boolean;
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
