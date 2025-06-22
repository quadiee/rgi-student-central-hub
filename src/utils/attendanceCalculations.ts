
import { 
  AttendanceRecord, 
  Student, 
  Course, 
  AttendanceStats, 
  LeaveRequest,
  SystemSettings 
} from '../types';

export class AttendanceCalculator {
  private attendanceRecords: AttendanceRecord[];
  private students: Student[];
  private courses: Course[];
  private leaves: LeaveRequest[];
  private settings: SystemSettings;

  constructor(
    attendanceRecords: AttendanceRecord[],
    students: Student[],
    courses: Course[],
    leaves: LeaveRequest[],
    settings: SystemSettings
  ) {
    this.attendanceRecords = attendanceRecords;
    this.students = students;
    this.courses = courses;
    this.leaves = leaves;
    this.settings = settings;
  }

  // Calculate individual student attendance percentage
  calculateStudentAttendance(studentId: string): AttendanceStats {
    const student = this.students.find(s => s.id === studentId);
    if (!student) {
      throw new Error(`Student with ID ${studentId} not found`);
    }

    const studentAttendance = this.attendanceRecords.filter(
      record => record.studentId === studentId
    );

    const totalClasses = studentAttendance.length;
    const presentClasses = studentAttendance.filter(
      record => record.status === 'Present'
    ).length;
    const absentClasses = studentAttendance.filter(
      record => record.status === 'Absent'
    ).length;
    const leaveClasses = studentAttendance.filter(
      record => record.status === 'Leave'
    ).length;

    // Attendance percentage includes both present and leave
    const attendancePercentage = totalClasses > 0 ? 
      Math.round(((presentClasses + leaveClasses) / totalClasses) * 100) : 0;

    // Calculate course-wise attendance
    const studentCourses = this.courses.filter(
      course => course.department === student.department && 
                course.year === student.year
    );

    const courseWiseAttendance = studentCourses.map(course => {
      const courseAttendance = studentAttendance.filter(
        record => record.courseCode === course.courseCode
      );
      const courseTotal = courseAttendance.length;
      const coursePresent = courseAttendance.filter(
        record => record.status === 'Present' || record.status === 'Leave'
      ).length;
      const percentage = courseTotal > 0 ? 
        Math.round((coursePresent / courseTotal) * 100) : 0;

      return {
        courseCode: course.courseCode,
        courseName: course.courseName,
        totalHours: courseTotal,
        presentHours: coursePresent,
        percentage: percentage,
      };
    });

    // Calculate subject-wise attendance (similar to course-wise but grouped differently)
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
      isAtRisk: attendancePercentage < this.settings.attendanceThreshold,
    };
  }

  // Calculate course average attendance
  calculateCourseAverage(courseCode: string): number {
    const courseAttendance = this.attendanceRecords.filter(
      record => record.courseCode === courseCode
    );
    
    if (courseAttendance.length === 0) return 0;

    // Get unique students for this course
    const studentIds = [...new Set(courseAttendance.map(record => record.studentId))];
    
    const studentAttendances = studentIds.map(studentId => {
      const studentCourseAttendance = courseAttendance.filter(
        record => record.studentId === studentId
      );
      const total = studentCourseAttendance.length;
      const present = studentCourseAttendance.filter(
        record => record.status === 'Present' || record.status === 'Leave'
      ).length;
      return total > 0 ? (present / total) * 100 : 0;
    });

    return Math.round(
      studentAttendances.reduce((sum, att) => sum + att, 0) / studentAttendances.length
    );
  }

  // Get at-risk students (below threshold)
  getAtRiskStudents(department?: string): Student[] {
    let studentsToCheck = this.students;
    
    if (department) {
      studentsToCheck = this.students.filter(s => s.department === department);
    }

    return studentsToCheck.filter(student => {
      const stats = this.calculateStudentAttendance(student.id);
      return stats.isAtRisk;
    });
  }

  // Calculate department-wise statistics
  calculateDepartmentStats(department: string) {
    const deptStudents = this.students.filter(s => s.department === department);
    const deptCourses = this.courses.filter(c => c.department === department);
    
    const totalStudents = deptStudents.length;
    const atRiskStudents = this.getAtRiskStudents(department).length;
    
    // Calculate average attendance for department
    const attendancePercentages = deptStudents.map(student => 
      this.calculateStudentAttendance(student.id).attendancePercentage
    );
    
    const avgAttendance = attendancePercentages.length > 0 ?
      Math.round(attendancePercentages.reduce((sum, att) => sum + att, 0) / attendancePercentages.length) : 0;

    return {
      department,
      totalStudents,
      avgAttendance,
      atRiskStudents,
      totalCourses: deptCourses.length,
      activeFaculty: [...new Set(deptCourses.map(c => c.facultyEmail))].length
    };
  }

  // Validate leave request dates
  validateLeaveRequest(leave: Partial<LeaveRequest>): string[] {
    const errors: string[] = [];
    
    if (!leave.fromDate || !leave.toDate) {
      errors.push('From date and to date are required');
      return errors;
    }

    const fromDate = new Date(leave.fromDate);
    const toDate = new Date(leave.toDate);
    const today = new Date();
    
    if (fromDate > toDate) {
      errors.push('From date cannot be after to date');
    }
    
    if (fromDate < today) {
      errors.push('Cannot request leave for past dates');
    }
    
    const daysDiff = Math.ceil((toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24));
    if (daysDiff > 7) {
      errors.push('Leave requests cannot exceed 7 days');
    }
    
    if (!leave.reason || leave.reason.trim().length < 10) {
      errors.push('Reason must be at least 10 characters long');
    }

    return errors;
  }

  // Generate attendance records for approved leaves
  createLeaveAttendanceRecords(leave: LeaveRequest): AttendanceRecord[] {
    const records: AttendanceRecord[] = [];
    const fromDate = new Date(leave.fromDate);
    const toDate = new Date(leave.toDate);
    
    // Get student's courses
    const student = this.students.find(s => s.id === leave.studentId);
    if (!student) return records;
    
    const studentCourses = this.courses.filter(
      course => course.department === student.department && 
                course.year === student.year
    );

    // Create records for each day and each hour of each course
    for (let date = new Date(fromDate); date <= toDate; date.setDate(date.getDate() + 1)) {
      const dateStr = date.toISOString().split('T')[0];
      
      // Skip weekends (assuming working days are Mon-Sat)
      const dayOfWeek = date.getDay();
      if (dayOfWeek === 0) continue; // Skip Sunday
      
      studentCourses.forEach(course => {
        for (let hour = 1; hour <= course.hoursPerWeek; hour++) {
          records.push({
            id: `leave_${leave.id}_${course.courseCode}_${dateStr}_${hour}`,
            studentId: leave.studentId,
            courseCode: course.courseCode,
            date: dateStr,
            hourNumber: hour,
            status: 'Leave',
            facultyId: course.facultyEmail, // This should be mapped to faculty ID
            markedAt: new Date().toISOString(),
            markedBy: leave.approvedBy || 'system',
            academicYear: '2024-25' // This should be dynamic
          });
        }
      });
    }
    
    return records;
  }
}
