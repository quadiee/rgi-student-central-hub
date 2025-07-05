
import React, { useState, useEffect } from 'react';
import { CreditCard, Calendar, AlertTriangle, CheckCircle, DollarSign } from 'lucide-react';
import { Button } from '../ui/button';
import { useAuth } from '../../contexts/SupabaseAuthContext';
import { useToast } from '../ui/use-toast';
import { supabase } from '../../integrations/supabase/client';
import { FeeRecord } from '../../types';
import { useIsMobile } from '../../hooks/use-mobile';
import PaymentGateway from './PaymentGateway';

const EnhancedStudentFeeView: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [feeRecords, setFeeRecords] = useState<FeeRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFee, setSelectedFee] = useState<FeeRecord | null>(null);
  const [showPaymentGateway, setShowPaymentGateway] = useState(false);

  useEffect(() => {
    fetchFeeRecords();
  }, [user]);

  const fetchFeeRecords = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('fee_records')
        .select(`
          *,
          profiles!student_id (name, roll_number)
        `)
        .eq('student_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const transformedRecords: FeeRecord[] = (data || []).map(record => ({
        id: record.id,
        studentId: record.student_id,
        feeType: 'Semester Fee',
        amount: Number(record.final_amount),
        dueDate: record.due_date,
        paidDate: record.last_payment_date,
        status: record.status === 'Paid' ? 'Paid' : 
                record.status === 'Overdue' ? 'Overdue' : 'Pending',
        semester: record.semester,
        academicYear: record.academic_year,
        paymentMethod: undefined,
        receiptNumber: undefined
      }));

      setFeeRecords(transformedRecords);
    } catch (error) {
      console.error('Error fetching fee records:', error);
      toast({
        title: "Error",
        description: "Failed to fetch fee records",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = async () => {
    if (!selectedFee) return;

    try {
      // Create payment transaction record
      const { error: paymentError } = await supabase
        .from('payment_transactions')
        .insert({
          fee_record_id: selectedFee.id,
          student_id: user!.id,
          amount: selectedFee.amount,
          payment_method: 'Online',
          transaction_id: `TXN${Date.now()}`,
          status: 'Success',
          receipt_number: `RCP${Date.now()}`,
          processed_by: user!.id
        });

      if (paymentError) throw paymentError;

      // Update fee record status
      const { error: updateError } = await supabase
        .from('fee_records')
        .update({
          paid_amount: selectedFee.amount,
          status: 'Paid',
          last_payment_date: new Date().toISOString()
        })
        .eq('id', selectedFee.id);

      if (updateError) throw updateError;

      toast({
        title: "Payment Successful",
        description: "Your fee payment has been processed successfully",
      });

      setShowPaymentGateway(false);
      setSelectedFee(null);
      fetchFeeRecords(); // Refresh the records

    } catch (error) {
      console.error('Error updating payment:', error);
      toast({
        title: "Error",
        description: "Payment successful but failed to update records",
        variant: "destructive"
      });
    }
  };

  const handlePayNow = (feeRecord: FeeRecord) => {
    setSelectedFee(feeRecord);
    setShowPaymentGateway(true);
  };

  const totalDue = feeRecords.reduce((sum, record) => 
    record.status !== 'Paid' ? sum + record.amount : sum, 0
  );
  const totalPaid = feeRecords.reduce((sum, record) => 
    record.status === 'Paid' ? sum + record.amount : sum, 0
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading fee records...</p>
        </div>
      </div>
    );
  }

  if (showPaymentGateway && selectedFee) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold text-gray-800`}>
            Payment Gateway
          </h2>
          <Button 
            variant="outline" 
            onClick={() => setShowPaymentGateway(false)}
          >
            Back to Fees
          </Button>
        </div>

        <PaymentGateway
          feeRecord={selectedFee}
          onPaymentSuccess={handlePaymentSuccess}
          onPaymentCancel={() => setShowPaymentGateway(false)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold text-gray-800`}>
          My Fee Status
        </h2>
      </div>

      {/* Summary Cards */}
      <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-3'} gap-4`}>
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Fees</p>
              <p className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold text-blue-600`}>
                ₹{(totalDue + totalPaid).toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <DollarSign className={`${isMobile ? 'w-5 h-5' : 'w-6 h-6'} text-blue-600`} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Amount Paid</p>
              <p className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold text-green-600`}>
                ₹{totalPaid.toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className={`${isMobile ? 'w-5 h-5' : 'w-6 h-6'} text-green-600`} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Amount Due</p>
              <p className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold text-red-600`}>
                ₹{totalDue.toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <AlertTriangle className={`${isMobile ? 'w-5 h-5' : 'w-6 h-6'} text-red-600`} />
            </div>
          </div>
        </div>
      </div>

      {/* Fee Records */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Fee Details</h3>
        
        {feeRecords.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No fee records found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {feeRecords.map(record => {
              const isOverdue = record.status === 'Overdue' || 
                (record.status === 'Pending' && new Date(record.dueDate) < new Date());
              
              return (
                <div key={record.id} className="border border-gray-200 rounded-lg p-4">
                  <div className={`flex ${isMobile ? 'flex-col space-y-3' : 'items-center justify-between'}`}>
                    <div className={`${isMobile ? '' : 'flex-1'}`}>
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="font-medium text-gray-900">{record.feeType}</h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          record.status === 'Paid' ? 'bg-green-100 text-green-800' :
                          record.status === 'Overdue' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {record.status}
                        </span>
                      </div>
                      <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-3'} gap-2 text-sm text-gray-600`}>
                        <div>
                          <span className="font-medium">Amount: </span>
                          ₹{record.amount.toLocaleString()}
                        </div>
                        <div>
                          <span className="font-medium">Due Date: </span>
                          <span className={isOverdue ? 'text-red-600 font-medium' : ''}>
                            {new Date(record.dueDate).toLocaleDateString()}
                          </span>
                        </div>
                        <div>
                          <span className="font-medium">Semester: </span>
                          {record.semester}
                        </div>
                      </div>
                    </div>
                    
                    {record.status !== 'Paid' && (
                      <div className={`${isMobile ? 'w-full' : 'flex-shrink-0'}`}>
                        <Button 
                          onClick={() => handlePayNow(record)}
                          size={isMobile ? 'sm' : 'default'}
                          className={`${isMobile ? 'w-full' : ''} bg-blue-600 hover:bg-blue-700`}
                        >
                          <CreditCard className="w-4 h-4 mr-2" />
                          Pay ₹{record.amount.toLocaleString()}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default EnhancedStudentFeeView;
