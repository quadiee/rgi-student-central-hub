
import {
  Student,
  Faculty,
  Subject,
  Course,
  TimeSlot,
  TimetableEntry,
  Classroom,
  AttendanceRecord,
  LeaveRequest,
  FeeRecord,
  ExamRecord,
  User,
  AttendanceStats,
  DepartmentStats,
  AcademicCalendar,
  SystemSettings,
  Department,
} from '../types';

// Mock Data for Students
export const mockStudents: Student[] = [
  {
    id: 'STU001',
    name: 'Alice Johnson',
    rollNumber: '2021A001',
    course: 'B.Tech CSE',
    year: 3,
    semester: 6,
    email: 'alice.j@rgce.edu.in',
    phone: '9876543210',
    profileImage: 'https://example.com/alice.jpg',
    admissionDate: '2021-08-15',
    guardianName: 'Robert Johnson',
    guardianPhone: '9876543211',
    address: '123 Main Street, Anytown',
    bloodGroup: 'O+',
    emergencyContact: '9876543212',
    department: 'CSE',
    yearSection: '3-A',
    attendancePercentage: 85,
  },
  {
    id: 'STU002',
    name: 'Bob Williams',
    rollNumber: '2020B002',
    course: 'B.Tech ECE',
    year: 4,
    semester: 8,
    email: 'bob.w@rgce.edu.in',
    phone: '9876543220',
    profileImage: 'https://example.com/bob.jpg',
    admissionDate: '2020-08-10',
    guardianName: 'Linda Williams',
    guardianPhone: '9876543221',
    address: '456 Elm Street, Anytown',
    bloodGroup: 'A-',
    emergencyContact: '9876543222',
    department: 'ECE',
    yearSection: '4-B',
    attendancePercentage: 78,
  },
  {
    id: 'STU003',
    name: 'Charlie Brown',
    rollNumber: '2022C003',
    course: 'B.Tech MECH',
    year: 2,
    semester: 4,
    email: 'charlie.b@rgce.edu.in',
    phone: '9876543230',
    profileImage: 'https://example.com/charlie.jpg',
    admissionDate: '2022-08-20',
    guardianName: 'Patricia Brown',
    guardianPhone: '9876543231',
    address: '789 Oak Street, Anytown',
    bloodGroup: 'B+',
    emergencyContact: '9876543232',
    department: 'MECH',
    yearSection: '2-C',
    attendancePercentage: 92,
  },
  {
    id: 'STU004',
    name: 'Diana Miller',
    rollNumber: '2023D004',
    course: 'B.Tech CIVIL',
    year: 1,
    semester: 2,
    email: 'diana.m@rgce.edu.in',
    phone: '9876543240',
    profileImage: 'https://example.com/diana.jpg',
    admissionDate: '2023-08-25',
    guardianName: 'David Miller',
    guardianPhone: '9876543241',
    address: '101 Pine Street, Anytown',
    bloodGroup: 'AB+',
    emergencyContact: '9876543242',
    department: 'CIVIL',
    yearSection: '1-A',
    attendancePercentage: 65,
  },
  {
    id: 'STU005',
    name: 'Eva Garcia',
    rollNumber: '2021E005',
    course: 'B.Tech EEE',
    year: 3,
    semester: 6,
    email: 'eva.g@rgce.edu.in',
    phone: '9876543250',
    profileImage: 'https://example.com/eva.jpg',
    admissionDate: '2021-09-01',
    guardianName: 'Sophia Garcia',
    guardianPhone: '9876543251',
    address: '222 Maple Street, Anytown',
    bloodGroup: 'O-',
    emergencyContact: '9876543252',
    department: 'EEE',
    yearSection: '3-B',
    attendancePercentage: 70,
  },
];

