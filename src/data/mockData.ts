
import { Student, AttendanceRecord, FeeRecord, ExamRecord, User, Faculty, Subject, TimeSlot, TimetableEntry, Classroom, AttendanceSession, AttendanceStats } from '../types';

export const mockUsers: User[] = [
  { 
    id: '1', 
    name: 'Admin User', 
    email: 'admin@rgi.edu', 
    role: 'admin',
    permissions: ['all'],
    isActive: true,
    lastLogin: '2024-06-20T10:00:00Z'
  },
  { 
    id: '2', 
    name: 'Dr. Sharma', 
    email: 'sharma@rgi.edu', 
    role: 'faculty',
    facultyId: 'FAC001',
    permissions: ['attendance', 'grades', 'student_view'],
    isActive: true,
    lastLogin: '2024-06-20T09:30:00Z'
  },
  { 
    id: '3', 
    name: 'Rahul Kumar', 
    email: 'rahul@rgi.edu', 
    role: 'student', 
    studentId: 'RGI001',
    permissions: ['view_own_data'],
    isActive: true,
    lastLogin: '2024-06-20T08:45:00Z'
  },
  { 
    id: '4', 
    name: 'Priya Singh', 
    email: 'priya@rgi.edu', 
    role: 'student', 
    studentId: 'RGI002',
    permissions: ['view_own_data'],
    isActive: true,
    lastLogin: '2024-06-20T09:15:00Z'
  },
];

export const mockFaculty: Faculty[] = [
  {
    id: 'FAC001',
    name: 'Dr. Rajesh Sharma',
    email: 'sharma@rgi.edu',
    phone: '+91 9876543220',
    department: 'Computer Science',
    designation: 'Professor',
    employeeId: 'EMP001',
    subjects: ['Data Structures', 'Algorithms', 'Database Management']
  },
  {
    id: 'FAC002',
    name: 'Prof. Anita Gupta',
    email: 'gupta@rgi.edu',
    phone: '+91 9876543221',
    department: 'Computer Science',
    designation: 'Associate Professor',
    employeeId: 'EMP002',
    subjects: ['Database Management', 'Web Development', 'Software Engineering']
  }
];

export const mockSubjects: Subject[] = [
  {
    id: 'SUB001',
    name: 'Data Structures',
    code: 'CS301',
    department: 'Computer Science',
    semester: 5,
    credits: 4,
    type: 'Theory'
  },
  {
    id: 'SUB002',
    name: 'Database Management',
    code: 'CS302',
    department: 'Computer Science',
    semester: 5,
    credits: 3,
    type: 'Theory'
  },
  {
    id: 'SUB003',
    name: 'Data Structures Lab',
    code: 'CS301L',
    department: 'Computer Science',
    semester: 5,
    credits: 2,
    type: 'Lab'
  }
];

export const timeSlots: TimeSlot[] = [
  { id: 'TS001', startTime: '09:00', endTime: '10:00', period: 1 },
  { id: 'TS002', startTime: '10:00', endTime: '11:00', period: 2 },
  { id: 'TS003', startTime: '11:15', endTime: '12:15', period: 3 },
  { id: 'TS004', startTime: '12:15', endTime: '13:15', period: 4 },
  { id: 'TS005', startTime: '14:00', endTime: '15:00', period: 5 },
  { id: 'TS006', startTime: '15:00', endTime: '16:00', period: 6 }
];

export const mockClassrooms: Classroom[] = [
  {
    id: 'CR001',
    name: 'LH-101',
    capacity: 60,
    type: 'Lecture Hall',
    building: 'Academic Block A',
    floor: 1,
    facilities: ['Projector', 'AC', 'Sound System']
  },
  {
    id: 'CR002',
    name: 'LAB-201',
    capacity: 30,
    type: 'Lab',
    building: 'Academic Block B',
    floor: 2,
    facilities: ['Computers', 'Projector', 'AC']
  }
];

