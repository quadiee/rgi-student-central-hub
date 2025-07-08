
export interface InvitationData {
  id: string;
  email: string;
  role: string;
  department: string;
  roll_number?: string;
  employee_id?: string;
  is_valid: boolean;
  error_message?: string;
}

export type ValidateInvitationResponse = {
  id: string;
  email: string;
  role: string;
  department: string;
  roll_number: string | null;
  employee_id: string | null;
  is_valid: boolean;
  error_message: string | null;
};

export interface InvitationFormData {
  name: string;
  password: string;
  confirmPassword: string;
  phone: string;
  rollNumber: string;
  employeeId: string;
  guardianName: string;
  guardianPhone: string;
  address: string;
}