// Mock Data for Faculty
export const mockFaculty: Faculty[] = [
  {
    id: 'FAC001',
    name: 'Dr. Rajesh Kumar',
    email: 'rajesh.k@rgce.edu.in',
    phone: '9444455555',
    department: 'CSE',
    designation: 'Professor',
    employeeId: 'EMP1001',
    subjects: ['Data Structures', 'Algorithms'],
    profileImage: 'https://example.com/rajesh.jpg',
    assignedCourses: ['CSE301', 'CSE401'],
  },
  {
    id: 'FAC002',
    name: 'Dr. Priya Sharma',
    email: 'priya.s@rgce.edu.in',
    phone: '9555566666',
    department: 'ECE',
    designation: 'Associate Professor',
    employeeId: 'EMP1002',
    subjects: ['Signals and Systems', 'Digital Communication'],
    profileImage: 'https://example.com/priya.jpg',
    assignedCourses: ['ECE302', 'ECE402'],
  },
  {
    id: 'FAC003',
    name: 'Mr. Arvind Patel',
    email: 'arvind.p@rgce.edu.in',
    phone: '9666677777',
    department: 'MECH',
    designation: 'Assistant Professor',
    employeeId: 'EMP1003',
    subjects: ['Thermodynamics', 'Fluid Mechanics'],
    profileImage: 'https://example.com/arvind.jpg',
    assignedCourses: ['MECH303', 'MECH403'],
  },
];

// Mock Data for Subjects
export const mockSubjects: Subject[] = [
  {
    id: 'SUB001',
    name: 'Data Structures',
    code: 'CSE301',
    department: 'CSE',
    semester: 3,
    credits: 4,
    type: 'Theory',
  },
  {
    id: 'SUB002',
    name: 'Signals and Systems',
    code: 'ECE302',
    department: 'ECE',
    semester: 3,
    credits: 4,
    type: 'Theory',
  },
  {
    id: 'SUB003',
    name: 'Thermodynamics',
    code: 'MECH303',
    department: 'MECH',
    semester: 3,
    credits: 4,
    type: 'Theory',
  },
];

// Mock Data for Courses
export const mockCourses: Course[] = [
  {
    id: 'CRS001',
    courseCode: 'CSE301',
    courseName: 'Data Structures',
    department: 'CSE',
    facultyEmail: 'rajesh.k@rgce.edu.in',
    hoursPerWeek: 4,
    semester: 3,
    year: 2023,
    yearSection: '3-A',
    avgAttendance: 85,
  },
  {
    id: 'CRS002',
    courseCode: 'ECE302',
    courseName: 'Signals and Systems',
    department: 'ECE',
    facultyEmail: 'priya.s@rgce.edu.in',
    hoursPerWeek: 4,
    semester: 3,
    year: 2023,
    yearSection: '3-B',
    avgAttendance: 78,
  },
  {
    id: 'CRS003',
    courseCode: 'MECH303',
    courseName: 'Thermodynamics',
    department: 'MECH',
    facultyEmail: 'arvind.p@rgce.edu.in',
    hoursPerWeek: 4,
    semester: 3,
    year: 2023,
    yearSection: '3-C',
    avgAttendance: 92,
  },
];

// Mock Data for Time Slots
export const timeSlots: TimeSlot[] = [
  { id: 'TS001', startTime: '09:00', endTime: '09:50', period: 1 },
  { id: 'TS002', startTime: '10:00', endTime: '10:50', period: 2 },
  { id: 'TS003', startTime: '11:00', endTime: '11:50', period: 3 },
  { id: 'TS004', startTime: '12:00', endTime: '12:50', period: 4 },
  { id: 'TS005', startTime: '14:00', endTime: '14:50', period: 5 },
  { id: 'TS006', startTime: '15:00', endTime: '15:50', period: 6 },
  { id: 'TS007', startTime: '16:00', endTime: '16:50', period: 7 },
  { id: 'TS008', startTime: '17:00', endTime: '17:50', period: 8 },
];

// Mock Data for Timetable Entries
export const mockTimetable: TimetableEntry[] = [
  {
    id: 'TT001',
    dayOfWeek: 1,
    timeSlot: timeSlots[0],
    subjectId: 'SUB001',
    facultyId: 'FAC001',
    classroomId: 'CR001',
    course: 'B.Tech CSE',
    semester: 3,
    year: 2023,
  },
  {
    id: 'TT002',
    dayOfWeek: 2,
    timeSlot: timeSlots[1],
    subjectId: 'SUB002',
    facultyId: 'FAC002',
    classroomId: 'CR002',
    course: 'B.Tech ECE',
    semester: 3,
    year: 2023,
  },
  {
    id: 'TT003',
    dayOfWeek: 3,
    timeSlot: timeSlots[2],
    subjectId: 'SUB003',
    facultyId: 'FAC003',
    classroomId: 'CR003',
    course: 'B.Tech MECH',
    semester: 3,
    year: 2023,
  },
];

