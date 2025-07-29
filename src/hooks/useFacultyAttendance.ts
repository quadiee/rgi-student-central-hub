import { useState, useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';
import { useAuth } from '../contexts/SupabaseAuthContext';

export interface FacultyAttendanceRecord {
  id: string;
  faculty_id: string;
  attendance_date: string;
  total_periods: number;
  present_periods: number;
  absent_periods: number;
  late_periods: number;
  overall_status: 'Present' | 'Absent' | 'Partial' | 'On Leave';
  first_punch_time?: string;
  last_punch_time?: string;
  total_working_hours?: string;
  faculty_name: string;
  employee_code: string;
  department_name: string;
}

export interface FacultyAttendanceSession {
  id: string;
  faculty_id: string;
  session_date: string;
  period_number: number;
  subject_name: string;
  class_section: string;
  scheduled_start_time: string;
  scheduled_end_time: string;
  actual_start_time?: string;
  actual_end_time?: string;
  status: 'Scheduled' | 'Present' | 'Absent' | 'Late' | 'Left Early';
  marking_method: 'Manual' | 'Facial Recognition' | 'Excel Import';
  faculty_name: string;
  employee_code: string;
}

export interface FacialRecognitionLog {
  id: string;
  faculty_id: string;
  device_id: string;
  recognition_timestamp: string;
  confidence_score?: number;
  photo_url?: string;
  location?: string;
  recognition_type: 'Entry' | 'Exit';
  processed: boolean;
  faculty_name: string;
  employee_code: string;
}

export interface EnhancedFacultyMember {
  faculty_id: string;
  user_id: string;
  name: string;
  email: string;
  employee_code: string;
  designation: string;
  department_name: string;
  department_code: string;
  joining_date: string;
  phone: string | null;
  gender: string | null;
  age: number | null;
  years_of_experience: number | null;
  is_active: boolean;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  current_address: string | null;
  blood_group: string | null;
  marital_status: string | null;
  total_attendance_days: number;
  present_days: number;
  absent_days: number;
  attendance_percentage: number;
}

export const useFacultyAttendance = () => {
  const { user } = useAuth();
  const [attendanceRecords, setAttendanceRecords] = useState<FacultyAttendanceRecord[]>([]);
  const [attendanceSessions, setAttendanceSessions] = useState<FacultyAttendanceSession[]>([]);
  const [facialRecognitionLogs, setFacialRecognitionLogs] = useState<FacialRecognitionLog[]>([]);
  const [enhancedFacultyList, setEnhancedFacultyList] = useState<EnhancedFacultyMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEnhancedFacultyList = async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.rpc('get_faculty_with_details', {
        p_user_id: user.id
      });

      if (error) throw error;

      const mappedData: EnhancedFacultyMember[] = (data || []).map((faculty: any) => ({
        faculty_id: faculty.faculty_id,
        user_id: faculty.user_id,
        name: faculty.name || 'N/A',
        email: faculty.email || 'N/A',
        employee_code: faculty.employee_code || 'N/A',
        designation: faculty.designation || 'N/A',
        department_name: faculty.department_name || 'Unknown Department',
        department_code: faculty.department_code || 'N/A',
        joining_date: faculty.joining_date || '',
        phone: faculty.phone,
        gender: faculty.gender,
        age: faculty.age,
        years_of_experience: faculty.years_of_experience,
        is_active: faculty.is_active || false,
        emergency_contact_name: faculty.emergency_contact_name,
        emergency_contact_phone: faculty.emergency_contact_phone,
        current_address: faculty.current_address,
        blood_group: faculty.blood_group,
        marital_status: faculty.marital_status,
        total_attendance_days: faculty.total_attendance_days || 0,
        present_days: faculty.present_days || 0,
        absent_days: faculty.absent_days || 0,
        attendance_percentage: faculty.attendance_percentage || 0
      }));

      setEnhancedFacultyList(mappedData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch enhanced faculty list');
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendanceRecords = async (date?: string, departmentId?: string) => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('faculty_attendance')
        .select(`
          *,
          faculty_profiles!inner (
            id,
            employee_code,
            profiles!faculty_profiles_user_id_fkey (
              name,
              department_id,
              departments (
                name
              )
            )
          )
        `)
        .order('attendance_date', { ascending: false });

      if (date) {
        query = query.eq('attendance_date', date);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      const formattedRecords: FacultyAttendanceRecord[] = data?.map(record => ({
        id: record.id,
        faculty_id: record.faculty_id,
        attendance_date: record.attendance_date,
        total_periods: record.total_periods,
        present_periods: record.present_periods,
        absent_periods: record.absent_periods,
        late_periods: record.late_periods,
        overall_status: record.overall_status as 'Present' | 'Absent' | 'Partial' | 'On Leave',
        first_punch_time: record.first_punch_time,
        last_punch_time: record.last_punch_time,
        total_working_hours: record.total_working_hours ? String(record.total_working_hours) : undefined,
        faculty_name: record.faculty_profiles?.profiles?.name || 'Unknown',
        employee_code: record.faculty_profiles?.employee_code || '',
        department_name: record.faculty_profiles?.profiles?.departments?.name || 'Unknown'
      })) || [];

      setAttendanceRecords(formattedRecords);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch attendance records');
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendanceSessions = async (date?: string, facultyId?: string) => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('faculty_attendance_sessions')
        .select(`
          *,
          faculty_profiles!inner (
            id,
            employee_code,
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

      if (facultyId) {
        query = query.eq('faculty_id', facultyId);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      const formattedSessions: FacultyAttendanceSession[] = data?.map(session => ({
        id: session.id,
        faculty_id: session.faculty_id,
        session_date: session.session_date,
        period_number: session.period_number,
        subject_name: session.subject_name,
        class_section: session.class_section,
        scheduled_start_time: session.scheduled_start_time,
        scheduled_end_time: session.scheduled_end_time,
        actual_start_time: session.actual_start_time,
        actual_end_time: session.actual_end_time,
        status: session.status as 'Scheduled' | 'Present' | 'Absent' | 'Late' | 'Left Early',
        marking_method: session.marking_method as 'Manual' | 'Facial Recognition' | 'Excel Import',
        faculty_name: session.faculty_profiles?.profiles?.name || 'Unknown',
        employee_code: session.faculty_profiles?.employee_code || ''
      })) || [];

      setAttendanceSessions(formattedSessions);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch attendance sessions');
    } finally {
      setLoading(false);
    }
  };

  const fetchFacialRecognitionLogs = async (date?: string, processed?: boolean) => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('faculty_facial_recognition_logs')
        .select(`
          *,
          faculty_profiles!inner (
            id,
            employee_code,
            profiles!faculty_profiles_user_id_fkey (
              name
            )
          )
        `)
        .order('recognition_timestamp', { ascending: false });

      if (date) {
        query = query.gte('recognition_timestamp', `${date}T00:00:00`)
                   .lt('recognition_timestamp', `${date}T23:59:59`);
      }

      if (processed !== undefined) {
        query = query.eq('processed', processed);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      const formattedLogs: FacialRecognitionLog[] = data?.map(log => ({
        id: log.id,
        faculty_id: log.faculty_id,
        device_id: log.device_id,
        recognition_timestamp: log.recognition_timestamp,
        confidence_score: log.confidence_score,
        photo_url: log.photo_url,
        location: log.location,
        recognition_type: log.recognition_type as 'Entry' | 'Exit',
        processed: log.processed,
        faculty_name: log.faculty_profiles?.profiles?.name || 'Unknown',
        employee_code: log.faculty_profiles?.employee_code || ''
      })) || [];

      setFacialRecognitionLogs(formattedLogs);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch facial recognition logs');
    } finally {
      setLoading(false);
    }
  };

  const markAttendance = async (sessionId: string, status: string, actualStartTime?: string, actualEndTime?: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('faculty_attendance_sessions')
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
    faculty_id: string;
    session_date: string;
    period_number: number;
    subject_name: string;
    class_section: string;
    scheduled_start_time: string;
    scheduled_end_time: string;
  }) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('faculty_attendance_sessions')
        .insert([sessionData]);

      if (error) throw error;

      // Refresh the sessions data
      await fetchAttendanceSessions();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create attendance session');
      throw err;
    }
  };

  const processFacialRecognitionData = async (recognitionData: {
    faculty_id: string;
    device_id: string;
    recognition_timestamp: string;
    confidence_score?: number;
    photo_url?: string;
    location?: string;
    recognition_type: 'Entry' | 'Exit';
  }) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('faculty_facial_recognition_logs')
        .insert([recognitionData]);

      if (error) throw error;

      // The database trigger will automatically process this into attendance
      await fetchFacialRecognitionLogs();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process facial recognition data');
      throw err;
    }
  };

  return {
    attendanceRecords,
    attendanceSessions,
    facialRecognitionLogs,
    enhancedFacultyList,
    loading,
    error,
    fetchAttendanceRecords,
    fetchAttendanceSessions,
    fetchFacialRecognitionLogs,
    fetchEnhancedFacultyList,
    markAttendance,
    createAttendanceSession,
    processFacialRecognitionData
  };
};
