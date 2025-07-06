
import React, { useState, useEffect } from 'react';
import { TrendingUp, Users, IndianRupee, AlertTriangle, Eye } from 'lucide-react';
import { useAuth } from '../../contexts/SupabaseAuthContext';
import { supabase } from '../../integrations/supabase/client';
import { useToast } from '../ui/use-toast';
import { Card, CardContent } from '../ui/card';
import { formatCurrency } from '../../utils/feeValidation';
import { usePaymentBreakdown } from '../../hooks/usePaymentBreakdown';
import PaymentBreakdown from '../Fees/PaymentBreakdown';

interface DashboardStats {
  totalStudents: number;
  totalRevenue: number;
  totalOutstanding: number;
  overdueStudents: number;
  recentPaymentIds: string[];
  outstandingFeeRecords: string[];
}

const RealTimeStats: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const { 
    selectedPaymentId, 
    isShowingBreakdown, 
    showPaymentBreakdown, 
    hidePaymentBreakdown,
    breadcrumbItems 
  } = usePaymentBreakdown();

  useEffect(() => {
    if (user) {
      loadStats();
    }
  }, [user]);

  const loadStats = async () => {
    try {
      setLoading(true);

      // Get basic statistics
      const { data: feeRecords, error: feeError } = await supabase
        .from('fee_records')
        .select(`
          *,
          profiles!student_id (
            name,
            roll_number,
            departments:department_id (name)
          )
        `);

      if (feeError) throw feeError;

      // Get recent payments
      const { data: recentPayments, error: paymentsError } = await supabase
        .from('payment_transactions')
        .select('id')
        .eq('status', 'Success')
        .order('processed_at', { ascending: false })
        .limit(5);

      if (paymentsError) throw paymentsError;

      const uniqueStudentIds = new Set(feeRecords?.map(record => record.student_id).filter(Boolean));
      const totalStudents = uniqueStudentIds.size;

      const { data: payments } = await supabase
        .from('payment_transactions')
        .select('*')
        .eq('status', 'Success');

      const totalRevenue = payments?.reduce((sum, payment) => sum + Number(payment.amount), 0) || 0;
      const totalOutstanding = feeRecords?.reduce((sum, record) => 
        sum + (Number(record.final_amount) - Number(record.paid_amount || 0)), 0) || 0;

      // Count overdue students
      const overdueCount = feeRecords?.filter(record => 
        record.status === 'Overdue' || 
        (new Date(record.due_date) < new Date() && record.status !== 'Paid')
      ).length || 0;

      // Get outstanding fee records for breakdown
      const outstandingRecords = feeRecords?.filter(record => 
        Number(record.final_amount) > Number(record.paid_amount || 0)
      ).map(record => record.id) || [];

      setStats({
        totalStudents,
        totalRevenue,
        totalOutstanding,
        overdueStudents: overdueCount,
        recentPaymentIds: recentPayments?.map(p => p.id) || [],
        outstandingFeeRecords: outstandingRecords
      });
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard statistics",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatClick = async (statType: string) => {
    if (statType === 'revenue' && stats?.recentPaymentIds.length) {
      // Show breakdown for most recent payment
      const paymentId = stats.recentPaymentIds[0];
      showPaymentBreakdown(paymentId, [
        { label: 'Dashboard' },
        { label: 'Revenue Breakdown' }
      ]);
    } else if (statType === 'outstanding' && stats?.outstandingFeeRecords.length) {
      // Show breakdown for most recent outstanding fee record
      const feeRecordId = stats.outstandingFeeRecords[0];
      showPaymentBreakdown(feeRecordId, [
        { label: 'Dashboard' },
        { label: 'Outstanding Fees Breakdown' }
      ]);
    }
  };

  if (isShowingBreakdown && selectedPaymentId) {
    return (
      <PaymentBreakdown
        paymentId={selectedPaymentId}
        onBack={hidePaymentBreakdown}
        breadcrumbItems={breadcrumbItems}
      />
    );
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-16 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {/* Total Students */}
      <Card className="hover:shadow-lg transition-shadow cursor-pointer">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Students</p>
              <p className="text-2xl font-bold text-blue-600">{stats.totalStudents}</p>
            </div>
            <Users className="w-8 h-8 text-blue-500" />
          </div>
        </CardContent>
      </Card>

      {/* Total Revenue - Clickable */}
      <Card 
        className="hover:shadow-lg transition-shadow cursor-pointer group"
        onClick={() => handleStatClick('revenue')}
      >
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 flex items-center gap-2">
                Total Revenue
                <Eye className="w-3 h-3 opacity-50 group-hover:opacity-100" />
              </p>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(stats.totalRevenue)}
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-500" />
          </div>
        </CardContent>
      </Card>

      {/* Outstanding Amount - Clickable */}
      <Card 
        className="hover:shadow-lg transition-shadow cursor-pointer group"
        onClick={() => handleStatClick('outstanding')}
      >
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 flex items-center gap-2">
                Outstanding
                <Eye className="w-3 h-3 opacity-50 group-hover:opacity-100" />
              </p>
              <p className="text-2xl font-bold text-orange-600">
                {formatCurrency(stats.totalOutstanding)}
              </p>
            </div>
            <IndianRupee className="w-8 h-8 text-orange-500" />
          </div>
        </CardContent>
      </Card>

      {/* Overdue Students */}
      <Card className="hover:shadow-lg transition-shadow cursor-pointer">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Overdue</p>
              <p className="text-2xl font-bold text-red-600">{stats.overdueStudents}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RealTimeStats;