// Mock Data for Classrooms
export const mockClassrooms: Classroom[] = [
  {
    id: 'CR001',
    name: 'Lecture Hall 101',
    capacity: 60,
    type: 'Lecture Hall',
    building: 'Academic Block A',
    floor: 1,
    facilities: ['Projector', 'Whiteboard', 'Audio System'],
  },
  {
    id: 'CR002',
    name: 'Electronics Lab 201',
    capacity: 30,
    type: 'Lab',
    building: 'Technical Block B',
    floor: 2,
    facilities: ['Oscilloscopes', 'Function Generators', 'Power Supplies'],
  },
  {
    id: 'CR003',
    name: 'Mechanical Workshop 102',
    capacity: 40,
    type: 'Lab',
    building: 'Workshop Block C',
    floor: 1,
    facilities: ['Lathe Machines', 'Milling Machines', 'Welding Equipment'],
  },
];

// Mock Data for Attendance Records
export const mockAttendance: AttendanceRecord[] = [
  {
    id: 'ATT001',
    studentId: 'STU001',
    courseCode: 'CSE301',
    date: '2024-06-20',
    hourNumber: 1,
    status: 'Present',
    facultyId: 'FAC001',
    markedAt: '2024-06-20T09:15:00',
    markedBy: 'FAC001',
    academicYear: '2024-25',
  },
  {
    id: 'ATT002',
    studentId: 'STU002',
    courseCode: 'ECE302',
    date: '2024-06-20',
    hourNumber: 2,
    status: 'Absent',
    facultyId: 'FAC002',
    markedAt: '2024-06-20T10:10:00',
    markedBy: 'FAC002',
    academicYear: '2024-25',
  },
  {
    id: 'ATT003',
    studentId: 'STU003',
    courseCode: 'MECH303',
    date: '2024-06-20',
    hourNumber: 3,
    status: 'Present',
    facultyId: 'FAC003',
    markedAt: '2024-06-20T11:12:00',
    markedBy: 'FAC003',
    academicYear: '2024-25',
  },
  {
    id: 'ATT004',
    studentId: 'STU001',
    courseCode: 'CSE301',
    date: '2024-06-20',
    hourNumber: 2,
    status: 'Leave',
    facultyId: 'FAC001',
    markedAt: '2024-06-20T10:18:00',
    markedBy: 'FAC001',
    academicYear: '2024-25',
  },
  {
    id: 'ATT005',
    studentId: 'STU002',
    courseCode: 'ECE302',
    date: '2024-06-20',
    hourNumber: 1,
    status: 'Present',
    facultyId: 'FAC002',
    markedAt: '2024-06-20T09:25:00',
    markedBy: 'FAC002',
    academicYear: '2024-25',
  },
  {
    id: 'ATT006',
    studentId: 'STU003',
    courseCode: 'MECH303',
    date: '2024-06-20',
    hourNumber: 4,
    status: 'Absent',
    facultyId: 'FAC003',
    markedAt: '2024-06-20T12:20:00',
    markedBy: 'FAC003',
    academicYear: '2024-25',
  },
];

// Mock Data for Leave Requests
export const mockLeaves: LeaveRequest[] = [
  {
    id: 'LV001',
    studentId: 'STU001',
    fromDate: '2024-07-01',
    toDate: '2024-07-03',
    reason: 'Medical appointment',
    facultyApproval: 'Approved',
    hodApproval: 'Pending',
    finalStatus: 'Pending',
    approvedBy: 'rajesh.k@rgce.edu.in',
    requestedOn: '2024-06-20T14:00:00',
    courseCode: 'CSE301',
  },
  {
    id: 'LV002',
    studentId: 'STU002',
    fromDate: '2024-07-05',
    toDate: '2024-07-05',
    reason: 'Family function',
    facultyApproval: 'Pending',
    hodApproval: 'Pending',
    finalStatus: 'Pending',
    requestedOn: '2024-06-20T15:00:00',
    courseCode: 'ECE302',
  },
  {
    id: 'LV003',
    studentId: 'STU003',
    fromDate: '2024-07-10',
    toDate: '2024-07-12',
    reason: 'Personal reasons',
    facultyApproval: 'Approved',
    hodApproval: 'Approved',
    finalStatus: 'Approved',
    approvedBy: 'arvind.p@rgce.edu.in',
    requestedOn: '2024-06-20T16:00:00',
    courseCode: 'MECH303',
  },
];

