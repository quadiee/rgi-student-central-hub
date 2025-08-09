
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { FileText, Download, Calendar, TrendingUp, Users, DollarSign } from 'lucide-react';
import { useAuth } from '../../contexts/SupabaseAuthContext';
import { useToast } from '../ui/use-toast';
import { supabase } from '../../integrations/supabase/client';
import { useFeeTypeAnalytics } from '../../hooks/useFeeTypeAnalytics';

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

const AdminReportGenerator: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { analytics: feeTypeAnalytics, getTotalStats } = useFeeTypeAnalytics();
  const [loading, setLoading] = useState(false);
  const [departmentData, setDepartmentData] = useState<DepartmentAnalytics[]>([]);
  const [reportConfig, setReportConfig] = useState({
    type: 'Revenue',
    dateFrom: '',
    dateTo: '',
    department: '',
    format: 'PDF'
  });

  const fetchDepartmentAnalytics = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase.rpc('get_department_analytics_filtered', {
        p_from_date: reportConfig.dateFrom || null,
        p_to_date: reportConfig.dateTo || null,
        p_date_filter_type: 'created_at',
        p_department_ids: reportConfig.department ? [reportConfig.department] : null,
        p_status_filter: null,
        p_min_amount: null,
        p_max_amount: null
      });

      if (error) throw error;
      setDepartmentData(data || []);
    } catch (error) {
      console.error('Error fetching department analytics:', error);
      toast({
        title: "Error fetching data",
        description: "Failed to load department analytics",
        variant: "destructive"
      });
    }
  };

  React.useEffect(() => {
    if (user) {
      fetchDepartmentAnalytics();
    }
  }, [user, reportConfig.dateFrom, reportConfig.dateTo, reportConfig.department]);

  const handleGenerateReport = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Generate report with real data
      const totalStats = getTotalStats();
      const reportData = {
        type: reportConfig.type,
        dateRange: {
          from: reportConfig.dateFrom,
          to: reportConfig.dateTo
        },
        department: reportConfig.department,
        summary: {
          totalFees: totalStats.totalFees,
          totalCollected: totalStats.totalCollected,
          totalPending: totalStats.totalPending,
          collectionRate: totalStats.totalFees > 0 ? (totalStats.totalCollected / totalStats.totalFees) * 100 : 0
        },
        departmentBreakdown: departmentData,
        feeTypeBreakdown: feeTypeAnalytics
      };

      toast({
        title: "Report Generated",
        description: `${reportConfig.type} report has been generated with real backend data`
      });

      console.log('Generated report with real data:', reportData);
      
    } catch (error) {
      toast({
        title: "Error generating report",
        description: error instanceof Error ? error.message : "Failed to generate report",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const reportTypes = [
    { value: 'Revenue', label: 'Revenue Report' },
    { value: 'Collection', label: 'Collection Report' },
    { value: 'Outstanding', label: 'Outstanding Fees' },
    { value: 'Department', label: 'Department-wise Report' },
    { value: 'Student', label: 'Student Report' }
  ];

  const totalStats = getTotalStats();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Generate Reports
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="reportType">Report Type</Label>
              <Select value={reportConfig.type} onValueChange={(value) => 
                setReportConfig(prev => ({ ...prev, type: value }))
              }>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {reportTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="department">Department</Label>
              <Select value={reportConfig.department} onValueChange={(value) => 
                setReportConfig(prev => ({ ...prev, department: value }))
              }>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Departments</SelectItem>
                  {departmentData.map(dept => (
                    <SelectItem key={dept.department_id} value={dept.department_id}>
                      {dept.department_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="dateFrom">From Date</Label>
              <Input
                id="dateFrom"
                type="date"
                value={reportConfig.dateFrom}
                onChange={(e) => setReportConfig(prev => ({ ...prev, dateFrom: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="dateTo">To Date</Label>
              <Input
                id="dateTo"
                type="date"
                value={reportConfig.dateTo}
                onChange={(e) => setReportConfig(prev => ({ ...prev, dateTo: e.target.value }))}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              onClick={handleGenerateReport}
              disabled={loading}
              className="flex items-center gap-2"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              {loading ? 'Generating...' : 'Generate Report'}
            </Button>
          </div>

          {/* Real-time Data Preview */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium">Total Revenue</span>
                </div>
                <p className="text-2xl font-bold text-green-600">₹{totalStats.totalCollected.toLocaleString()}</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-4 w-4 text-orange-600" />
                  <span className="text-sm font-medium">Pending Amount</span>
                </div>
                <p className="text-2xl font-bold text-orange-600">₹{totalStats.totalPending.toLocaleString()}</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium">Total Records</span>
                </div>
                <p className="text-2xl font-bold text-blue-600">{totalStats.totalRecords}</p>
              </CardContent>
            </Card>
          </div>

          {/* Report Preview */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium mb-2">Report Preview (Real Data)</h4>
            <div className="text-sm text-gray-600 space-y-1">
              <p><strong>Type:</strong> {reportConfig.type} Report</p>
              <p><strong>Department:</strong> {reportConfig.department ? 
                departmentData.find(d => d.department_id === reportConfig.department)?.department_name || 'Selected Department' 
                : 'All Departments'}</p>
              {reportConfig.dateFrom && (
                <p><strong>Date Range:</strong> {reportConfig.dateFrom} to {reportConfig.dateTo || 'Today'}</p>
              )}
              <p><strong>Data Source:</strong> Live Supabase Backend</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminReportGenerator;
