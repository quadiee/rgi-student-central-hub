import { User, FeeRecord } from '../types';

// Mock Users
export const mockUsers: User[] = [
  {
    id: '1',
    name: 'Rajesh Kumar',
    email: 'rajesh.kumar@rgce.edu.in',
    role: 'student',
    department_id: 'CSE',
    rollNumber: 'CSE2021001',
    yearSection: '4A',
    studentId: '1',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
    isActive: true
  },
  {
    id: '2',
    name: 'Dr. Priya Sharma',
    email: 'priya.sharma@rgce.edu.in',
    role: 'hod',
    department_id: 'CSE',
    employeeId: 'HOD001',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face',
    isActive: true
  },
  {
    id: '3',
    name: 'Dr. Suresh Reddy',
    email: 'suresh.reddy@rgce.edu.in',
    role: 'principal',
    department_id: 'ADMIN',
    employeeId: 'PRIN001',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
    isActive: true
  },
  {
    id: '4',
    name: 'Praveen Kumar',
    email: 'praveen@rgce.edu.in',
    role: 'admin',
    department_id: 'ADMIN',
    employeeId: 'ADMIN001',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face',
    isActive: true
  }
];

// Mock Students with Fee Information
export const mockStudents = [
  {
    id: '1',
    name: 'Rajesh Kumar',
    rollNumber: 'CSE2021001',
    department_id: 'CSE',
    year: 4,
    section: 'A',
    yearSection: '4A',
    email: 'rajesh.kumar@rgce.edu.in',
    phone: '+91 9876543210',
    guardianName: 'Suresh Kumar',
    guardianPhone: '+91 9876543211',
    address: '123 Main Street, Bangalore',
    profilePhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
    totalFees: 120000,
    paidAmount: 120000,
    dueAmount: 0,
    feeStatus: 'Paid'
  },
  {
    id: '2',
    name: 'Priya Sharma',
    rollNumber: 'CSE2021002',
    department_id: 'CSE',
    year: 4,
    section: 'A',
    yearSection: '4A',
    email: 'priya.sharma.student@rgce.edu.in',
    phone: '+91 9876543212',
    guardianName: 'Rakesh Sharma',
    guardianPhone: '+91 9876543213',
    address: '456 Park Road, Bangalore',
    profilePhoto: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face',
    totalFees: 120000,
    paidAmount: 80000,
    dueAmount: 40000,
    feeStatus: 'Pending'
  },
  {
    id: '3',
    name: 'Amit Patel',
    rollNumber: 'CSE2021003',
    department_id: 'CSE',
    year: 4,
    section: 'B',
    yearSection: '4B',
    email: 'amit.patel@rgce.edu.in',
    phone: '+91 9876543214',
    guardianName: 'Ramesh Patel',
    guardianPhone: '+91 9876543215',
    address: '789 Gandhi Nagar, Bangalore',
    profilePhoto: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
    totalFees: 120000,
    paidAmount: 0,
    dueAmount: 120000,
    feeStatus: 'Overdue'
  }
];

// Mock Fee Records
export const mockFeeRecords: FeeRecord[] = [
  {
    id: '1',
    studentId: '1',
    academicYear: '2024-25',
    semester: 7,
    feeType: 'Tuition Fee',
    amount: 60000,
    dueDate: '2024-07-15',
    status: 'Paid',
    paidAmount: 60000,
    lastPaymentDate: '2024-07-10'
  },
  {
    id: '2',
    studentId: '1',
    academicYear: '2024-25',
    semester: 8,
    feeType: 'Tuition Fee',
    amount: 60000,
    dueDate: '2024-12-15',
    status: 'Paid',
    paidAmount: 60000,
    lastPaymentDate: '2024-12-10'
  },
  {
    id: '3',
    studentId: '2',
    academicYear: '2024-25',
    semester: 7,
    feeType: 'Tuition Fee',
    amount: 60000,
    dueDate: '2024-07-15',
    status: 'Paid',
    paidAmount: 60000,
    lastPaymentDate: '2024-07-10'
  },
  {
    id: '4',
    studentId: '2',
    academicYear: '2024-25',
    semester: 8,
    feeType: 'Tuition Fee',
    amount: 60000,
    dueDate: '2024-12-15',
    status: 'Pending',
    paidAmount: 20000,
    lastPaymentDate: '2024-12-01'
  },
  {
    id: '5',
    studentId: '3',
    academicYear: '2024-25',
    semester: 7,
    feeType: 'Tuition Fee',
    amount: 60000,
    dueDate: '2024-07-15',
    status: 'Overdue',
    paidAmount: 0
  },
  {
    id: '6',
    studentId: '3',
    academicYear: '2024-25',
    semester: 8,
    feeType: 'Tuition Fee',
    amount: 60000,
    dueDate: '2024-12-15',
    status: 'Pending',
    paidAmount: 0
  }
];

// Helper function to get student fee summary
export const getStudentFeeSummary = (studentId: string) => {
  const studentRecords = mockFeeRecords.filter(record => record.studentId === studentId);
  const totalFees = studentRecords.reduce((sum, record) => sum + record.amount, 0);
  const totalPaid = studentRecords.reduce((sum, record) => sum + (record.paidAmount || 0), 0);
  const totalDue = totalFees - totalPaid;
  
  return {
    totalFees,
    totalPaid,
    totalDue,
    records: studentRecords
  };
};

// Helper function to get department fee statistics
export const getDepartmentFeeStats = (department_id: string) => {
  const departmentStudents = mockStudents.filter(student => student.department_id === department_id);
  const totalStudents = departmentStudents.length;
  const totalCollected = departmentStudents.reduce((sum, student) => sum + student.paidAmount, 0);
  const totalOutstanding = departmentStudents.reduce((sum, student) => sum + student.dueAmount, 0);
  const collectionRate = totalStudents > 0 ? Math.round((totalCollected / (totalCollected + totalOutstanding)) * 100) : 0;
  
  return {
    totalStudents,
    totalCollected,
    totalOutstanding,
    collectionRate,
    students: departmentStudents
  };
};

const mockData = {
  mockUsers,
  mockStudents,
  mockFeeRecords,
  getStudentFeeSummary,
  getDepartmentFeeStats
};

export default mockData;