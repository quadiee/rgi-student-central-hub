
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

export const useStudentAttendance = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [studentsWithAttendance, setStudentsWithAttendance] = useState<StudentWithAttendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStudentAttendance = async () => {
    if (!user) {
      setError('User not authenticated');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Use the existing function to get students with attendance details
      const { data: studentData, error: studentError } = await supabase
        .rpc('get_student_with_attendance_details', { p_user_id: user.id });

      if (studentError) {
        throw new Error(studentError.message);
      }

      // Safely handle the data
      const students = studentData || [];
      
      // Transform the data to match our interface
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

  useEffect(() => {
    fetchStudentAttendance();
  }, [user]);

  return {
    studentsWithAttendance,
    loading,
    error,
    refetch: fetchStudentAttendance
  };
};
