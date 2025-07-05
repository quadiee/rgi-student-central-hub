
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const validateFeeAmount = (amount: string): boolean => {
  const numAmount = parseFloat(amount);
  return !isNaN(numAmount) && numAmount > 0 && numAmount <= 1000000;
};

export const validateDueDate = (date: string): boolean => {
  const dueDate = new Date(date);
  const today = new Date();
  return dueDate >= today;
};

export const calculateLateFee = (originalAmount: number, dueDate: string, penaltyPercentage: number = 5): number => {
  const today = new Date();
  const due = new Date(dueDate);
  
  if (today <= due) {
    return 0;
  }

  const daysOverdue = Math.floor((today.getTime() - due.getTime()) / (1000 * 60 * 60 * 24));
  const monthsOverdue = daysOverdue / 30;
  
  return (originalAmount * penaltyPercentage / 100) * monthsOverdue;
};

export const getDueDateStatus = (dueDate: string): 'upcoming' | 'due' | 'overdue' => {
  const due = new Date(dueDate);
  const today = new Date();
  const diffDays = Math.floor((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) {
    return 'overdue';
  } else if (diffDays <= 7) {
    return 'due';
  } else {
    return 'upcoming';
  }
};
