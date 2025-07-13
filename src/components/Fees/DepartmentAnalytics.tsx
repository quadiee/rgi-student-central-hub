import React, { useState, useEffect } from 'react';
import { BarChart3, Download, TrendingUp, TrendingDown, DollarSign, Users, AlertCircle, CheckCircle, Award } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { useToast } from '../ui/use-toast';
import { supabase } from '../../integrations/supabase/client';
import { useAuth } from '../../contexts/SupabaseAuthContext';
interface Department {
  id: string;
  name: string;
  code: string;
}
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
  avg_fee_per_student: number;
  last_updated: string;
}
interface ScholarshipAnalytics {
  department_id: string;
  department_name: string;
  department_code: string;
  total_scholarship_students: number;
  total_scholarships: number;
  total_eligible_amount: number;
  total_received_amount: number;
  applied_scholarships: number;
  received_scholarships: number;
  academic_year: string;
}
interface Filters {
  fromDate: string;
  toDate: string;
  dateFilterType: string;
  selectedDepartments: string[];
  statusFilter: string[];
  minAmount: string;
  maxAmount: string;
}
const DepartmentAnalytics: React.FC = () => {
  const {
    user
  } = useAuth();
  const {
    toast
  } = useToast();
  const [analytics, setAnalytics] = useState<DepartmentAnalytics[]>([]);
  const [scholarshipAnalytics, setScholarshipAnalytics] = useState<ScholarshipAnalytics[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    fromDate: '',
    toDate: '',
    dateFilterType: 'created_at',
    selectedDepartments: [],
    statusFilter: [],
    minAmount: '',
    maxAmount: ''
  });
  useEffect(() => {
    fetchDepartments();
    fetchAnalytics();
    fetchScholarshipAnalytics();
  }, []);
  const fetchDepartments = async () => {
    try {
      const {
        data,
        error
      } = await supabase.from('departments').select('id, name, code').eq('is_active', true).order('name');
      if (error) throw error;
      setDepartments(data || []);
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };
  const fetchAnalytics = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const params = {
        p_from_date: filters.fromDate || null,
        p_to_date: filters.toDate || null,
        p_date_filter_type: filters.dateFilterType,
        p_department_ids: filters.selectedDepartments.length > 0 ? filters.selectedDepartments : null,
        p_status_filter: filters.statusFilter.length > 0 ? filters.statusFilter : null,
        p_min_amount: filters.minAmount ? parseFloat(filters.minAmount) : null,
        p_max_amount: filters.maxAmount ? parseFloat(filters.maxAmount) : null
      };
      const {
        data,
        error
      } = await supabase.rpc('get_department_analytics_filtered', params);
      if (error) throw error;
      setAnalytics(data || []);
    } catch (error) {
      console.error('Error fetching department analytics:', error);
      toast({
        title: "Error",
        description: "Failed to fetch department analytics",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  const fetchScholarshipAnalytics = async () => {
    try {
      const {
        data,
        error
      } = await supabase.from('scholarship_summary').select('*').eq('academic_year', '2024-25').order('department_name');
      if (error) throw error;
      setScholarshipAnalytics(data || []);
    } catch (error) {
      console.error('Error fetching scholarship analytics:', error);
    }
  };
  const handleApplyFilters = () => {
    fetchAnalytics();
  };
  const handleClearFilters = () => {
    setFilters({
      fromDate: '',
      toDate: '',
      dateFilterType: 'created_at',
      selectedDepartments: [],
      statusFilter: [],
      minAmount: '',
      maxAmount: ''
    });
  };
  const exportToCSV = () => {
    const csvContent = [['Department', 'Code', 'Students', 'Fee Records', 'Total Fees', 'Collected', 'Pending', 'Collection %', 'Overdue', 'Scholarship Eligible', 'Scholarship Received', 'Scholarship %'].join(','), ...analytics.map(item => {
      const scholarship = scholarshipAnalytics.find(s => s.department_id === item.department_id);
      return [item.department_name, item.department_code, item.total_students, item.total_fee_records, item.total_fees, item.total_collected, item.total_pending, item.collection_percentage, item.overdue_records, scholarship?.total_eligible_amount || 0, scholarship?.total_received_amount || 0, scholarship && scholarship.total_eligible_amount > 0 ? Math.round(scholarship.total_received_amount / scholarship.total_eligible_amount * 100) : 0].join(',');
    })].join('\n');
    const blob = new Blob([csvContent], {
      type: 'text/csv'
    });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `department_analytics_with_scholarships_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };
  const getStatusColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-green-500';
    if (percentage >= 70) return 'bg-yellow-500';
    if (percentage >= 50) return 'bg-orange-500';
    return 'bg-red-500';
  };
  const totalStats = analytics.reduce((acc, item) => ({
    totalFees: acc.totalFees + item.total_fees,
    totalCollected: acc.totalCollected + item.total_collected,
    totalPending: acc.totalPending + item.total_pending,
    totalStudents: acc.totalStudents + item.total_students,
    totalRecords: acc.totalRecords + item.total_fee_records
  }), {
    totalFees: 0,
    totalCollected: 0,
    totalPending: 0,
    totalStudents: 0,
    totalRecords: 0
  });
  const totalScholarshipStats = scholarshipAnalytics.reduce((acc, item) => ({
    totalEligible: acc.totalEligible + item.total_eligible_amount,
    totalReceived: acc.totalReceived + item.total_received_amount,
    totalStudents: acc.totalStudents + item.total_scholarship_students
  }), {
    totalEligible: 0,
    totalReceived: 0,
    totalStudents: 0
  });
  const overallCollectionPercentage = totalStats.totalFees > 0 ? totalStats.totalCollected / totalStats.totalFees * 100 : 0;
  const overallScholarshipPercentage = totalScholarshipStats.totalEligible > 0 ? totalScholarshipStats.totalReceived / totalScholarshipStats.totalEligible * 100 : 0;
  return <div className="space-y-6 mx-[22px] px-[8px] py-[5px] rounded-sm">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Department-wise Analytics</h2>
          <p className="text-gray-600">Analyze fee collection and scholarship disbursement by department</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportToCSV} disabled={analytics.length === 0}>
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Departments</p>
                <p className="text-2xl font-bold">{analytics.length}</p>
              </div>
              <BarChart3 className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Fee Collection</p>
                <p className="text-2xl font-bold">₹{totalStats.totalCollected.toLocaleString()}</p>
                <p className="text-sm text-gray-500">{overallCollectionPercentage.toFixed(1)}%</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Fee Pending</p>
                <p className="text-2xl font-bold">₹{totalStats.totalPending.toLocaleString()}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Scholarship Received</p>
                <p className="text-2xl font-bold">₹{totalScholarshipStats.totalReceived.toLocaleString()}</p>
                <p className="text-sm text-gray-500">{overallScholarshipPercentage.toFixed(1)}%</p>
              </div>
              <Award className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Students</p>
                <p className="text-2xl font-bold">{totalStats.totalStudents}</p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Grid */}
      {loading ? <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div> : <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {analytics.map((item, index) => {
        const scholarship = scholarshipAnalytics.find(s => s.department_id === item.department_id);
        const scholarshipPercentage = scholarship && scholarship.total_eligible_amount > 0 ? scholarship.total_received_amount / scholarship.total_eligible_amount * 100 : 0;
        return <Card key={item.department_id} className="relative">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        {item.department_name}
                        <Badge variant="outline" className="text-xs">{item.department_code}</Badge>
                      </CardTitle>
                      <p className="text-sm text-gray-600 mt-1">Department #{index + 1}</p>
                    </div>
                    <div className="text-right">
                      {item.collection_percentage >= 90 ? <TrendingUp className="w-5 h-5 text-green-600 ml-auto" /> : item.collection_percentage < 50 ? <TrendingDown className="w-5 h-5 text-red-600 ml-auto" /> : <BarChart3 className="w-5 h-5 text-yellow-600 ml-auto" />}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Fee Collection Progress */}
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Fee Collection Progress</span>
                      <span className="font-medium">{item.collection_percentage.toFixed(1)}%</span>
                    </div>
                    <Progress value={item.collection_percentage} className="h-2" />
                  </div>

                  {/* Scholarship Progress */}
                  {scholarship && <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Scholarship Collection Progress</span>
                        <span className="font-medium">{scholarshipPercentage.toFixed(1)}%</span>
                      </div>
                      <Progress value={scholarshipPercentage} className="h-2" />
                    </div>}

                  {/* Fee Statistics Grid */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-blue-600" />
                      <div>
                        <div className="font-medium">{item.total_students}</div>
                        <div className="text-gray-500">Students</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-green-600" />
                      <div>
                        <div className="font-medium">₹{item.total_collected.toLocaleString()}</div>
                        <div className="text-gray-500">Collected</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-red-600" />
                      <div>
                        <div className="font-medium">₹{item.total_pending.toLocaleString()}</div>
                        <div className="text-gray-500">Pending</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-purple-600" />
                      <div>
                        <div className="font-medium">₹{item.avg_fee_per_student.toLocaleString()}</div>
                        <div className="text-gray-500">Avg/Student</div>
                      </div>
                    </div>
                  </div>

                  {/* Scholarship Statistics */}
                  {scholarship && <div className="border-t pt-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                        <Award className="w-4 h-4" />
                        Scholarship Details
                      </h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <div className="font-medium text-green-600">₹{scholarship.total_eligible_amount.toLocaleString()}</div>
                          <div className="text-gray-500">Eligible Amount</div>
                        </div>
                        <div>
                          <div className="font-medium text-blue-600">₹{scholarship.total_received_amount.toLocaleString()}</div>
                          <div className="text-gray-500">Received Amount</div>
                        </div>
                        <div>
                          <div className="font-medium">{scholarship.total_scholarship_students}</div>
                          <div className="text-gray-500">Eligible Students</div>
                        </div>
                        <div>
                          <div className="font-medium">{scholarship.received_scholarships}</div>
                          <div className="text-gray-500">Received Count</div>
                        </div>
                      </div>
                    </div>}

                  {/* Overdue Records */}
                  {item.overdue_records > 0 && <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <div className="flex items-center gap-2 text-red-700">
                        <AlertCircle className="w-4 h-4" />
                        <span className="text-sm font-medium">
                          {item.overdue_records} overdue records requiring attention
                        </span>
                      </div>
                    </div>}
                </CardContent>
              </Card>;
      })}
        </div>}

      {/* No Data State */}
      {!loading && analytics.length === 0 && <Card>
          <CardContent className="text-center py-12">
            <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Department Data Found</h3>
            <p className="text-gray-600 mb-4">
              No department analytics data matches your current filter criteria.
            </p>
            <Button onClick={handleClearFilters} variant="outline">
              Clear Filters
            </Button>
          </CardContent>
        </Card>}
    </div>;
};
export default DepartmentAnalytics;