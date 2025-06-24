
export const validateFeeAmount = (amount: number): boolean => {
  return amount > 0 && amount <= 1000000; // Max 10 lakh
};

export const validatePaymentMethod = (method: string): boolean => {
  const validMethods = ['Cash', 'Online', 'Cheque', 'DD'];
  return validMethods.includes(method);
};

export const validateAcademicYear = (year: string): boolean => {
  const yearPattern = /^\d{4}-\d{2}$/;
  return yearPattern.test(year);
};

export const validateSemester = (semester: number): boolean => {
  return semester >= 1 && semester <= 8;
};

export const validateEmail = (email: string): boolean => {
  const emailPattern = /^[^\s@]+@rgce\.edu\.in$/;
  return emailPattern.test(email);
};

export const calculateLateFee = (
  originalAmount: number, 
  dueDate: string, 
  latePercentage: number = 5
): number => {
  const due = new Date(dueDate);
  const today = new Date();
  
  if (today <= due) return 0;
  
  const daysLate = Math.ceil((today.getTime() - due.getTime()) / (1000 * 60 * 60 * 24));
  const monthsLate = Math.ceil(daysLate / 30);
  
  return Math.round((originalAmount * latePercentage / 100) * monthsLate);
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

export const formatReceiptNumber = (date: Date, sequence: number): string => {
  const dateStr = date.toISOString().split('T')[0].replace(/-/g, '');
  const seqStr = sequence.toString().padStart(4, '0');
  return `RCP-${dateStr}-${seqStr}`;
};

export const validateInstallmentPlan = (
  totalAmount: number,
  installments: number,
  maxInstallments: number = 3
): boolean => {
  if (installments < 1 || installments > maxInstallments) return false;
  if (totalAmount / installments < 1000) return false; // Minimum installment amount
  return true;
};

export const generateTransactionId = (): string => {
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substr(2, 9);
  return `TXN${timestamp}${random}`;
};

export const calculateFinalAmount = (
  originalAmount: number,
  discountAmount: number = 0,
  penaltyAmount: number = 0
): number => {
  return Math.max(0, originalAmount - discountAmount + penaltyAmount);
};

export const getDueDateStatus = (dueDate: string): 'upcoming' | 'due' | 'overdue' => {
  const due = new Date(dueDate);
  const today = new Date();
  const diffDays = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffDays > 7) return 'upcoming';
  if (diffDays >= 0) return 'due';
  return 'overdue';
};
