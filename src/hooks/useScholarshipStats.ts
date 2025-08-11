
import { useState, useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';
import { useAuth } from '../contexts/SupabaseAuthContext';

export interface ScholarshipStats {
  totalScholarships: number;
  totalEligibleAmount: number;
  totalReceivedAmount: number;
  appliedScholarships: number;
  receivedScholarships: number;
  scholarshipStudents: number;
  pmssScholarships: number;
  fgScholarships: number;
}

export const useScholarshipStats = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<ScholarshipStats>({
    totalScholarships: 0,
    totalEligibleAmount: 0,
    totalReceivedAmount: 0,
    appliedScholarships: 0,
    receivedScholarships: 0,
    scholarshipStudents: 0,
    pmssScholarships: 0,
    fgScholarships: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchScholarshipStats = async () => {
      if (!user) return;

      try {
        setLoading(true);
        
        // Get scholarship records
        const { data: scholarships, error: scholarshipError } = await supabase
          .from('scholarships')
          .select('*');

        if (scholarshipError) throw scholarshipError;

        if (scholarships) {
          const totalScholarships = scholarships.length;
          const totalEligibleAmount = scholarships.reduce((sum, s) => sum + Number(s.eligible_amount), 0);
          const appliedScholarships = scholarships.filter(s => s.applied_status).length;
          const receivedScholarships = scholarships.filter(s => s.received_by_institution).length;
          const totalReceivedAmount = scholarships
            .filter(s => s.received_by_institution)
            .reduce((sum, s) => sum + Number(s.eligible_amount), 0);
          
          const scholarshipStudents = new Set(scholarships.map(s => s.student_id)).size;
          const pmssScholarships = scholarships.filter(s => s.scholarship_type === 'PMSS').length;
          const fgScholarships = scholarships.filter(s => s.scholarship_type === 'FG').length;

          setStats({
            totalScholarships,
            totalEligibleAmount,
            totalReceivedAmount,
            appliedScholarships,
            receivedScholarships,
            scholarshipStudents,
            pmssScholarships,
            fgScholarships
          });
        }
      } catch (err) {
        console.error('Error fetching scholarship stats:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch scholarship stats');
      } finally {
        setLoading(false);
      }
    };

    fetchScholarshipStats();
  }, [user?.id]); // Only depend on user.id to prevent unnecessary re-fetches

  return { stats, loading, error };
};
