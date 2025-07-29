
import React, { useState } from 'react';
import { useAuth } from '../../contexts/SupabaseAuthContext';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { Calendar, Clock, Users, FileSpreadsheet, Camera, CheckCircle, XCircle, AlertCircle, Upload } from 'lucide-react';
import { useIsMobile } from '../../hooks/use-mobile';

const FacultyAttendanceManagement: React.FC = () => {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [activeTab, setActiveTab] = useState('daily');

  const attendanceStats = [
    {
      title: 'Present Today',
      value: '42',
      total: '45',
      percentage: '93%',
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Absent Today',
      value: '2',
      total: '45',
      percentage: '4%',
      icon: XCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-50'
    },
    {
      title: 'Late Arrivals',
      value: '3',
      total: '45',
      percentage: '7%',
      icon: AlertCircle,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50'
    },
    {
      title: 'On Leave',
      value: '1',
      total: '45',
      percentage: '2%',
      icon: Calendar,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    }
  ];

  const mockAttendanceData = [
    {
      id: '1',
      facultyName: 'Dr. Sarah Johnson',
      employeeCode: 'EMP001',
      department: 'Computer Science',
      firstPunch: '09:00 AM',
      lastPunch: '05:30 PM',
      totalHours: '8h 30m',
      status: 'Present',
      periods: { total: 6, present: 6, absent: 0 }
    },
    {
      id: '2',
      facultyName: 'Prof. Michael Chen',
      employeeCode: 'EMP002',
      department: 'Mathematics',
      firstPunch: '09:15 AM',
      lastPunch: '05:45 PM',
      totalHours: '8h 30m',
      status: 'Late',
      periods: { total: 5, present: 5, absent: 0 }
    },
    {
      id: '3',
      facultyName: 'Dr. Emily Davis',
      employeeCode: 'EMP003',
      department: 'Physics',
      firstPunch: '-',
      lastPunch: '-',
      totalHours: '-',
      status: 'On Leave',
      periods: { total: 4, present: 0, absent: 4 }
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Present':
        return <Badge className="bg-green-100 text-green-800">Present</Badge>;
      case 'Absent':
        return <Badge className="bg-red-100 text-red-800">Absent</Badge>;
      case 'Late':
        return <Badge className="bg-yellow-100 text-yellow-800">Late</Badge>;
      case 'On Leave':
        return <Badge className="bg-blue-100 text-blue-800">On Leave</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleExcelUpload = () => {
    // Implementation for Excel upload
    console.log('Excel upload functionality');
  };

  const handleFacialRecognitionSync = () => {
    // Implementation for facial recognition sync
    console.log('Facial recognition sync functionality');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Faculty Attendance</h2>
          <p className="text-muted-foreground">
            Track and manage faculty attendance with multiple integration options
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExcelUpload}>
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Excel Upload
          </Button>
          <Button variant="outline" onClick={handleFacialRecognitionSync}>
            <Camera className="h-4 w-4 mr-2" />
            Sync Facial Recognition
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="department">Department</Label>
              <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  <SelectItem value="cse">Computer Science</SelectItem>
                  <SelectItem value="ece">Electronics & Communication</SelectItem>
                  <SelectItem value="mech">Mechanical</SelectItem>
                  <SelectItem value="civil">Civil</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button className="w-full">
                Filter Results
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {attendanceStats.map((stat, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    {stat.value}
                    <span className="text-sm font-normal text-muted-foreground">
                      /{stat.total}
                    </span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {stat.percentage}
                  </p>
                </div>
                <div className={`p-3 rounded-full ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Attendance Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className={`grid w-full ${isMobile ? 'grid-cols-2' : 'grid-cols-4'}`}>
          <TabsTrigger value="daily">Daily View</TabsTrigger>
          <TabsTrigger value="sessions">Session View</TabsTrigger>
          <TabsTrigger value="corrections">Corrections</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="daily">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Daily Attendance - {selectedDate}
              </CardTitle>
              <CardDescription>
                Overall attendance summary for all faculty members
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-4">Faculty</th>
                      <th className="text-left p-4">Employee Code</th>
                      <th className="text-left p-4">Department</th>
                      <th className="text-left p-4">First Punch</th>
                      <th className="text-left p-4">Last Punch</th>
                      <th className="text-left p-4">Total Hours</th>
                      <th className="text-left p-4">Periods</th>
                      <th className="text-left p-4">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockAttendanceData.map((record) => (
                      <tr key={record.id} className="border-b hover:bg-muted/50">
                        <td className="p-4 font-medium">{record.facultyName}</td>
                        <td className="p-4">{record.employeeCode}</td>
                        <td className="p-4">{record.department}</td>
                        <td className="p-4">{record.firstPunch}</td>
                        <td className="p-4">{record.lastPunch}</td>
                        <td className="p-4">{record.totalHours}</td>
                        <td className="p-4">
                          <span className="text-sm">
                            {record.periods.present}/{record.periods.total}
                          </span>
                        </td>
                        <td className="p-4">{getStatusBadge(record.status)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sessions">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Session-wise Attendance
              </CardTitle>
              <CardDescription>
                Period-wise attendance tracking for individual classes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Clock className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Session View</h3>
                <p className="text-muted-foreground">
                  Detailed session-wise attendance tracking will be displayed here.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="corrections">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Attendance Corrections
              </CardTitle>
              <CardDescription>
                Manage attendance correction requests and approvals
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Correction Requests</h3>
                <p className="text-muted-foreground">
                  All attendance correction requests will appear here.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5" />
                Attendance Reports
              </CardTitle>
              <CardDescription>
                Generate and download attendance reports
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
                  <FileSpreadsheet className="h-8 w-8" />
                  <span>Monthly Report</span>
                  <span className="text-sm text-muted-foreground">Download Excel</span>
                </Button>
                <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
                  <Calendar className="h-8 w-8" />
                  <span>Custom Range</span>
                  <span className="text-sm text-muted-foreground">Select dates</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FacultyAttendanceManagement;
