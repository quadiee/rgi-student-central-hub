import { LeaveRequest } from '../types';
import { mockSystemSettings } from '../data/mockData';

// Utility function to validate email format
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Utility function to validate phone number format (basic)
export const isValidPhoneNumber = (phone: string): boolean => {
  const phoneRegex = /^[0-9]{10}$/;
  return phoneRegex.test(phone);
};

// Utility function to validate date format (YYYY-MM-DD)
export const isValidDateFormat = (date: string): boolean => {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  return dateRegex.test(date);
};

// Utility function to validate course code format (e.g., CSE101)
export const isValidCourseCode = (code: string): boolean => {
  const codeRegex = /^[A-Z]{2,4}\d{3}$/;
  return codeRegex.test(code);
};

// Utility function to validate roll number format (e.g., 2021A001)
export const isValidRollNumber = (roll: string): boolean => {
  const rollRegex = /^\d{4}[A-Z]\d{3}$/;
  return rollRegex.test(roll);
};

// Utility function to validate name (only alphabets and spaces)
export const isValidName = (name: string): boolean => {
    const nameRegex = /^[a-zA-Z\s]+$/;
    return nameRegex.test(name);
};

// Utility function to validate password strength (example criteria)
export const isValidPassword = (password: string): boolean => {
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};

// Utility function to validate if a string is not empty
export const isNotEmpty = (value: string): boolean => {
  return value.trim().length > 0;
};

// Utility function to validate if a number is within a range
export const isValidRange = (value: number, min: number, max: number): boolean => {
  return value >= min && value <= max;
};

// Utility function to validate URL format
export const isValidURL = (url: string): boolean => {
  const urlRegex = /^(ftp|http|https):\/\/[^ "]+$/;
  return urlRegex.test(url);
};

// Utility function to validate academic year format (e.g., 2023-24)
export const isValidAcademicYear = (year: string): boolean => {
  const yearRegex = /^\d{4}-\d{2}$/;
  if (!yearRegex.test(year)) return false;
  const [start, end] = year.split('-').map(Number);
  return end === start % 100 + 1;
};

// Utility function to validate semester (1 to 8)
export const isValidSemester = (semester: number): boolean => {
  return semester >= 1 && semester <= 8;
};

// Utility function to validate marks (0 to 100)
export const isValidMarks = (marks: number): boolean => {
  return marks >= 0 && marks <= 100;
};

// Utility function to validate designation
export const isValidDesignation = (designation: string): boolean => {
    const designationRegex = /^[a-zA-Z\s.,]+$/;
    return designationRegex.test(designation);
};

// Leave Request Validation
export const validateLeaveRequest = (leaveData: Partial<LeaveRequest>): string[] => {
  const errors: string[] = [];

  // Validate required fields
  if (!leaveData.studentId?.trim()) {
    errors.push('Student ID is required');
  }

  if (!leaveData.fromDate) {
    errors.push('From date is required');
  }

  if (!leaveData.toDate) {
    errors.push('To date is required');
  }

  if (!leaveData.reason?.trim()) {
    errors.push('Reason is required');
  }

  // Validate date logic
  if (leaveData.fromDate && leaveData.toDate) {
    const fromDate = new Date(leaveData.fromDate);
    const toDate = new Date(leaveData.toDate);
    const today = new Date();
    
    if (fromDate < today) {
      errors.push('From date cannot be in the past');
    }
    
    if (toDate < fromDate) {
      errors.push('To date must be after from date');
    }

    // Check if leave duration is reasonable (max 30 days)
    const daysDiff = Math.ceil((toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24));
    if (daysDiff > 30) {
      errors.push('Leave duration cannot exceed 30 days');
    }
  }

  // Validate reason length
  if (leaveData.reason && leaveData.reason.trim().length < 10) {
    errors.push('Reason must be at least 10 characters long');
  }

  // Validate course code if provided
  if (leaveData.courseCode && !isValidCourseCode(leaveData.courseCode)) {
    errors.push('Invalid course code format');
  }

  return errors;
};

// System Settings Validation
export const getSystemSettings = () => {
  return mockSystemSettings;
};
