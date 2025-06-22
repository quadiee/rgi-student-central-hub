
import { User, UserRole, Department, SystemSettings } from '../types';

export class RGCEValidator {
  private settings: SystemSettings;

  constructor(settings: SystemSettings) {
    this.settings = settings;
  }

  // Validate RGCE email format
  validateEmail(email: string): { isValid: boolean; error?: string } {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!emailRegex.test(email)) {
      return { isValid: false, error: 'Invalid email format' };
    }
    
    if (!email.endsWith(this.settings.emailDomain)) {
      return { 
        isValid: false, 
        error: `Email must be from RGCE domain (${this.settings.emailDomain})` 
      };
    }
    
    return { isValid: true };
  }

  // Validate user role and department combination
  validateUserRole(role: UserRole, department: Department): { isValid: boolean; error?: string } {
    // Principal and Admin can belong to ADMIN department
    if ((role === 'principal' || role === 'admin') && department !== 'ADMIN') {
      return { 
        isValid: false, 
        error: 'Principal and Admin roles must belong to ADMIN department' 
      };
    }

    // HOD must belong to an academic department
    if (role === 'hod' && department === 'ADMIN') {
      return { 
        isValid: false, 
        error: 'HOD role cannot belong to ADMIN department' 
      };
    }

    return { isValid: true };
  }

  // Check if user has permission for specific action
  hasPermission(user: User, requiredPermission: string): boolean {
    if (!user.isActive) return false;
    
    // Admin has all permissions
    if (user.role === 'admin' || user.permissions?.includes('all')) {
      return true;
    }

    // Principal has most permissions except admin-specific ones
    if (user.role === 'principal' && !['user_management', 'system_settings'].includes(requiredPermission)) {
      return true;
    }

    // Check specific permissions
    return user.permissions?.includes(requiredPermission) || false;
  }

  // Role-based permission matrix
  getRolePermissions(role: UserRole): string[] {
    switch (role) {
      case 'admin':
        return ['all'];
      case 'principal':
        return [
          'view_all_students', 'view_all_faculty', 'view_all_courses',
          'view_attendance_reports', 'view_department_stats',
          'approve_leaves', 'view_system_reports'
        ];
      case 'hod':
        return [
          'view_dept_students', 'view_dept_faculty', 'view_dept_courses',
          'manage_dept_attendance', 'approve_dept_leaves',
          'view_dept_reports', 'manage_dept_timetable'
        ];
      case 'faculty':
        return [
          'mark_attendance', 'view_assigned_courses', 'view_student_list',
          'approve_student_leaves', 'generate_attendance_reports',
          'view_course_analytics'
        ];
      case 'student':
        return [
          'view_own_attendance', 'view_own_courses', 'request_leave',
          'view_own_fees', 'view_own_exams', 'view_timetable'
        ];
      default:
        return [];
    }
  }

  // Validate department codes
  validateDepartment(department: string): boolean {
    const validDepartments: Department[] = ['CSE', 'ECE', 'MECH', 'CIVIL', 'EEE', 'IT', 'ADMIN'];
    return validDepartments.includes(department as Department);
  }

  // Validate roll number format for RGCE
  validateRollNumber(rollNumber: string, department: Department, year: number): { isValid: boolean; error?: string } {
    // Expected format: YYDEPTnnn (e.g., 21CSE001)
    const rollPattern = new RegExp(`^\\d{2}${department}\\d{3}$`);
    
    if (!rollPattern.test(rollNumber)) {
      return {
        isValid: false,
        error: `Roll number must follow format: YY${department}nnn (e.g., 21${department}001)`
      };
    }

    // Extract year from roll number and validate
    const rollYear = parseInt(`20${rollNumber.substring(0, 2)}`);
    const currentYear = new Date().getFullYear();
    const expectedYear = currentYear - year + 1;

    if (rollYear !== expectedYear) {
      return {
        isValid: false,
        error: `Roll number year (${rollYear}) doesn't match student's current year`
      };
    }

    return { isValid: true };
  }

  // Validate course code format
  validateCourseCode(courseCode: string, department: Department): { isValid: boolean; error?: string } {
    // Expected format: DEPTnnn (e.g., CSE301)
    const coursePattern = new RegExp(`^${department}\\d{3}$`);
    
    if (!coursePattern.test(courseCode)) {
      return {
        isValid: false,
        error: `Course code must follow format: ${department}nnn (e.g., ${department}301)`
      };
    }

    return { isValid: true };
  }

  // Validate academic year format
  validateAcademicYear(academicYear: string): { isValid: boolean; error?: string } {
    const yearPattern = /^\d{4}-\d{2}$/;
    
    if (!yearPattern.test(academicYear)) {
      return {
        isValid: false,
        error: 'Academic year must be in format YYYY-YY (e.g., 2024-25)'
      };
    }

    const [startYear, endYearSuffix] = academicYear.split('-');
    const endYear = `20${endYearSuffix}`;
    
    if (parseInt(endYear) - parseInt(startYear) !== 1) {
      return {
        isValid: false,
        error: 'Academic year must be consecutive (e.g., 2024-25)'
      };
    }

    return { isValid: true };
  }
}

// Default RGCE validation instance
import { mockSystemSettings } from '../data/mockData';
export const rgceValidator = new RGCEValidator(mockSystemSettings);

// Utility functions for common validations
export const validateRGCEEmail = (email: string) => rgceValidator.validateEmail(email);
export const checkUserPermission = (user: User, permission: string) => rgceValidator.hasPermission(user, permission);
export const getRolePermissions = (role: UserRole) => rgceValidator.getRolePermissions(role);
