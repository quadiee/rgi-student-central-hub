import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useAuth } from '../../contexts/SupabaseAuthContext';
import { useToast } from '../ui/use-toast';
import { supabase } from '../../integrations/supabase/client';
import { CreditCard, CheckCircle, AlertCircle } from 'lucide-react';
import PaymentGateway from './PaymentGateway';

interface PendingPayment {
  id: string;
  student_name: string;
  roll_number: string;
  amount: number;
  due_date: string;
  semester: number;
  academic_year: string;
}

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

interface PaymentProcessorProps {
  feeRecord?: StudentFeeRecord;
  onPaymentSuccess?: () => void;
}

const PaymentProcessor: React.FC<PaymentProcessorProps> = ({ 
  feeRecord, 
  onPaymentSuccess 
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [pendingPayments, setPendingPayments] = useState<PendingPayment[]>([]);
  const [selectedPayment, setSelectedPayment] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<string>('');
  const [transactionId, setTransactionId] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPaymentGateway, setShowPaymentGateway] = useState(false);

  // If this is for student payment (feeRecord provided), show payment gateway
  const isStudentPayment = !!feeRecord;

  useEffect(() => {
    if (!isStudentPayment) {
      fetchPendingPayments();
    }
  }, [isStudentPayment]);

  const fetchPendingPayments = async () => {
    try {
      const { data, error } = await supabase
        .from('fee_records')
        .select(`
          id,
          final_amount,
          due_date,
          semester,
          academic_year,
          profiles!student_id (
            name,
            roll_number
          )
        `)
        .in('status', ['Pending', 'Overdue', 'Partial'])
        .limit(50);

      if (error) throw error;

      const payments = data?.map(record => ({
        id: record.id,
        student_name: (record.profiles as any)?.name || 'Unknown',
        roll_number: (record.profiles as any)?.roll_number || 'Unknown',
        amount: Number(record.final_amount),
        due_date: record.due_date,
        semester: record.semester,
        academic_year: record.academic_year
      })) || [];

      setPendingPayments(payments);
    } catch (error) {
      console.error('Error fetching pending payments:', error);
      toast({
        title: "Error",
        description: "Failed to fetch pending payments",
        variant: "destructive"
      });
    }
  };

  const processPayment = async () => {
    if (!selectedPayment || !paymentMethod) {
      toast({
        title: "Validation Error",
        description: "Please select a payment and payment method",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const payment = pendingPayments.find(p => p.id === selectedPayment);
      if (!payment) return;

      // Create payment transaction
      const { error: transactionError } = await supabase
        .from('payment_transactions')
        .insert({
          fee_record_id: selectedPayment,
          amount: payment.amount,
          payment_method: paymentMethod as any,
          transaction_id: transactionId || `MANUAL-${Date.now()}`,
          status: 'Success',
          receipt_number: `RCP-${Date.now()}`,
          processed_by: user!.id
        });

      if (transactionError) throw transactionError;

      // Update fee record
      const { error: updateError } = await supabase
        .from('fee_records')
        .update({
          paid_amount: payment.amount,
          status: 'Paid',
          last_payment_date: new Date().toISOString()
        })
        .eq('id', selectedPayment);

      if (updateError) throw updateError;

      toast({
        title: "Payment Processed",
        description: `Payment of ₹${payment.amount.toLocaleString()} processed successfully`,
      });

      // Reset form and refresh data
      setSelectedPayment('');
      setPaymentMethod('');
      setTransactionId('');
      fetchPendingPayments();

    } catch (error) {
      console.error('Error processing payment:', error);
      toast({
        title: "Payment Failed",
        description: "Failed to process payment",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStudentPaymentSuccess = () => {
    setShowPaymentGateway(false);
    if (onPaymentSuccess) {
      onPaymentSuccess();
    }
  };

  // Student payment view
  if (isStudentPayment) {
    if (showPaymentGateway && feeRecord) {
      const outstandingAmount = feeRecord.final_amount - (feeRecord.paid_amount || 0);
      const paymentFeeRecord = {
        id: feeRecord.id,
        studentId: user?.id || '',
        feeType: `${feeRecord.academic_year} - Semester ${feeRecord.semester}`,
        semester: feeRecord.semester,
        academicYear: feeRecord.academic_year,
        amount: outstandingAmount,
        dueDate: feeRecord.due_date,
        status: (feeRecord.status === 'Paid' || feeRecord.status === 'Pending' || feeRecord.status === 'Overdue') 
          ? feeRecord.status as "Paid" | "Pending" | "Overdue"
          : "Pending" as const
      };

      return (
        <PaymentGateway
          feeRecord={paymentFeeRecord}
          onPaymentSuccess={handleStudentPaymentSuccess}
          onPaymentCancel={() => setShowPaymentGateway(false)}
        />
      );
    }

    if (!feeRecord) {
      return (
        <Card>
          <CardContent className="p-6 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-800 mb-2">No Fee Record</h3>
            <p className="text-gray-600">Fee record not found.</p>
          </CardContent>
        </Card>
      );
    }

    const outstandingAmount = feeRecord.final_amount - (feeRecord.paid_amount || 0);

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CreditCard className="w-5 h-5" />
            <span>Make Payment</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Payment Details</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Academic Year:</span>
                <span>{feeRecord.academic_year}</span>
              </div>
              <div className="flex justify-between">
                <span>Semester:</span>
                <span>{feeRecord.semester}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Fee:</span>
                <span>₹{feeRecord.final_amount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Paid Amount:</span>
                <span className="text-green-600">₹{(feeRecord.paid_amount || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-semibold border-t pt-2">
                <span>Outstanding:</span>
                <span className="text-red-600">₹{outstandingAmount.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <Button
            onClick={() => setShowPaymentGateway(true)}
            className="w-full"
            disabled={outstandingAmount <= 0}
          >
            <CreditCard className="w-4 h-4 mr-2" />
            Pay ₹{outstandingAmount.toLocaleString()}
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Admin payment view
  if (!user || !['admin', 'principal'].includes(user.role)) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Access Denied</h3>
          <p className="text-gray-600">Only administrators can process payments manually.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CreditCard className="w-5 h-5" />
            <span>Manual Payment Processing</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Pending Payment
              </label>
              <Select value={selectedPayment} onValueChange={setSelectedPayment}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a payment to process" />
                </SelectTrigger>
                <SelectContent>
                  {pendingPayments.map(payment => (
                    <SelectItem key={payment.id} value={payment.id}>
                      {payment.student_name} ({payment.roll_number}) - ₹{payment.amount.toLocaleString()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Method
              </label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger>
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Cash">Cash</SelectItem>
                  <SelectItem value="Cheque">Cheque</SelectItem>
                  <SelectItem value="DD">Demand Draft</SelectItem>
                  <SelectItem value="UPI">UPI</SelectItem>
                  <SelectItem value="Online">Online Transfer</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Transaction ID (Optional)
            </label>
            <Input
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
              placeholder="Enter transaction ID if available"
            />
          </div>

          <Button
            onClick={processPayment}
            disabled={loading || !selectedPayment || !paymentMethod}
            className="w-full"
          >
            {loading ? (
              'Processing...'
            ) : (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Process Payment
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Pending Payments Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Pending Payments Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {pendingPayments.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No pending payments found</p>
            ) : (
              <div className="space-y-2">
                {pendingPayments.slice(0, 10).map(payment => (
                  <div key={payment.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <span className="font-medium">{payment.student_name}</span>
                      <span className="text-gray-500 ml-2">({payment.roll_number})</span>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">₹{payment.amount.toLocaleString()}</div>
                      <div className="text-sm text-gray-500">Due: {new Date(payment.due_date).toLocaleDateString()}</div>
                    </div>
                  </div>
                ))}
                {pendingPayments.length > 10 && (
                  <p className="text-sm text-gray-500 text-center">
                    And {pendingPayments.length - 10} more pending payments...
                  </p>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentProcessor;
