
import { User, FeeRecord } from '../types';

export const mockUsers: User[] = [
  {
    id: '1',
    name: 'Arun Kumar',
    email: 'arun.kumar@rgce.edu.in',
    role: 'student',
    department_id: '1',
    department_name: 'Computer Science Engineering',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
    rollNumber: 'CSE2021001'
  },
  {
    id: '2',
    name: 'Dr. Rajesh Sharma',
    email: 'rajesh.sharma@rgce.edu.in',
    role: 'hod',
    department_id: '1',
    department_name: 'Computer Science Engineering',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
    employeeId: 'CSE001'
  },
  {
    id: '3',
    name: 'Prof. Sunita Menon',
    email: 'sunita.menon@rgce.edu.in',
    role: 'principal',
    department_id: '7',
    department_name: 'Administration',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face',
    employeeId: 'PRIN001'
  },
  {
    id: '4',
    name: 'Praveen Kumar',
    email: 'praveen@rgce.edu.in',
    role: 'admin',
    department_id: '7',
    department_name: 'Administration',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face',
    employeeId: 'ADMIN001'
  }
];

export const mockFeeRecords: FeeRecord[] = [
  {
    id: '1',
    studentId: '1',
    feeType: 'Semester Fee',
    amount: 120000,
    dueDate: '2024-12-31',
    status: 'Pending',
    semester: 5,
    academicYear: '2024-25'
  },
  {
    id: '2',
    studentId: '5',
    feeType: 'Semester Fee',
    amount: 120000,
    dueDate: '2024-12-31',
    paidDate: '2024-11-15',
    status: 'Paid',
    semester: 5,
    academicYear: '2024-25',
    paymentMethod: 'Online',
    receiptNumber: 'RCP-20241115-0001'
  }
];
