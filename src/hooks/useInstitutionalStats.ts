
import { useState, useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';
import { useAuth } from '../contexts/SupabaseAuthContext';

export const useInstitutionalStats = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalFaculty: 0,
    totalDepartments: 0,
    activeStudents: 0,
    activeFaculty: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return;

      try {
        setLoading(true);
        
        // Get total students
        const { data: studentsData, error: studentsError } = await supabase
          .from('profiles')
          .select('id, is_active')
          .eq('role', 'student');

        if (studentsError) throw studentsError;

        // Get total faculty
        const { data: facultyData, error: facultyError } = await supabase
          .from('profiles')
          .select('id, is_active')
          .eq('role', 'faculty');

        if (facultyError) throw facultyError;

        // Get total departments
        const { data: departmentsData, error: departmentsError } = await supabase
          .from('departments')
          .select('id')
          .eq('is_active', true);

        if (departmentsError) throw departmentsError;

        setStats({
          totalStudents: studentsData?.length || 0,
          totalFaculty: facultyData?.length || 0,
          totalDepartments: departmentsData?.length || 0,
          activeStudents: studentsData?.filter(s => s.is_active).length || 0,
          activeFaculty: facultyData?.filter(f => f.is_active).length || 0
        });
      } catch (err) {
        console.error('Error fetching institutional stats:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch stats');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user?.id]); // Only depend on user.id to prevent unnecessary re-fetches

  return { stats, loading, error };
};
