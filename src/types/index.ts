
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

export interface AttendanceRecord {
  id: string;
  studentId: string;
  subject: string;
  subjectId: string;
  date: string;
  timeSlot: string;
  period: number;
  status: 'Present' | 'Absent' | 'Late';
  faculty: string;
  facultyId: string;
  markedAt: string;
  markedBy: string;
  className: string;
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

export type UserRole = 'student' | 'faculty' | 'admin' | 'parent';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  studentId?: string;
  facultyId?: string;
  profileImage?: string;
  permissions?: string[];
  isActive?: boolean;
  lastLogin?: string;
}

export interface AttendanceStats {
  totalClasses: number;
  presentClasses: number;
  absentClasses: number;
  lateClasses: number;
  attendancePercentage: number;
  subjectWiseAttendance: {
    subjectId: string;
    subjectName: string;
    totalClasses: number;
    presentClasses: number;
    percentage: number;
  }[];
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
