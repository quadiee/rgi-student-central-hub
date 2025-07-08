
import React, { useState } from 'react';
import { Calendar, Download, Filter, TrendingUp, BarChart3, PieChart } from 'lucide-react';
import { Button } from '../ui/button';
import { useAuth } from '../../contexts/SupabaseAuthContext';
import { useToast } from '../ui/use-toast';
import { FeeService } from '../../services/feeService';
import { useIsMobile } from '../../hooks/use-mobile';

const AdminReportGenerator: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [reportType, setReportType] = useState('revenue');
  const [dateRange, setDateRange] = useState({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    to: new Date().toISOString().split('T')[0]
  });
  const [filters, setFilters] = useState({
    department: 'all',
    semester: 'all',
    paymentStatus: 'all'
  });
  const [generatedReport, setGeneratedReport] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const generateReport = async () => {
    setLoading(true);
    try {
      const report = await FeeService.generateReport(user!, {
        type: reportType as any,
        title: `${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report`,
        dateRange,
        filters: filters.department !== 'all' ? { department: filters.department } : {}
      });
      
      setGeneratedReport({
        ...report,
        // Mock detailed data
        departmentWise: [
          { department: 'CSE', collected: 8500000, pending: 1200000, students: 240 },
          { department: 'ECE', collected: 7200000, pending: 980000, students: 195 },
          { department: 'MECH', collected: 6800000, pending: 850000, students: 180 },
          { department: 'CIVIL', collected: 5900000, pending: 720000, students: 160 },
          { department: 'EEE', collected: 4800000, pending: 650000, students: 140 }
        ],
        monthlyTrend: [
          { month: 'Jan', revenue: 2800000 },
          { month: 'Feb', revenue: 3200000 },
          { month: 'Mar', revenue: 4100000 },
          { month: 'Apr', revenue: 3800000 },
          { month: 'May', revenue: 4500000 },
          { month: 'Jun', revenue: 5200000 }
        ],
        paymentMethods: [
          { method: 'Online', amount: 18500000, percentage: 65 },
          { method: 'Cash', amount: 7200000, percentage: 25 },
          { method: 'Cheque', amount: 2100000, percentage: 7 },
          { method: 'DD', amount: 850000, percentage: 3 }
        ]
      });

      toast({
        title: "Report Generated",
        description: "Your report has been generated successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate report",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = () => {
    toast({
      title: "Download Started",
      description: "Your report is being downloaded"
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold text-gray-800`}>
          Fee Reports & Analytics
        </h2>
      </div>

      {/* Report Configuration */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Generate Report</h3>
        
        <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'} gap-4 mb-6`}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Report Type</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="revenue">Revenue Report</option>
              <option value="collection">Collection Report</option>
              <option value="outstanding">Outstanding Report</option>
              <option value="department">Department Wise</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">From Date</label>
            <input
              type="date"
              value={dateRange.from}
              onChange={(e) => setDateRange({...dateRange, from: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">To Date</label>
            <input
              type="date"
              value={dateRange.to}
              onChange={(e) => setDateRange({...dateRange, to: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
            <select
              value={filters.department}
              onChange={(e) => setFilters({...filters, department: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Departments</option>
              <option value="CSE">Computer Science</option>
              <option value="ECE">Electronics</option>
              <option value="MECH">Mechanical</option>
              <option value="CIVIL">Civil</option>
              <option value="EEE">Electrical</option>
            </select>
          </div>
        </div>

        <div className="flex space-x-3">
          <Button onClick={generateReport} disabled={loading} className="flex items-center space-x-2">
            <BarChart3 className="w-4 h-4" />
            <span>{loading ? 'Generating...' : 'Generate Report'}</span>
          </Button>
          
          {generatedReport && (
            <Button variant="outline" onClick={downloadReport} className="flex items-center space-x-2">
              <Download className="w-4 h-4" />
              <span>Download PDF</span>
            </Button>
          )}
        </div>
      </div>

      {/* Generated Report Display */}
      {generatedReport && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-3'} gap-4`}>
            <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100">Total Revenue</p>
                  <p className={`${isMobile ? 'text-2xl' : 'text-3xl'} font-bold`}>
                    ₹{(generatedReport.totalRevenue / 1000000).toFixed(1)}M
                  </p>
                </div>
                <TrendingUp className={`${isMobile ? 'w-8 h-8' : 'w-10 h-10'} text-green-100`} />
              </div>
            </div>

            <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-xl shadow-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-100">Outstanding</p>
                  <p className={`${isMobile ? 'text-2xl' : 'text-3xl'} font-bold`}>
                    ₹{(generatedReport.totalOutstanding / 1000000).toFixed(1)}M
                  </p>
                </div>
                <Calendar className={`${isMobile ? 'w-8 h-8' : 'w-10 h-10'} text-yellow-100`} />
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100">Collection Rate</p>
                  <p className={`${isMobile ? 'text-2xl' : 'text-3xl'} font-bold`}>
                    {((generatedReport.totalRevenue / (generatedReport.totalRevenue + generatedReport.totalOutstanding)) * 100).toFixed(1)}%
                  </p>
                </div>
                <PieChart className={`${isMobile ? 'w-8 h-8' : 'w-10 h-10'} text-blue-100`} />
              </div>
            </div>
          </div>

          {/* Department-wise Breakdown */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Department-wise Collection</h3>
            
            {isMobile ? (
              <div className="space-y-4">
                {generatedReport.departmentWise.map((dept: any) => (
                  <div key={dept.department} className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-3">{dept.department}</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Students:</span>
                        <p className="font-medium">{dept.students}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Collected:</span>
                        <p className="font-medium text-green-600">₹{(dept.collected / 1000000).toFixed(1)}M</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Pending:</span>
                        <p className="font-medium text-yellow-600">₹{(dept.pending / 1000000).toFixed(1)}M</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Rate:</span>
                        <p className="font-medium">{((dept.collected / (dept.collected + dept.pending)) * 100).toFixed(1)}%</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Students</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Collected</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pending</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Collection Rate</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {generatedReport.departmentWise.map((dept: any) => (
                      <tr key={dept.department} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {dept.department}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {dept.students}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">
                          ₹{(dept.collected / 1000000).toFixed(1)}M
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-yellow-600 font-medium">
                          ₹{(dept.pending / 1000000).toFixed(1)}M
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {((dept.collected / (dept.collected + dept.pending)) * 100).toFixed(1)}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Payment Methods Breakdown */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Payment Methods Distribution</h3>
            <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-2 md:grid-cols-4'} gap-4`}>
              {generatedReport.paymentMethods.map((method: any) => (
                <div key={method.method} className="text-center p-4 border border-gray-200 rounded-lg">
                  <h4 className="font-medium text-gray-900">{method.method}</h4>
                  <p className="text-2xl font-bold text-blue-600 mt-2">
                    ₹{(method.amount / 1000000).toFixed(1)}M
                  </p>
                  <p className="text-sm text-gray-500">{method.percentage}%</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminReportGenerator;
