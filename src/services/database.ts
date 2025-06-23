// Database service layer for CRUD operations
export interface DatabaseService {
  // Users
  getUsers(): Promise<any[]>;
  createUser(user: any): Promise<any>;
  updateUser(id: string, user: any): Promise<any>;
  deleteUser(id: string): Promise<void>;

  // Students
  getStudents(filters?: any): Promise<any[]>;
  createStudent(student: any): Promise<any>;
  updateStudent(id: string, student: any): Promise<any>;
  deleteStudent(id: string): Promise<void>;

  // Courses
  getCourses(filters?: any): Promise<any[]>;
  createCourse(course: any): Promise<any>;
  updateCourse(id: string, course: any): Promise<any>;
  deleteCourse(id: string): Promise<void>;

  // Attendance
  getAttendance(filters?: any): Promise<any[]>;
  createAttendance(attendance: any): Promise<any>;
  batchCreateAttendance(records: any[]): Promise<any[]>;
  updateAttendance(id: string, attendance: any): Promise<any>;
  deleteAttendance(id: string): Promise<void>;

  // Leaves
  getLeaves(filters?: any): Promise<any[]>;
  createLeave(leave: any): Promise<any>;
  updateLeave(id: string, leave: any): Promise<any>;
  deleteLeave(id: string): Promise<void>;

  // Fees
  getFeeRecords(filters?: any): Promise<any[]>;
  createFeeRecord(feeRecord: any): Promise<any>;
  updateFeeRecord(id: string, feeRecord: any): Promise<any>;
  deleteFeeRecord(id: string): Promise<void>;
}

// Mock implementation (to be replaced with actual database)
class MockDatabaseService implements DatabaseService {
  private users: any[] = [];
  private students: any[] = [];
  private courses: any[] = [];
  private attendance: any[] = [];
  private leaves: any[] = [];

  async getUsers(): Promise<any[]> {
    return this.users;
  }

  async createUser(user: any): Promise<any> {
    const newUser = { ...user, id: Date.now().toString() };
    this.users.push(newUser);
    return newUser;
  }

  async updateUser(id: string, user: any): Promise<any> {
    const index = this.users.findIndex(u => u.id === id);
    if (index !== -1) {
      this.users[index] = { ...this.users[index], ...user };
      return this.users[index];
    }
    throw new Error('User not found');
  }

  async deleteUser(id: string): Promise<void> {
    this.users = this.users.filter(u => u.id !== id);
  }

  async getStudents(filters?: any): Promise<any[]> {
    let result = this.students;
    if (filters?.department) {
      result = result.filter(s => s.department === filters.department);
    }
    return result;
  }

  async createStudent(student: any): Promise<any> {
    const newStudent = { ...student, id: Date.now().toString() };
    this.students.push(newStudent);
    return newStudent;
  }

  async updateStudent(id: string, student: any): Promise<any> {
    const index = this.students.findIndex(s => s.id === id);
    if (index !== -1) {
      this.students[index] = { ...this.students[index], ...student };
      return this.students[index];
    }
    throw new Error('Student not found');
  }

  async deleteStudent(id: string): Promise<void> {
    this.students = this.students.filter(s => s.id !== id);
  }

  async getCourses(filters?: any): Promise<any[]> {
    let result = this.courses;
    if (filters?.department) {
      result = result.filter(c => c.department === filters.department);
    }
    return result;
  }

  async createCourse(course: any): Promise<any> {
    const newCourse = { ...course, id: Date.now().toString() };
    this.courses.push(newCourse);
    return newCourse;
  }

  async updateCourse(id: string, course: any): Promise<any> {
    const index = this.courses.findIndex(c => c.id === id);
    if (index !== -1) {
      this.courses[index] = { ...this.courses[index], ...course };
      return this.courses[index];
    }
    throw new Error('Course not found');
  }

  async deleteCourse(id: string): Promise<void> {
    this.courses = this.courses.filter(c => c.id !== id);
  }

