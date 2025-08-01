
import { useState, useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';
import { useAuth } from '../contexts/SupabaseAuthContext';

export interface FacultyProfile {
  id: string;
  user_id: string;
  employee_code: string;
  designation: string;
  joining_date: string;
  salary_grade?: string;
  pf_number?: string;
  aadhar_number?: string;
  pan_number?: string;
  bank_account_number?: string;
  bank_name?: string;
  bank_branch?: string;
  ifsc_code?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  emergency_contact_relation?: string;
  current_address?: string;
  permanent_address?: string;
  marital_status?: string;
  spouse_name?: string;
  medical_conditions?: string;
  blood_group?: string;
  children_count?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // Profile data from profiles table
  name?: string;
  email?: string;
  phone?: string;
  department_name?: string;
  department_code?: string;
}

export const useFacultyProfile = () => {
  const { user } = useAuth();
  const [facultyProfile, setFacultyProfile] = useState<FacultyProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFacultyProfile = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // First check if user has faculty role
      if (user.role !== 'faculty') {
        setLoading(false);
        return;
      }

      // Try to get faculty profile with profile data
      const { data, error: fetchError } = await supabase
        .from('faculty_profiles')
        .select(`
          *,
          profiles!faculty_profiles_user_id_fkey (
            name,
            email,
            phone,
            departments (
              name,
              code
            )
          )
        `)
        .eq('user_id', user.id)
        .maybeSingle();

      if (fetchError) {
        console.error('Error fetching faculty profile:', fetchError);
        throw fetchError;
      }

      if (data) {
        const profile: FacultyProfile = {
          ...data,
          name: data.profiles?.name,
          email: data.profiles?.email,
          phone: data.profiles?.phone,
          department_name: data.profiles?.departments?.name,
          department_code: data.profiles?.departments?.code
        };

        setFacultyProfile(profile);
      } else {
        // No faculty profile found, but user is faculty - this might be a new signup
        console.log('No faculty profile found for user:', user.id);
        setFacultyProfile(null);
      }
    } catch (err) {
      console.error('Error fetching faculty profile:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch faculty profile');
    } finally {
      setLoading(false);
    }
  };

  const updateFacultyProfile = async (updates: Partial<FacultyProfile>) => {
    if (!facultyProfile) return;

    try {
      setError(null);

      const { error: updateError } = await supabase
        .from('faculty_profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', facultyProfile.id);

      if (updateError) {
        throw updateError;
      }

      // Refresh the profile data
      await fetchFacultyProfile();
    } catch (err) {
      console.error('Error updating faculty profile:', err);
      setError(err instanceof Error ? err.message : 'Failed to update faculty profile');
      throw err;
    }
  };

  useEffect(() => {
    fetchFacultyProfile();
  }, [user]);

  return {
    facultyProfile,
    loading,
    error,
    refetch: fetchFacultyProfile,
    updateProfile: updateFacultyProfile
  };
};
