
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Button } from '../ui/button';
import { Calendar, Clock, Users, CheckCircle, XCircle, AlertCircle, BookOpen } from 'lucide-react';
import { useStudentAttendance, StudentAttendanceRecord } from '../../hooks/useStudentAttendance';
import { useAuth } from '../../contexts/SupabaseAuthContext';
import { supabase } from '../../integrations/supabase/client';

interface AttendanceStats {
  totalStudents: number;
  presentToday: number;
  absentToday: number;
  partialToday: number;
  averageAttendance: number;
}

const StudentAttendanceOverview: React.FC = () => {
  const { user } = useAuth();
  const { attendanceRecords, studentsWithAttendance, loading, fetchAttendanceRecords, fetchStudentsWithAttendance } = useStudentAttendance();
  const [attendanceStats, setAttendanceStats] = useState<AttendanceStats>({
    totalStudents: 0,
    presentToday: 0,
    absentToday: 0,
    partialToday: 0,
    averageAttendance: 0
  });
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [classFilter, setClassFilter] = useState('all');
  const [departments, setDepartments] = useState<any[]>([]);

  useEffect(() => {
    fetchDepartments();
    if (user) {
      fetchStudentsWithAttendance();
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchAttendanceRecords(selectedDate, departmentFilter !== 'all' ? departmentFilter : undefined);
    }
  }, [user, selectedDate, departmentFilter]);

  useEffect(() => {
    calculateStats();
  }, [attendanceRecords, studentsWithAttendance]);

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
    const totalStudents = studentsWithAttendance.length;
    const presentToday = attendanceRecords.filter(r => r.overall_status === 'Present').length;
    const absentToday = attendanceRecords.filter(r => r.overall_status === 'Absent').length;
    const partialToday = attendanceRecords.filter(r => r.overall_status === 'Partial').length;
    
    const averageAttendance = studentsWithAttendance.length > 0
      ? studentsWithAttendance.reduce((sum, student) => sum + student.attendance_percentage, 0) / studentsWithAttendance.length
      : 0;

    setAttendanceStats({
      totalStudents,
      presentToday,
      absentToday,
      partialToday,
      averageAttendance: Math.round(averageAttendance * 100) / 100
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

  const getAttendanceColor = (percentage: number) => {
    if (percentage >= 85) return 'text-green-600';
    if (percentage >= 75) return 'text-yellow-600';
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
        <h2 className="text-2xl font-bold text-gray-900">Student Attendance Overview</h2>
        <Button 
          onClick={() => {
            fetchAttendanceRecords(selectedDate, departmentFilter !== 'all' ? departmentFilter : undefined);
            fetchStudentsWithAttendance();
          }}
          variant="outline"
        >
          Refresh
        </Button>
      </div>

      {/* Date and Department Filters */}
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
        <div>
          <Label htmlFor="class">Class/Section</Label>
          <Select value={classFilter} onValueChange={setClassFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Select class" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Classes</SelectItem>
              <SelectItem value="A">Section A</SelectItem>
              <SelectItem value="B">Section B</SelectItem>
              <SelectItem value="C">Section C</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Students</p>
                <p className="text-2xl font-bold">{attendanceStats.totalStudents}</p>
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
                <p className="text-sm font-medium text-muted-foreground">Average Attendance</p>
                <p className="text-2xl font-bold">{attendanceStats.averageAttendance}%</p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Today's Attendance Table */}
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
                  <th className="text-left p-3">Student</th>
                  <th className="text-left p-3">Roll Number</th>
                  <th className="text-left p-3">Department</th>
                  <th className="text-left p-3">Status</th>
                  <th className="text-left p-3">Periods</th>
                  <th className="text-left p-3">Attendance %</th>
                </tr>
              </thead>
              <tbody>
                {attendanceRecords.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-muted-foreground">
                      No attendance records found for this date
                    </td>
                  </tr>
                ) : (
                  attendanceRecords.map((record, index) => (
                    <tr key={index} className="border-b hover:bg-muted/50">
                      <td className="p-3 font-medium">{record.student_name}</td>
                      <td className="p-3">{record.roll_number}</td>
                      <td className="p-3">{record.department_name}</td>
                      <td className="p-3">{getStatusBadge(record.overall_status)}</td>
                      <td className="p-3">
                        <span className="text-sm">
                          {record.present_periods + record.late_periods + record.excused_periods}/{record.total_periods}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className={`font-medium ${getAttendanceColor(record.attendance_percentage)}`}>
                          {record.attendance_percentage}%
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

      {/* Overall Student Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Overall Student Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3">Student</th>
                  <th className="text-left p-3">Roll Number</th>
                  <th className="text-left p-3">Department</th>
                  <th className="text-left p-3">Year</th>
                  <th className="text-left p-3">Total Days</th>
                  <th className="text-left p-3">Present Days</th>
                  <th className="text-left p-3">Overall %</th>
                </tr>
              </thead>
              <tbody>
                {studentsWithAttendance.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-muted-foreground">
                      No student data available
                    </td>
                  </tr>
                ) : (
                  studentsWithAttendance.map((student, index) => (
                    <tr key={index} className="border-b hover:bg-muted/50">
                      <td className="p-3 font-medium">{student.name}</td>
                      <td className="p-3">{student.roll_number}</td>
                      <td className="p-3">{student.department_name}</td>
                      <td className="p-3">{student.year}</td>
                      <td className="p-3">{student.total_attendance_days}</td>
                      <td className="p-3">{student.present_days}</td>
                      <td className="p-3">
                        <span className={`font-medium ${getAttendanceColor(student.attendance_percentage)}`}>
                          {student.attendance_percentage}%
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
    </div>
  );
};

export default StudentAttendanceOverview;
