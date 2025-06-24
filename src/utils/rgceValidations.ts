
// RGCE-specific validation utilities

export const validateEmail = (email: string): boolean => {
  const rgceEmailPattern = /^[a-zA-Z0-9._%+-]+@rgce\.edu\.in$/;
  return rgceEmailPattern.test(email);
};

export const validateRollNumber = (rollNumber: string): boolean => {
  // Format: CSE2021001 (Department + Year + Number)
  const rollNumberPattern = /^(CSE|ECE|EEE|MECH|CIVIL|IT)\d{7}$/;
  return rollNumberPattern.test(rollNumber);
};

export const validateEmployeeId = (employeeId: string): boolean => {
  // Format: EMP001, HOD001, PRIN001, etc.
  const employeeIdPattern = /^[A-Z]{3,6}\d{3}$/;
  return employeeIdPattern.test(employeeId);
};

export const validatePhoneNumber = (phone: string): boolean => {
  const phonePattern = /^\+91\s?[6-9]\d{9}$/;
  return phonePattern.test(phone);
};

export const validateFeeAmount = (amount: number): boolean => {
  return amount > 0 && amount <= 500000; // Max fee 5 lakhs
};

export const validateAcademicYear = (year: string): boolean => {
  const yearPattern = /^\d{4}-\d{2}$/;
  return yearPattern.test(year);
};

export const validateSemester = (semester: number): boolean => {
  return semester >= 1 && semester <= 8;
};

export const validateYearSection = (yearSection: string): boolean => {
  const yearSectionPattern = /^[1-4][A-Z]$/;
  return yearSectionPattern.test(yearSection);
};

export const validatePassword = (password: string): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export default {
  validateEmail,
  validateRollNumber,
  validateEmployeeId,
  validatePhoneNumber,
  validateFeeAmount,
  validateAcademicYear,
  validateSemester,
  validateYearSection,
  validatePassword
};
