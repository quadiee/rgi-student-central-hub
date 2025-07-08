import React, { useState, useEffect } from 'react';
import { DollarSign, Clock, CheckCircle, AlertTriangle, Calendar, CreditCard } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { useAuth } from '../../contexts/SupabaseAuthContext';
import { useToast } from '../ui/use-toast';
import { SupabaseFeeService } from '../../services/supabaseFeeService';
import { FeeRecord } from '../../types';
import { useIsMobile } from '../../hooks/use-mobile';
import { useUserConversion } from '../../hooks/useUserConversion';

const StudentFeeView: React.FC = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const { convertProfileToUser } = useUserConversion();
  const [feeRecords, setFeeRecords] = useState<FeeRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudentFees();
  }, [profile]);

  const fetchStudentFees = async () => {
    if (!profile) return;
    
    try {
      setLoading(true);
      const user = convertProfileToUser(profile);
      const records = await SupabaseFeeService.getFeeRecords(user);
      setFeeRecords(records);
    } catch (error) {
      console.error('Error fetching student fees:', error);
      toast({
        title: "Error",
        description: "Failed to fetch fee records",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async (feeRecord: FeeRecord) => {
    if (!profile) return;
    
    try {
      const user = convertProfileToUser(profile);
      const payment = {
        studentId: profile.id,
        feeRecordId: feeRecord.id,
        amount: feeRecord.amount - (feeRecord.paidAmount || 0),
        paymentMethod: 'Online' as const,
        status: 'Success' as const
      };

      const result = await SupabaseFeeService.processPayment(user, payment);
      
      if (result.status === 'Success') {
        toast({
          title: "Payment Successful",
          description: `Payment of ₹${payment.amount} processed successfully`,
        });
        await fetchStudentFees();
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      toast({
        title: "Payment Failed",
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
          <p className="text-gray-600">Loading your fee records...</p>
        </div>
      </div>
    );
  }

  const totalFees = feeRecords.reduce((sum, record) => sum + record.amount, 0);
  const totalPaid = feeRecords.reduce((sum, record) => sum + (record.paidAmount || 0), 0);
  const totalOutstanding = totalFees - totalPaid;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold text-gray-800`}>
          My Fee Records
        </h2>
      </div>

      {/* Fee Summary Cards */}
      <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-3'} gap-4`}>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Fees</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              ₹{totalFees.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Current semester
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paid Amount</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ₹{totalPaid.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Successfully paid
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Outstanding</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              ₹{totalOutstanding.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Pending payment
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Fee Records List */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Fee Details</h3>
        
        {feeRecords.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600">No fee records found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {feeRecords.map((record) => (
              <div key={record.id} className="border border-gray-200 rounded-lg p-4">
                <div className={`${isMobile ? 'space-y-3' : 'flex items-center justify-between'}`}>
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
                    <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-4'} gap-2 text-sm text-gray-600`}>
                      <div className="flex items-center">
                        <DollarSign className="w-4 h-4 mr-1" />
                        Total: ₹{record.amount.toLocaleString()}
                      </div>
                      <div className="flex items-center">
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Paid: ₹{(record.paidAmount || 0).toLocaleString()}
                      </div>
                      <div className="flex items-center">
                        <AlertTriangle className="w-4 h-4 mr-1" />
                        Due: ₹{(record.amount - (record.paidAmount || 0)).toLocaleString()}
                      </div>
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        Due Date: {new Date(record.dueDate).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  
                  {record.status !== 'Paid' && (
                    <div className={`${isMobile ? 'w-full' : 'flex-shrink-0'}`}>
                      <Button 
                        onClick={() => handlePayment(record)}
                        className={`${isMobile ? 'w-full' : ''}`}
                      >
                        <CreditCard className="w-4 h-4 mr-2" />
                        Pay Now
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentFeeView;