// Mock Data for Fee Records
export const mockFeeRecords: FeeRecord[] = [
  {
    id: 'FR001',
    studentId: 'STU001',
    feeType: 'Tuition Fee',
    amount: 50000,
    dueDate: '2024-07-31',
    paidDate: '2024-06-15',
    status: 'Paid',
    semester: 1,
    academicYear: '2024-25',
    paymentMethod: 'Online',
    receiptNumber: 'RCPT001',
  },
  {
    id: 'FR002',
    studentId: 'STU002',
    feeType: 'Exam Fee',
    amount: 5000,
    dueDate: '2024-07-31',
    paidDate: null,
    status: 'Pending',
    semester: 1,
    academicYear: '2024-25',
    paymentMethod: null,
    receiptNumber: null,
  },
  {
    id: 'FR003',
    studentId: 'STU003',
    feeType: 'Library Fee',
    amount: 1000,
    dueDate: '2024-07-31',
    paidDate: '2024-06-20',
    status: 'Paid',
    semester: 1,
    academicYear: '2024-25',
    paymentMethod: 'Cash',
    receiptNumber: 'RCPT003',
  },
  {
    id: 'FR004',
    studentId: 'STU004',
    feeType: 'Tuition Fee',
    amount: 50000,
    dueDate: '2024-06-30',
    paidDate: null,
    status: 'Overdue',
    semester: 1,
    academicYear: '2024-25',
    paymentMethod: null,
    receiptNumber: null,
  },
];

// Mock Data for Exam Records
export const mockExamRecords: ExamRecord[] = [
  {
    id: 'ER001',
    studentId: 'STU001',
    subject: 'Data Structures',
    subjectId: 'SUB001',
    examType: 'Mid-term',
    marksObtained: 45,
    totalMarks: 50,
    examDate: '2024-06-15',
    grade: 'A',
    percentage: 90,
    remarks: 'Excellent',
  },
  {
    id: 'ER002',
    studentId: 'STU002',
    subject: 'Signals and Systems',
    subjectId: 'SUB002',
    examType: 'Mid-term',
    marksObtained: 35,
    totalMarks: 50,
    examDate: '2024-06-16',
    grade: 'B',
    percentage: 70,
    remarks: 'Good',
  },
  {
    id: 'ER003',
    studentId: 'STU003',
    subject: 'Thermodynamics',
    subjectId: 'SUB003',
    examType: 'Mid-term',
    marksObtained: 40,
    totalMarks: 50,
    examDate: '2024-06-17',
    grade: 'A',
    percentage: 80,
    remarks: 'Very Good',
  },
  {
    id: 'ER004',
    studentId: 'STU004',
    subject: 'Data Structures',
    subjectId: 'SUB001',
    examType: 'Assignment',
    marksObtained: 18,
    totalMarks: 25,
    examDate: '2024-06-10',
    grade: 'B+',
    percentage: 72,
    remarks: 'Good work',
  },
  {
    id: 'ER005',
    studentId: 'STU005',
    subject: 'Signals and Systems',
    subjectId: 'SUB002',
    examType: 'Quiz',
    marksObtained: 8,
    totalMarks: 10,
    examDate: '2024-06-12',
    grade: 'A',
    percentage: 80,
    remarks: 'Well done',
  },
];

// Export aliases for backward compatibility
export const mockFees = mockFeeRecords;
export const mockExams = mockExamRecords;

// Mock Data for Users
export const mockUsers: User[] = [
  {
    id: 'USR001',
    name: 'Admin User',
    email: 'admin@rgce.edu.in',
    role: 'admin',
    department: 'ADMIN',
    permissions: ['read', 'write', 'delete'],
    isActive: true,
    lastLogin: '2024-06-20T10:00:00',
    createdAt: '2024-01-01T00:00:00',
  },
  {
    id: 'USR002',
    name: 'Student Alice',
    email: 'alice.j@rgce.edu.in',
    role: 'student',
    department: 'CSE',
    studentId: 'STU001',
  },
  {
    id: 'USR003',
    name: 'Faculty Rajesh',
    email: 'rajesh.k@rgce.edu.in',
    role: 'faculty',
    department: 'CSE',
    facultyId: 'FAC001',
  },
];

// Mock System Settings
export const mockSystemSettings: SystemSettings = {
  attendanceThreshold: 75,
  semesterStartDate: '2024-08-01',
  semesterEndDate: '2024-12-15',
  hoursPerDay: 8,
  workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  emailDomain: '@rgce.edu.in'
};

