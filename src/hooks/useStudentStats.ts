
import { useState, useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';
import { useAuth } from '../contexts/SupabaseAuthContext';

export interface StudentStats {
  totalStudents: number;
  activeStudents: number;
  firstGenerationStudents: number;
  scStStudents: number;
  finalYearStudents: number;
  totalDepartments: number;
  excellentAttendance: number;
  criticalAttendance: number;
  avgAttendance: number;
  topPerformers: number;
  departmentWiseCount: Record<string, number>;
  yearWiseCount: Record<number, number>;
  communityWiseCount: Record<string, number>;
  departmentStats?: Array<{
    department: string;
    totalStudents: number;
    avgAttendance: number;
  }>;
}

interface StudentRecord {
  student_id: string;
  name: string;
  roll_number: string;
  department_name: string;
  department_code: string;
  current_year: number;
  is_active: boolean;
  attendance_percentage: number;
}

export const useStudentStats = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<StudentStats>({
    totalStudents: 0,
    activeStudents: 0,
    firstGenerationStudents: 0,
    scStStudents: 0,
    finalYearStudents: 0,
    totalDepartments: 0,
    excellentAttendance: 0,
    criticalAttendance: 0,
    avgAttendance: 0,
    topPerformers: 0,
    departmentWiseCount: {},
    yearWiseCount: {},
    communityWiseCount: {},
    departmentStats: []
  });
  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStudentStats = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);
      
      // Get all student data with departments
      const { data: studentsData, error: studentsError } = await supabase
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
          roll_number,
          departments:department_id (
            name,
            code
          )
        `)
        .eq('role', 'student');

      if (studentsError) throw studentsError;

      // Get departments count
      const { data: deptData, error: deptError } = await supabase
        .from('departments')
        .select('id')
        .eq('is_active', true);

      if (deptError) throw deptError;

      if (studentsData) {
        // Mock attendance data for now since we don't have it in the current structure
        const studentsWithAttendance: StudentRecord[] = studentsData.map(student => ({
          student_id: student.id,
          name: student.name || 'Unknown Student',
          roll_number: student.roll_number || 'N/A',
          department_name: student.departments?.name || 'Unknown Department',
          department_code: student.departments?.code || 'N/A',
          current_year: student.year || 1,
          is_active: student.is_active || false,
          attendance_percentage: Math.floor(Math.random() * 40) + 60 // Mock data: 60-100%
        }));

        setStudents(studentsWithAttendance);

        const totalStudents = studentsData.length;
        const activeStudents = studentsData.filter(s => s.is_active).length;
        const firstGenerationStudents = studentsData.filter(s => s.first_generation).length;
        const scStStudents = studentsData.filter(s => s.community && ['SC', 'ST'].includes(s.community)).length;
        const finalYearStudents = studentsData.filter(s => s.year === 4).length;
        const totalDepartments = deptData?.length || 0;

        // Calculate attendance stats
        const excellentAttendance = studentsWithAttendance.filter(s => s.attendance_percentage >= 90).length;
        const criticalAttendance = studentsWithAttendance.filter(s => s.attendance_percentage < 75).length;
        const avgAttendance = Math.round(studentsWithAttendance.reduce((sum, s) => sum + s.attendance_percentage, 0) / studentsWithAttendance.length) || 0;
        const topPerformers = studentsWithAttendance.filter(s => s.attendance_percentage > 95).length;

        // Department-wise count
        const departmentWiseCount = studentsData.reduce((acc, student) => {
          const deptName = student.departments?.name || 'Unknown';
          acc[deptName] = (acc[deptName] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        // Year-wise count
        const yearWiseCount = studentsData.reduce((acc, student) => {
          const year = student.year || 0;
          acc[year] = (acc[year] || 0) + 1;
          return acc;
        }, {} as Record<number, number>);

        // Community-wise count
        const communityWiseCount = studentsData.reduce((acc, student) => {
          const community = student.community || 'General';
          acc[community] = (acc[community] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        // Department stats
        const departmentStats = Object.entries(departmentWiseCount).map(([department, totalStudents]) => {
          const deptStudents = studentsWithAttendance.filter(s => s.department_name === department);
          const avgAttendance = Math.round(deptStudents.reduce((sum, s) => sum + s.attendance_percentage, 0) / deptStudents.length) || 0;
          
          return {
            department,
            totalStudents,
            avgAttendance
          };
        });

        setStats({
          totalStudents,
          activeStudents,
          firstGenerationStudents,
          scStStudents,
          finalYearStudents,
          totalDepartments,
          excellentAttendance,
          criticalAttendance,
          avgAttendance,
          topPerformers,
          departmentWiseCount,
          yearWiseCount,
          communityWiseCount,
          departmentStats
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

  return { 
    stats, 
    students, 
    loading, 
    error, 
    refetch: fetchStudentStats,
    fetchStats: fetchStudentStats 
  };
};
