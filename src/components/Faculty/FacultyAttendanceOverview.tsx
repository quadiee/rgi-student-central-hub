
import React, { useState, useEffect } from 'react';
import { supabase } from '../../integrations/supabase/client';
import { useAuth } from '../../contexts/SupabaseAuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Calendar, Clock, Users, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface AttendanceStats {
  totalFaculty: number;
  presentToday: number;
  absentToday: number;
  onLeaveToday: number;
  averageAttendance: number;
}

interface FacultyAttendanceItem {
  faculty_id: string;
  name: string;
  employee_code: string;
  department_name: string;
  attendance_date: string;
  overall_status: string;
  present_periods: number;
  total_periods: number;
  first_punch_time: string;
  last_punch_time: string;
  total_working_hours: string;
}

const FacultyAttendanceOverview: React.FC = () => {
  const { user } = useAuth();
  const [attendanceStats, setAttendanceStats] = useState<AttendanceStats>({
    totalFaculty: 0,
    presentToday: 0,
    absentToday: 0,
    onLeaveToday: 0,
    averageAttendance: 0
  });
  const [todayAttendance, setTodayAttendance] = useState<FacultyAttendanceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [departments, setDepartments] = useState<any[]>([]);

  useEffect(() => {
    fetchDepartments();
  }, []);

  useEffect(() => {
    if (user) {
      fetchAttendanceData();
    }
  }, [user, selectedDate, departmentFilter]);

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

  const fetchAttendanceData = async () => {
    try {
      setLoading(true);

      // Get faculty list with attendance data
      const { data: facultyData, error: facultyError } = await supabase.rpc('get_faculty_with_details', {
        p_user_id: user?.id
      });

      if (facultyError) throw facultyError;

      // Get attendance for selected date
      let attendanceQuery = supabase
        .from('faculty_attendance')
        .select(`
          *,
          faculty_profiles!inner (
            id,
            employee_code,
            profiles!faculty_profiles_user_id_fkey (
              name,
              department_id,
              departments (
                name
              )
            )
          )
        `)
        .eq('attendance_date', selectedDate);

      const { data: attendanceData, error: attendanceError } = await attendanceQuery;

      if (attendanceError) throw attendanceError;

      // Process attendance data
      const processedAttendance: FacultyAttendanceItem[] = (attendanceData || []).map(record => ({
        faculty_id: record.faculty_id,
        name: record.faculty_profiles?.profiles?.name || 'Unknown',
        employee_code: record.faculty_profiles?.employee_code || 'N/A',
        department_name: record.faculty_profiles?.profiles?.departments?.name || 'Unknown',
        attendance_date: record.attendance_date,
        overall_status: record.overall_status,
        present_periods: record.present_periods,
        total_periods: record.total_periods,
        first_punch_time: record.first_punch_time,
        last_punch_time: record.last_punch_time,
        total_working_hours: record.total_working_hours ? String(record.total_working_hours) : 'N/A'
      }));

      // Filter by department if selected
      const filteredAttendance = departmentFilter === 'all' 
        ? processedAttendance 
        : processedAttendance.filter(record => 
            record.department_name === departments.find(d => d.id === departmentFilter)?.name
          );

      setTodayAttendance(filteredAttendance);

      // Calculate stats
      const totalFaculty = facultyData?.length || 0;
      const presentToday = filteredAttendance.filter(r => r.overall_status === 'Present').length;
      const absentToday = filteredAttendance.filter(r => r.overall_status === 'Absent').length;
      const onLeaveToday = filteredAttendance.filter(r => r.overall_status === 'On Leave').length;
      
      const averageAttendance = facultyData?.length > 0 
        ? facultyData.reduce((sum: number, faculty: any) => sum + (faculty.attendance_percentage || 0), 0) / facultyData.length
        : 0;

      setAttendanceStats({
        totalFaculty,
        presentToday,
        absentToday,
        onLeaveToday,
        averageAttendance: Math.round(averageAttendance * 100) / 100
      });

    } catch (error) {
      console.error('Error fetching attendance data:', error);
    } finally {
      setLoading(false);
    }
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

  const formatTime = (timeString: string) => {
    if (!timeString) return 'N/A';
    return new Date(`1970-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
            Attendance for {new Date(selectedDate).toLocaleDateString()}
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
                {todayAttendance.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-8 text-muted-foreground">
                      No attendance records found for this date
                    </td>
                  </tr>
                ) : (
                  todayAttendance.map((record, index) => (
                    <tr key={index} className="border-b hover:bg-muted/50">
                      <td className="p-3 font-medium">{record.name}</td>
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
                      <td className="p-3">{record.total_working_hours}</td>
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

export default FacultyAttendanceOverview;
