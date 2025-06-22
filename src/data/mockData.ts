
import { Student, AttendanceRecord, FeeRecord, ExamRecord, User } from '../types';

export const mockUsers: User[] = [
  { id: '1', name: 'Admin User', email: 'admin@rgi.edu', role: 'admin' },
  { id: '2', name: 'Dr. Sharma', email: 'sharma@rgi.edu', role: 'faculty' },
  { id: '3', name: 'Rahul Kumar', email: 'rahul@rgi.edu', role: 'student', studentId: 'RGI001' },
  { id: '4', name: 'Priya Singh', email: 'priya@rgi.edu', role: 'student', studentId: 'RGI002' },
];

export const mockStudents: Student[] = [
  {
    id: 'RGI001',
    name: 'Rahul Kumar',
    rollNumber: '21CS001',
    course: 'Computer Science Engineering',
    year: 3,
    semester: 5,
    email: 'rahul@rgi.edu',
    phone: '+91 9876543210'
  },
  {
    id: 'RGI002',
    name: 'Priya Singh',
    rollNumber: '21CS002',
    course: 'Computer Science Engineering',
    year: 3,
    semester: 5,
    email: 'priya@rgi.edu',
    phone: '+91 9876543211'
  },
  {
    id: 'RGI003',
    name: 'Amit Patel',
    rollNumber: '21ME001',
    course: 'Mechanical Engineering',
    year: 2,
    semester: 3,
    email: 'amit@rgi.edu',
    phone: '+91 9876543212'
  },
  {
    id: 'RGI004',
    name: 'Sneha Reddy',
    rollNumber: '21EE001',
    course: 'Electrical Engineering',
    year: 1,
    semester: 2,
    email: 'sneha@rgi.edu',
    phone: '+91 9876543213'
  }
];

export const mockAttendance: AttendanceRecord[] = [
  {
    id: '1',
    studentId: 'RGI001',
    subject: 'Data Structures',
    date: '2024-06-20',
    status: 'Present',
    faculty: 'Dr. Sharma'
  },
  {
    id: '2',
    studentId: 'RGI001',
    subject: 'Database Management',
    date: '2024-06-20',
    status: 'Absent',
    faculty: 'Prof. Gupta'
  },
  {
    id: '3',
    studentId: 'RGI002',
    subject: 'Data Structures',
    date: '2024-06-20',
    status: 'Present',
    faculty: 'Dr. Sharma'
  },
  {
    id: '4',
    studentId: 'RGI002',
    subject: 'Database Management',
    date: '2024-06-20',
    status: 'Late',
    faculty: 'Prof. Gupta'
  }
];

export const mockFees: FeeRecord[] = [
  {
    id: '1',
    studentId: 'RGI001',
    feeType: 'Tuition Fee',
    amount: 75000,
    dueDate: '2024-07-15',
    paidDate: '2024-07-10',
    status: 'Paid',
    semester: 5
  },
  {
    id: '2',
    studentId: 'RGI001',
    feeType: 'Library Fee',
    amount: 2000,
    dueDate: '2024-07-20',
    status: 'Pending',
    semester: 5
  },
  {
    id: '3',
    studentId: 'RGI002',
    feeType: 'Tuition Fee',
    amount: 75000,
    dueDate: '2024-07-15',
    status: 'Overdue',
    semester: 5
  }
];

export const mockExams: ExamRecord[] = [
  {
    id: '1',
    studentId: 'RGI001',
    subject: 'Data Structures',
    examType: 'Mid-term',
    marksObtained: 85,
    totalMarks: 100,
    examDate: '2024-06-15',
    grade: 'A'
  },
  {
    id: '2',
    studentId: 'RGI001',
    subject: 'Database Management',
    examType: 'Assignment',
    marksObtained: 78,
    totalMarks: 100,
    examDate: '2024-06-18',
    grade: 'B+'
  },
  {
    id: '3',
    studentId: 'RGI002',
    subject: 'Data Structures',
    examType: 'Mid-term',
    marksObtained: 92,
    totalMarks: 100,
    examDate: '2024-06-15',
    grade: 'A+'
  }
];
