
import React, { useState, useEffect } from 'react';
import { CreditCard, Clock, CheckCircle, AlertTriangle, Calendar, History, TrendingUp } from 'lucide-react';
import { useAuth } from '../../contexts/SupabaseAuthContext';
import { supabase } from '../../integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { useToast } from '../ui/use-toast';
import { formatCurrency } from '../../utils/feeValidation';
import { useIsMobile } from '../../hooks/use-mobile';

interface StudentFeeRecord {
  id: string;
  academic_year: string;
  semester: number;
  original_amount: number;
  final_amount: number;
  paid_amount: number;
  status: string;
  due_date: string;
  last_payment_date?: string;
  fee_type_name?: string;
}

interface UserActivity {
  id: string;
  activity_type: string;
  activity_description: string;
  metadata: any;
  created_at: string;
}

interface PaymentTransaction {
  id: string;
  amount: number;
  payment_method: string;
  status: string;
  processed_at: string;
  receipt_number: string;
}

const EnhancedStudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [feeRecords, setFeeRecords] = useState<StudentFeeRecord[]>([]);
  const [recentActivities, setRecentActivities] = useState<UserActivity[]>([]);
  const [recentPayments, setRecentPayments] = useState<PaymentTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState<StudentFeeRecord | null>(null);

  useEffect(() => {
    if (user) {
      loadStudentData();
    }
  }, [user]);

  const loadStudentData = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Load fee records with proper joins
      const { data: feeData, error: feeError } = await supabase
        .from('fee_records')
        .select(`
          *,
          fee_types!fee_type_id (name)
        `)
        .eq('student_id', user.id)
        .order('created_at', { ascending: false });

      if (feeError) throw feeError;

      const formattedFeeRecords = (feeData || []).map(record => ({
        id: record.id,
        academic_year: record.academic_year,
        semester: record.semester,
        original_amount: Number(record.original_amount),
        final_amount: Number(record.final_amount),
        paid_amount: Number(record.paid_amount || 0),
        status: record.status,
        due_date: record.due_date,
        last_payment_date: record.last_payment_date,
        fee_type_name: record.fee_types?.name || 'Semester Fee'
      }));

      setFeeRecords(formattedFeeRecords);

      // Load recent activities
      const { data: activityData, error: activityError } = await supabase
        .from('user_activity_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (activityError) throw activityError;
      setRecentActivities(activityData || []);

      // Load recent payments
      const { data: paymentData, error: paymentError } = await supabase
        .from('payment_transactions')
        .select('*')
        .eq('student_id', user.id)
        .eq('status', 'Success')
        .order('processed_at', { ascending: false })
        .limit(5);

      if (paymentError) throw paymentError;
      setRecentPayments(paymentData || []);

    } catch (error) {
      console.error('Error loading student data:', error);
      toast({
        title: "Error",
        description: "Failed to load student data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async (record: StudentFeeRecord) => {
    if (!user) return;

    try {
      const remainingAmount = record.final_amount - record.paid_amount;
      
      // Create payment transaction
      const { data, error } = await supabase
        .from('payment_transactions')
        .insert({
          fee_record_id: record.id,
          student_id: user.id,
          amount: remainingAmount,
          payment_method: 'Online',
          transaction_id: `TXN${Date.now()}${Math.floor(Math.random() * 1000)}`,
          status: Math.random() > 0.05 ? 'Success' : 'Failed', // 95% success rate for demo
          receipt_number: `RCP-${Date.now()}${Math.floor(Math.random() * 1000)}`,
          processed_by: user.id
        })
        .select()
        .single();

      if (error) throw error;

      if (data.status === 'Success') {
        toast({
          title: "Payment Successful",
          description: `Payment of ${formatCurrency(remainingAmount)} processed successfully`,
        });
      } else {
        toast({
          title: "Payment Failed",
          description: "Payment processing failed. Please try again.",
          variant: "destructive"
        });
      }

      // Reload data to reflect changes
      await loadStudentData();

    } catch (error) {
      console.error('Error processing payment:', error);
      toast({
        title: "Payment Error",
        description: "Failed to process payment",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your fee information...</p>
        </div>
      </div>
    );
  }

  const totalFees = feeRecords.reduce((sum, record) => sum + record.final_amount, 0);
  const totalPaid = feeRecords.reduce((sum, record) => sum + record.paid_amount, 0);
  const totalDue = totalFees - totalPaid;
  const overdueRecords = feeRecords.filter(record => 
    record.status === 'Overdue' || 
    (record.status === 'Pending' && new Date(record.due_date) < new Date())
  );

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'Paid': { variant: 'default' as const, className: 'bg-green-100 text-green-800' },
      'Partial': { variant: 'secondary' as const, className: 'bg-yellow-100 text-yellow-800' },
      'Pending': { variant: 'outline' as const, className: 'bg-blue-100 text-blue-800' },
      'Overdue': { variant: 'destructive' as const, className: 'bg-red-100 text-red-800' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.Pending;
    
    return (
      <Badge variant={config.variant} className={config.className}>
        {status}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className={`${isMobile ? 'text-2xl' : 'text-3xl'} font-bold text-gray-800`}>
          Student Fee Dashboard
        </h1>
        <p className="text-gray-600 mt-2">Track your fee payments and academic progress</p>
      </div>

      {/* Fee Summary Cards */}
      <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-2 lg:grid-cols-4'} gap-4`}>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Fees</p>
                <p className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold text-blue-600`}>
                  {formatCurrency(totalFees)}
                </p>
              </div>
              <TrendingUp className={`${isMobile ? 'w-5 h-5' : 'w-8 h-8'} text-blue-500`} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Amount Paid</p>
                <p className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold text-green-600`}>
                  {formatCurrency(totalPaid)}
                </p>
              </div>
              <CheckCircle className={`${isMobile ? 'w-5 h-5' : 'w-8 h-8'} text-green-500`} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Amount Due</p>
                <p className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold text-red-600`}>
                  {formatCurrency(totalDue)}
                </p>
              </div>
              <AlertTriangle className={`${isMobile ? 'w-5 h-5' : 'w-8 h-8'} text-red-500`} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Overdue</p>
                <p className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold text-orange-600`}>
                  {overdueRecords.length}
                </p>
              </div>
              <Clock className={`${isMobile ? 'w-5 h-5' : 'w-8 h-8'} text-orange-500`} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Fee Records */}
      <Card>
        <CardHeader>
          <CardTitle>Fee Records</CardTitle>
        </CardHeader>
        <CardContent>
          {feeRecords.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No fee records found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {feeRecords.map(record => {
                const isOverdue = record.status === 'Overdue' || 
                  (record.status === 'Pending' && new Date(record.due_date) < new Date());
                const remainingAmount = record.final_amount - record.paid_amount;
                
                return (
                  <div key={record.id} className="border border-gray-200 rounded-lg p-4">
                    <div className={`flex ${isMobile ? 'flex-col space-y-3' : 'items-center justify-between'}`}>
                      <div className={`${isMobile ? '' : 'flex-1'}`}>
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="font-medium text-gray-900">
                            {record.fee_type_name} - {record.academic_year} Sem {record.semester}
                          </h4>
                          {getStatusBadge(record.status)}
                        </div>
                        <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-4'} gap-2 text-sm text-gray-600`}>
                          <div>
                            <span className="font-medium">Total: </span>
                            {formatCurrency(record.final_amount)}
                          </div>
                          <div>
                            <span className="font-medium">Paid: </span>
                            <span className="text-green-600">{formatCurrency(record.paid_amount)}</span>
                          </div>
                          <div>
                            <span className="font-medium">Due Date: </span>
                            <span className={isOverdue ? 'text-red-600 font-medium' : ''}>
                              {new Date(record.due_date).toLocaleDateString()}
                            </span>
                          </div>
                          {remainingAmount > 0 && (
                            <div>
                              <span className="font-medium">Remaining: </span>
                              <span className="text-red-600">{formatCurrency(remainingAmount)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {remainingAmount > 0 && (
                        <div className={`${isMobile ? 'w-full' : 'flex-shrink-0'}`}>
                          <Button 
                            onClick={() => handlePayment(record)}
                            size={isMobile ? 'sm' : 'default'}
                            className={`${isMobile ? 'w-full' : ''}`}
                          >
                            <CreditCard className="w-4 h-4 mr-2" />
                            Pay {formatCurrency(remainingAmount)}
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Payments */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="w-5 h-5" />
            Recent Payments
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentPayments.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No payment history available</p>
          ) : (
            <div className="space-y-3">
              {recentPayments.map(payment => (
                <div key={payment.id} className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{formatCurrency(Number(payment.amount))}</p>
                    <p className="text-sm text-gray-600">
                      {new Date(payment.processed_at).toLocaleDateString()} • {payment.payment_method}
                    </p>
                    <p className="text-xs text-gray-500">Receipt: {payment.receipt_number}</p>
                  </div>
                  <Badge className="bg-green-100 text-green-800">
                    {payment.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Activities */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Recent Activities
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentActivities.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No recent activities</p>
          ) : (
            <div className="space-y-3">
              {recentActivities.slice(0, 5).map(activity => (
                <div key={activity.id} className="flex justify-between items-start p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{activity.activity_description}</p>
                    <p className="text-sm text-gray-600 mt-1">
                      {new Date(activity.created_at).toLocaleString()}
                    </p>
                  </div>
                  <Badge variant="outline" className="ml-2">
                    {activity.activity_type.replace('_', ' ')}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedStudentDashboard;
