
import { useState, useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';
import { useAuth } from '../contexts/SupabaseAuthContext';

export interface StudentStats {
  totalStudents: number;
  activeStudents: number;
  firstGenerationStudents: number;
  scStStudents: number;
  finalYearStudents: number;
  departmentWiseCount: Record<string, number>;
  yearWiseCount: Record<number, number>;
  communityWiseCount: Record<string, number>;
}

export const useStudentStats = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<StudentStats>({
    totalStudents: 0,
    activeStudents: 0,
    firstGenerationStudents: 0,
    scStStudents: 0,
    finalYearStudents: 0,
    departmentWiseCount: {},
    yearWiseCount: {},
    communityWiseCount: {}
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStudentStats = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);
      
      // Get all student data with departments
      const { data: students, error: studentsError } = await supabase
        .from('profiles')
        .select(`
          id,
          name,
          year,
          semester,
          department_id,
          is_active,
          community,
          first_generation,
          departments:department_id (
            name,
            code
          )
        `)
        .eq('role', 'student');

      if (studentsError) throw studentsError;

      if (students) {
        const totalStudents = students.length;
        const activeStudents = students.filter(s => s.is_active).length;
        const firstGenerationStudents = students.filter(s => s.first_generation).length;
        const scStStudents = students.filter(s => s.community && ['SC', 'ST'].includes(s.community)).length;
        const finalYearStudents = students.filter(s => s.year === 4).length;

        // Department-wise count
        const departmentWiseCount = students.reduce((acc, student) => {
          const deptName = student.departments?.name || 'Unknown';
          acc[deptName] = (acc[deptName] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        // Year-wise count
        const yearWiseCount = students.reduce((acc, student) => {
          const year = student.year || 0;
          acc[year] = (acc[year] || 0) + 1;
          return acc;
        }, {} as Record<number, number>);

        // Community-wise count
        const communityWiseCount = students.reduce((acc, student) => {
          const community = student.community || 'General';
          acc[community] = (acc[community] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        setStats({
          totalStudents,
          activeStudents,
          firstGenerationStudents,
          scStStudents,
          finalYearStudents,
          departmentWiseCount,
          yearWiseCount,
          communityWiseCount
        });
      }
    } catch (err) {
      console.error('Error fetching student stats:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch student stats');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentStats();
  }, [user]);

  return { stats, loading, error, refetch: fetchStudentStats };
};
