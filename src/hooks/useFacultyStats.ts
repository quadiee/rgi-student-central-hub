
import { useState, useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';
import { useAuth } from '../contexts/SupabaseAuthContext';
import { useToast } from '../components/ui/use-toast';

export interface FacultyStats {
  totalFaculty: number;
  activeFaculty: number;
  avgAttendance: number;
  departmentStats: {
    departmentName: string;
    facultyCount: number;
    avgAttendance: number;
  }[];
}

export const useFacultyStats = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [stats, setStats] = useState<FacultyStats>({
    totalFaculty: 0,
    activeFaculty: 0,
    avgAttendance: 0,
    departmentStats: []
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

      // Use the existing function to get faculty with details
      const { data: facultyData, error: facultyError } = await supabase
        .rpc('get_faculty_with_details', { p_user_id: user.id });

      if (facultyError) {
        throw new Error(facultyError.message);
      }

      const facultyList = facultyData || [];
      
      // Calculate basic stats
      const totalFaculty = facultyList.length;
      const activeFaculty = facultyList.filter((f: any) => f.is_active).length;
      const avgAttendance = totalFaculty > 0 
        ? facultyList.reduce((sum: number, f: any) => sum + (f.attendance_percentage || 0), 0) / totalFaculty
        : 0;

      // Calculate department-wise stats
      const departmentMap = new Map();
      facultyList.forEach((faculty: any) => {
        const deptName = faculty.department_name || 'Unknown';
        if (!departmentMap.has(deptName)) {
          departmentMap.set(deptName, {
            departmentName: deptName,
            facultyCount: 0,
            totalAttendance: 0
          });
        }
        const dept = departmentMap.get(deptName);
        dept.facultyCount++;
        dept.totalAttendance += faculty.attendance_percentage || 0;
      });

      const departmentStats = Array.from(departmentMap.values()).map((dept: any) => ({
        departmentName: dept.departmentName,
        facultyCount: dept.facultyCount,
        avgAttendance: dept.facultyCount > 0 ? dept.totalAttendance / dept.facultyCount : 0
      }));

      setStats({
        totalFaculty,
        activeFaculty,
        avgAttendance,
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
