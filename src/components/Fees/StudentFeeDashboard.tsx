
import React, { useState, useEffect } from 'react';
import { CreditCard, Download, Calendar, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { Button } from '../ui/button';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../ui/use-toast';
import { FeeService } from '../../services/feeService';
import { FeeRecord } from '../../types';
import { useIsMobile } from '../../hooks/use-mobile';

const StudentFeeDashboard: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [feeRecords, setFeeRecords] = useState<FeeRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedFee, setSelectedFee] = useState<FeeRecord | null>(null);

  useEffect(() => {
    loadFeeRecords();
  }, []);

  const loadFeeRecords = async () => {
    try {
      const records = await FeeService.getFeeRecords(user!);
      setFeeRecords(records);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load fee records",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async (feeRecord: FeeRecord, paymentMethod: string) => {
    try {
      const pendingAmount = feeRecord.amount - (feeRecord.amount * 0.7); // Mock calculation
      
      await FeeService.processPayment(user!, {
        studentId: user!.studentId!,
        feeRecordId: feeRecord.id,
        amount: pendingAmount,
        paymentMethod: paymentMethod as any
      });

      toast({
        title: "Payment Successful",
        description: `Payment of ₹${pendingAmount.toLocaleString()} processed successfully`
      });

      setShowPaymentModal(false);
      loadFeeRecords();
    } catch (error) {
      toast({
        title: "Payment Failed",
        description: "Payment processing failed. Please try again.",
        variant: "destructive"
      });
    }
  };

  const mockFeeRecords: FeeRecord[] = [
    {
      id: '1',
      studentId: user?.studentId || '1',
      feeType: 'Tuition Fee',
      amount: 50000,
      dueDate: '2024-07-15',
      paidDate: '2024-06-10',
      status: 'Paid',
      semester: 6,
      academicYear: '2023-24',
      paymentMethod: 'Online',
      receiptNumber: 'RCP001'
    },
    {
      id: '2',
      studentId: user?.studentId || '1',
      feeType: 'Lab Fee',
      amount: 5000,
      dueDate: '2024-12-15',
      status: 'Pending',
      semester: 7,
      academicYear: '2024-25'
    },
    {
      id: '3',
      studentId: user?.studentId || '1',
      feeType: 'Library Fee',
      amount: 2000,
      dueDate: '2024-12-15',
      status: 'Pending',
      semester: 7,
      academicYear: '2024-25'
    }
  ];

  const totalDue = mockFeeRecords.filter(f => f.status === 'Pending').reduce((sum, f) => sum + f.amount, 0);
  const totalPaid = mockFeeRecords.filter(f => f.status === 'Paid').reduce((sum, f) => sum + f.amount, 0);

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold text-gray-800`}>
          My Fee Dashboard
        </h2>
      </div>

      {/* Fee Summary Cards */}
      <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-3'} gap-4`}>
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100">Total Paid</p>
              <p className={`${isMobile ? 'text-2xl' : 'text-3xl'} font-bold`}>₹{totalPaid.toLocaleString()}</p>
            </div>
            <CheckCircle className={`${isMobile ? 'w-8 h-8' : 'w-10 h-10'} text-green-100`} />
          </div>
        </div>

        <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100">Pending Dues</p>
              <p className={`${isMobile ? 'text-2xl' : 'text-3xl'} font-bold`}>₹{totalDue.toLocaleString()}</p>
            </div>
            <Clock className={`${isMobile ? 'w-8 h-8' : 'w-10 h-10'} text-yellow-100`} />
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100">Total Fees</p>
              <p className={`${isMobile ? 'text-2xl' : 'text-3xl'} font-bold`}>₹{(totalPaid + totalDue).toLocaleString()}</p>
            </div>
            <CreditCard className={`${isMobile ? 'w-8 h-8' : 'w-10 h-10'} text-blue-100`} />
          </div>
        </div>
      </div>

      {/* Fee Records */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Fee Details</h3>
        
        {isMobile ? (
          <div className="space-y-4">
            {mockFeeRecords.map(record => (
              <div key={record.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900">{record.feeType}</h4>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    record.status === 'Paid' ? 'bg-green-100 text-green-800' :
                    record.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {record.status}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Amount:</span>
                    <p className="font-medium">₹{record.amount.toLocaleString()}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Due Date:</span>
                    <p className="font-medium">{record.dueDate}</p>
                  </div>
                </div>
                
                {record.status === 'Pending' && (
                  <Button 
                    className="w-full mt-3" 
                    size="sm"
                    onClick={() => {
                      setSelectedFee(record);
                      setShowPaymentModal(true);
                    }}
                  >
                    Pay Now
                  </Button>
                )}
                
                {record.receiptNumber && (
                  <Button variant="outline" className="w-full mt-2" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Download Receipt
                  </Button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fee Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {mockFeeRecords.map(record => (
                  <tr key={record.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{record.feeType}</div>
                      <div className="text-sm text-gray-500">Semester {record.semester}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ₹{record.amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {record.dueDate}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        record.status === 'Paid' ? 'bg-green-100 text-green-800' :
                        record.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {record.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        {record.status === 'Pending' && (
                          <Button 
                            size="sm"
                            onClick={() => {
                              setSelectedFee(record);
                              setShowPaymentModal(true);
                            }}
                          >
                            Pay Now
                          </Button>
                        )}
                        {record.receiptNumber && (
                          <Button variant="outline" size="sm">
                            <Download className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Payment Modal */}
      {showPaymentModal && selectedFee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Pay {selectedFee.feeType}</h3>
            <div className="mb-4">
              <p className="text-gray-600">Amount: ₹{selectedFee.amount.toLocaleString()}</p>
              <p className="text-gray-600">Due Date: {selectedFee.dueDate}</p>
            </div>
            
            <div className="space-y-3">
              <Button 
                className="w-full" 
                onClick={() => handlePayment(selectedFee, 'Online')}
              >
                Pay Online (UPI/Card)
              </Button>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => handlePayment(selectedFee, 'Cash')}
              >
                Pay at Office
              </Button>
            </div>
            
            <Button 
              variant="outline" 
              className="w-full mt-4"
              onClick={() => setShowPaymentModal(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentFeeDashboard;
