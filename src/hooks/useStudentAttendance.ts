
import { useState, useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';
import { useAuth } from '../contexts/SupabaseAuthContext';

export interface StudentAttendanceRecord {
  id: string;
  student_id: string;
  attendance_date: string;
  total_periods: number;
  present_periods: number;
  absent_periods: number;
  late_periods: number;
  excused_periods: number;
  overall_status: 'Present' | 'Absent' | 'Partial' | 'On Leave';
  attendance_percentage: number;
  student_name: string;
  roll_number: string;
  department_name: string;
}

export interface StudentAttendanceSession {
  id: string;
  student_id: string;
  session_date: string;
  period_number: number;
  subject_name: string;
  faculty_id?: string;
  class_section: string;
  scheduled_start_time: string;
  scheduled_end_time: string;
  actual_start_time?: string;
  actual_end_time?: string;
  status: 'Scheduled' | 'Present' | 'Absent' | 'Late' | 'Excused';
  marking_method: 'Manual' | 'Biometric' | 'Excel Import';
  student_name: string;
  roll_number: string;
  faculty_name?: string;
}

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

export const useStudentAttendance = () => {
  const { user } = useAuth();
  const [attendanceRecords, setAttendanceRecords] = useState<StudentAttendanceRecord[]>([]);
  const [attendanceSessions, setAttendanceSessions] = useState<StudentAttendanceSession[]>([]);
  const [studentsWithAttendance, setStudentsWithAttendance] = useState<StudentWithAttendance[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStudentsWithAttendance = async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.rpc('get_student_with_attendance_details', {
        p_user_id: user.id
      });

      if (error) throw error;

      const mappedData: StudentWithAttendance[] = (data || []).map((student: any) => ({
        student_id: student.student_id,
        user_id: student.user_id,
        name: student.name || 'N/A',
        email: student.email || 'N/A',
        roll_number: student.roll_number || 'N/A',
        department_name: student.department_name || 'Unknown Department',
        year: student.year || 0,
        semester: student.semester || 0,
        total_attendance_days: student.total_attendance_days || 0,
        present_days: student.present_days || 0,
        absent_days: student.absent_days || 0,
        attendance_percentage: student.attendance_percentage || 0
      }));

      setStudentsWithAttendance(mappedData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch students with attendance');
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendanceRecords = async (date?: string, departmentId?: string, studentId?: string) => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('student_attendance')
        .select(`
          *,
          profiles!student_attendance_student_id_fkey (
            name,
            roll_number,
            department_id,
            departments (
              name
            )
          )
        `)
        .order('attendance_date', { ascending: false });

      if (date) {
        query = query.eq('attendance_date', date);
      }

      if (studentId) {
        query = query.eq('student_id', studentId);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      const formattedRecords: StudentAttendanceRecord[] = data?.map(record => ({
        id: record.id,
        student_id: record.student_id,
        attendance_date: record.attendance_date,
        total_periods: record.total_periods,
        present_periods: record.present_periods,
        absent_periods: record.absent_periods,
        late_periods: record.late_periods,
        excused_periods: record.excused_periods,
        overall_status: record.overall_status as 'Present' | 'Absent' | 'Partial' | 'On Leave',
        attendance_percentage: record.attendance_percentage || 0,
        student_name: record.profiles?.name || 'Unknown',
        roll_number: record.profiles?.roll_number || 'N/A',
        department_name: record.profiles?.departments?.name || 'Unknown'
      })) || [];

      setAttendanceRecords(formattedRecords);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch attendance records');
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendanceSessions = async (date?: string, studentId?: string, classSection?: string) => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('student_attendance_sessions')
        .select(`
          *,
          profiles!student_attendance_sessions_student_id_fkey (
            name,
            roll_number
          ),
          faculty_profiles!student_attendance_sessions_faculty_id_fkey (
            profiles!faculty_profiles_user_id_fkey (
              name
            )
          )
        `)
        .order('session_date', { ascending: false })
        .order('period_number', { ascending: true });

      if (date) {
        query = query.eq('session_date', date);
      }

      if (studentId) {
        query = query.eq('student_id', studentId);
      }

      if (classSection) {
        query = query.eq('class_section', classSection);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      const formattedSessions: StudentAttendanceSession[] = data?.map(session => ({
        id: session.id,
        student_id: session.student_id,
        session_date: session.session_date,
        period_number: session.period_number,
        subject_name: session.subject_name,
        faculty_id: session.faculty_id,
        class_section: session.class_section,
        scheduled_start_time: session.scheduled_start_time,
        scheduled_end_time: session.scheduled_end_time,
        actual_start_time: session.actual_start_time,
        actual_end_time: session.actual_end_time,
        status: session.status as 'Scheduled' | 'Present' | 'Absent' | 'Late' | 'Excused',
        marking_method: session.marking_method as 'Manual' | 'Biometric' | 'Excel Import',
        student_name: session.profiles?.name || 'Unknown',
        roll_number: session.profiles?.roll_number || 'N/A',
        faculty_name: session.faculty_profiles?.profiles?.name || 'Unknown'
      })) || [];

      setAttendanceSessions(formattedSessions);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch attendance sessions');
    } finally {
      setLoading(false);
    }
  };

  const markAttendance = async (sessionId: string, status: string, actualStartTime?: string, actualEndTime?: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('student_attendance_sessions')
        .update({
          status,
          actual_start_time: actualStartTime,
          actual_end_time: actualEndTime,
          marked_by: user.id,
          marking_method: 'Manual',
          updated_at: new Date().toISOString()
        })
        .eq('id', sessionId);

      if (error) throw error;

      // Refresh the sessions data
      await fetchAttendanceSessions();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mark attendance');
      throw err;
    }
  };

  const createAttendanceSession = async (sessionData: {
    student_id: string;
    session_date: string;
    period_number: number;
    subject_name: string;
    class_section: string;
    scheduled_start_time: string;
    scheduled_end_time: string;
    faculty_id?: string;
  }) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('student_attendance_sessions')
        .insert([sessionData]);

      if (error) throw error;

      // Refresh the sessions data
      await fetchAttendanceSessions();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create attendance session');
      throw err;
    }
  };

  const batchMarkAttendance = async (updates: { sessionId: string; status: string }[]) => {
    if (!user) return;

    try {
      const promises = updates.map(update =>
        supabase
          .from('student_attendance_sessions')
          .update({
            status: update.status,
            marked_by: user.id,
            marking_method: 'Manual',
            updated_at: new Date().toISOString()
          })
          .eq('id', update.sessionId)
      );

      const results = await Promise.all(promises);
      
      const errors = results.filter(result => result.error);
      if (errors.length > 0) {
        throw new Error(`Failed to update ${errors.length} attendance records`);
      }

      // Refresh the sessions data
      await fetchAttendanceSessions();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to batch mark attendance');
      throw err;
    }
  };

  return {
    attendanceRecords,
    attendanceSessions,
    studentsWithAttendance,
    loading,
    error,
    fetchAttendanceRecords,
    fetchAttendanceSessions,
    fetchStudentsWithAttendance,
    markAttendance,
    createAttendanceSession,
    batchMarkAttendance
  };
};
