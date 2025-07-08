
import React, { useState, useEffect } from 'react';
import { DollarSign, Users, AlertTriangle, CheckCircle, Calendar, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { useAuth } from '../../contexts/SupabaseAuthContext';
import { useToast } from '../ui/use-toast';
import { SupabaseFeeService } from '../../services/supabaseFeeService';
import { FeeRecord } from '../../types';
import { useIsMobile } from '../../hooks/use-mobile';

const HODFeeView: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [departmentData, setDepartmentData] = useState<any>({
    totalRevenue: 0,
    totalOutstanding: 0,
    totalStudents: 0,
    classes: [],
    students: []
  });
  const [loading, setLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState<string>('ALL');

  useEffect(() => {
    fetchDepartmentData();
  }, [user]);

  const fetchDepartmentData = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Fetch department fee records
      const records = await SupabaseFeeService.getFeeRecords(user, {
        department: user.department_name || user.department_id
      });
      
      // Calculate department totals
      const totalRevenue = records
        .filter(record => record.status === 'Paid')
        .reduce((sum, record) => sum + record.amount, 0);
      
      const totalOutstanding = records
        .filter(record => record.status !== 'Paid')
        .reduce((sum, record) => sum + record.amount, 0);

      // Mock class-wise data based on department
      const departmentName = user.department_name || 'Department';
      const classData = [
        { name: `${departmentName} 1st Year`, students: 30, revenue: 600000, outstanding: 90000, dueToday: 5 },
        { name: `${departmentName} 2nd Year`, students: 28, revenue: 560000, outstanding: 84000, dueToday: 3 },
        { name: `${departmentName} 3rd Year`, students: 32, revenue: 640000, outstanding: 96000, dueToday: 7 },
        { name: `${departmentName} 4th Year`, students: 30, revenue: 600000, outstanding: 90000, dueToday: 4 }
      ];

      // Mock student data
      const studentData = [
        { id: '1', name: 'Arjun Kumar', rollNumber: `${user.department_name || 'DEPT'}21001`, class: '3rd Year', totalFees: 20000, paidAmount: 15000, dueAmount: 5000, dueDate: '2024-07-15', status: 'Pending' },
        { id: '2', name: 'Priya Sharma', rollNumber: `${user.department_name || 'DEPT'}21002`, class: '3rd Year', totalFees: 20000, paidAmount: 20000, dueAmount: 0, dueDate: '2024-07-15', status: 'Paid' },
        { id: '3', name: 'Rahul Reddy', rollNumber: `${user.department_name || 'DEPT'}21003`, class: '3rd Year', totalFees: 20000, paidAmount: 10000, dueAmount: 10000, dueDate: '2024-06-15', status: 'Overdue' },
        { id: '4', name: 'Anjali Patel', rollNumber: `${user.department_name || 'DEPT'}21004`, class: '3rd Year', totalFees: 20000, paidAmount: 20000, dueAmount: 0, dueDate: '2024-07-15', status: 'Paid' },
      ];

      setDepartmentData({
        totalRevenue,
        totalOutstanding,
        totalStudents: classData.reduce((sum, cls) => sum + cls.students, 0),
        classes: classData,
        students: studentData
      });
    } catch (error) {
      console.error('Error fetching department data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch department fee data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const generateDepartmentReport = async () => {
    try {
      const report = await SupabaseFeeService.generateReport(user!, {
        title: `${user?.department_name || 'Department'} Fee Report`,
        type: 'Department',
        filters: { department: user?.department_name || user?.department_id }
      });
      
      toast({
        title: "Success",
        description: "Department report generated successfully",
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
          <p className="text-gray-600">Loading department fee data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold text-gray-800`}>
          {user?.department_name || 'Department'} Fee Management
        </h2>
        <Button onClick={generateDepartmentReport} className="flex items-center space-x-2">
          <FileText className="w-4 h-4" />
          <span>Generate Report</span>
        </Button>
      </div>

      {/* Department Summary Cards */}
      <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-4'} gap-4`}>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {departmentData.totalStudents}
            </div>
            <p className="text-xs text-muted-foreground">
              Active students
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ₹{departmentData.totalRevenue?.toLocaleString() || '0'}
            </div>
            <p className="text-xs text-muted-foreground">
              Collected this semester
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
              ₹{departmentData.totalOutstanding?.toLocaleString() || '0'}
            </div>
            <p className="text-xs text-muted-foreground">
              Pending payments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Due Today</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {departmentData.classes?.reduce((sum: number, cls: any) => sum + cls.dueToday, 0) || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Payments due today
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for Class-wise and Student-wise views */}
      <Tabs defaultValue="classes" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="classes">Class-wise View</TabsTrigger>
          <TabsTrigger value="students">Student-wise View</TabsTrigger>
        </TabsList>

        <TabsContent value="classes" className="space-y-4">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Class-wise Fee Summary</h3>
            <div className="space-y-4">
              {departmentData.classes?.map((classData: any) => (
                <div key={classData.name} className="border border-gray-200 rounded-lg p-4">
                  <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-5'} gap-4 items-center`}>
                    <div>
                      <h4 className="font-medium text-gray-900">{classData.name}</h4>
                      <p className="text-sm text-gray-600">{classData.students} students</p>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-lg font-semibold text-green-600">
                        ₹{classData.revenue.toLocaleString()}
                      </div>
                      <p className="text-xs text-gray-600">Revenue</p>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-lg font-semibold text-red-600">
                        ₹{classData.outstanding.toLocaleString()}
                      </div>
                      <p className="text-xs text-gray-600">Outstanding</p>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-lg font-semibold text-orange-600">
                        {classData.dueToday}
                      </div>
                      <p className="text-xs text-gray-600">Due Today</p>
                    </div>
                    
                    <div className={`${isMobile ? 'mt-2' : ''}`}>
                      <Button size="sm" variant="outline" className={`${isMobile ? 'w-full' : ''}`}>
                        View Students
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="students" className="space-y-4">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Student-wise Fee Details</h3>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-1"
              >
                <option value="ALL">All Classes</option>
                <option value="1st Year">1st Year</option>
                <option value="2nd Year">2nd Year</option>
                <option value="3rd Year">3rd Year</option>
                <option value="4th Year">4th Year</option>
              </select>
            </div>

            <div className="space-y-3">
              {departmentData.students?.map((student: any) => (
                <div key={student.id} className="border border-gray-200 rounded-lg p-4">
                  <div className={`${isMobile ? 'space-y-3' : 'flex items-center justify-between'}`}>
                    <div className={`${isMobile ? '' : 'flex-1'}`}>
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="font-medium text-gray-900">{student.name}</h4>
                        <span className="text-sm text-gray-600">({student.rollNumber})</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          student.status === 'Paid' ? 'bg-green-100 text-green-800' :
                          student.status === 'Overdue' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {student.status}
                        </span>
                      </div>
                      <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-4'} gap-2 text-sm text-gray-600`}>
                        <div>Class: {student.class}</div>
                        <div>Total: ₹{student.totalFees.toLocaleString()}</div>
                        <div>Paid: ₹{student.paidAmount.toLocaleString()}</div>
                        <div className={student.status === 'Overdue' ? 'text-red-600 font-medium' : ''}>
                          Due: ₹{student.dueAmount.toLocaleString()} ({new Date(student.dueDate).toLocaleDateString()})
                        </div>
                      </div>
                    </div>
                    
                    {student.status !== 'Paid' && (
                      <div className={`${isMobile ? 'w-full' : 'flex-shrink-0'}`}>
                        <Button size="sm" className={`${isMobile ? 'w-full' : ''}`}>
                          Send Reminder
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default HODFeeView;
