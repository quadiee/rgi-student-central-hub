
import React, { useState, useEffect } from 'react';
import { BarChart3, Download, TrendingUp, TrendingDown, DollarSign, Users, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { useToast } from '../ui/use-toast';
import { supabase } from '../../integrations/supabase/client';
import { useAuth } from '../../contexts/SupabaseAuthContext';
import MobileAnalyticsSummary from './MobileAnalyticsSummary';
import MobileFilterDrawer from './MobileFilterDrawer';
import MobileFeeAnalyticsCard from './MobileFeeAnalyticsCard';

interface FeeTypeAnalytics {
  fee_type_id: string;
  fee_type_name: string;
  fee_type_description: string;
  is_mandatory: boolean;
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

const MobileFeeTypeAnalytics: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [analytics, setAnalytics] = useState<FeeTypeAnalytics[]>([]);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

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
    fetchAnalytics();
  }, []);

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

      const { data, error } = await supabase.rpc('get_fee_type_analytics_filtered', params);

      if (error) throw error;

      setAnalytics(data || []);
    } catch (error) {
      console.error('Error fetching fee type analytics:', error);
      toast({
        title: "Error",
        description: "Failed to fetch fee type analytics",
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

  const exportToCSV = () => {
    const csvContent = [
      ['Fee Type', 'Description', 'Type', 'Students', 'Records', 'Total Fees', 'Collected', 'Pending', 'Collection %', 'Overdue', 'Avg per Student'].join(','),
      ...analytics.map(item => [
        item.fee_type_name,
        item.fee_type_description || '',
        item.is_mandatory ? 'Mandatory' : 'Optional',
        item.total_students,
        item.total_fee_records,
        item.total_fees,
        item.total_collected,
        item.total_pending,
        item.collection_percentage,
        item.overdue_records,
        item.avg_fee_per_student
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fee_type_analytics_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
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

  if (loading) {
    return (
      <div className="space-y-4">
        <MobileAnalyticsSummary
          totalItems={0}
          totalCollection={0}
          totalPending={0}
          overallPercentage={0}
          title="Fee Types"
        />
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Mobile Summary Cards */}
      <MobileAnalyticsSummary
        totalItems={analytics.length}
        totalCollection={totalStats.totalCollected}
        totalPending={totalStats.totalPending}
        overallPercentage={overallCollectionPercentage}
        title="Fee Types"
      />

      {/* Mobile Header with Actions */}
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-800">Fee Type Analytics</h2>
        <div className="flex gap-2">
          <MobileFilterDrawer
            isOpen={showFilters}
            onOpenChange={setShowFilters}
            onApplyFilters={handleApplyFilters}
            onClearFilters={handleClearFilters}
            loading={loading}
          >
            <div className="space-y-4">
              <p className="text-sm text-gray-600">Filter options would go here</p>
            </div>
          </MobileFilterDrawer>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={exportToCSV}
            disabled={analytics.length === 0}
            className="min-h-[44px]"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Mobile Analytics Cards */}
      <div className="space-y-3">
        {analytics.map((item, index) => (
          <MobileFeeAnalyticsCard
            key={item.fee_type_id}
            title={item.fee_type_name}
            description={item.fee_type_description}
            isMandatory={item.is_mandatory}
            collectionPercentage={item.collection_percentage}
            totalStudents={item.total_students}
            totalCollected={item.total_collected}
            totalPending={item.total_pending}
            overdueRecords={item.overdue_records}
            avgPerStudent={item.avg_fee_per_student}
            rank={index + 1}
          />
        ))}
      </div>

      {/* No Data State */}
      {analytics.length === 0 && !loading && (
        <Card>
          <CardContent className="text-center py-8">
            <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Fee Type Data Found</h3>
            <p className="text-gray-600 text-sm mb-4">
              No fee type analytics data matches your current filter criteria.
            </p>
            <Button onClick={handleClearFilters} variant="outline" size="sm">
              Clear Filters
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MobileFeeTypeAnalytics;
