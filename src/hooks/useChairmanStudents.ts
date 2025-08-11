
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../integrations/supabase/client';
import { useAuth } from '../contexts/SupabaseAuthContext';
import { useToast } from '../components/ui/use-toast';

export interface ChairmanStudentData {
  id: string;
  name: string;
  roll_number: string;
  department: string;
  semester: number;
  feeStatus: 'Paid' | 'Pending' | 'Overdue';
  academicPerformance?: number;
  scholarships: string[];
  phone?: string;
  email: string;
  department_id: string;
  totalFees: number;
  totalPaid: number;
  dueAmount: number;
}

export const useChairmanStudents = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [students, setStudents] = useState<ChairmanStudentData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStudents = useCallback(async (filters?: {
    department?: string;
    semester?: number;
    feeStatus?: string;
    searchTerm?: string;
  }) => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      // Get all students with their department and fee information
      let query = supabase
        .from('profiles')
        .select(`
          id,
          name,
          roll_number,
          semester,
          phone,
          email,
          department_id,
          departments!profiles_department_id_fkey (
            name,
            code
          )
        `)
        .eq('role', 'student')
        .eq('is_active', true);

      // Apply filters
      if (filters?.department && filters.department !== 'all') {
        const { data: deptData } = await supabase
          .from('departments')
          .select('id')
          .eq('code', filters.department)
          .single();
        
        if (deptData) {
          query = query.eq('department_id', deptData.id);
        }
      }

      if (filters?.semester && filters.semester !== 0) {
        query = query.eq('semester', filters.semester);
      }

      if (filters?.searchTerm) {
        query = query.or(`name.ilike.%${filters.searchTerm}%,roll_number.ilike.%${filters.searchTerm}%`);
      }

      const { data, error: fetchError } = await query.order('roll_number');

      if (fetchError) throw fetchError;

      // Get fee records for all students
      const studentIds = (data || []).map(s => s.id);
      const { data: feeData } = await supabase
        .from('fee_records')
        .select('student_id, original_amount, final_amount, paid_amount, status')
        .in('student_id', studentIds);

      // Get scholarships separately
      const { data: scholarshipsData } = await supabase
        .from('scholarships')
        .select('student_id, scholarship_type')
        .in('student_id', studentIds);

      // Transform data with real fee calculations
      const transformedStudents: ChairmanStudentData[] = (data || []).map((student: any) => {
        const studentFees = (feeData || []).filter((fee: any) => fee.student_id === student.id);
        const totalFees = studentFees.reduce((sum: number, fee: any) => sum + (Number(fee.final_amount) || 0), 0);
        const totalPaid = studentFees.reduce((sum: number, fee: any) => sum + (Number(fee.paid_amount) || 0), 0);
        const dueAmount = totalFees - totalPaid;
        
        let feeStatus: 'Paid' | 'Pending' | 'Overdue' = 'Pending';
        if (totalPaid >= totalFees && totalFees > 0) {
          feeStatus = 'Paid';
        } else if (studentFees.some((fee: any) => fee.status === 'Overdue')) {
          feeStatus = 'Overdue';
        }

        const studentScholarships = (scholarshipsData || [])
          .filter((s: any) => s.student_id === student.id)
          .map((s: any) => s.scholarship_type);

        return {
          id: student.id,
          name: student.name || 'N/A',
          roll_number: student.roll_number || 'N/A',
          department: student.departments?.code || 'N/A',
          semester: student.semester || 0,
          feeStatus,
          scholarships: studentScholarships,
          phone: student.phone,
          email: student.email || '',
          department_id: student.department_id,
          totalFees,
          totalPaid,
          dueAmount
        };
      });

      // Apply fee status filter
      if (filters?.feeStatus && filters.feeStatus !== 'all') {
        const filtered = transformedStudents.filter(s => 
          s.feeStatus.toLowerCase() === filters.feeStatus?.toLowerCase()
        );
        setStudents(filtered);
      } else {
        setStudents(transformedStudents);
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch students';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
      console.error('Error fetching students:', err);
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  useEffect(() => {
    if (user) {
      fetchStudents();
    }
  }, [user?.id]);

  return {
    students,
    loading,
    error,
    fetchStudents,
    refetch: () => fetchStudents()
  };
};
