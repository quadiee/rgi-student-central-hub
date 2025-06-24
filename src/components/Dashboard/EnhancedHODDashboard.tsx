
import React, { useState, useEffect } from 'react';
import { Users, DollarSign, AlertCircle, TrendingUp } from 'lucide-react';
import { useEnhancedAuth } from '../../contexts/EnhancedAuthContext';
import { EnhancedFeeService } from '../../services/enhancedFeeService';
import { HODDepartmentSummary, StudentFeeSummary } from '../../types/enhancedTypes';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

const EnhancedHODDashboard: React.FC = () => {
  const { user } = useEnhancedAuth();
  const [departmentSummary, setDepartmentSummary] = useState<HODDepartmentSummary | null>(null);
  const [topPendingStudents, setTopPendingStudents] = useState<StudentFeeSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        const [summaryData, pendingStudents] = await Promise.all([
          EnhancedFeeService.getHODDepartmentSummary(user),
          EnhancedFeeService.getTop10PendingStudents(user)
        ]);
        
        if (summaryData.length > 0) {
          setDepartmentSummary(summaryData[0]);
        }
        setTopPendingStudents(pendingStudents);
      } catch (error) {
        console.error('Error loading HOD dashboard:', error);
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

  if (!departmentSummary) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No department data found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Department Dashboard</h2>
        <div className="text-sm text-gray-600">
          {departmentSummary.department_name} ({departmentSummary.department_code})
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
              <Users className="w-4 h-4 mr-2" />
              Total Students
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{departmentSummary.total_students}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
              <DollarSign className="w-4 h-4 mr-2" />
              Total Fees
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{departmentSummary.total_department_fees.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
              <TrendingUp className="w-4 h-4 mr-2" />
              Collection Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{departmentSummary.collection_percentage}%</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
              <AlertCircle className="w-4 h-4 mr-2" />
              Pending Amount
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">₹{departmentSummary.total_pending.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Top 10 Students with Pending Fees</CardTitle>
        </CardHeader>
        <CardContent>
          {topPendingStudents.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              No students with pending fees
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Student</th>
                    <th className="text-left py-2">Roll Number</th>
                    <th className="text-right py-2">Pending Amount</th>
                    <th className="text-left py-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {topPendingStudents.map((student) => (
                    <tr key={student.student_id} className="border-b">
                      <td className="py-2 font-medium">{student.name}</td>
                      <td className="py-2">{student.roll_number}</td>
                      <td className="py-2 text-right font-medium text-red-600">
                        ₹{student.pending_amount.toLocaleString()}
                      </td>
                      <td className="py-2">
                        <span className={`px-2 py-1 rounded text-xs ${
                          student.payment_status === 'Unpaid' ? 'bg-red-100 text-red-800' :
                          student.payment_status === 'Partially Paid' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {student.payment_status}
                        </span>
                      </td>
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

export default EnhancedHODDashboard;
