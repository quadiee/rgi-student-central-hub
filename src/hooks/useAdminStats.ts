
import { useState, useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';
import { useToast } from '../components/ui/use-toast';

interface AdminStats {
  totalUsers: number;
  pendingInvitations: number;
  activeStudents: number;
  facultyMembers: number;
  loading: boolean;
}

export const useAdminStats = () => {
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    pendingInvitations: 0,
    activeStudents: 0,
    facultyMembers: 0,
    loading: true
  });
  const { toast } = useToast();

  const loadStats = async () => {
    try {
      setStats(prev => ({ ...prev, loading: true }));

      // Get total users
      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Get pending invitations
      const { count: pendingInvitations } = await supabase
        .from('user_invitations')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true)
        .is('used_at', null);

      // Get active students
      const { count: activeStudents } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'student')
        .eq('is_active', true);

      // Get faculty members (faculty + hod + principal)
      const { count: facultyMembers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .in('role', ['faculty', 'hod', 'principal'])
        .eq('is_active', true);

      setStats({
        totalUsers: totalUsers || 0,
        pendingInvitations: pendingInvitations || 0,
        activeStudents: activeStudents || 0,
        facultyMembers: facultyMembers || 0,
        loading: false
      });

    } catch (error) {
      console.error('Error loading admin stats:', error);
      toast({
        title: "Error",
        description: "Failed to load admin statistics",
        variant: "destructive"
      });
      setStats(prev => ({ ...prev, loading: false }));
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  return { stats, loadStats };
};
