import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, AlertTriangle, Users, Building2, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { useAuth } from '../../contexts/SupabaseAuthContext';
import { useToast } from '../ui/use-toast';
import { SupabaseFeeService } from '../../services/supabaseFeeService';
import { FeeRecord } from '../../types';
import { useIsMobile } from '../../hooks/use-mobile';

const PrincipalFeeView: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [feeData, setFeeData] = useState<any>({
    totalRevenue: 0,
    totalOutstanding: 0,
    totalStudents: 0,
    departments: []
  });
  const [loading, setLoading] = useState(true);
  const [selectedDepartment, setSelectedDepartment] = useState<string>('ALL');

  useEffect(() => {
    fetchInstitutionData();
  }, [user]);

  const fetchInstitutionData = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Fetch all fee records for institution overview
      const allRecords = await SupabaseFeeService.getFeeRecords(user);
      
      // Calculate totals
      const totalRevenue = allRecords
        .filter(record => record.status === 'Paid')
        .reduce((sum, record) => sum + record.amount, 0);
      
      const totalOutstanding = allRecords
        .filter(record => record.status !== 'Paid')
        .reduce((sum, record) => sum + record.amount, 0);

      // Group by departments (mock data for now)
      const departmentData = [
        { department_id: 'CSE', students: 120, revenue: 2400000, outstanding: 360000, collections: 87 },
        { department_id: 'ECE', students: 100, revenue: 2000000, outstanding: 300000, collections: 85 },
        { department_id: 'MECH', students: 80, revenue: 1600000, outstanding: 240000, collections: 87 },
        { department_id: 'CIVIL', students: 60, revenue: 1200000, outstanding: 180000, collections: 87 },
        { department_id: 'EEE', students: 70, revenue: 1400000, outstanding: 210000, collections: 87 }
      ];

      setFeeData({
        totalRevenue,
        totalOutstanding,
        totalStudents: departmentData.reduce((sum, dept) => sum + dept.students, 0),
        departments: departmentData
      });
    } catch (error) {
      console.error('Error fetching institution data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch institution fee data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async () => {
    try {
      const report = await SupabaseFeeService.generateReport(user!, {
        title: 'Institution Fee Report',
        type: 'Revenue',
        filters: { department_id: selectedDepartment !== 'ALL' ? selectedDepartment : undefined }
      });
      
      toast({
        title: "Success",
        description: "Report generated successfully",
      });
    } catch (error) {
      console.error('Error generating report:', error);
      toast({
        title: "Error",
        description: "Failed to generate report",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading institution fee data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold text-gray-800`}>
          Institution Fee Overview
        </h2>
        <Button onClick={generateReport} className="flex items-center space-x-2">
          <Calendar className="w-4 h-4" />
          <span>Generate Report</span>
        </Button>
      </div>

      {/* Institution Summary Cards */}
      <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-4'} gap-4`}>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ₹{feeData.totalRevenue?.toLocaleString() || '0'}
            </div>
            <p className="text-xs text-muted-foreground">
              Collected this academic year
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Outstanding</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              ₹{feeData.totalOutstanding?.toLocaleString() || '0'}
            </div>
            <p className="text-xs text-muted-foreground">
              Pending collections
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {feeData.totalStudents}
            </div>
            <p className="text-xs text-muted-foreground">
              Across all departments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Collection Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">86.5%</div>
            <p className="text-xs text-muted-foreground">
              Overall collection efficiency
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Department-wise Breakdown */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Department-wise Analysis</h3>
          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-1"
          >
            <option value="ALL">All Departments</option>
            <option value="CSE">Computer Science</option>
            <option value="ECE">Electronics</option>
            <option value="MECH">Mechanical</option>
            <option value="CIVIL">Civil</option>
            <option value="EEE">Electrical</option>
          </select>
        </div>

        <div className="space-y-4">
          {feeData.departments.map((dept: any) => (
            <div key={dept.department_id} className="border border-gray-200 rounded-lg p-4">
              <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-5'} gap-4 items-center`}>
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Building2 className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{dept.department_id}</h4>
                    <p className="text-sm text-gray-600">{dept.students} students</p>
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="text-lg font-semibold text-green-600">
                    ₹{dept.revenue.toLocaleString()}
                  </div>
                  <p className="text-xs text-gray-600">Revenue</p>
                </div>
                
                <div className="text-center">
                  <div className="text-lg font-semibold text-red-600">
                    ₹{dept.outstanding.toLocaleString()}
                  </div>
                  <p className="text-xs text-gray-600">Outstanding</p>
                </div>
                
                <div className="text-center">
                  <div className="text-lg font-semibold text-blue-600">
                    {dept.collections}%
                  </div>
                  <p className="text-xs text-gray-600">Collection Rate</p>
                </div>
                
                <div className={`${isMobile ? 'mt-2' : ''}`}>
                  <Button size="sm" variant="outline" className={`${isMobile ? 'w-full' : ''}`}>
                    View Details
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
        <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-3'} gap-4`}>
          <Button variant="outline" className="flex flex-col items-center p-4 h-auto">
            <Calendar className="w-6 h-6 mb-2" />
            <span>Generate Monthly Report</span>
          </Button>
          <Button variant="outline" className="flex flex-col items-center p-4 h-auto">
            <AlertTriangle className="w-6 h-6 mb-2" />
            <span>View Overdue Payments</span>
          </Button>
          <Button variant="outline" className="flex flex-col items-center p-4 h-auto">
            <TrendingUp className="w-6 h-6 mb-2" />
            <span>Collection Analytics</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PrincipalFeeView;