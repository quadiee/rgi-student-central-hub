
import { useState, useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';
import { useAuth } from '../contexts/SupabaseAuthContext';
import { useToast } from '../components/ui/use-toast';

export interface StudentWithAttendance {
  student_id: string;
  user_id: string;
  name: string;
  email: string;
  roll_number: string;
  department_name: string;
  year: number;
  semester: number;
  total_attendance_days: number;
  present_days: number;
  absent_days: number;
  attendance_percentage: number;
}

export interface StudentAttendanceRecord {
  id: string;
  student_id: string;
  student_name: string;
  roll_number: string;
  department_name: string;
  session_date: string;
  overall_status: string;
  total_periods: number;
  present_periods: number;
  absent_periods: number;
  late_periods: number;
  excused_periods: number;
  attendance_percentage: number;
}

export interface AttendanceSession {
  id: string;
  student_id: string;
  student_name: string;
  roll_number: string;
  subject_name: string;
  class_section: string;
  period_number: number;
  scheduled_start_time: string;
  scheduled_end_time: string;
  status: string;
  session_date: string;
}

export const useStudentAttendance = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [studentsWithAttendance, setStudentsWithAttendance] = useState<StudentWithAttendance[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<StudentAttendanceRecord[]>([]);
  const [attendanceSessions, setAttendanceSessions] = useState<AttendanceSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStudentsWithAttendance = async () => {
    if (!user) {
      setError('User not authenticated');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data: studentData, error: studentError } = await supabase
        .rpc('get_student_with_attendance_details', { p_user_id: user.id });

      if (studentError) {
        throw new Error(studentError.message);
      }

      const students = studentData || [];
      
      const transformedStudents: StudentWithAttendance[] = students.map((student: any) => ({
        student_id: student.student_id || student.user_id,
        user_id: student.user_id,
        name: student.name || 'Unknown',
        email: student.email || '',
        roll_number: student.roll_number || 'N/A',
        department_name: student.department_name || 'Unknown Department',
        year: student.year || 0,
        semester: student.semester || 0,
        total_attendance_days: Number(student.total_attendance_days) || 0,
        present_days: Number(student.present_days) || 0,
        absent_days: Number(student.absent_days) || 0,
        attendance_percentage: Number(student.attendance_percentage) || 0
      }));

      setStudentsWithAttendance(transformedStudents);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch student attendance';
      setError(errorMessage);
      console.error('Error fetching student attendance:', err);
      
      toast({
        title: "Error loading student attendance",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendanceRecords = async (date?: string, departmentId?: string) => {
    if (!user) return;

    try {
      setLoading(true);
      
      let query = supabase
        .from('student_attendance_sessions')
        .select(`
          id,
          student_id,
          session_date,
          status,
          period_number,
          subject_name,
          class_section,
          profiles!inner(name, roll_number, department_id),
          departments!inner(name)
        `);

      if (date) {
        query = query.eq('session_date', date);
      }

      if (departmentId) {
        query = query.eq('profiles.department_id', departmentId);
      }

      const { data, error } = await query.order('session_date', { ascending: false });

      if (error) {
        throw new Error(error.message);
      }

      // Group by student and date to calculate daily stats
      const studentDailyStats = new Map();
      
      (data || []).forEach((session: any) => {
        const key = `${session.student_id}-${session.session_date}`;
        if (!studentDailyStats.has(key)) {
          studentDailyStats.set(key, {
            id: `${session.student_id}-${session.session_date}`,
            student_id: session.student_id,
            student_name: session.profiles?.name || 'Unknown',
            roll_number: session.profiles?.roll_number || 'N/A',
            department_name: session.departments?.name || 'Unknown',
            session_date: session.session_date,
            total_periods: 0,
            present_periods: 0,
            absent_periods: 0,
            late_periods: 0,
            excused_periods: 0,
            overall_status: 'Absent'
          });
        }

        const stats = studentDailyStats.get(key);
        stats.total_periods++;
        
        switch (session.status?.toLowerCase()) {
          case 'present':
            stats.present_periods++;
            break;
          case 'absent':
            stats.absent_periods++;
            break;
          case 'late':
            stats.late_periods++;
            break;
          case 'excused':
            stats.excused_periods++;
            break;
        }

        // Determine overall status
        const attendedPeriods = stats.present_periods + stats.late_periods + stats.excused_periods;
        if (attendedPeriods === stats.total_periods) {
          stats.overall_status = 'Present';
        } else if (attendedPeriods > 0) {
          stats.overall_status = 'Partial';
        } else {
          stats.overall_status = 'Absent';
        }

        stats.attendance_percentage = stats.total_periods > 0 
          ? Math.round((attendedPeriods / stats.total_periods) * 100)
          : 0;
      });

      setAttendanceRecords(Array.from(studentDailyStats.values()));

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch attendance records';
      setError(errorMessage);
      console.error('Error fetching attendance records:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendanceSessions = async (date?: string) => {
    if (!user) return;

    try {
      setLoading(true);
      
      let query = supabase
        .from('student_attendance_sessions')
        .select(`
          id,
          student_id,
          session_date,
          period_number,
          scheduled_start_time,
          scheduled_end_time,
          subject_name,
          class_section,
          status,
          profiles!inner(name, roll_number)
        `);

      if (date) {
        query = query.eq('session_date', date);
      }

      const { data, error } = await query.order('period_number', { ascending: true });

      if (error) {
        throw new Error(error.message);
      }

      const sessions: AttendanceSession[] = (data || []).map((session: any) => ({
        id: session.id,
        student_id: session.student_id,
        student_name: session.profiles?.name || 'Unknown',
        roll_number: session.profiles?.roll_number || 'N/A',
        subject_name: session.subject_name,
        class_section: session.class_section,
        period_number: session.period_number,
        scheduled_start_time: session.scheduled_start_time,
        scheduled_end_time: session.scheduled_end_time,
        status: session.status || 'Scheduled',
        session_date: session.session_date
      }));

      setAttendanceSessions(sessions);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch attendance sessions';
      setError(errorMessage);
      console.error('Error fetching attendance sessions:', err);
    } finally {
      setLoading(false);
    }
  };

  const markAttendance = async (sessionId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('student_attendance_sessions')
        .update({ 
          status,
          actual_start_time: new Date().toTimeString().split(' ')[0],
          marked_by: user?.id
        })
        .eq('id', sessionId);

      if (error) {
        throw new Error(error.message);
      }

      // Refresh sessions
      await fetchAttendanceSessions();
      
      toast({
        title: "Success",
        description: "Attendance marked successfully",
      });

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to mark attendance';
      console.error('Error marking attendance:', err);
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    }
  };

  const batchMarkAttendance = async (updates: { sessionId: string; status: string }[]) => {
    try {
      for (const update of updates) {
        await supabase
          .from('student_attendance_sessions')
          .update({ 
            status: update.status,
            actual_start_time: new Date().toTimeString().split(' ')[0],
            marked_by: user?.id
          })
          .eq('id', update.sessionId);
      }

      // Refresh sessions
      await fetchAttendanceSessions();
      
      toast({
        title: "Success",
        description: `Marked ${updates.length} sessions successfully`,
      });

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to batch mark attendance';
      console.error('Error batch marking attendance:', err);
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    }
  };

  const createAttendanceSession = async (sessionData: any) => {
    try {
      const { error } = await supabase
        .from('student_attendance_sessions')
        .insert({
          ...sessionData,
          status: 'Scheduled'
        });

      if (error) {
        throw new Error(error.message);
      }

      await fetchAttendanceSessions();
      
      toast({
        title: "Success",
        description: "Attendance session created successfully",
      });

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create attendance session';
      console.error('Error creating attendance session:', err);
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    if (user) {
      fetchStudentsWithAttendance();
    }
  }, [user]);

  return {
    studentsWithAttendance,
    attendanceRecords,
    attendanceSessions,
    loading,
    error,
    refetch: fetchStudentsWithAttendance,
    fetchAttendanceRecords,
    fetchStudentsWithAttendance,
    fetchAttendanceSessions,
    markAttendance,
    batchMarkAttendance,
    createAttendanceSession
  };
};
