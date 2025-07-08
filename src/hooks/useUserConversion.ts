
import { UserProfile } from '../contexts/SupabaseAuthContext';
import { User } from '../types';

export const useUserConversion = () => {
  const convertUserProfileToUser = (userProfile: UserProfile): User => {
    return {
      id: userProfile.id,
      name: userProfile.name,
      email: userProfile.email,
      role: userProfile.role,
      department_id: userProfile.department_id,
      department_name: userProfile.department_name,
      avatar: userProfile.profile_photo_url || userProfile.avatar || '',
      rollNumber: userProfile.roll_number || userProfile.rollNumber,
      employeeId: userProfile.employee_id,
      isActive: userProfile.isActive,
      createdAt: userProfile.created_at,
      phone: userProfile.phone,
      address: userProfile.address,
      profile_photo_url: userProfile.profile_photo_url,
      roll_number: userProfile.roll_number,
      employee_id: userProfile.employee_id,
      created_at: userProfile.created_at,
    };
  };

  return { convertUserProfileToUser };
};
