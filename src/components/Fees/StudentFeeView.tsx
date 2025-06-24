
import React, { useState, useEffect } from 'react';
import { CreditCard, Calendar, AlertTriangle, CheckCircle, DollarSign } from 'lucide-react';
import { Button } from '../ui/button';
import { useAuth } from '../../contexts/SupabaseAuthContext';
import { useToast } from '../ui/use-toast';
import { RealFeeService } from '../../services/realFeeService';
import { FeeRecord } from '../../types';
import { useIsMobile } from '../../hooks/use-mobile';

const StudentFeeView: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [feeRecords, setFeeRecords] = useState<FeeRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFee, setSelectedFee] = useState<FeeRecord | null>(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Online');

  useEffect(() => {
    fetchFeeRecords();
  }, [user]);

  const fetchFeeRecords = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const records = await RealFeeService.getFeeRecords(user);
      setFeeRecords(records);
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

  const handlePayment = async () => {
    if (!selectedFee || !paymentAmount) return;

    try {
      await RealFeeService.processPayment(user!, {
        feeRecordId: selectedFee.id,
        studentId: user!.id,
        amount: parseFloat(paymentAmount),
        paymentMethod: paymentMethod as any
      });

      toast({
        title: "Success",
        description: "Payment processed successfully",
      });

      setSelectedFee(null);
      setPaymentAmount('');
      fetchFeeRecords();
    } catch (error) {
      console.error('Error processing payment:', error);
      toast({
        title: "Error",
        description: "Failed to process payment",
        variant: "destructive"
      });
    }
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
                          onClick={() => setSelectedFee(record)}
                          size={isMobile ? 'sm' : 'default'}
                          className={`${isMobile ? 'w-full' : ''}`}
                        >
                          <CreditCard className="w-4 h-4 mr-2" />
                          Pay Now
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

      {/* Payment Modal */}
      {selectedFee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Process Payment</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fee Type
                </label>
                <p className="text-gray-900">{selectedFee.feeType}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Total Amount
                </label>
                <p className="text-gray-900 font-medium">₹{selectedFee.amount.toLocaleString()}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Amount
                </label>
                <input
                  type="number"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  max={selectedFee.amount}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  placeholder="Enter amount"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Method
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="Online">Online Payment</option>
                  <option value="Cash">Cash</option>
                  <option value="Cheque">Cheque</option>
                  <option value="DD">Demand Draft</option>
                  <option value="UPI">UPI</option>
                </select>
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <Button
                variant="outline"
                onClick={() => setSelectedFee(null)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handlePayment}
                disabled={!paymentAmount}
                className="flex-1"
              >
                Process Payment
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentFeeView;
