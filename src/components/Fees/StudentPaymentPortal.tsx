
import React, { useState, useEffect } from 'react';
import { CreditCard, Download, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/SupabaseAuthContext';
import { supabase } from '../../integrations/supabase/client';
import { useToast } from '../ui/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import PaymentProcessor from './PaymentProcessor';
import { formatCurrency, getDueDateStatus } from '../../utils/feeValidation';

interface StudentFeeRecord {
  id: string;
  academic_year: string;
  semester: number;
  original_amount: number;
  discount_amount: number;
  penalty_amount: number;
  final_amount: number;
  paid_amount: number;
  due_date: string;
  status: string;
  last_payment_date: string;
}

const StudentPaymentPortal: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [feeRecords, setFeeRecords] = useState<StudentFeeRecord[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<StudentFeeRecord | null>(null);
  const [loading, setLoading] = useState(true);

  const loadStudentFeeRecords = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('fee_records')
        .select('*')
        .eq('student_id', user.id)
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

  useEffect(() => {
    loadStudentFeeRecords();
  }, [user?.id]);

  const getStatusBadge = (status: string, dueDate: string) => {
    switch (status) {
      case 'Paid':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Paid</Badge>;
      case 'Partial':
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />Partial</Badge>;
      case 'Overdue':
        return <Badge className="bg-red-100 text-red-800"><AlertCircle className="w-3 h-3 mr-1" />Overdue</Badge>;
      default:
        const dueDateStatus = getDueDateStatus(dueDate);
        return dueDateStatus === 'due' ? 
          <Badge className="bg-orange-100 text-orange-800"><Clock className="w-3 h-3 mr-1" />Due Soon</Badge> :
          <Badge className="bg-blue-100 text-blue-800"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
    }
  };

  const downloadReceipt = async (recordId: string) => {
    try {
      const { data, error } = await supabase
        .from('payment_transactions')
        .select('*')
        .eq('fee_record_id', recordId)
        .eq('status', 'Success')
        .order('processed_at', { ascending: false })
        .limit(1)
        .single();

      if (error) throw error;

      // Generate simple receipt content
      const receiptContent = `
RGCE Fee Payment Receipt
========================
Receipt No: ${data.receipt_number}
Transaction ID: ${data.transaction_id}
Date: ${new Date(data.processed_at).toLocaleDateString()}
Amount: ${formatCurrency(data.amount)}
Payment Method: ${data.payment_method}
Status: ${data.status}
      `;

      const blob = new Blob([receiptContent], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `receipt_${data.receipt_number}.txt`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Receipt Downloaded",
        description: "Payment receipt has been downloaded successfully",
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Could not download receipt",
        variant: "destructive"
      });
    }
  };

  const handlePaymentSuccess = () => {
    loadStudentFeeRecords();
    setSelectedRecord(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">My Fee Payments</h2>
        <div className="text-sm text-gray-600">
          Total Records: {feeRecords.length}
        </div>
      </div>

      {feeRecords.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <CreditCard className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No Fee Records Found</h3>
            <p className="text-gray-500">Your fee records will appear here once configured by administration.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {/* Fee Records List */}
          <div className="grid gap-4">
            {feeRecords.map(record => {
              const outstandingAmount = record.final_amount - (record.paid_amount || 0);
              return (
                <Card key={record.id}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800">
                          {record.academic_year} - Semester {record.semester}
                        </h3>
                        <p className="text-sm text-gray-600">
                          Due Date: {new Date(record.due_date).toLocaleDateString()}
                        </p>
                      </div>
                      {getStatusBadge(record.status, record.due_date)}
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-gray-500">Total Fee</p>
                        <p className="font-semibold">{formatCurrency(record.final_amount)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Paid Amount</p>
                        <p className="font-semibold text-green-600">
                          {formatCurrency(record.paid_amount || 0)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Outstanding</p>
                        <p className={`font-semibold ${outstandingAmount > 0 ? 'text-red-600' : 'text-green-600'}`}>
                          {formatCurrency(outstandingAmount)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Last Payment</p>
                        <p className="text-sm">
                          {record.last_payment_date ? 
                            new Date(record.last_payment_date).toLocaleDateString() : 
                            'No payments'
                          }
                        </p>
                      </div>
                    </div>

                    {/* Breakdown */}
                    {(record.discount_amount > 0 || record.penalty_amount > 0) && (
                      <div className="bg-gray-50 p-3 rounded mb-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Fee Breakdown</h4>
                        <div className="text-xs space-y-1">
                          <div className="flex justify-between">
                            <span>Original Amount:</span>
                            <span>{formatCurrency(record.original_amount)}</span>
                          </div>
                          {record.discount_amount > 0 && (
                            <div className="flex justify-between text-green-600">
                              <span>Discount:</span>
                              <span>-{formatCurrency(record.discount_amount)}</span>
                            </div>
                          )}
                          {record.penalty_amount > 0 && (
                            <div className="flex justify-between text-red-600">
                              <span>Late Fee:</span>
                              <span>+{formatCurrency(record.penalty_amount)}</span>
                            </div>
                          )}
                          <div className="flex justify-between font-semibold border-t pt-1">
                            <span>Final Amount:</span>
                            <span>{formatCurrency(record.final_amount)}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex space-x-2">
                      {outstandingAmount > 0 && (
                        <button
                          onClick={() => setSelectedRecord(record)}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
                        >
                          <CreditCard className="w-4 h-4" />
                          <span>Make Payment</span>
                        </button>
                      )}
                      
                      {record.paid_amount > 0 && (
                        <button
                          onClick={() => downloadReceipt(record.id)}
                          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center space-x-2"
                        >
                          <Download className="w-4 h-4" />
                          <span>Download Receipt</span>
                        </button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Payment Processor Modal */}
          {selectedRecord && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
                <div className="p-4 border-b flex justify-between items-center">
                  <h3 className="text-lg font-semibold">
                    Payment for {selectedRecord.academic_year} - Sem {selectedRecord.semester}
                  </h3>
                  <button
                    onClick={() => setSelectedRecord(null)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </div>
                <div className="p-4">
                  <PaymentProcessor
                    feeRecord={selectedRecord}
                    onPaymentSuccess={handlePaymentSuccess}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StudentPaymentPortal;
