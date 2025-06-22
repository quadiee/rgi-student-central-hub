import {
  Student,
  Faculty,
  Subject,
  Course,
  TimeSlot,
  TimetableEntry,
  Classroom,
  AttendanceRecord,
  AttendanceStats,
  FeeRecord,
  ExamRecord,
  User,
  LeaveRequest,
  Department,
  DepartmentStats,
  SystemSettings,
} from '../types';

// Enhanced Users with RGCE structure
export const mockUsers: User[] = [
  {
    id: '1',
    name: 'Admin User',
    email: 'admin@rgce.edu.in',
    role: 'admin',
    department: 'ADMIN',
    profileImage: 'https://i.pravatar.cc/150?img=10',
    permissions: ['all'],
    isActive: true,
    createdAt: '2024-01-01'
  },
  {
    id: '2',
    name: 'Dr. Rajesh Kumar',
    email: 'rajesh.kumar@rgce.edu.in',
    role: 'hod',
    department: 'CSE',
    facultyId: 'fac1',
    profileImage: 'https://i.pravatar.cc/150?img=6',
    permissions: ['hod', 'faculty'],
    isActive: true
  },
  {
    id: '3',
    name: 'Alice Johnson',
    email: 'alice.johnson@rgce.edu.in',
    role: 'student',
    department: 'CSE',
    studentId: 'std1',
    profileImage: 'https://i.pravatar.cc/150?img=1',
    permissions: ['student'],
    isActive: true
  },
  {
    id: '4',
    name: 'Dr. Priya Sharma',
    email: 'priya.sharma@rgce.edu.in',
    role: 'faculty',
    department: 'CSE',
    facultyId: 'fac2',
    profileImage: 'https://i.pravatar.cc/150?img=7',
    permissions: ['faculty'],
    isActive: true
  },
  {
    id: '5',
    name: 'Dr. Principal',
    email: 'principal@rgce.edu.in',
    role: 'principal',
    department: 'ADMIN',
    profileImage: 'https://i.pravatar.cc/150?img=8',
    permissions: ['principal', 'all'],
    isActive: true
  }
];

// Enhanced Students with department and year-section
export const mockStudents: Student[] = [
  {
    id: 'std1',
    name: 'Alice Johnson',
    rollNumber: '21CSE001',
    course: 'B.Tech Computer Science',
    year: 3,
    semester: 5,
    department: 'CSE',
    yearSection: '3-A',
    email: 'alice.johnson@rgce.edu.in',
    phone: '9876543210',
    profileImage: 'https://i.pravatar.cc/150?img=1',
    admissionDate: '2021-08-15',
    guardianName: 'Robert Johnson',
    guardianPhone: '9876543211',
    address: '123 Highland, Anytown',
    bloodGroup: 'O+',
    emergencyContact: '9876543212',
    attendancePercentage: 85
  },
  {
    id: 'std2',
    name: 'Raj Patel',
    rollNumber: '21CSE002',
    course: 'B.Tech Computer Science',
    year: 3,
    semester: 5,
    department: 'CSE',
    yearSection: '3-A',
    email: 'raj.patel@rgce.edu.in',
    phone: '9876543213',
    profileImage: 'https://i.pravatar.cc/150?img=2',
    admissionDate: '2021-08-16',
    guardianName: 'Suresh Patel',
    guardianPhone: '9876543214',
    address: '456 Gandhi Nagar, Rajkot',
    bloodGroup: 'A+',
    emergencyContact: '9876543215',
    attendancePercentage: 72 // At-risk student
  },
  {
    id: 'std3',
    name: 'Priya Mehta',
    rollNumber: '21ECE001',
    course: 'B.Tech Electronics',
    year: 3,
    semester: 5,
    department: 'ECE',
    yearSection: '3-B',
    email: 'priya.mehta@rgce.edu.in',
    phone: '9876543216',
    profileImage: 'https://i.pravatar.cc/150?img=3',
    admissionDate: '2021-08-17',
    guardianName: 'Ramesh Mehta',
    guardianPhone: '9876543217',
    address: '789 Satellite, Ahmedabad',
    bloodGroup: 'B+',
    emergencyContact: '9876543218',
    attendancePercentage: 90
  },
  {
    id: 'std4',
    name: 'Diana Miller',
    rollNumber: '2021004',
    course: 'Civil Engineering',
    year: 3,
    semester: 5,
    email: 'diana.m@example.com',
    phone: '456-789-0123',
    profileImage: 'https://i.pravatar.cc/150?img=4',
    admissionDate: '2021-08-18',
    guardianName: 'Michael Miller',
    guardianPhone: '456-789-0124',
    address: '101 Upland, Anytown',
    bloodGroup: 'AB+',
    emergencyContact: '654-321-0987',
    department: 'CIVIL',
    yearSection: '3-A',
    attendancePercentage: 88
  },
  {
    id: 'std5',
    name: 'Ethan Davis',
    rollNumber: '2021005',
    course: 'Chemical Engineering',
    year: 3,
    semester: 5,
    email: 'ethan.d@example.com',
    phone: '567-890-1234',
    profileImage: 'https://i.pravatar.cc/150?img=5',
    admissionDate: '2021-08-19',
    guardianName: 'Susan Davis',
    guardianPhone: '567-890-1235',
    address: '112 Bottomland, Anytown',
    bloodGroup: 'O-',
    emergencyContact: '543-210-9876',
    department: 'MECH',
    yearSection: '3-B',
    attendancePercentage: 76
  },
];

