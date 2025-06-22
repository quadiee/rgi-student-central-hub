import {
  Student,
  Faculty,
  Subject,
  TimeSlot,
  TimetableEntry,
  Classroom,
  AttendanceRecord,
  AttendanceStats,
  FeeRecord,
  ExamRecord,
  User,
} from '../types';

export const mockUsers: User[] = [
  {
    id: '1',
    name: 'Admin User',
    email: 'admin@college.edu',
    role: 'admin',
    profileImage: 'https://i.pravatar.cc/150?img=10'
  },
  {
    id: '2',
    name: 'Dr. Smith',
    email: 'smith@college.edu',
    role: 'faculty',
    profileImage: 'https://i.pravatar.cc/150?img=6'
  },
  {
    id: '3',
    name: 'Alice Johnson',
    email: 'alice.j@college.edu',
    role: 'student',
    studentId: 'std1',
    profileImage: 'https://i.pravatar.cc/150?img=1'
  }
];

export const mockStudents: Student[] = [
  {
    id: 'std1',
    name: 'Alice Johnson',
    rollNumber: '2021001',
    course: 'Computer Science',
    year: 3,
    semester: 5,
    email: 'alice.j@example.com',
    phone: '123-456-7890',
    profileImage: 'https://i.pravatar.cc/150?img=1',
    admissionDate: '2021-08-15',
    guardianName: 'Robert Johnson',
    guardianPhone: '123-456-7891',
    address: '123 Highland, Anytown',
    bloodGroup: 'O+',
    emergencyContact: '987-654-3210',
  },
  {
    id: 'std2',
    name: 'Bob Smith',
    rollNumber: '2021002',
    course: 'Electrical Engineering',
    year: 3,
    semester: 5,
    email: 'bob.s@example.com',
    phone: '234-567-8901',
    profileImage: 'https://i.pravatar.cc/150?img=2',
    admissionDate: '2021-08-16',
    guardianName: 'Linda Smith',
    guardianPhone: '234-567-8902',
    address: '456 Lowland, Anytown',
    bloodGroup: 'A-',
    emergencyContact: '876-543-2109',
  },
  {
    id: 'std3',
    name: 'Charlie Brown',
    rollNumber: '2021003',
    course: 'Mechanical Engineering',
    year: 3,
    semester: 5,
    email: 'charlie.b@example.com',
    phone: '345-678-9012',
    profileImage: 'https://i.pravatar.cc/150?img=3',
    admissionDate: '2021-08-17',
    guardianName: 'Patricia Brown',
    guardianPhone: '345-678-9013',
    address: '789 Midlane, Anytown',
    bloodGroup: 'B+',
    emergencyContact: '765-432-1098',
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
  },
];

export const mockFaculty: Faculty[] = [
  {
    id: 'fac1',
    name: 'Dr. Smith',
    email: 'smith@example.com',
    phone: '111-222-3333',
    department: 'Computer Science',
    designation: 'Professor',
    employeeId: 'EMP001',
    subjects: ['sub1', 'sub2'],
    profileImage: 'https://i.pravatar.cc/150?img=6',
  },
  {
    id: 'fac2',
    name: 'Dr. Jones',
    email: 'jones@example.com',
    phone: '222-333-4444',
    department: 'Electrical Engineering',
    designation: 'Associate Professor',
    employeeId: 'EMP002',
    subjects: ['sub3', 'sub4'],
    profileImage: 'https://i.pravatar.cc/150?img=7',
  },
  {
    id: 'fac3',
    name: 'Dr. Williams',
    email: 'williams@example.com',
    phone: '333-444-5555',
    department: 'Mechanical Engineering',
    designation: 'Assistant Professor',
    employeeId: 'EMP003',
    subjects: ['sub5'],
    profileImage: 'https://i.pravatar.cc/150?img=8',
  },
];

