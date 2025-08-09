
import { supabase } from '../integrations/supabase/client';
import { User } from '../types';

export class DataService {
  // Real-time data fetching for dashboard stats
  static async getDashboardStats(user: User) {
    try {
      const { data: feeRecords } = await supabase
        .from('fee_records')
        .select('*')
        .limit(100);

      const { data: students } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'student')
        .eq('is_active', true);

      const { data: faculty } = await supabase
        .from('faculty_profiles')
        .select(`
          *,
          profiles!faculty_profiles_user_id_fkey(name, email, department_id)
        `)
        .eq('is_active', true);

      return {
        totalStudents: students?.length || 0,
        totalFaculty: faculty?.length || 0,
        totalFeeRecords: feeRecords?.length || 0,
        totalRevenue: feeRecords?.reduce((sum, record) => sum + Number(record.paid_amount || 0), 0) || 0,
        pendingFees: feeRecords?.reduce((sum, record) => 
          sum + (Number(record.final_amount) - Number(record.paid_amount || 0)), 0) || 0
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      return {
        totalStudents: 0,
        totalFaculty: 0,
        totalFeeRecords: 0,
        totalRevenue: 0,
        pendingFees: 0
      };
    }
  }

  // Get students with real-time data
  static async getStudents(user: User, filters?: any) {
    try {
      let query = supabase
        .from('profiles')
        .select(`
          *,
          departments!profiles_department_id_fkey(name, code)
        `)
        .eq('role', 'student')
        .eq('is_active', true);

      // Apply role-based filtering
      if (user.role === 'hod') {
        query = query.eq('department_id', user.department_id);
      }

      if (filters?.department) {
        query = query.eq('department_id', filters.department);
      }

      if (filters?.year) {
        query = query.eq('year', filters.year);
      }

      const { data, error } = await query.order('roll_number');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching students:', error);
      return [];
    }
  }

  // Get faculty with real-time data
  static async getFaculty(user: User, filters?: any) {
    try {
      let query = supabase
        .from('faculty_profiles')
        .select(`
          *,
          profiles!faculty_profiles_user_id_fkey(
            name, email, department_id, phone,
            departments!profiles_department_id_fkey(name, code)
          )
        `)
        .eq('is_active', true);

      // Apply role-based filtering
      if (user.role === 'hod') {
        query = query.eq('profiles.department_id', user.department_id);
      }

      const { data, error } = await query.order('employee_code');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching faculty:', error);
      return [];
    }
  }

  // Get attendance data
  static async getAttendanceData(user: User, type: 'student' | 'faculty', date?: string) {
    try {
      if (type === 'student') {
        let query = supabase
          .from('student_attendance')
          .select(`
            *,
            profiles!student_attendance_student_id_fkey(name, roll_number, department_id)
          `);

        if (date) {
          query = query.eq('attendance_date', date);
        }

        // Apply role-based filtering
        if (user.role === 'student') {
          query = query.eq('student_id', user.id);
        } else if (user.role === 'hod') {
          // Filter by department through profile
          const { data: deptStudents } = await supabase
            .from('profiles')
            .select('id')
            .eq('department_id', user.department_id)
            .eq('role', 'student');
          
          if (deptStudents) {
            const studentIds = deptStudents.map(s => s.id);
            query = query.in('student_id', studentIds);
          }
        }

        const { data, error } = await query.order('attendance_date', { ascending: false });
        if (error) throw error;
        return data || [];

      } else {
        // Faculty attendance
        let query = supabase
          .from('faculty_attendance')
          .select(`
            *,
            faculty_profiles!faculty_attendance_faculty_id_fkey(
              user_id,
              employee_code,
              profiles!faculty_profiles_user_id_fkey(name, department_id)
            )
          `);

        if (date) {
          query = query.eq('attendance_date', date);
        }

        // Apply role-based filtering
        if (user.role === 'faculty') {
          const { data: facultyProfile } = await supabase
            .from('faculty_profiles')
            .select('id')
            .eq('user_id', user.id)
            .single();
          
          if (facultyProfile) {
            query = query.eq('faculty_id', facultyProfile.id);
          }
        }

        const { data, error } = await query.order('attendance_date', { ascending: false });
        if (error) throw error;
        return data || [];
      }
    } catch (error) {
      console.error('Error fetching attendance data:', error);
      return [];
    }
  }
}
