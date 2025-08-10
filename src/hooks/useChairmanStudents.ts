
import { useState, useEffect } from 'react';
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
}

export const useChairmanStudents = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [students, setStudents] = useState<ChairmanStudentData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStudents = async (filters?: {
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
      // Using the correct relationship specification to avoid ambiguity
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
          ),
          fee_records (
            status,
            final_amount,
            paid_amount
          ),
          scholarships (
            scholarship_type
          )
        `)
        .eq('role', 'student')
        .eq('is_active', true);

      // Apply filters
      if (filters?.department && filters.department !== 'all') {
        // First get the department ID from the code
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

      // Transform data
      const transformedStudents: ChairmanStudentData[] = (data || []).map((student: any) => {
        const feeRecords = student.fee_records || [];
        const totalFees = feeRecords.reduce((sum: number, record: any) => sum + (record.final_amount || 0), 0);
        const totalPaid = feeRecords.reduce((sum: number, record: any) => sum + (record.paid_amount || 0), 0);
        
        let feeStatus: 'Paid' | 'Pending' | 'Overdue' = 'Pending';
        if (totalPaid >= totalFees && totalFees > 0) {
          feeStatus = 'Paid';
        } else if (feeRecords.some((record: any) => record.status === 'Overdue')) {
          feeStatus = 'Overdue';
        }

        const scholarships = (student.scholarships || []).map((s: any) => s.scholarship_type);

        return {
          id: student.id,
          name: student.name || 'N/A',
          roll_number: student.roll_number || 'N/A',
          department: student.departments?.code || 'N/A',
          semester: student.semester || 0,
          feeStatus,
          scholarships,
          phone: student.phone,
          email: student.email || '',
          department_id: student.department_id
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
  };

  useEffect(() => {
    if (user) {
      fetchStudents();
    }
  }, [user]);

  return {
    students,
    loading,
    error,
    fetchStudents,
    refetch: () => fetchStudents()
  };
};