// Enhanced Faculty with assigned courses
export const mockFaculty: Faculty[] = [
  {
    id: 'fac1',
    name: 'Dr. Rajesh Kumar',
    email: 'rajesh.kumar@rgce.edu.in',
    phone: '9876543220',
    department: 'CSE',
    designation: 'HOD & Professor',
    employeeId: 'RGCE001',
    subjects: ['sub1', 'sub2'],
    profileImage: 'https://i.pravatar.cc/150?img=6',
    assignedCourses: ['CSE301', 'CSE302']
  },
  {
    id: 'fac2',
    name: 'Dr. Priya Sharma',
    email: 'priya.sharma@rgce.edu.in',
    phone: '9876543221',
    department: 'CSE',
    designation: 'Associate Professor',
    employeeId: 'RGCE002',
    subjects: ['sub3'],
    profileImage: 'https://i.pravatar.cc/150?img=7',
    assignedCourses: ['CSE303']
  },
  {
    id: 'fac3',
    name: 'Dr. Amit Joshi',
    email: 'amit.joshi@rgce.edu.in',
    phone: '9876543222',
    department: 'ECE',
    designation: 'Assistant Professor',
    employeeId: 'RGCE003',
    subjects: ['sub4'],
    profileImage: 'https://i.pravatar.cc/150?img=8',
    assignedCourses: ['ECE301']
  }
];

// New Courses module
export const mockCourses: Course[] = [
  {
    id: 'course1',
    courseCode: 'CSE301',
    courseName: 'Database Management Systems',
    department: 'CSE',
    facultyEmail: 'rajesh.kumar@rgce.edu.in',
    hoursPerWeek: 6,
    semester: 5,
    year: 3,
    yearSection: '3-A',
    avgAttendance: 85
  },
  {
    id: 'course2',
    courseCode: 'CSE302',
    courseName: 'Software Engineering',
    department: 'CSE',
    facultyEmail: 'rajesh.kumar@rgce.edu.in',
    hoursPerWeek: 5,
    semester: 5,
    year: 3,
    yearSection: '3-A',
    avgAttendance: 78
  },
  {
    id: 'course3',
    courseCode: 'CSE303',
    courseName: 'Computer Networks',
    department: 'CSE',
    facultyEmail: 'priya.sharma@rgce.edu.in',
    hoursPerWeek: 4,
    semester: 5,
    year: 3,
    yearSection: '3-A',
    avgAttendance: 82
  },
  {
    id: 'course4',
    courseCode: 'ECE301',
    courseName: 'Digital Signal Processing',
    department: 'ECE',
    facultyEmail: 'amit.joshi@rgce.edu.in',
    hoursPerWeek: 5,
    semester: 5,
    year: 3,
    yearSection: '3-B',
    avgAttendance: 88
  }
];

// Enhanced Subjects
export const mockSubjects: Subject[] = [
  {
    id: 'sub1',
    name: 'Database Management Systems',
    code: 'CSE301',
    department: 'CSE',
    semester: 5,
    credits: 4,
    type: 'Theory',
  },
  {
    id: 'sub2',
    name: 'Software Engineering',
    code: 'CSE302',
    department: 'CSE',
    semester: 5,
    credits: 4,
    type: 'Theory',
  },
  {
    id: 'sub3',
    name: 'Computer Networks',
    code: 'CSE303',
    department: 'CSE',
    semester: 5,
    credits: 3,
    type: 'Theory',
  },
  {
    id: 'sub4',
    name: 'Digital Signal Processing',
    code: 'ECE301',
    department: 'ECE',
    semester: 5,
    credits: 4,
    type: 'Theory',
  },
  {
    id: 'sub5',
    name: 'Thermodynamics',
    code: 'ME201',
    department: 'Mechanical Engineering',
    semester: 3,
    credits: 3,
    type: 'Theory',
  },
];

