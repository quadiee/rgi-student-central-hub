
import React, { useState, useEffect } from 'react';
import { CreditCard, DollarSign, AlertTriangle, CheckCircle, Calendar } from 'lucide-react';
import { useAuth } from '../../contexts/SupabaseAuthContext';
import { useToast } from '../ui/use-toast';
import { RealFeeService } from '../../services/realFeeService';
import { FeeRecord } from '../../types';
import { Button } from '../ui/button';
import { useIsMobile } from '../../hooks/use-mobile';

const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [feeRecords, setFeeRecords] = useState<FeeRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFee, setSelectedFee] = useState<FeeRecord | null>(null);

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

  if (!user) return null;

  const totalDue = feeRecords.reduce((sum, record) => 
    record.status !== 'Paid' ? sum + record.amount : sum, 0
  );
  const totalPaid = feeRecords.reduce((sum, record) => 
    record.status === 'Paid' ? sum + record.amount : sum, 0
  );
  const totalFees = totalDue + totalPaid;

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className={`${isMobile ? 'text-2xl' : 'text-3xl'} font-bold text-gray-800`}>
          My Fee Dashboard
        </h1>
        <p className="text-gray-600 mt-2">Track your fee payments and dues</p>
      </div>

      {/* Fee Summary Cards */}
      <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-3'} gap-4`}>
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Fees</p>
              <p className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold text-blue-600`}>
                ₹{totalFees.toLocaleString()}
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
                        <h4 className="font-medium text-gray-900">{record.feeType || 'Semester Fee'}</h4>
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

      {/* Payment History */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Payments</h3>
        <div className="space-y-3">
          {feeRecords
            .filter(record => record.status === 'Paid' && record.lastPaymentDate)
            .slice(0, 5)
            .map(record => (
              <div key={record.id} className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">₹{record.amount.toLocaleString()}</p>
                  <p className="text-sm text-gray-600">
                    {record.lastPaymentDate && new Date(record.lastPaymentDate).toLocaleDateString()}
                  </p>
                </div>
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                  Paid
                </span>
              </div>
            ))}
          {feeRecords.filter(record => record.status === 'Paid').length === 0 && (
            <p className="text-gray-500 text-center py-4">No payment history available</p>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
        <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-2'} gap-4`}>
          <Button variant="outline" className="flex items-center justify-center p-4 h-auto">
            <Calendar className="w-5 h-5 mr-2" />
            <span>Download Fee Receipt</span>
          </Button>
          <Button variant="outline" className="flex items-center justify-center p-4 h-auto">
            <DollarSign className="w-5 h-5 mr-2" />
            <span>Payment History</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
