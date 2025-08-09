
import { useState, useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';
import { useAuth } from '../contexts/SupabaseAuthContext';

export interface FacultyMember {
  id: string;
  name: string;
  email: string;
  department_id: string;
  department_name: string;
  department_code: string;
  designation?: string;
  experience?: number;
  qualification?: string;
  specialization?: string;
  phone?: string;
  is_active: boolean;
  attendance_rate?: number;
  subjects_taught?: number;
  research_papers?: number;
  years_at_institution?: number;
}

export interface FacultyStats {
  totalFaculty: number;
  activeFaculty: number;
  totalDepartments: number;
  avgExperience: number;
  seniorFaculty: number;
  juniorFaculty: number;
  excellentPerformers: number;
  avgAttendance: number;
  topPerformers: number;
  departmentStats: Record<string, {
    total: number;
    active: number;
    avgExperience: number;
    code: string;
  }>;
  faculty: FacultyMember[];
}

export const useFacultyStats = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<FacultyStats>({
    totalFaculty: 0,
    activeFaculty: 0,
    totalDepartments: 0,
    avgExperience: 0,
    seniorFaculty: 0,
    juniorFaculty: 0,
    excellentPerformers: 0,
    avgAttendance: 0,
    topPerformers: 0,
    departmentStats: {},
    faculty: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchStats = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError('');

      // Fetch real faculty data using the updated function
      const { data: facultyData, error: facultyError } = await supabase
        .rpc('get_faculty_with_details', { p_user_id: user.id });

      if (facultyError) throw facultyError;

      const faculty: FacultyMember[] = (facultyData || []).map((member: any) => ({
        id: member.faculty_id,
        name: member.name || 'N/A',
        email: member.email || 'N/A',
        department_id: member.department_id,
        department_name: member.department_name || 'Unknown',
        department_code: member.department_code || 'N/A',
        designation: member.designation || 'Faculty',
        experience: member.years_of_experience || 0,
        qualification: 'N/A', // Will be filled from real data when available
        specialization: 'N/A', // Will be filled from real data when available
        phone: member.phone,
        is_active: member.is_active,
        attendance_rate: member.attendance_percentage || 0,
        subjects_taught: 0, // Will be calculated from real course assignments
        research_papers: 0, // Will be calculated from real research data
        years_at_institution: member.years_of_experience || 0
      }));

      // Calculate real statistics
      const totalFaculty = faculty.length;
      const activeFaculty = faculty.filter(f => f.is_active).length;
      
      // Calculate experience stats from real data
      const experiences = faculty.filter(f => f.experience && f.experience > 0).map(f => f.experience || 0);
      const avgExperience = experiences.length > 0 
        ? experiences.reduce((sum, exp) => sum + exp, 0) / experiences.length 
        : 0;
      
      const seniorFaculty = faculty.filter(f => (f.experience || 0) >= 10).length;
      const juniorFaculty = faculty.filter(f => (f.experience || 0) < 5).length;
      
      // Calculate attendance stats from real data
      const attendanceRates = faculty.map(f => f.attendance_rate || 0);
      const avgAttendance = attendanceRates.length > 0 
        ? attendanceRates.reduce((sum, rate) => sum + rate, 0) / attendanceRates.length 
        : 0;
      const excellentPerformers = faculty.filter(f => (f.attendance_rate || 0) >= 95).length;
      
      // Research papers will be calculated from real data when available
      const topPerformers = faculty.filter(f => (f.research_papers || 0) >= 5).length;

      // Calculate department statistics from real data
      const departmentStats: Record<string, any> = {};
      faculty.forEach(member => {
        const deptName = member.department_name;
        if (!departmentStats[deptName]) {
          departmentStats[deptName] = {
            total: 0,
            active: 0,
            totalExperience: 0,
            experienceCount: 0,
            code: member.department_code
          };
        }
        departmentStats[deptName].total += 1;
        if (member.is_active) departmentStats[deptName].active += 1;
        if (member.experience && member.experience > 0) {
          departmentStats[deptName].totalExperience += member.experience;
          departmentStats[deptName].experienceCount += 1;
        }
      });

      // Calculate average experience per department
      Object.keys(departmentStats).forEach(dept => {
        const deptData = departmentStats[dept];
        departmentStats[dept] = {
          total: deptData.total,
          active: deptData.active,
          avgExperience: deptData.experienceCount > 0 
            ? deptData.totalExperience / deptData.experienceCount 
            : 0,
          code: deptData.code
        };
      });

      const totalDepartments = Object.keys(departmentStats).length;

      setStats({
        totalFaculty,
        activeFaculty,
        totalDepartments,
        avgExperience,
        seniorFaculty,
        juniorFaculty,
        excellentPerformers,
        avgAttendance,
        topPerformers,
        departmentStats,
        faculty
      });

    } catch (err) {
      console.error('Error fetching faculty stats:', err);
      setError('Failed to fetch faculty statistics');
    } finally {
      setLoading(false);
    }
  };

  const refetch = fetchStats;

  useEffect(() => {
    fetchStats();
  }, [user]);

  return {
    stats,
    loading,
    error,
    refetch,
    fetchStats: refetch
  };
};
