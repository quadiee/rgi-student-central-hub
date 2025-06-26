import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

interface FeeSummary {
  totalFees: number;
  totalPaid: number;
  totalPending: number;
  pendingInstallments: number;
}

interface FeeRecord {
  id: string;
  amount: number;
  status: 'Paid' | 'Pending' | 'Overdue';
  dueDate: string;
  paidDate?: string;
}

const EnhancedStudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const [feeSummary, setFeeSummary] = useState<FeeSummary | null>(null);
  const [recentFees, setRecentFees] = useState<FeeRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!user) return;

      try {
        setLoading(true);
        // Mock data
        const mockFeeSummary: FeeSummary = {
          totalFees: 120000,
          totalPaid: 90000,
          totalPending: 30000,
          pendingInstallments: 2
        };

        const mockRecentFees: FeeRecord[] = [
          { id: '1', amount: 10000, status: 'Paid', dueDate: '2025-05-01', paidDate: '2025-05-02' },
          { id: '2', amount: 15000, status: 'Pending', dueDate: '2025-06-15' },
          { id: '3', amount: 15000, status: 'Overdue', dueDate: '2025-04-01' }
        ];

        setFeeSummary(mockFeeSummary);
        setRecentFees(mockRecentFees);
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

  if (!user) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No user data found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Student Dashboard</h2>
        <div className="text-sm text-gray-600">
          {user.name} ({user.rollNumber}) - {user.department_id}
        </div>
      </div>

      {feeSummary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Fees</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{feeSummary.totalFees.toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Paid</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">₹{feeSummary.totalPaid.toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Pending</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">₹{feeSummary.totalPending.toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Pending Installments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{feeSummary.pendingInstallments}</div>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Recent Fee Records</CardTitle>
        </CardHeader>
        <CardContent>
          {recentFees.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              No recent fee records
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Amount</th>
                    <th className="text-left py-2">Status</th>
                    <th className="text-left py-2">Due Date</th>
                    <th className="text-left py-2">Paid Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentFees.map(fee => (
                    <tr key={fee.id} className="border-b">
                      <td className="py-2 font-medium">₹{fee.amount.toLocaleString()}</td>
                      <td className="py-2">
                        <span className={`px-2 py-1 rounded text-xs ${
                          fee.status === 'Paid' ? 'bg-green-100 text-green-800' :
                          fee.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {fee.status}
                        </span>
                      </td>
                      <td className="py-2">{fee.dueDate}</td>
                      <td className="py-2">{fee.paidDate || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedStudentDashboard;