
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { FileText, Download, Calendar } from 'lucide-react';
import { useAuth } from '../../contexts/SupabaseAuthContext';
import { RealFeeService } from '../../services/realFeeService';
import { useToast } from '../ui/use-toast';

const AdminReportGenerator: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [reportConfig, setReportConfig] = useState({
    type: 'Revenue',
    dateFrom: '',
    dateTo: '',
    department: '',
    format: 'PDF'
  });

  const handleGenerateReport = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      const report = await RealFeeService.generateReport(user, {
        type: reportConfig.type as any,
        dateRange: {
          from: reportConfig.dateFrom,
          to: reportConfig.dateTo
        },
        filters: {
          department: reportConfig.department || undefined
        }
      });

      toast({
        title: "Report Generated",
        description: `${reportConfig.type} report has been generated successfully`
      });

      // Here you would typically trigger a download or display the report
      console.log('Generated report:', report);
      
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

  const departments = [
    { value: '', label: 'All Departments' },
    { value: 'CSE', label: 'Computer Science Engineering' },
    { value: 'ECE', label: 'Electronics & Communication' },
    { value: 'MECH', label: 'Mechanical Engineering' },
    { value: 'CIVIL', label: 'Civil Engineering' },
    { value: 'EEE', label: 'Electrical & Electronics' },
    { value: 'IT', label: 'Information Technology' }
  ];

  return (
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
                {departments.map(dept => (
                  <SelectItem key={dept.value} value={dept.value}>
                    {dept.label}
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

        {/* Report Preview */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium mb-2">Report Preview</h4>
          <div className="text-sm text-gray-600 space-y-1">
            <p><strong>Type:</strong> {reportConfig.type} Report</p>
            <p><strong>Department:</strong> {reportConfig.department || 'All Departments'}</p>
            {reportConfig.dateFrom && (
              <p><strong>Date Range:</strong> {reportConfig.dateFrom} to {reportConfig.dateTo || 'Today'}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminReportGenerator;