export const mockTimetable: TimetableEntry[] = [
  {
    id: 'TT001',
    dayOfWeek: 1, // Monday
    timeSlot: timeSlots[0],
    subjectId: 'SUB001',
    facultyId: 'FAC001',
    classroomId: 'CR001',
    course: 'Computer Science Engineering',
    semester: 5,
    year: 3
  },
  {
    id: 'TT002',
    dayOfWeek: 1, // Monday
    timeSlot: timeSlots[1],
    subjectId: 'SUB002',
    facultyId: 'FAC002',
    classroomId: 'CR001',
    course: 'Computer Science Engineering',
    semester: 5,
    year: 3
  }
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
    phone: '+91 9876543210',
    admissionDate: '2021-08-15',
    guardianName: 'Suresh Kumar',
    guardianPhone: '+91 9876543215',
    address: '123 Main Street, Delhi',
    bloodGroup: 'O+',
    emergencyContact: '+91 9876543216'
  },
  {
    id: 'RGI002',
    name: 'Priya Singh',
    rollNumber: '21CS002',
    course: 'Computer Science Engineering',
    year: 3,
    semester: 5,
    email: 'priya@rgi.edu',
    phone: '+91 9876543211',
    admissionDate: '2021-08-15',
    guardianName: 'Rajesh Singh',
    guardianPhone: '+91 9876543217',
    address: '456 Park Avenue, Mumbai',
    bloodGroup: 'A+',
    emergencyContact: '+91 9876543218'
  },
  {
    id: 'RGI003',
    name: 'Amit Patel',
    rollNumber: '21ME001',
    course: 'Mechanical Engineering',
    year: 2,
    semester: 3,
    email: 'amit@rgi.edu',
    phone: '+91 9876543212',
    admissionDate: '2021-08-15',
    guardianName: 'Bharat Patel',
    guardianPhone: '+91 9876543219',
    address: '789 Gandhi Road, Ahmedabad',
    bloodGroup: 'B+',
    emergencyContact: '+91 9876543220'
  },
  {
    id: 'RGI004',
    name: 'Sneha Reddy',
    rollNumber: '21EE001',
    course: 'Electrical Engineering',
    year: 1,
    semester: 2,
    email: 'sneha@rgi.edu',
    phone: '+91 9876543213',
    admissionDate: '2021-08-15',
    guardianName: 'Venkat Reddy',
    guardianPhone: '+91 9876543221',
    address: '321 Tech City, Hyderabad',
    bloodGroup: 'AB+',
    emergencyContact: '+91 9876543222'
  }
];

export const mockAttendance: AttendanceRecord[] = [
  {
    id: '1',
    studentId: 'RGI001',
    subject: 'Data Structures',
    subjectId: 'SUB001',
    date: '2024-06-20',
    timeSlot: '09:00-10:00',
    period: 1,
    status: 'Present',
    faculty: 'Dr. Sharma',
    facultyId: 'FAC001',
    markedAt: '2024-06-20T09:05:00Z',
    markedBy: 'FAC001',
    className: 'CS-5th-Sem',
    academicYear: '2024-25'
  },
  {
    id: '2',
    studentId: 'RGI001',
    subject: 'Database Management',
    subjectId: 'SUB002',
    date: '2024-06-20',
    timeSlot: '10:00-11:00',
    period: 2,
    status: 'Absent',
    faculty: 'Prof. Gupta',
    facultyId: 'FAC002',
    markedAt: '2024-06-20T10:05:00Z',
    markedBy: 'FAC002',
    className: 'CS-5th-Sem',
    academicYear: '2024-25'
  },
  {
    id: '3',
    studentId: 'RGI002',
    subject: 'Data Structures',
    subjectId: 'SUB001',
    date: '2024-06-20',
    timeSlot: '09:00-10:00',
    period: 1,
    status: 'Present',
    faculty: 'Dr. Sharma',
    facultyId: 'FAC001',
    markedAt: '2024-06-20T09:05:00Z',
    markedBy: 'FAC001',
    className: 'CS-5th-Sem',
    academicYear: '2024-25'
  },
  {
    id: '4',
    studentId: 'RGI002',
    subject: 'Database Management',
    subjectId: 'SUB002',
    date: '2024-06-20',
    timeSlot: '10:00-11:00',
    period: 2,
    status: 'Late',
    faculty: 'Prof. Gupta',
    facultyId: 'FAC002',
    markedAt: '2024-06-20T10:15:00Z',
    markedBy: 'FAC002',
    className: 'CS-5th-Sem',
    academicYear: '2024-25'
  }
];

