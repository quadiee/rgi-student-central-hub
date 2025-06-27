
import { UserProfile } from '../contexts/SupabaseAuthContext';
import { User } from '../types';

export const useUserConversion = () => {
  const convertUserProfileToUser = (userProfile: UserProfile): User => {
    return {
      id: userProfile.id,
      name: userProfile.name,
      email: userProfile.email,
      role: userProfile.role as 'student' | 'hod' | 'principal' | 'admin',
      department_id: userProfile.department_id,
      department_name: userProfile.department_name,
      avatar: userProfile.profile_photo_url || '',
      rollNumber: userProfile.roll_number,
      employeeId: userProfile.employee_id,
      isActive: userProfile.is_active,
      createdAt: userProfile.created_at,
    };
  };

  return { convertUserProfileToUser };
};