export const mockSubjects: Subject[] = [
  {
    id: 'sub1',
    name: 'Data Structures',
    code: 'CS201',
    department: 'Computer Science',
    semester: 3,
    credits: 4,
    type: 'Theory',
  },
  {
    id: 'sub2',
    name: 'Database Management',
    code: 'CS301',
    department: 'Computer Science',
    semester: 5,
    credits: 4,
    type: 'Theory',
  },
  {
    id: 'sub3',
    name: 'Circuit Analysis',
    code: 'EE201',
    department: 'Electrical Engineering',
    semester: 3,
    credits: 3,
    type: 'Theory',
  },
  {
    id: 'sub4',
    name: 'Power Systems',
    code: 'EE301',
    department: 'Electrical Engineering',
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

export const timeSlots: TimeSlot[] = [
  { id: 'ts1', startTime: '9:00 AM', endTime: '10:00 AM', period: 1 },
  { id: 'ts2', startTime: '10:00 AM', endTime: '11:00 AM', period: 2 },
  { id: 'ts3', startTime: '11:00 AM', endTime: '12:00 PM', period: 3 },
  { id: 'ts4', startTime: '1:00 PM', endTime: '2:00 PM', period: 4 },
  { id: 'ts5', startTime: '2:00 PM', endTime: '3:00 PM', period: 5 },
];

export const mockTimetable: TimetableEntry[] = [
  {
    id: 'tt1',
    dayOfWeek: 1, // Monday
    timeSlot: timeSlots[0],
    subjectId: 'sub1',
    facultyId: 'fac1',
    classroomId: 'cr1',
    course: 'Computer Science',
    semester: 5,
    year: 3,
  },
  {
    id: 'tt2',
    dayOfWeek: 1, // Monday
    timeSlot: timeSlots[1],
    subjectId: 'sub2',
    facultyId: 'fac1',
    classroomId: 'cr2',
    course: 'Computer Science',
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
    name: 'Room 101',
    capacity: 60,
    type: 'Lecture Hall',
    building: 'A',
    floor: 1,
    facilities: ['Projector', 'Whiteboard'],
  },
  {
    id: 'cr2',
    name: 'Lab A',
    capacity: 30,
    type: 'Lab',
    building: 'B',
    floor: 2,
    facilities: ['Computers', 'Equipment'],
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

export const mockAttendance: AttendanceRecord[] = [
  {
    id: 'att1',
    studentId: 'std1',
    subject: 'Data Structures',
    subjectId: 'sub1',
    date: '2024-06-20',
    timeSlot: '9:00 AM',
    period: 1,
    status: 'Present',
    faculty: 'Dr. Smith',
    facultyId: 'fac1',
    markedAt: '2024-06-20T09:05:00',
    markedBy: 'fac1',
    className: 'CS301',
    academicYear: '2024',
  },
  {
    id: 'att2',
    studentId: 'std2',
    subject: 'Database Management',
    subjectId: 'sub2',
    date: '2024-06-20',
    timeSlot: '10:00 AM',
    period: 2,
    status: 'Absent',
    faculty: 'Dr. Smith',
    facultyId: 'fac1',
    markedAt: '2024-06-20T10:10:00',
    markedBy: 'fac1',
    className: 'CS301',
    academicYear: '2024',
  },
  {
    id: 'att3',
    studentId: 'std3',
    subject: 'Thermodynamics',
    subjectId: 'sub5',
    date: '2024-06-20',
    timeSlot: '9:00 AM',
    period: 1,
    status: 'Late',
    faculty: 'Dr. Williams',
    facultyId: 'fac3',
    markedAt: '2024-06-20T09:15:00',
    markedBy: 'fac3',
    className: 'ME201',
    academicYear: '2024',
  },
  {
    id: 'att4',
    studentId: 'std4',
    subject: 'Circuit Analysis',
    subjectId: 'sub3',
    date: '2024-06-20',
    timeSlot: '10:00 AM',
    period: 2,
    status: 'Present',
    faculty: 'Dr. Jones',
    facultyId: 'fac2',
    markedAt: '2024-06-20T10:05:00',
    markedBy: 'fac2',
    className: 'EE201',
    academicYear: '2024',
  },
  {
    id: 'att5',
    studentId: 'std5',
    subject: 'Power Systems',
    subjectId: 'sub4',
    date: '2024-06-20',
    timeSlot: '2:00 PM',
    period: 5,
    status: 'Present',
    faculty: 'Dr. Jones',
    facultyId: 'fac2',
    markedAt: '2024-06-20T14:05:00',
    markedBy: 'fac2',
    className: 'EE301',
    academicYear: '2024',
  },
];

export const calculateAttendanceStats = (studentId: string): AttendanceStats => {
  const studentAttendance = mockAttendance.filter(record => record.studentId === studentId);
  const totalClasses = studentAttendance.length;
  const presentClasses = studentAttendance.filter(record => record.status === 'Present').length;
  const absentClasses = studentAttendance.filter(record => record.status === 'Absent').length;
  const lateClasses = studentAttendance.filter(record => record.status === 'Late').length;

  const attendancePercentage = totalClasses > 0 ? Math.round((presentClasses + lateClasses) / totalClasses * 100) : 0;

  const subjectWiseAttendance = mockSubjects.map(subject => {
    const subjectAttendance = studentAttendance.filter(record => record.subjectId === subject.id);
    const subjectTotal = subjectAttendance.length;
    const subjectPresent = subjectAttendance.filter(record => record.status === 'Present').length;
    const percentage = subjectTotal > 0 ? Math.round(subjectPresent / subjectTotal * 100) : 0;

    return {
      subjectId: subject.id,
      subjectName: subject.name,
      totalClasses: subjectTotal,
      presentClasses: subjectPresent,
      percentage: percentage,
    };
  });

  return {
    totalClasses,
    presentClasses,
    absentClasses,
    lateClasses,
    attendancePercentage,
    subjectWiseAttendance,
  };
};

export const mockFees: FeeRecord[] = [
  {
    id: 'fee1',
    studentId: 'std1',
    feeType: 'Tuition Fee',
    amount: 45000,
    dueDate: '2024-07-15',
    paidDate: '2024-07-10',
    status: 'Paid',
    semester: 5,
    academicYear: '2024-25',
    paymentMethod: 'Online',
    receiptNumber: 'RCT001'
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
    subject: 'Data Structures',
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

// Keep the old exports for backward compatibility
export const mockFeeRecords = mockFees;
export const mockExamRecords = mockExams;
