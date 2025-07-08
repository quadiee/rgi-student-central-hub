
import React, { useState, useEffect } from 'react';
import { TrendingUp, Users, IndianRupee, AlertTriangle, BarChart3, PieChart } from 'lucide-react';
import { useAuth } from '../../contexts/SupabaseAuthContext';
import { supabase } from '../../integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { useToast } from '../ui/use-toast';
import { formatCurrency } from '../../utils/feeValidation';
import { Progress } from '../ui/progress';

interface DepartmentAnalytics {
  department_id: string;
  department_name: string;
  department_code: string;
  total_students: number;
  total_fee_records: number;
  total_fees: number;
  total_collected: number;
  total_pending: number;
  collection_percentage: number;
  overdue_records: number;
}

const DepartmentAnalytics: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [analytics, setAnalytics] = useState<DepartmentAnalytics[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadDepartmentAnalytics();
    }
  }, [user]);

  const loadDepartmentAnalytics = async () => {
    if (!user) return;

    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('department_fee_analytics')
        .select('*')
        .order('department_name');

      if (error) throw error;

      setAnalytics(data || []);
    } catch (error) {
      console.error('Error loading department analytics:', error);
      toast({
        title: "Error",
        description: "Failed to load department analytics",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const totalStats = analytics.reduce((acc, dept) => ({
    students: acc.students + Number(dept.total_students),
    fees: acc.fees + Number(dept.total_fees),
    collected: acc.collected + Number(dept.total_collected),
    pending: acc.pending + Number(dept.total_pending),
    overdue: acc.overdue + Number(dept.overdue_records)
  }), { students: 0, fees: 0, collected: 0, pending: 0, overdue: 0 });

  const overallCollectionPercentage = totalStats.fees > 0 
    ? (totalStats.collected / totalStats.fees) * 100 
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Department Fee Analytics</h2>
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-blue-600" />
          <span className="text-sm text-gray-600">Real-time Data</span>
        </div>
      </div>

      {/* Overall Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Students</p>
                <p className="text-2xl font-bold text-blue-600">{totalStats.students}</p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Fees</p>
                <p className="text-2xl font-bold text-purple-600">
                  {formatCurrency(totalStats.fees)}
                </p>
              </div>
              <IndianRupee className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Collected</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(totalStats.collected)}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-orange-600">
                  {formatCurrency(totalStats.pending)}
                </p>
              </div>
              <AlertTriangle className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Collection %</p>
                <p className="text-2xl font-bold text-indigo-600">
                  {overallCollectionPercentage.toFixed(1)}%
                </p>
              </div>
              <PieChart className="w-8 h-8 text-indigo-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Department Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Department-wise Fee Collection</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {analytics.map((dept) => (
              <div key={dept.department_id} className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900">
                      {dept.department_name} ({dept.department_code})
                    </h3>
                    <p className="text-sm text-gray-600">
                      {Number(dept.total_students)} students • {Number(dept.total_fee_records)} fee records
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-blue-600">
                      {Number(dept.collection_percentage).toFixed(1)}%
                    </p>
                    <p className="text-sm text-gray-600">Collection Rate</p>
                  </div>
                </div>

                <Progress 
                  value={Number(dept.collection_percentage)} 
                  className="h-2"
                />

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-blue-600 font-medium">Total Fees</p>
                    <p className="text-blue-800 font-bold">
                      {formatCurrency(Number(dept.total_fees))}
                    </p>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg">
                    <p className="text-green-600 font-medium">Collected</p>
                    <p className="text-green-800 font-bold">
                      {formatCurrency(Number(dept.total_collected))}
                    </p>
                  </div>
                  <div className="bg-orange-50 p-3 rounded-lg">
                    <p className="text-orange-600 font-medium">Pending</p>
                    <p className="text-orange-800 font-bold">
                      {formatCurrency(Number(dept.total_pending))}
                    </p>
                  </div>
                  <div className="bg-red-50 p-3 rounded-lg">
                    <p className="text-red-600 font-medium">Overdue</p>
                    <p className="text-red-800 font-bold">
                      {Number(dept.overdue_records)} records
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Performance Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Department Performance Ranking</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analytics
              .sort((a, b) => Number(b.collection_percentage) - Number(a.collection_percentage))
              .map((dept, index) => (
                <div key={dept.department_id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                      index === 0 ? 'bg-yellow-500' : 
                      index === 1 ? 'bg-gray-400' : 
                      index === 2 ? 'bg-orange-500' : 'bg-blue-500'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-semibold">{dept.department_name}</p>
                      <p className="text-sm text-gray-600">
                        {Number(dept.total_students)} students
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-green-600">
                      {Number(dept.collection_percentage).toFixed(1)}%
                    </p>
                    <p className="text-sm text-gray-600">
                      {formatCurrency(Number(dept.total_collected))} collected
                    </p>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DepartmentAnalytics;
