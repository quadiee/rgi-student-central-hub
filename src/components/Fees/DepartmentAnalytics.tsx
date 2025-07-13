import React from 'react';
import { useIsMobile } from '../../hooks/use-mobile';
import MobileDepartmentAnalytics from './MobileDepartmentAnalytics';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { TrendingUp, TrendingDown, Users, DollarSign, AlertCircle, Filter } from 'lucide-react';
import { useAuth } from '../../contexts/SupabaseAuthContext';
import { useToast } from '../ui/use-toast';
import { supabase } from '../../integrations/supabase/client';
import { Button } from '../ui/button';
import { useState, useEffect } from 'react';
import MobileFilterDrawer from './MobileFilterDrawer';
import MobileAnalyticsSummary from './MobileAnalyticsSummary';
import MobileFeeAnalyticsCard from './MobileFeeAnalyticsCard';
import FeeTypeAnalyticsFilters from './FeeTypeAnalyticsFilters';

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
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const { toast } = useToast();
  const [analytics, setAnalytics] = useState<DepartmentAnalytics[]>([]);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [departments, setDepartments] = useState<any[]>([]);

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
  }, []);

  const fetchDepartments = async () => {
    try {
      const { data, error } = await supabase
        .from('departments')
        .select('id, name, code')
        .eq('is_active', true)
        .order('name');

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

      const { data, error } = await supabase.rpc('get_department_analytics_filtered', params);

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

  const totalStats = analytics.reduce((acc, item) => ({
    totalFees: acc.totalFees + item.total_fees,
    totalCollected: acc.totalCollected + item.total_collected,
    totalPending: acc.totalPending + item.total_pending,
    totalStudents: acc.totalStudents + item.total_students,
    totalRecords: acc.totalRecords + item.total_fee_records
  }), { totalFees: 0, totalCollected: 0, totalPending: 0, totalStudents: 0, totalRecords: 0 });

  const overallCollectionPercentage = totalStats.totalFees > 0
    ? (totalStats.totalCollected / totalStats.totalFees) * 100
    : 0;

  const getStatusColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-green-500';
    if (percentage >= 70) return 'bg-yellow-500';
    if (percentage >= 50) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getTrendIcon = (percentage: number) => {
    if (percentage >= 90) return <TrendingUp className="w-4 h-4 text-green-600" />;
    if (percentage < 50) return <TrendingDown className="w-4 h-4 text-red-600" />;
    return <TrendingUp className="w-4 h-4 text-yellow-600" />;
  };

  if (isMobile) {
    return <MobileDepartmentAnalytics />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Department Analytics</h2>
          <p className="text-gray-600">Analyze fee collection performance by department</p>
        </div>
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
        >
          <Filter className="w-4 h-4 mr-2" />
          {showFilters ? 'Hide' : 'Show'} Filters
        </Button>
      </div>

      {/* Filters */}
      {showFilters && (
        <FeeTypeAnalyticsFilters
          departments={departments}
          filters={filters}
          onFiltersChange={setFilters}
          onApplyFilters={handleApplyFilters}
          onClearFilters={handleClearFilters}
          loading={loading}
        />
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Departments</p>
                <p className="text-2xl font-bold">{analytics.length}</p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Collection</p>
                <p className="text-2xl font-bold">₹{totalStats.totalCollected.toLocaleString()}</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Pending</p>
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
                <p className="text-sm font-medium text-gray-600">Overall Collection</p>
                <p className="text-2xl font-bold">{overallCollectionPercentage.toFixed(1)}%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {analytics.map((item, index) => (
            <Card key={item.department_id} className="relative">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{item.department_name}</CardTitle>
                    <p className="text-sm text-gray-600 mt-1">Code: {item.department_code}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-500">Rank #{index + 1}</div>
                    {getTrendIcon(item.collection_percentage)}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Collection Progress */}
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Collection Progress</span>
                    <span className="font-medium">{item.collection_percentage.toFixed(1)}%</span>
                  </div>
                  <Progress
                    value={item.collection_percentage}
                    className="h-2"
                  />
                  <div className={`h-2 rounded-full ${getStatusColor(item.collection_percentage)} opacity-75`}
                    style={{ width: `${item.collection_percentage}%` }} />
                </div>

                {/* Statistics Grid */}
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
                    <DollarSign className="w-4 h-4 text-purple-600" />
                    <div>
                      <div className="font-medium">₹{item.avg_fee_per_student.toLocaleString()}</div>
                      <div className="text-gray-500">Avg/Student</div>
                    </div>
                  </div>
                </div>

                {/* Overdue Records */}
                {item.overdue_records > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-red-700">
                      <AlertCircle className="w-4 h-4" />
                      <span className="text-sm font-medium">
                        {item.overdue_records} overdue records requiring attention
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* No Data State */}
      {!loading && analytics.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Department Data Found</h3>
            <p className="text-gray-600 mb-4">
              No department analytics data matches your current filter criteria.
            </p>
            <Button onClick={handleClearFilters} variant="outline">
              Clear Filters
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DepartmentAnalytics;
