
import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Users, IndianRupee, AlertTriangle, RefreshCw, Eye, Receipt } from 'lucide-react';
import { useAuth } from '../../contexts/SupabaseAuthContext';
import { Button } from '../ui/button';
import { useToast } from '../ui/use-toast';
import { supabase } from '../../integrations/supabase/client';
import { formatCurrency } from '../../utils/feeValidation';
import { usePaymentBreakdown } from '../../hooks/usePaymentBreakdown';
import PaymentBreakdown from './PaymentBreakdown';

interface FeeRecord {
  id: string;
  academic_year: string;
  semester: number;
  original_amount: number;
  final_amount: number;
  paid_amount: number;
  status: string;
  due_date: string;
  payment_transactions: Array<{
    id: string;
    amount: number;
    processed_at: string;
    payment_method: string;
    status: string;
  }>;
}

const StudentFeeDashboard: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [feeRecords, setFeeRecords] = useState<FeeRecord[]>([]);
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
      loadFeeRecords();
    }
  }, [user]);

  const loadFeeRecords = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('fee_records')
        .select(`
          *,
          payment_transactions (
            id,
            amount,
            processed_at,
            payment_method,
            status
          )
        `)
        .eq('student_id', user?.id)
        .order('academic_year', { ascending: false })
        .order('semester', { ascending: false });

      if (error) throw error;

      setFeeRecords(data || []);
    } catch (error) {
      console.error('Error loading fee records:', error);
      toast({
        title: "Error",
        description: "Failed to load fee records",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentClick = (paymentId: string, feeRecord: FeeRecord) => {
    showPaymentBreakdown(paymentId, [
      { label: 'Student Dashboard' },
      { label: 'Fee Records' },
      { label: `${feeRecord.academic_year} - Sem ${feeRecord.semester}` }
    ]);
  };

  const handleAmountClick = (feeRecord: FeeRecord) => {
    // If there are payments, show the most recent one
    const recentPayment = feeRecord.payment_transactions
      ?.filter(p => p.status === 'Success')
      ?.sort((a, b) => new Date(b.processed_at).getTime() - new Date(a.processed_at).getTime())[0];
    
    if (recentPayment) {
      handlePaymentClick(recentPayment.id, feeRecord);
    } else {
      toast({
        title: "No Payment Found",
        description: "No successful payments found for this fee record",
        variant: "destructive"
      });
    }
  };

  const handleOutstandingClick = () => {
    // Show breakdown of outstanding fees
    const outstandingRecords = feeRecords.filter(record => 
      record.final_amount > (record.paid_amount || 0)
    );
    
    if (outstandingRecords.length > 0) {
      // Show the most recent outstanding record
      const recentOutstanding = outstandingRecords[0];
      showPaymentBreakdown(recentOutstanding.id, [
        { label: 'Student Dashboard' },
        { label: 'Outstanding Fees' },
        { label: `${recentOutstanding.academic_year} - Sem ${recentOutstanding.semester}` }
      ]);
    } else {
      toast({
        title: "No Outstanding Fees",
        description: "You have no pending fee payments",
      });
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
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const totalFees = feeRecords.reduce((sum, record) => sum + record.final_amount, 0);
  const totalPaid = feeRecords.reduce((sum, record) => sum + (record.paid_amount || 0), 0);
  const totalPending = totalFees - totalPaid;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">My Fee Dashboard</h2>
        <Button onClick={loadFeeRecords} disabled={loading} variant="outline">
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 flex items-center gap-2">
                Total Fees
                <Eye className="w-3 h-3 opacity-50 group-hover:opacity-100" />
              </p>
              <p className="text-2xl font-bold text-blue-600">{formatCurrency(totalFees)}</p>
            </div>
            <Receipt className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div 
          className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer group"
          onClick={() => feeRecords.length > 0 && handleAmountClick(feeRecords[0])}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 flex items-center gap-2">
                Total Paid
                <Eye className="w-3 h-3 opacity-50 group-hover:opacity-100" />
              </p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(totalPaid)}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div 
          className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer group"
          onClick={handleOutstandingClick}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 flex items-center gap-2">
                Pending
                <Eye className="w-3 h-3 opacity-50 group-hover:opacity-100" />
              </p>
              <p className="text-2xl font-bold text-orange-600">{formatCurrency(totalPending)}</p>
            </div>
            <IndianRupee className="w-8 h-8 text-orange-500" />
          </div>
        </div>
      </div>

      {/* Fee Records List */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Fee Records</h3>
        <div className="space-y-4">
          {feeRecords.map((record) => (
            <div key={record.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-medium">{record.academic_year} - Semester {record.semester}</h4>
                  <p className="text-sm text-gray-600">Due: {new Date(record.due_date).toLocaleDateString()}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  record.status === 'Paid' ? 'bg-green-100 text-green-800' :
                  record.status === 'Partial' ? 'bg-yellow-100 text-yellow-800' :
                  record.status === 'Overdue' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {record.status}
                </span>
              </div>
              
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div 
                  className="cursor-pointer hover:text-blue-600 transition-colors group"
                  onClick={() => handleAmountClick(record)}
                >
                  <span className="text-gray-600">Total: </span>
                  <span className="font-medium flex items-center gap-1">
                    {formatCurrency(record.final_amount)}
                    <Eye className="w-3 h-3 opacity-0 group-hover:opacity-100" />
                  </span>
                </div>
                <div 
                  className="cursor-pointer hover:text-green-600 transition-colors group"
                  onClick={() => handleAmountClick(record)}
                >
                  <span className="text-gray-600">Paid: </span>
                  <span className="font-medium flex items-center gap-1">
                    {formatCurrency(record.paid_amount || 0)}
                    <Eye className="w-3 h-3 opacity-0 group-hover:opacity-100" />
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Pending: </span>
                  <span className="font-medium text-orange-600">
                    {formatCurrency(record.final_amount - (record.paid_amount || 0))}
                  </span>
                </div>
              </div>

              {/* Payment History */}
              {record.payment_transactions && record.payment_transactions.length > 0 && (
                <div className="mt-3 pt-3 border-t">
                  <p className="text-xs text-gray-600 mb-2">Recent Payments:</p>
                  <div className="space-y-1">
                    {record.payment_transactions
                      .filter(p => p.status === 'Success')
                      .slice(0, 3)
                      .map((payment) => (
                      <div 
                        key={payment.id} 
                        className="flex justify-between text-xs cursor-pointer hover:text-blue-600 transition-colors group"
                        onClick={() => handlePaymentClick(payment.id, record)}
                      >
                        <span className="flex items-center gap-1">
                          {formatCurrency(payment.amount)} via {payment.payment_method}
                          <Eye className="w-3 h-3 opacity-0 group-hover:opacity-100" />
                        </span>
                        <span className="text-gray-500">
                          {new Date(payment.processed_at).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {feeRecords.length === 0 && (
          <div className="text-center py-8">
            <Receipt className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No fee records found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentFeeDashboard;
