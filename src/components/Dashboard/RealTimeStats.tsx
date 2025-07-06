
import React, { useState, useEffect } from 'react';
import { Users, DollarSign, AlertTriangle, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { useAuth } from '../../contexts/SupabaseAuthContext';
import { supabase } from '../../integrations/supabase/client';

interface DashboardStats {
  totalStudents: number;
  totalRevenue: number;
  pendingPayments: number;
  paidStudents: number;
  departmentStats?: {
    totalStudents: number;
    totalRevenue: number;
    pendingPayments: number;
  };
}

const RealTimeStats: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalStudents: 0,
    totalRevenue: 0,
    pendingPayments: 0,
    paidStudents: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, [user]);

  const fetchStats = async () => {
    if (!user) return;

    try {
      setLoading(true);

      if (user.role === 'student') {
        // For students, show their personal stats
        const { data: feeRecords } = await supabase
          .from('fee_records')
          .select('*')
          .eq('student_id', user.id);

        const totalFees = feeRecords?.reduce((sum, record) => sum + record.final_amount, 0) || 0;
        const paidAmount = feeRecords?.reduce((sum, record) => sum + (record.paid_amount || 0), 0) || 0;
        const pendingAmount = totalFees - paidAmount;

        setStats({
          totalStudents: 1,
          totalRevenue: paidAmount,
          pendingPayments: pendingAmount,
          paidStudents: pendingAmount === 0 ? 1 : 0
        });
      } else {
        // For admin/principal/hod, show institutional stats
        let query = supabase
          .from('profiles')
          .select(`
            id,
            total_fees,
            paid_amount,
            due_amount,
            department_id
          `)
          .eq('role', 'student')
          .eq('is_active', true);

        // Filter by department for HOD
        if (user.role === 'hod') {
          query = query.eq('department_id', user.department_id);
        }

        const { data: students } = await query;

        if (students) {
          const totalStudents = students.length;
          const totalRevenue = students.reduce((sum, student) => sum + (student.paid_amount || 0), 0);
          const pendingPayments = students.reduce((sum, student) => sum + (student.due_amount || 0), 0);
          const paidStudents = students.filter(student => (student.due_amount || 0) === 0).length;

          setStats({
            totalStudents,
            totalRevenue,
            pendingPayments,
            paidStudents
          });
        }
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map(i => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                {user?.role === 'student' ? 'My Profile' : 'Total Students'}
              </p>
              <p className="text-2xl font-bold text-blue-600">
                {stats.totalStudents.toLocaleString()}
              </p>
            </div>
            <Users className="w-8 h-8 text-blue-600" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                {user?.role === 'student' ? 'Amount Paid' : 'Total Revenue'}
              </p>
              <p className="text-2xl font-bold text-green-600">
                ₹{stats.totalRevenue.toLocaleString()}
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-green-600" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                {user?.role === 'student' ? 'Amount Due' : 'Pending Collections'}
              </p>
              <p className="text-2xl font-bold text-red-600">
                ₹{stats.pendingPayments.toLocaleString()}
              </p>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                {user?.role === 'student' ? 'Payment Status' : 'Completed Payments'}
              </p>
              <p className="text-2xl font-bold text-purple-600">
                {user?.role === 'student' 
                  ? (stats.pendingPayments === 0 ? 'Paid' : 'Pending')
                  : stats.paidStudents.toLocaleString()
                }
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-purple-600" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RealTimeStats;