// AttendanceCalculator class for calculating attendance statistics
export class AttendanceCalculator {
  private attendanceRecords: AttendanceRecord[];
  private students: Student[];
  private courses: Course[];
  private leaves: LeaveRequest[];
  private systemSettings: SystemSettings;

  constructor(
    attendanceRecords: AttendanceRecord[],
    students: Student[],
    courses: Course[],
    leaves: LeaveRequest[],
    systemSettings: SystemSettings
  ) {
    this.attendanceRecords = attendanceRecords;
    this.students = students;
    this.courses = courses;
    this.leaves = leaves;
    this.systemSettings = systemSettings;
  }

  calculateDepartmentStats(department: Department) {
    const deptStudents = this.students.filter(s => s.department === department);
    const deptCourses = this.courses.filter(c => c.department === department);
    const deptFaculty = mockFaculty.filter(f => f.department === department);

    const totalStudents = deptStudents.length;
    const activeFaculty = deptFaculty.length;
    const totalCourses = deptCourses.length;

    const avgAttendance = Math.round(
      deptStudents.reduce((sum, student) => 
        sum + (student.attendancePercentage || 0), 0
      ) / totalStudents
    );

    const atRiskStudents = deptStudents.filter(s => 
      (s.attendancePercentage || 0) < this.systemSettings.attendanceThreshold
    ).length;

    return {
      department,
      totalStudents,
      activeFaculty,
      totalCourses,
      avgAttendance,
      atRiskStudents
    };
  }

  calculateStudentAttendance(studentId: string) {
    const student = this.students.find(s => s.id === studentId);
    if (!student) {
      return {
        attendancePercentage: 0,
        presentClasses: 0,
        absentClasses: 0,
        leaveClasses: 0,
        totalClasses: 0
      };
    }

    const studentRecords = this.attendanceRecords.filter(r => r.studentId === studentId);
    const studentLeaves = this.leaves.filter(l => l.studentId === studentId && l.finalStatus === 'Approved');

    const presentClasses = studentRecords.filter(r => r.status === 'Present').length;
    const absentClasses = studentRecords.filter(r => r.status === 'Absent').length;
    const leaveClasses = studentLeaves.length;
    const totalClasses = presentClasses + absentClasses + leaveClasses;

    const attendancePercentage = totalClasses > 0 
      ? Math.round(((presentClasses + leaveClasses) / totalClasses) * 100)
      : 0;

    return {
      attendancePercentage,
      presentClasses,
      absentClasses,
      leaveClasses,
      totalClasses
    };
  }

  getAtRiskStudents(department?: Department) {
    const studentsToCheck = department 
      ? this.students.filter(s => s.department === department)
      : this.students;

    return studentsToCheck.filter(student => 
      (student.attendancePercentage || 0) < this.systemSettings.attendanceThreshold
    );
  }
}

// Mock Data for Attendance Stats
export const calculateAttendanceStats = (studentId: string): AttendanceStats => {
  const studentAttendance = mockAttendance.filter(a => a.studentId === studentId);
  const totalClasses = studentAttendance.length;
  const presentClasses = studentAttendance.filter(a => a.status === 'Present').length;
  const absentClasses = studentAttendance.filter(a => a.status === 'Absent').length;
  const leaveClasses = studentAttendance.filter(a => a.status === 'Leave').length;
  
  const attendancePercentage = totalClasses > 0 ? 
    Math.round(((presentClasses + leaveClasses) / totalClasses) * 100) : 0;

  // Mock course-wise data
  const courseWiseAttendance = [
    {
      courseCode: 'CSE301',
      courseName: 'Data Structures',
      totalHours: Math.floor(totalClasses / 2),
      presentHours: Math.floor(presentClasses / 2),
      percentage: Math.round(Math.random() * 20 + 75)
    },
    {
      courseCode: 'CSE302', 
      courseName: 'Database Management',
      totalHours: Math.floor(totalClasses / 2),
      presentHours: Math.floor(presentClasses / 2),
      percentage: Math.round(Math.random() * 20 + 75)
    }
  ];

  const subjectWiseAttendance = courseWiseAttendance.map(course => ({
    subject: course.courseName,
    percentage: course.percentage
  }));

  return {
    totalClasses,
    presentClasses,
    absentClasses,
    leaveClasses,
    attendancePercentage,
    courseWiseAttendance,
    subjectWiseAttendance,
    isAtRisk: attendancePercentage < 75
  };
};
