
export interface Student {
  id: string;
  name: string;
  rollNumber?: string;
  course?: string;
  year?: number;
  semester?: number;
  email?: string;
  phone?: string;
  profileImage?: string;
  admissionDate?: string;
  guardianName?: string;
  guardianPhone?: string;
  address?: string;
  bloodGroup?: string;
  emergencyContact?: string;
  department?: string;
  yearSection?: string;
  section?: string;
  totalFees?: number;
  paidAmount?: number;
  dueAmount?: number;
  feeStatus?: string;
  community?: 'SC' | 'ST' | 'OBC' | 'General' | 'EWS';
  first_generation?: boolean;
}

export interface Scholarship {
  id: string;
  student_id: string;
  scholarship_type: 'PMSS' | 'FG';
  eligible_amount: number;
  applied_status: boolean;
  application_date?: string;
  received_by_institution: boolean;
  receipt_date?: string;
  academic_year: string;
  semester?: number;
  remarks?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export interface ScholarshipWithProfile extends Scholarship {
  profiles?: {
    name: string;
    roll_number: string;
    departments?: {
      name: string;
      code: string;
    };
  };
}

export interface ScholarshipSummary {
  department_id: string;
  department_name: string;
  department_code: string;
  total_scholarship_students: number;
  total_scholarships: number;
  total_eligible_amount: number;
  total_received_amount: number;
  applied_scholarships: number;
  received_scholarships: number;
  academic_year: string;
}

export interface InstitutionScholarshipSummary {
  total_scholarship_students: number;
  total_scholarships: number;
  total_eligible_amount: number;
  total_received_amount: number;
  applied_scholarships: number;
  received_scholarships: number;
  academic_year: string;
}
