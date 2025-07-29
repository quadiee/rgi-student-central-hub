
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/SupabaseAuthContext';
import { supabase } from '../../../integrations/supabase/client';
import QuickStatsCards from '../QuickStatsCards';
import RecentActivityFeed from '../RecentActivityFeed';
import NotificationCenter from '../NotificationCenter';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { 
  CreditCard, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  TrendingUp,
  Calendar,
  BookOpen,
  Award
} from 'lucide-react';
import { formatCurrency } from '../../../utils/feeValidation';
import { useToast } from '../../ui/use-toast';

interface StudentStats {
  totalFees: number;
  paidAmount: number;
  pendingAmount: number;
  attendancePercentage: number;
  upcomingExams: number;
  completedAssignments: number;
}

const StudentMobileDashboard: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [stats, setStats] = useState<StudentStats>({
    totalFees: 0,
    paidAmount: 0,
    pendingAmount: 0,
    attendancePercentage: 0,
    upcomingExams: 0,
    completedAssignments: 0
  });
  const [loading, setLoading] = useState(true);
  const [urgentPayments, setUrgentPayments] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      loadStudentData();
    }
  }, [user]);

  const loadStudentData = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Load fee records
      const { data: feeData } = await supabase
        .from('fee_records')
        .select('*')
        .eq('student_id', user.id);

      if (feeData) {
        const totalFees = feeData.reduce((sum, record) => sum + Number(record.final_amount), 0);
        const paidAmount = feeData.reduce((sum, record) => sum + Number(record.paid_amount || 0), 0);
        const pendingAmount = totalFees - paidAmount;

        // Find urgent payments (due within 7 days)
        const urgentPayments = feeData.filter(record => {
          const dueDate = new Date(record.due_date);
          const today = new Date();
          const diffTime = dueDate.getTime() - today.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          return diffDays <= 7 && diffDays >= 0 && record.status !== 'Paid';
        });

        setStats(prev => ({
          ...prev,
          totalFees,
          paidAmount,
          pendingAmount
        }));

        setUrgentPayments(urgentPayments);
      }

      // Mock data for attendance and academic info
      setStats(prev => ({
        ...prev,
        attendancePercentage: 87,
        upcomingExams: 3,
        completedAssignments: 12
      }));

    } catch (error) {
      console.error('Error loading student data:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const quickStats = [
    {
      title: 'Pending Fees',
      value: formatCurrency(stats.pendingAmount),
      change: urgentPayments.length > 0 ? `${urgentPayments.length} due soon` : 'All up to date',
      icon: CreditCard,
      color: stats.pendingAmount > 0 ? 'text-red-600' : 'text-green-600',
      bgColor: stats.pendingAmount > 0 ? 'bg-red-50' : 'bg-green-50'
    },
    {
      title: 'Attendance',
      value: `${stats.attendancePercentage}%`,
      change: stats.attendancePercentage >= 75 ? 'Good standing' : 'Below required',
      icon: Clock,
      color: stats.attendancePercentage >= 75 ? 'text-green-600' : 'text-red-600',
      bgColor: stats.attendancePercentage >= 75 ? 'bg-green-50' : 'bg-red-50'
    },
    {
      title: 'Assignments',
      value: stats.completedAssignments.toString(),
      change: 'Completed this sem',
      icon: CheckCircle,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Upcoming Exams',
      value: stats.upcomingExams.toString(),
      change: 'This month',
      icon: BookOpen,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    }
  ];

  if (loading) {
    return (
      <div className="p-4 space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-32 bg-gray-200 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      {/* Welcome Section */}
      <div className="text-center py-6">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          Welcome back, {user?.name?.split(' ')[0] || 'Student'}!
        </h2>
        <p className="text-gray-600 mt-2">Here's your academic overview</p>
      </div>

      {/* Quick Stats */}
      <QuickStatsCards stats={quickStats} />

      {/* Urgent Payments Alert */}
      {urgentPayments.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader className="pb-3">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <CardTitle className="text-red-800 text-lg">Urgent Payments</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {urgentPayments.slice(0, 2).map((payment) => (
                <div key={payment.id} className="flex items-center justify-between p-3 bg-white rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">
                      {payment.academic_year} - Semester {payment.semester}
                    </p>
                    <p className="text-sm text-gray-600">
                      Due: {new Date(payment.due_date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-red-600">
                      {formatCurrency(payment.final_amount - (payment.paid_amount || 0))}
                    </p>
                    <Button size="sm" className="mt-1 bg-red-600 hover:bg-red-700">
                      Pay Now
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Academic Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            <span>Academic Progress</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Attendance Progress */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-600">Attendance</span>
                <Badge variant={stats.attendancePercentage >= 75 ? "default" : "destructive"}>
                  {stats.attendancePercentage}%
                </Badge>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-500 ${
                    stats.attendancePercentage >= 75 ? 'bg-green-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${stats.attendancePercentage}%` }}
                />
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-3 mt-4">
              <Button variant="outline" className="h-16 flex flex-col items-center justify-center">
                <Calendar className="w-5 h-5 mb-1 text-blue-600" />
                <span className="text-xs">View Schedule</span>
              </Button>
              <Button variant="outline" className="h-16 flex flex-col items-center justify-center">
                <Award className="w-5 h-5 mb-1 text-purple-600" />
                <span className="text-xs">Achievements</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <RecentActivityFeed limit={5} />

      {/* Notifications */}
      <NotificationCenter />
    </div>
  );
};

export default StudentMobileDashboard;
