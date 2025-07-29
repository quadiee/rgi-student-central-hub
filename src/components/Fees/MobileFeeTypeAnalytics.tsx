
import React, { useState, useEffect } from 'react';
import { BarChart3, Download, TrendingUp, TrendingDown, DollarSign, Users, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';
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
import MobileLoadingSpinner from '../Mobile/MobileLoadingSpinner';
import SwipeableCard from '../Mobile/SwipeableCard';
import { Eye, Edit, Trash2 } from 'lucide-react';

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
  const [refreshing, setRefreshing] = useState(false);
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

  const fetchAnalytics = async (showRefresh = false) => {
    if (!user) return;

    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const params = {
        p_from_date: filters.fromDate || null,
        p_to_date: filters.toDate || null,
        p_date_filter_type: filters.dateFilterType,
        p_department_ids: filters.selectedDepartments.length > 0 ? filters.selectedDepartments : null,
        p_status_filter: filters.statusFilter.length > 0 ? filters.statusFilter : null,
        p_min_amount: filters.minAmount ? parseFloat(filters.minAmount) : null,
        p_max_amount: filters.maxAmount ? parseFloat(filters.maxAmount) : null
      };

      console.log('Fetching fee type analytics with params:', params);

      const { data, error } = await supabase.rpc('get_fee_type_analytics_filtered', params);

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      console.log('Fee type analytics data:', data);
      setAnalytics(data || []);

      if (showRefresh) {
        toast({
          title: "Data Refreshed",
          description: "Fee type analytics have been updated",
        });
      }

    } catch (error) {
      console.error('Error fetching fee type analytics:', error);
      toast({
        title: "Error",
        description: "Failed to fetch fee type analytics",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
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
    // Re-fetch with cleared filters
    setTimeout(() => fetchAnalytics(), 100);
  };

  const handleRefresh = () => {
    fetchAnalytics(true);
  };

  const exportToCSV = () => {
    if (analytics.length === 0) {
      toast({
        title: "No Data",
        description: "No data available to export",
        variant: "destructive"
      });
      return;
    }

    const csvContent = [
      ['Fee Type', 'Description', 'Type', 'Students', 'Records', 'Total Fees', 'Collected', 'Pending', 'Collection %', 'Overdue', 'Avg per Student'].join(','),
      ...analytics.map(item => [
        `"${item.fee_type_name || ''}"`,
        `"${item.fee_type_description || ''}"`,
        item.is_mandatory ? 'Mandatory' : 'Optional',
        item.total_students || 0,
        item.total_fee_records || 0,
        item.total_fees || 0,
        item.total_collected || 0,
        item.total_pending || 0,
        (item.collection_percentage || 0).toFixed(2),
        item.overdue_records || 0,
        (item.avg_fee_per_student || 0).toFixed(2)
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fee_type_analytics_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    toast({
      title: "Export Successful",
      description: "Fee analytics data exported to CSV",
    });
  };

  const totalStats = analytics.reduce((acc, item) => ({
    totalFees: acc.totalFees + (item.total_fees || 0),
    totalCollected: acc.totalCollected + (item.total_collected || 0),
    totalPending: acc.totalPending + (item.total_pending || 0),
    totalStudents: acc.totalStudents + (item.total_students || 0),
    totalRecords: acc.totalRecords + (item.total_fee_records || 0)
  }), { totalFees: 0, totalCollected: 0, totalPending: 0, totalStudents: 0, totalRecords: 0 });

  const overallCollectionPercentage = totalStats.totalFees > 0 
    ? (totalStats.totalCollected / totalStats.totalFees) * 100 
    : 0;

  if (loading && analytics.length === 0) {
    return (
      <div className="space-y-4">
        <MobileAnalyticsSummary
          totalItems={0}
          totalCollection={0}
          totalPending={0}
          overallPercentage={0}
          title="Fee Types"
        />
        <MobileLoadingSpinner text="Loading fee type analytics..." />
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
        <div className="flex-1">
          <h2 className="text-lg font-semibold text-gray-800">Fee Type Analytics</h2>
          <p className="text-xs text-gray-600">
            {analytics.length > 0 && (
              `Last updated: ${new Date(analytics[0].last_updated || new Date()).toLocaleDateString()}`
            )}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
            className="min-h-[44px] p-2"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </Button>
          <MobileFilterDrawer
            isOpen={showFilters}
            onOpenChange={setShowFilters}
            onApplyFilters={handleApplyFilters}
            onClearFilters={handleClearFilters}
            loading={loading}
          >
            <div className="space-y-4">
              <p className="text-sm text-gray-600">Advanced filtering options for fee type analytics</p>
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
            <span className="hidden sm:inline">Export</span>
          </Button>
        </div>
      </div>

      {/* Mobile Analytics Cards */}
      <div className="space-y-3">
        {analytics.map((item, index) => {
          const swipeActions = user && ['admin', 'principal'].includes(user.role) ? [
            {
              id: 'view',
              label: 'View Details',
              icon: Eye,
              color: 'bg-blue-500',
              action: () => {
                console.log('View details for:', item.fee_type_name);
                toast({
                  title: "View Details",
                  description: `Viewing details for ${item.fee_type_name}`,
                });
              }
            }
          ] : [];

          return (
            <SwipeableCard
              key={item.fee_type_id}
              leftActions={swipeActions}
              onSwipe={(direction, actionId) => {
                console.log('Swiped', direction, 'on', item.fee_type_name);
              }}
            >
              <MobileFeeAnalyticsCard
                title={item.fee_type_name || 'Unknown Fee Type'}
                description={item.fee_type_description}
                isMandatory={item.is_mandatory}
                collectionPercentage={item.collection_percentage || 0}
                totalStudents={item.total_students || 0}
                totalCollected={item.total_collected || 0}
                totalPending={item.total_pending || 0}
                overdueRecords={item.overdue_records || 0}
                avgPerStudent={item.avg_fee_per_student || 0}
                rank={index + 1}
              />
            </SwipeableCard>
          );
        })}
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
            <div className="flex gap-2 justify-center">
              <Button onClick={handleClearFilters} variant="outline" size="sm">
                Clear Filters
              </Button>
              <Button onClick={handleRefresh} variant="default" size="sm">
                Refresh Data
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pull to Refresh Indicator */}
      {refreshing && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50">
          <div className="bg-blue-600 text-white px-4 py-2 rounded-full shadow-lg flex items-center space-x-2">
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span className="text-sm">Refreshing data...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default MobileFeeTypeAnalytics;