  async getAttendance(filters?: any): Promise<any[]> {
    let result = this.attendance;
    if (filters?.studentId) {
      result = result.filter(a => a.studentId === filters.studentId);
    }
    if (filters?.courseCode) {
      result = result.filter(a => a.courseCode === filters.courseCode);
    }
    if (filters?.date) {
      result = result.filter(a => a.date === filters.date);
    }
    return result;
  }

  async createAttendance(attendance: any): Promise<any> {
    const newAttendance = { ...attendance, id: Date.now().toString() };
    this.attendance.push(newAttendance);
    return newAttendance;
  }

  async batchCreateAttendance(records: any[]): Promise<any[]> {
    const newRecords = records.map(record => ({
      ...record,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9)
    }));
    this.attendance.push(...newRecords);
    return newRecords;
  }

  async updateAttendance(id: string, attendance: any): Promise<any> {
    const index = this.attendance.findIndex(a => a.id === id);
    if (index !== -1) {
      this.attendance[index] = { ...this.attendance[index], ...attendance };
      return this.attendance[index];
    }
    throw new Error('Attendance record not found');
  }

  async deleteAttendance(id: string): Promise<void> {
    this.attendance = this.attendance.filter(a => a.id !== id);
  }

  async getLeaves(filters?: any): Promise<any[]> {
    let result = this.leaves;
    if (filters?.studentId) {
      result = result.filter(l => l.studentId === filters.studentId);
    }
    if (filters?.status) {
      result = result.filter(l => l.finalStatus === filters.status);
    }
    return result;
  }

  async createLeave(leave: any): Promise<any> {
    const newLeave = { 
      ...leave, 
      id: Date.now().toString(),
      requestedOn: new Date().toISOString(),
      facultyApproval: 'Pending',
      hodApproval: 'Pending'
    };
    this.leaves.push(newLeave);
    return newLeave;
  }

  async updateLeave(id: string, leave: any): Promise<any> {
    const index = this.leaves.findIndex(l => l.id === id);
    if (index !== -1) {
      this.leaves[index] = { ...this.leaves[index], ...leave };
      return this.leaves[index];
    }
    throw new Error('Leave request not found');
  }

  async deleteLeave(id: string): Promise<void> {
    this.leaves = this.leaves.filter(l => l.id !== id);
  }

  async getFeeRecords(filters?: any): Promise<any[]> {
    // Mock fee records
    const mockFeeRecords = [
      {
        id: '1',
        studentId: filters?.studentId || '1',
        feeType: 'Tuition Fee',
        amount: 50000,
        dueDate: '2024-07-15',
        paidDate: '2024-06-10',
        status: 'Paid',
        semester: 6,
        academicYear: '2023-24',
        paymentMethod: 'Online',
        receiptNumber: 'RCP001'
      },
      {
        id: '2',
        studentId: filters?.studentId || '1',
        feeType: 'Lab Fee',
        amount: 5000,
        dueDate: '2024-12-15',
        status: 'Pending',
        semester: 7,
        academicYear: '2024-25'
      },
      {
        id: '3',
        studentId: filters?.studentId || '1',
        feeType: 'Library Fee',
        amount: 2000,
        dueDate: '2024-12-15',
        status: 'Pending',
        semester: 7,
        academicYear: '2024-25'
      }
    ];

    let result = mockFeeRecords;
    
    if (filters?.studentId) {
      result = result.filter(f => f.studentId === filters.studentId);
    }
    if (filters?.department) {
      // Filter by department logic would go here
      result = result.filter(f => f.semester >= 1); // Placeholder
    }
    if (filters?.status) {
      result = result.filter(f => f.status === filters.status);
    }
    
    return result;
  }

  async createFeeRecord(feeRecord: any): Promise<any> {
    const newRecord = { ...feeRecord, id: Date.now().toString() };
    return newRecord;
  }

  async updateFeeRecord(id: string, feeRecord: any): Promise<any> {
    // Mock update
    return { ...feeRecord, id };
  }

  async deleteFeeRecord(id: string): Promise<void> {
    // Mock delete
    console.log(`Fee record ${id} deleted`);
  }
}

export const databaseService = new MockDatabaseService();
