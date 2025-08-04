
import React, { useState, useEffect } from 'react';
import { supabase } from '../../integrations/supabase/client';
import { useAuth } from '../../contexts/SupabaseAuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Calendar, Clock, Users, CheckCircle, XCircle, AlertCircle, TrendingUp, BookOpen } from 'lucide-react';
import { useFacultyAttendance } from '../../hooks/useFacultyAttendance';

interface AttendanceStats {
  totalFaculty: number;
  presentToday: number;
  absentToday: number;
  onLeaveToday: number;
  averageAttendance: number;
  totalSessions: number;
  completedSessions: number;
}

const EnhancedFacultyAttendanceOverview: React.FC = () => {
  const { user } = useAuth();
  const { 
    attendanceRecords, 
    attendanceSessions, 
    enhancedFacultyList, 
    loading, 
    fetchAttendanceRecords, 
    fetchAttendanceSessions, 
    fetchEnhancedFacultyList 
  } = useFacultyAttendance();
  
  const [attendanceStats, setAttendanceStats] = useState<AttendanceStats>({
    totalFaculty: 0,
    presentToday: 0,
    absentToday: 0,
    onLeaveToday: 0,
    averageAttendance: 0,
    totalSessions: 0,
    completedSessions: 0
  });
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [departments, setDepartments] = useState<any[]>([]);

  useEffect(() => {
    fetchDepartments();
    if (user) {
      fetchEnhancedFacultyList();
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchAttendanceRecords(selectedDate, departmentFilter !== 'all' ? departmentFilter : undefined);
      fetchAttendanceSessions(selectedDate);
    }
  }, [user, selectedDate, departmentFilter]);

  useEffect(() => {
    calculateStats();
  }, [attendanceRecords, attendanceSessions, enhancedFacultyList]);

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

  const calculateStats = () => {
    const totalFaculty = enhancedFacultyList.length;
    const presentToday = attendanceRecords.filter(r => r.overall_status === 'Present').length;
    const absentToday = attendanceRecords.filter(r => r.overall_status === 'Absent').length;
    const onLeaveToday = attendanceRecords.filter(r => r.overall_status === 'On Leave').length;
    
    const averageAttendance = enhancedFacultyList.length > 0
      ? enhancedFacultyList.reduce((sum, faculty) => sum + faculty.attendance_percentage, 0) / enhancedFacultyList.length
      : 0;

    const totalSessions = attendanceSessions.length;
    const completedSessions = attendanceSessions.filter(s => s.status !== 'Scheduled').length;

    setAttendanceStats({
      totalFaculty,
      presentToday,
      absentToday,
      onLeaveToday,
      averageAttendance: Math.round(averageAttendance * 100) / 100,
      totalSessions,
      completedSessions
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'present':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Present</Badge>;
      case 'absent':
        return <Badge className="bg-red-100 text-red-800"><XCircle className="h-3 w-3 mr-1" />Absent</Badge>;
      case 'partial':
        return <Badge className="bg-yellow-100 text-yellow-800"><AlertCircle className="h-3 w-3 mr-1" />Partial</Badge>;
      case 'on leave':
        return <Badge className="bg-blue-100 text-blue-800"><Calendar className="h-3 w-3 mr-1" />On Leave</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getSessionStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'present':
        return <Badge className="bg-green-100 text-green-800">Present</Badge>;
      case 'absent':
        return <Badge className="bg-red-100 text-red-800">Absent</Badge>;
      case 'late':
        return <Badge className="bg-orange-100 text-orange-800">Late</Badge>;
      case 'left early':
        return <Badge className="bg-yellow-100 text-yellow-800">Left Early</Badge>;
      case 'scheduled':
        return <Badge variant="outline">Scheduled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatTime = (timeString: string) => {
    if (!timeString) return 'N/A';
    return new Date(`1970-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const getAttendanceColor = (percentage: number) => {
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 80) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Faculty Attendance Overview</h2>
        <Button 
          onClick={() => {
            fetchAttendanceRecords(selectedDate, departmentFilter !== 'all' ? departmentFilter : undefined);
            fetchAttendanceSessions(selectedDate);
            fetchEnhancedFacultyList();
          }}
          variant="outline"
        >
          Refresh
        </Button>
      </div>

      {/* Date and Department Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Select department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              {departments.map((dept) => (
                <SelectItem key={dept.id} value={dept.id}>
                  {dept.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Faculty</p>
                <p className="text-2xl font-bold">{attendanceStats.totalFaculty}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Present Today</p>
                <p className="text-2xl font-bold text-green-600">{attendanceStats.presentToday}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Absent Today</p>
                <p className="text-2xl font-bold text-red-600">{attendanceStats.absentToday}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Sessions</p>
                <p className="text-2xl font-bold">{attendanceStats.completedSessions}/{attendanceStats.totalSessions}</p>
              </div>
              <BookOpen className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg. Attendance</p>
                <p className="text-2xl font-bold">{attendanceStats.averageAttendance}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for different views */}
      <Tabs defaultValue="daily" className="w-full">
        <TabsList>
          <TabsTrigger value="daily">Daily Attendance</TabsTrigger>
          <TabsTrigger value="sessions">Session Details</TabsTrigger>
          <TabsTrigger value="overall">Overall Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="daily">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Daily Attendance for {new Date(selectedDate).toLocaleDateString()}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3">Faculty</th>
                      <th className="text-left p-3">Employee Code</th>
                      <th className="text-left p-3">Department</th>
                      <th className="text-left p-3">Status</th>
                      <th className="text-left p-3">Periods</th>
                      <th className="text-left p-3">First Punch</th>
                      <th className="text-left p-3">Last Punch</th>
                      <th className="text-left p-3">Working Hours</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendanceRecords.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="text-center py-8 text-muted-foreground">
                          No attendance records found for this date
                        </td>
                      </tr>
                    ) : (
                      attendanceRecords.map((record, index) => (
                        <tr key={index} className="border-b hover:bg-muted/50">
                          <td className="p-3 font-medium">{record.faculty_name}</td>
                          <td className="p-3">{record.employee_code}</td>
                          <td className="p-3">{record.department_name}</td>
                          <td className="p-3">{getStatusBadge(record.overall_status)}</td>
                          <td className="p-3">
                            <span className="text-sm">
                              {record.present_periods || 0}/{record.total_periods || 0}
                            </span>
                          </td>
                          <td className="p-3">{formatTime(record.first_punch_time)}</td>
                          <td className="p-3">{formatTime(record.last_punch_time)}</td>
                          <td className="p-3">{record.total_working_hours || 'N/A'}</td>
                        </tr>
                      ))
                    )}
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
                <Clock className="h-5 w-5" />
                Session Details for {new Date(selectedDate).toLocaleDateString()}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3">Faculty</th>
                      <th className="text-left p-3">Subject</th>
                      <th className="text-left p-3">Class</th>
                      <th className="text-left p-3">Period</th>
                      <th className="text-left p-3">Scheduled Time</th>
                      <th className="text-left p-3">Actual Time</th>
                      <th className="text-left p-3">Status</th>
                      <th className="text-left p-3">Method</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendanceSessions.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="text-center py-8 text-muted-foreground">
                          No session records found for this date
                        </td>
                      </tr>
                    ) : (
                      attendanceSessions.map((session, index) => (
                        <tr key={index} className="border-b hover:bg-muted/50">
                          <td className="p-3 font-medium">{session.faculty_name}</td>
                          <td className="p-3">{session.subject_name}</td>
                          <td className="p-3">{session.class_section}</td>
                          <td className="p-3">{session.period_number}</td>
                          <td className="p-3 text-sm">
                            {formatTime(session.scheduled_start_time)} - {formatTime(session.scheduled_end_time)}
                          </td>
                          <td className="p-3 text-sm">
                            {session.actual_start_time && session.actual_end_time 
                              ? `${formatTime(session.actual_start_time)} - ${formatTime(session.actual_end_time)}`
                              : 'N/A'
                            }
                          </td>
                          <td className="p-3">{getSessionStatusBadge(session.status)}</td>
                          <td className="p-3">
                            <Badge variant="outline" className="text-xs">
                              {session.marking_method}
                            </Badge>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="overall">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Overall Faculty Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3">Faculty</th>
                      <th className="text-left p-3">Employee Code</th>
                      <th className="text-left p-3">Department</th>
                      <th className="text-left p-3">Experience</th>
                      <th className="text-left p-3">Total Days</th>
                      <th className="text-left p-3">Present Days</th>
                      <th className="text-left p-3">Overall %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {enhancedFacultyList.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center py-8 text-muted-foreground">
                          No faculty data available
                        </td>
                      </tr>
                    ) : (
                      enhancedFacultyList.map((faculty, index) => (
                        <tr key={index} className="border-b hover:bg-muted/50">
                          <td className="p-3 font-medium">{faculty.name}</td>
                          <td className="p-3">{faculty.employee_code}</td>
                          <td className="p-3">{faculty.department_name}</td>
                          <td className="p-3">{faculty.years_of_experience || 0} years</td>
                          <td className="p-3">{faculty.total_attendance_days}</td>
                          <td className="p-3">{faculty.present_days}</td>
                          <td className="p-3">
                            <span className={`font-medium ${getAttendanceColor(faculty.attendance_percentage)}`}>
                              {faculty.attendance_percentage}%
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnhancedFacultyAttendanceOverview;
