
import { useState, useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';
import { useAuth } from '../contexts/SupabaseAuthContext';
import { useToast } from '../components/ui/use-toast';

export interface FacultyStats {
  totalFaculty: number;
  activeFaculty: number;
  avgAttendance: number;
  totalDepartments: number;
  avgExperience: number;
  seniorFaculty: number;
  excellentPerformers: number;
  topPerformers: number;
  faculty: any[];
  departmentStats: {
    [key: string]: {
      total: number;
      active: number;
      avgExperience: number;
      code: string;
    };
  };
}

export const useFacultyStats = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [stats, setStats] = useState<FacultyStats>({
    totalFaculty: 0,
    activeFaculty: 0,
    avgAttendance: 0,
    totalDepartments: 0,
    avgExperience: 0,
    seniorFaculty: 0,
    excellentPerformers: 0,
    topPerformers: 0,
    faculty: [],
    departmentStats: {}
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFacultyStats = async () => {
    if (!user) {
      setError('User not authenticated');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Fetch faculty with details
      const { data: facultyData, error: facultyError } = await supabase
        .rpc('get_faculty_with_details', { p_user_id: user.id });

      if (facultyError) {
        throw new Error(facultyError.message);
      }

      const facultyList = facultyData || [];
      
      // Fetch departments
      const { data: departmentData, error: deptError } = await supabase
        .from('departments')
        .select('id, name, code')
        .eq('is_active', true);

      if (deptError) {
        console.error('Error fetching departments:', deptError);
      }

      const departments = departmentData || [];

      // Calculate stats
      const totalFaculty = facultyList.length;
      const activeFaculty = facultyList.filter((f: any) => f.is_active).length;
      const avgAttendance = totalFaculty > 0 
        ? facultyList.reduce((sum: number, f: any) => sum + (f.attendance_percentage || 0), 0) / totalFaculty
        : 0;

      // Calculate experience stats
      const experienceValues = facultyList
        .map((f: any) => f.years_of_experience || 0)
        .filter((exp: number) => exp > 0);
      
      const avgExperience = experienceValues.length > 0
        ? experienceValues.reduce((sum: number, exp: number) => sum + exp, 0) / experienceValues.length
        : 0;

      const seniorFaculty = facultyList.filter((f: any) => (f.years_of_experience || 0) >= 10).length;
      const excellentPerformers = facultyList.filter((f: any) => (f.attendance_percentage || 0) >= 95).length;
      const topPerformers = facultyList.filter((f: any) => (f.attendance_percentage || 0) >= 90).length;

      // Calculate department-wise stats
      const departmentStats: { [key: string]: any } = {};
      departments.forEach((dept: any) => {
        const deptFaculty = facultyList.filter((f: any) => f.department_id === dept.id);
        const deptExperience = deptFaculty
          .map((f: any) => f.years_of_experience || 0)
          .filter((exp: number) => exp > 0);
        
        departmentStats[dept.name] = {
          total: deptFaculty.length,
          active: deptFaculty.filter((f: any) => f.is_active).length,
          avgExperience: deptExperience.length > 0
            ? deptExperience.reduce((sum: number, exp: number) => sum + exp, 0) / deptExperience.length
            : 0,
          code: dept.code
        };
      });

      setStats({
        totalFaculty,
        activeFaculty,
        avgAttendance,
        totalDepartments: departments.length,
        avgExperience,
        seniorFaculty,
        excellentPerformers,
        topPerformers,
        faculty: facultyList,
        departmentStats
      });

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch faculty stats';
      setError(errorMessage);
      console.error('Error fetching faculty stats:', err);
      
      toast({
        title: "Error loading faculty statistics",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFacultyStats();
  }, [user]);

  return {
    stats,
    loading,
    error,
    refetch: fetchFacultyStats
  };
};