// New Leave Requests
export const mockLeaveRequests: LeaveRequest[] = [
  {
    id: 'leave1',
    studentId: 'std1',
    fromDate: '2024-06-25',
    toDate: '2024-06-26',
    reason: 'Family function - cousin marriage',
    facultyApproval: 'Approved',
    hodApproval: 'Pending',
    finalStatus: 'Pending',
    requestedOn: '2024-06-20T10:00:00',
    courseCode: 'CSE301'
  },
  {
    id: 'leave2',
    studentId: 'std2',
    fromDate: '2024-06-28',
    toDate: '2024-06-28',
    reason: 'Medical appointment',
    facultyApproval: 'Pending',
    hodApproval: 'Pending',
    finalStatus: 'Pending',
    requestedOn: '2024-06-22T14:30:00'
  },
  {
    id: 'leave3',
    studentId: 'std3',
    fromDate: '2024-06-20',
    toDate: '2024-06-21',
    reason: 'Technical symposium participation',
    facultyApproval: 'Approved',
    hodApproval: 'Approved',
    finalStatus: 'Approved',
    approvedBy: 'fac3',
    requestedOn: '2024-06-18T09:15:00'
  }
];

// Enhanced Attendance with hourly tracking
export const mockAttendance: AttendanceRecord[] = [
  {
    id: 'att1',
    studentId: 'std1',
    courseCode: 'CSE301',
    date: '2024-06-20',
    hourNumber: 1,
    status: 'Present',
    facultyId: 'fac1',
    markedAt: '2024-06-20T09:05:00',
    markedBy: 'fac1',
    academicYear: '2024-25'
  },
  {
    id: 'att2',
    studentId: 'std1',
    courseCode: 'CSE301',
    date: '2024-06-20',
    hourNumber: 2,
    status: 'Present',
    facultyId: 'fac1',
    markedAt: '2024-06-20T10:05:00',
    markedBy: 'fac1',
    academicYear: '2024-25'
  },
  {
    id: 'att3',
    studentId: 'std2',
    courseCode: 'CSE301',
    date: '2024-06-20',
    hourNumber: 1,
    status: 'Absent',
    facultyId: 'fac1',
    markedAt: '2024-06-20T09:05:00',
    markedBy: 'fac1',
    academicYear: '2024-25'
  },
  {
    id: 'att4',
    studentId: 'std3',
    courseCode: 'ECE301',
    date: '2024-06-21',
    hourNumber: 1,
    status: 'Leave',
    facultyId: 'fac3',
    markedAt: '2024-06-21T09:05:00',
    markedBy: 'fac3',
    academicYear: '2024-25'
  }
];

// Department Statistics
export const mockDepartmentStats: DepartmentStats[] = [
  {
    department: 'CSE',
    totalStudents: 120,
    avgAttendance: 82,
    atRiskStudents: 8,
    totalCourses: 12,
    activeFaculty: 8
  },
  {
    department: 'ECE',
    totalStudents: 90,
    avgAttendance: 86,
    atRiskStudents: 5,
    totalCourses: 10,
    activeFaculty: 6
  },
  {
    department: 'MECH',
    totalStudents: 100,
    avgAttendance: 79,
    atRiskStudents: 12,
    totalCourses: 11,
    activeFaculty: 7
  },
  {
    department: 'CIVIL',
    totalStudents: 80,
    avgAttendance: 88,
    atRiskStudents: 3,
    totalCourses: 9,
    activeFaculty: 5
  }
];

// System Settings
export const mockSystemSettings: SystemSettings = {
  attendanceThreshold: 75,
  semesterStartDate: '2024-06-01',
  semesterEndDate: '2024-11-30',
  hoursPerDay: 8,
  workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  emailDomain: '@rgce.edu.in'
};

