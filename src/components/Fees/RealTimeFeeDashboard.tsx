
import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Users, IndianRupee, AlertTriangle, RefreshCw } from 'lucide-react';
import { useAuth } from '../../contexts/SupabaseAuthContext';
import { supabase } from '../../integrations/supabase/client';
import { useToast } from '../ui/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { formatCurrency } from '../../utils/feeValidation';

interface DashboardStats {
  totalStudents: number;
  totalRevenue: number;
  totalOutstanding: number;
  paidStudents: number;
  partialStudents: number;
  overdueStudents: number;
  departmentStats: Array<{
    department: string;
    total_students: number;
    collected: number;
    outstanding: number;
  }>;
  paymentMethodStats: Array<{
    method: string;
    count: number;
    amount: number;
  }>;
}

const RealTimeFeeDashboard: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const loadDashboardStats = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Get basic fee statistics
      const { data: feeRecords, error: feeError } = await supabase
        .from('fee_records')
        .select(`
          *,
          profiles!student_id (
            name,
            department,
            roll_number
          )
        `);

      if (feeError) throw feeError;

      // Get payment transactions
      const { data: payments, error: paymentError } = await supabase
        .from('payment_transactions')
        .select('*')
        .eq('status', 'Success');

      if (paymentError) throw paymentError;

      // Calculate statistics
      const totalStudents = feeRecords?.length || 0;
      const totalRevenue = payments?.reduce((sum, payment) => sum + Number(payment.amount), 0) || 0;
      const totalOutstanding = feeRecords?.reduce((sum, record) => 
        sum + (Number(record.final_amount) - Number(record.paid_amount || 0)), 0) || 0;

      const paidStudents = feeRecords?.filter(r => r.status === 'Paid').length || 0;
      const partialStudents = feeRecords?.filter(r => r.status === 'Partial').length || 0;
      const overdueStudents = feeRecords?.filter(r => r.status === 'Overdue').length || 0;

      // Department-wise statistics
      const deptMap = new Map();
      feeRecords?.forEach(record => {
        const dept = record.profiles?.department || 'Unknown';
        if (!deptMap.has(dept)) {
          deptMap.set(dept, {
            department: dept,
            total_students: 0,
            collected: 0,
            outstanding: 0
          });
        }
        const deptStat = deptMap.get(dept);
        deptStat.total_students += 1;
        deptStat.collected += Number(record.paid_amount || 0);
        deptStat.outstanding += Number(record.final_amount) - Number(record.paid_amount || 0);
      });

      // Payment method statistics
      const methodMap = new Map();
      payments?.forEach(payment => {
        const method = payment.payment_method;
        if (!methodMap.has(method)) {
          methodMap.set(method, { method, count: 0, amount: 0 });
        }
        const methodStat = methodMap.get(method);
        methodStat.count += 1;
        methodStat.amount += Number(payment.amount);
      });

      setStats({
        totalStudents,
        totalRevenue,
        totalOutstanding,
        paidStudents,
        partialStudents,
        overdueStudents,
        departmentStats: Array.from(deptMap.values()),
        paymentMethodStats: Array.from(methodMap.values())
      });

      setLastUpdated(new Date());
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

  useEffect(() => {
    loadDashboardStats();
    
    // Set up real-time updates
    const channel = supabase
      .channel('dashboard-updates')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'payment_transactions'
      }, () => {
        loadDashboardStats();
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'fee_records'
      }, () => {
        loadDashboardStats();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!stats) return null;

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  const pieData = [
    { name: 'Paid', value: stats.paidStudents, color: '#10B981' },
    { name: 'Partial', value: stats.partialStudents, color: '#F59E0B' },
    { name: 'Overdue', value: stats.overdueStudents, color: '#EF4444' },
    { name: 'Pending', value: stats.totalStudents - stats.paidStudents - stats.partialStudents - stats.overdueStudents, color: '#6B7280' }
  ];

  return (
    <div className="space-y-6">
      {/* Header with Refresh */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Real-Time Fee Dashboard</h2>
          <p className="text-sm text-gray-600">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </p>
        </div>
        <Button onClick={loadDashboardStats} disabled={loading} variant="outline">
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
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

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(stats.totalRevenue)}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Outstanding</p>
                <p className="text-2xl font-bold text-orange-600">
                  {formatCurrency(stats.totalOutstanding)}
                </p>
              </div>
              <IndianRupee className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
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

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department-wise Collection */}
        <Card>
          <CardHeader>
            <CardTitle>Department-wise Collection</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.departmentStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="department" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Bar dataKey="collected" fill="#10B981" name="Collected" />
                <Bar dataKey="outstanding" fill="#F59E0B" name="Outstanding" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Payment Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Payment Methods Summary */}
      {stats.paymentMethodStats.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Payment Methods Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {stats.paymentMethodStats.map(method => (
                <div key={method.method} className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-800">{method.method}</h4>
                  <p className="text-sm text-gray-600">{method.count} transactions</p>
                  <p className="text-lg font-bold text-blue-600">
                    {formatCurrency(method.amount)}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default RealTimeFeeDashboard;
