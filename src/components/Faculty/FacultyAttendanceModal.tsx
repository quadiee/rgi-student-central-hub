
import React, { useState, useEffect } from 'react';
import { supabase } from '../../integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Calendar, Clock, TrendingUp, TrendingDown, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface FacultyAttendanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  faculty: {
    faculty_id: string;
    name: string;
    employee_code: string;
    department_name: string;
    attendance_percentage: number;
    total_attendance_days: number;
    present_days: number;
    absent_days: number;
  };
}

interface AttendanceRecord {
  attendance_date: string;
  total_periods: number;
  present_periods: number;
  absent_periods: number;
  late_periods: number;
  overall_status: string;
  first_punch_time: string;
  last_punch_time: string;
  total_working_hours: string;
  remarks: string;
}

const FacultyAttendanceModal: React.FC<FacultyAttendanceModalProps> = ({
  isOpen,
  onClose,
  faculty
}) => {
  const [attendanceHistory, setAttendanceHistory] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'semester'>('month');

  useEffect(() => {
    if (isOpen && faculty.faculty_id) {
      fetchAttendanceHistory();
    }
  }, [isOpen, faculty.faculty_id, selectedPeriod]);

  const fetchAttendanceHistory = async () => {
    try {
      setLoading(true);
      
      // Use direct query instead of RPC since the function might not be available
      const limit = selectedPeriod === 'week' ? 7 : selectedPeriod === 'month' ? 30 : 120;
      
      const { data, error } = await supabase
        .from('faculty_attendance')
        .select(`
          attendance_date,
          total_periods,
          present_periods,
          absent_periods,
          late_periods,
          overall_status,
          first_punch_time,
          last_punch_time,
          total_working_hours,
          remarks
        `)
        .eq('faculty_id', faculty.faculty_id)
        .order('attendance_date', { ascending: false })
        .limit(limit);

      if (error) throw error;
      
      const formattedData: AttendanceRecord[] = (data || []).map((record: any) => ({
        attendance_date: record.attendance_date,
        total_periods: record.total_periods || 0,
        present_periods: record.present_periods || 0,
        absent_periods: record.absent_periods || 0,
        late_periods: record.late_periods || 0,
        overall_status: record.overall_status || 'Unknown',
        first_punch_time: record.first_punch_time || '',
        last_punch_time: record.last_punch_time || '',
        total_working_hours: record.total_working_hours ? record.total_working_hours.toString() : '',
        remarks: record.remarks || ''
      }));

      setAttendanceHistory(formattedData);
    } catch (error) {
      console.error('Error fetching attendance history:', error);
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
    try {
      return new Date(`1970-01-01T${timeString}`).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch {
      return timeString || 'N/A';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Prepare chart data
  const chartData = attendanceHistory.slice(0, 14).reverse().map(record => ({
    date: new Date(record.attendance_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    attendance: record.present_periods && record.total_periods ? 
      Math.round((record.present_periods / record.total_periods) * 100) : 0
  }));

  const pieData = [
    { name: 'Present', value: faculty.present_days, color: '#10b981' },
    { name: 'Absent', value: faculty.absent_days, color: '#ef4444' }
  ];

  const recentTrend = chartData.length >= 2 ? 
    chartData[chartData.length - 1].attendance - chartData[chartData.length - 2].attendance : 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Attendance History - {faculty.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Employee Code</p>
                    <p className="font-semibold">{faculty.employee_code}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Department</p>
                    <p className="font-semibold">{faculty.department_name}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Overall Attendance</p>
                    <p className="font-semibold text-lg">{faculty.attendance_percentage.toFixed(1)}%</p>
                  </div>
                  {recentTrend > 0 ? (
                    <TrendingUp className="h-5 w-5 text-green-600" />
                  ) : recentTrend < 0 ? (
                    <TrendingDown className="h-5 w-5 text-red-600" />
                  ) : (
                    <Clock className="h-5 w-5 text-gray-600" />
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Period Selection */}
          <div className="flex gap-2">
            <Button
              variant={selectedPeriod === 'week' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedPeriod('week')}
            >
              Last Week
            </Button>
            <Button
              variant={selectedPeriod === 'month' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedPeriod('month')}
            >
              Last Month
            </Button>
            <Button
              variant={selectedPeriod === 'semester' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedPeriod('semester')}
            >
              This Semester
            </Button>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Attendance Trend */}
            <Card>
              <CardHeader>
                <CardTitle>Attendance Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip formatter={(value) => [`${value}%`, 'Attendance']} />
                    <Line type="monotone" dataKey="attendance" stroke="#3b82f6" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Present vs Absent */}
            <Card>
              <CardHeader>
                <CardTitle>Present vs Absent Days</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Attendance History Table */}
          <Card>
            <CardHeader>
              <CardTitle>Detailed Attendance History</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Date</th>
                        <th className="text-left p-2">Status</th>
                        <th className="text-left p-2">Periods</th>
                        <th className="text-left p-2">First Punch</th>
                        <th className="text-left p-2">Last Punch</th>
                        <th className="text-left p-2">Working Hours</th>
                      </tr>
                    </thead>
                    <tbody>
                      {attendanceHistory.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="text-center py-8 text-muted-foreground">
                            No attendance records found
                          </td>
                        </tr>
                      ) : (
                        attendanceHistory.map((record, index) => (
                          <tr key={index} className="border-b hover:bg-muted/50">
                            <td className="p-2">{formatDate(record.attendance_date)}</td>
                            <td className="p-2">{getStatusBadge(record.overall_status)}</td>
                            <td className="p-2">
                              <span className="text-sm">
                                {record.present_periods || 0}/{record.total_periods || 0}
                              </span>
                            </td>
                            <td className="p-2">{formatTime(record.first_punch_time)}</td>
                            <td className="p-2">{formatTime(record.last_punch_time)}</td>
                            <td className="p-2">
                              {record.total_working_hours || 'N/A'}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FacultyAttendanceModal;