// Utility functions for calculations
export const calculateAttendanceStats = (studentId: string): AttendanceStats => {
  const studentAttendance = mockAttendance.filter(record => record.studentId === studentId);
  const totalClasses = studentAttendance.length;
  const presentClasses = studentAttendance.filter(record => record.status === 'Present').length;
  const absentClasses = studentAttendance.filter(record => record.status === 'Absent').length;
  const leaveClasses = studentAttendance.filter(record => record.status === 'Leave').length;

  const attendancePercentage = totalClasses > 0 ? 
    Math.round(((presentClasses + leaveClasses) / totalClasses) * 100) : 0;

  const courseWiseAttendance = mockCourses
    .filter(course => {
      // Get student's courses based on department and year
      const student = mockStudents.find(s => s.id === studentId);
      return student && course.department === student.department && course.year === student.year;
    })
    .map(course => {
      const courseAttendance = studentAttendance.filter(record => record.courseCode === course.courseCode);
      const courseTotal = courseAttendance.length;
      const coursePresent = courseAttendance.filter(record => 
        record.status === 'Present' || record.status === 'Leave'
      ).length;
      const percentage = courseTotal > 0 ? Math.round((coursePresent / courseTotal) * 100) : 0;

      return {
        courseCode: course.courseCode,
        courseName: course.courseName,
        totalHours: courseTotal,
        presentHours: coursePresent,
        percentage: percentage,
      };
    });

  return {
    totalClasses,
    presentClasses,
    absentClasses,
    leaveClasses,
    attendancePercentage,
    courseWiseAttendance,
    isAtRisk: attendancePercentage < mockSystemSettings.attendanceThreshold,
  };
};

export const calculateCourseAvgAttendance = (courseCode: string): number => {
  const courseAttendance = mockAttendance.filter(record => record.courseCode === courseCode);
  if (courseAttendance.length === 0) return 0;

  const studentIds = [...new Set(courseAttendance.map(record => record.studentId))];
  const studentAttendances = studentIds.map(studentId => {
    const studentCourseAttendance = courseAttendance.filter(record => record.studentId === studentId);
    const total = studentCourseAttendance.length;
    const present = studentCourseAttendance.filter(record => 
      record.status === 'Present' || record.status === 'Leave'
    ).length;
    return total > 0 ? (present / total) * 100 : 0;
  });

  return Math.round(studentAttendances.reduce((sum, att) => sum + att, 0) / studentAttendances.length);
};

// Legacy exports for backward compatibility
export const timeSlots: TimeSlot[] = [
  { id: 'ts1', startTime: '9:00 AM', endTime: '10:00 AM', period: 1 },
  { id: 'ts2', startTime: '10:00 AM', endTime: '11:00 AM', period: 2 },
  { id: 'ts3', startTime: '11:00 AM', endTime: '12:00 PM', period: 3 },
  { id: 'ts4', startTime: '1:00 PM', endTime: '2:00 PM', period: 4 },
  { id: 'ts5', startTime: '2:00 PM', endTime: '3:00 PM', period: 5 },
  { id: 'ts6', startTime: '3:00 PM', endTime: '4:00 PM', period: 6 },
  { id: 'ts7', startTime: '4:00 PM', endTime: '5:00 PM', period: 7 },
  { id: 'ts8', startTime: '5:00 PM', endTime: '6:00 PM', period: 8 },
];

export const mockTimetable: TimetableEntry[] = [
  {
    id: 'tt1',
    dayOfWeek: 1,
    timeSlot: timeSlots[0],
    subjectId: 'sub1',
    facultyId: 'fac1',
    classroomId: 'cr1',
    course: 'CSE301',
    semester: 5,
    year: 3,
  },
  {
    id: 'tt2',
    dayOfWeek: 1,
    timeSlot: timeSlots[1],
    subjectId: 'sub2',
    facultyId: 'fac1',
    classroomId: 'cr1',
    course: 'CSE302',
    semester: 5,
    year: 3,
  },
  {
    id: 'tt3',
    dayOfWeek: 2, // Tuesday
    timeSlot: timeSlots[0],
    subjectId: 'sub3',
    facultyId: 'fac2',
    classroomId: 'cr3',
    course: 'Electrical Engineering',
    semester: 5,
    year: 3,
  },
  {
    id: 'tt4',
    dayOfWeek: 3, // Wednesday
    timeSlot: timeSlots[2],
    subjectId: 'sub1',
    facultyId: 'fac1',
    classroomId: 'cr1',
    course: 'Computer Science',
    semester: 5,
    year: 3,
  },
  {
    id: 'tt5',
    dayOfWeek: 4, // Thursday
    timeSlot: timeSlots[1],
    subjectId: 'sub4',
    facultyId: 'fac2',
    classroomId: 'cr2',
    course: 'Electrical Engineering',
    semester: 5,
    year: 3,
  },
  {
    id: 'tt6',
    dayOfWeek: 5, // Friday
    timeSlot: timeSlots[0],
    subjectId: 'sub5',
    facultyId: 'fac3',
    classroomId: 'cr3',
    course: 'Mechanical Engineering',
    semester: 5,
    year: 3,
  },
];

