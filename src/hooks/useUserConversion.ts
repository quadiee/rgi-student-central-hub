
import { User as SupabaseUser } from '@supabase/supabase-js';
import { User } from '../types';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'hod' | 'principal' | 'admin';
  department_id?: string;
  department_name?: string;
  avatar?: string;
  profile_photo_url?: string;
  roll_number?: string;
  rollNumber?: string;
  employee_id?: string;
  is_active: boolean;
  created_at?: string;
}

export const useUserConversion = () => {
  const convertUserProfileToUser = (userProfile: UserProfile): User => {
    return {
      id: userProfile.id,
      name: userProfile.name,
      email: userProfile.email,
      role: userProfile.role,
      department_id: userProfile.department_id || '',
      department_name: userProfile.department_name,
      avatar: userProfile.profile_photo_url || userProfile.avatar || '',
      rollNumber: userProfile.roll_number || userProfile.rollNumber,
      employeeId: userProfile.employee_id,
      isActive: userProfile.is_active,
      createdAt: userProfile.created_at,
    };
  };

  return { convertUserProfileToUser };
};
