
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/SupabaseAuthContext';
import { DataService } from '../services/dataService';

export interface DashboardStats {
  totalStudents: number;
  totalFaculty: number;
  totalFeeRecords: number;
  totalRevenue: number;
  pendingFees: number;
}

export const useDashboardStats = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalStudents: 0,
    totalFaculty: 0,
    totalFeeRecords: 0,
    totalRevenue: 0,
    pendingFees: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);
      const dashboardStats = await DataService.getDashboardStats(user);
      setStats(dashboardStats);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch dashboard stats');
      console.error('Error fetching dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [user]);

  return {
    stats,
    loading,
    error,
    refetch: fetchStats
  };
};