export const mockClassrooms: Classroom[] = [
  {
    id: 'cr1',
    name: 'CSE Lab 1',
    capacity: 60,
    type: 'Lab',
    building: 'CSE Block',
    floor: 1,
    facilities: ['Projector', 'Computers', 'AC'],
  },
  {
    id: 'cr2',
    name: 'LH-101',
    capacity: 120,
    type: 'Lecture Hall',
    building: 'Main Block',
    floor: 1,
    facilities: ['Projector', 'Mic System', 'AC'],
  },
  {
    id: 'cr3',
    name: 'Room 201',
    capacity: 45,
    type: 'Tutorial Room',
    building: 'A',
    floor: 2,
    facilities: ['Whiteboard', 'Tables'],
  },
];

// Keep existing mock data for compatibility
export const mockFees: FeeRecord[] = [
  {
    id: 'fee1',
    studentId: 'std1',
    feeType: 'Semester Fee',
    amount: 45000,
    dueDate: '2024-07-15',
    paidDate: '2024-07-10',
    status: 'Paid',
    semester: 5,
    academicYear: '2024-25',
    paymentMethod: 'Online',
    receiptNumber: 'RGCE001'
  },
  {
    id: 'fee2',
    studentId: 'std2',
    feeType: 'Tuition Fee',
    amount: 45000,
    dueDate: '2024-07-15',
    status: 'Pending',
    semester: 5,
    academicYear: '2024-25'
  },
  {
    id: 'fee3',
    studentId: 'std3',
    feeType: 'Lab Fee',
    amount: 8000,
    dueDate: '2024-06-15',
    status: 'Overdue',
    semester: 5,
    academicYear: '2024-25'
  },
  {
    id: 'fee4',
    studentId: 'std4',
    feeType: 'Library Fee',
    amount: 2000,
    dueDate: '2024-07-20',
    paidDate: '2024-07-18',
    status: 'Paid',
    semester: 5,
    academicYear: '2024-25',
    paymentMethod: 'Cash',
    receiptNumber: 'RCT002'
  },
  {
    id: 'fee5',
    studentId: 'std5',
    feeType: 'Exam Fee',
    amount: 1500,
    dueDate: '2024-08-01',
    status: 'Pending',
    semester: 5,
    academicYear: '2024-25'
  }
];

export const mockExams: ExamRecord[] = [
  {
    id: 'exam1',
    studentId: 'std1',
    subject: 'Database Management Systems',
    subjectId: 'sub1',
    examType: 'Mid-term',
    marksObtained: 85,
    totalMarks: 100,
    examDate: '2024-06-15',
    grade: 'A',
    percentage: 85,
    remarks: 'Excellent performance'
  },
  {
    id: 'exam2',
    studentId: 'std2',
    subject: 'Database Management',
    subjectId: 'sub2',
    examType: 'Mid-term',
    marksObtained: 78,
    totalMarks: 100,
    examDate: '2024-06-16',
    grade: 'B+',
    percentage: 78
  },
  {
    id: 'exam3',
    studentId: 'std3',
    subject: 'Data Structures',
    subjectId: 'sub1',
    examType: 'Final',
    marksObtained: 92,
    totalMarks: 100,
    examDate: '2024-06-20',
    grade: 'A+',
    percentage: 92,
    remarks: 'Outstanding'
  },
  {
    id: 'exam4',
    studentId: 'std4',
    subject: 'Operating Systems',
    subjectId: 'sub3',
    examType: 'Quiz',
    marksObtained: 65,
    totalMarks: 100,
    examDate: '2024-06-18',
    grade: 'B',
    percentage: 65
  },
  {
    id: 'exam5',
    studentId: 'std5',
    subject: 'Computer Networks',
    subjectId: 'sub4',
    examType: 'Assignment',
    marksObtained: 88,
    totalMarks: 100,
    examDate: '2024-06-22',
    grade: 'A',
    percentage: 88
  }
];

// Backward compatibility exports
export const mockFeeRecords = mockFees;
export const mockExamRecords = mockExams;