export const mockAttendanceSessions: AttendanceSession[] = [
  {
    id: 'AS001',
    subjectId: 'SUB001',
    facultyId: 'FAC001',
    date: '2024-06-20',
    timeSlot: '09:00-10:00',
    period: 1,
    className: 'CS-5th-Sem',
    totalStudents: 2,
    presentCount: 2,
    absentCount: 0,
    lateCount: 0,
    isActive: false,
    createdAt: '2024-06-20T09:00:00Z'
  },
  {
    id: 'AS002',
    subjectId: 'SUB002',
    facultyId: 'FAC002',
    date: '2024-06-20',
    timeSlot: '10:00-11:00',
    period: 2,
    className: 'CS-5th-Sem',
    totalStudents: 2,
    presentCount: 0,
    absentCount: 1,
    lateCount: 1,
    isActive: false,
    createdAt: '2024-06-20T10:00:00Z'
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
    semester: 5,
    academicYear: '2024-25',
    paymentMethod: 'Online',
    receiptNumber: 'RCP001'
  },
  {
    id: '2',
    studentId: 'RGI001',
    feeType: 'Library Fee',
    amount: 2000,
    dueDate: '2024-07-20',
    status: 'Pending',
    semester: 5,
    academicYear: '2024-25'
  },
  {
    id: '3',
    studentId: 'RGI002',
    feeType: 'Tuition Fee',
    amount: 75000,
    dueDate: '2024-07-15',
    status: 'Overdue',
    semester: 5,
    academicYear: '2024-25'
  }
];

export const mockExams: ExamRecord[] = [
  {
    id: '1',
    studentId: 'RGI001',
    subject: 'Data Structures',
    subjectId: 'SUB001',
    examType: 'Mid-term',
    marksObtained: 85,
    totalMarks: 100,
    examDate: '2024-06-15',
    grade: 'A',
    percentage: 85,
    remarks: 'Excellent performance'
  },
  {
    id: '2',
    studentId: 'RGI001',
    subject: 'Database Management',
    subjectId: 'SUB002',
    examType: 'Assignment',
    marksObtained: 78,
    totalMarks: 100,
    examDate: '2024-06-18',
    grade: 'B+',
    percentage: 78,
    remarks: 'Good work'
  },
  {
    id: '3',
    studentId: 'RGI002',
    subject: 'Data Structures',
    subjectId: 'SUB001',
    examType: 'Mid-term',
    marksObtained: 92,
    totalMarks: 100,
    examDate: '2024-06-15',
    grade: 'A+',
    percentage: 92,
    remarks: 'Outstanding performance'
  }
];

// Helper function to calculate attendance stats
export const calculateAttendanceStats = (studentId: string): AttendanceStats => {
  const studentAttendance = mockAttendance.filter(a => a.studentId === studentId);
  const totalClasses = studentAttendance.length;
  const presentClasses = studentAttendance.filter(a => a.status === 'Present').length;
  const absentClasses = studentAttendance.filter(a => a.status === 'Absent').length;
  const lateClasses = studentAttendance.filter(a => a.status === 'Late').length;
  const attendancePercentage = totalClasses > 0 ? Math.round((presentClasses / totalClasses) * 100) : 0;

  // Subject-wise attendance calculation
  const subjectMap = new Map();
  studentAttendance.forEach(record => {
    if (!subjectMap.has(record.subjectId)) {
      subjectMap.set(record.subjectId, {
        subjectId: record.subjectId,
        subjectName: record.subject,
        totalClasses: 0,
        presentClasses: 0
      });
    }
    const subject = subjectMap.get(record.subjectId);
    subject.totalClasses++;
    if (record.status === 'Present') {
      subject.presentClasses++;
    }
  });

  const subjectWiseAttendance = Array.from(subjectMap.values()).map(subject => ({
    ...subject,
    percentage: subject.totalClasses > 0 ? Math.round((subject.presentClasses / subject.totalClasses) * 100) : 0
  }));

  return {
    totalClasses,
    presentClasses,
    absentClasses,
    lateClasses,
    attendancePercentage,
    subjectWiseAttendance
  };
};
