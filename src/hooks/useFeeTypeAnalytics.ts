
import { useState, useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';
import { useAuth } from '../contexts/SupabaseAuthContext';
import { useToast } from '../components/ui/use-toast';

interface FeeTypeAnalytics {
  fee_type_id: string;
  fee_type_name: string;
  fee_type_description: string;
  is_mandatory: boolean;
  total_students: number;
  total_fee_records: number;
  total_fees: number;
  total_collected: number;
  total_pending: number;
  collection_percentage: number;
  overdue_records: number;
  avg_fee_per_student: number;
  last_updated: string;
}

export const useFeeTypeAnalytics = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [analytics, setAnalytics] = useState<FeeTypeAnalytics[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = async (showRefresh = false) => {
    if (!user) return;

    try {
      if (showRefresh) {
        setLoading(true);
      } else {
        setLoading(true);
      }

      const { data, error } = await supabase.rpc('get_fee_type_analytics_filtered', {
        p_from_date: null,
        p_to_date: null,
        p_date_filter_type: 'created_at',
        p_department_ids: null,
        p_status_filter: null,
        p_min_amount: null,
        p_max_amount: null
      });

      if (error) throw error;

      setAnalytics(data || []);
      setError(null);

    } catch (err) {
      console.error('Error fetching fee type analytics:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch fee type analytics';
      setError(errorMessage);
      
      if (!showRefresh) {
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive"
        });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchAnalytics();
    }
  }, [user?.id]);

  const refresh = () => fetchAnalytics(true);

  const getTopPerformingFeeTypes = (count = 3) => {
    return [...analytics]
      .sort((a, b) => b.collection_percentage - a.collection_percentage)
      .slice(0, count);
  };

  const getWorstPerformingFeeTypes = (count = 3) => {
    return [...analytics]
      .filter(item => item.total_fees > 0)
      .sort((a, b) => a.collection_percentage - b.collection_percentage)
      .slice(0, count);
  };

  const getTotalStats = () => {
    return analytics.reduce((acc, item) => ({
      totalFees: acc.totalFees + (item.total_fees || 0),
      totalCollected: acc.totalCollected + (item.total_collected || 0),
      totalPending: acc.totalPending + (item.total_pending || 0),
      totalStudents: acc.totalStudents + (item.total_students || 0),
      totalRecords: acc.totalRecords + (item.total_fee_records || 0)
    }), { totalFees: 0, totalCollected: 0, totalPending: 0, totalStudents: 0, totalRecords: 0 });
  };

  return {
    analytics,
    loading,
    error,
    refresh,
    getTopPerformingFeeTypes,
    getWorstPerformingFeeTypes,
    getTotalStats
  };
};
