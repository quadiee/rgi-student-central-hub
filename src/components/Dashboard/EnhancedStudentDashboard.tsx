
import React, { useState, useEffect } from 'react';
import { CreditCard, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

interface StudentFeeSummary {
  student_id: string;
  name: string;
  roll_number: string;
  total_fees: number;
  total_paid: number;
  pending_amount: number;
  payment_status: string;
  total_fee_records: number;
}

const EnhancedStudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const [feeSummary, setFeeSummary] = useState<StudentFeeSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        // Mock fee summary data since we don't have the enhanced fee service
        const mockSummary: StudentFeeSummary = {
          student_id: user.id,
          name: user.name,
          roll_number: user.rollNumber || 'N/A',
          total_fees: 50000,
          total_paid: 30000,
          pending_amount: 20000,
          payment_status: 'Partially Paid',
          total_fee_records: 2
        };
        setFeeSummary(mockSummary);
      } catch (error) {
        console.error('Error loading student dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!feeSummary) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No fee records found</p>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Fully Paid': return 'text-green-600';
      case 'Partially Paid': return 'text-yellow-600';
      case 'Unpaid': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Fully Paid': return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'Partially Paid': return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'Unpaid': return <AlertTriangle className="w-5 h-5 text-red-600" />;
      default: return <CreditCard className="w-5 h-5 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Fee Dashboard</h2>
        <div className="text-sm text-gray-600">
          {user?.department} - {user?.rollNumber}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Fees</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{feeSummary.total_fees.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Amount Paid</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">₹{feeSummary.total_paid.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Pending Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">₹{feeSummary.pending_amount.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Payment Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`flex items-center space-x-2 ${getStatusColor(feeSummary.payment_status)}`}>
              {getStatusIcon(feeSummary.payment_status)}
              <span className="font-medium">{feeSummary.payment_status}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Fee Records</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <p className="text-gray-600">
              You have {feeSummary.total_fee_records} fee record(s) on file.
            </p>
            {feeSummary.pending_amount > 0 && (
              <div className="mt-4">
                <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                  Pay Now
                </button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedStudentDashboard;
