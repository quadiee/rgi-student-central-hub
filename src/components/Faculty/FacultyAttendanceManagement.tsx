
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Calendar, Users, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useAuth } from '../../contexts/SupabaseAuthContext';
import { useFacultyAttendance } from '../../hooks/useFacultyAttendance';
import { useToast } from '../ui/use-toast';
import { format } from 'date-fns';

const FacultyAttendanceManagement: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [selectedFaculty, setSelectedFaculty] = useState<string>('all');
  
  const {
    attendanceRecords,
    attendanceSessions,
    enhancedFacultyList,
    loading,
    error,
    fetchAttendanceRecords,
    fetchAttendanceSessions,
    fetchEnhancedFacultyList,
    markAttendance
  } = useFacultyAttendance();

  useEffect(() => {
    fetchEnhancedFacultyList();
    fetchAttendanceRecords(selectedDate);
    fetchAttendanceSessions(selectedDate);
  }, [selectedDate]);

  const handleMarkAttendance = async (sessionId: string, status: string) => {
    try {
      await markAttendance(sessionId, status, new Date().toISOString().split('T')[1].substring(0, 8));
      toast({
        title: "Success",
        description: "Attendance marked successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to mark attendance",
        variant: "destructive"
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Present': return 'text-green-600 bg-green-50';
      case 'Absent': return 'text-red-600 bg-red-50';
      case 'Late': return 'text-yellow-600 bg-yellow-50';
      case 'On Leave': return 'text-blue-600 bg-blue-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Present': return CheckCircle;
      case 'Absent': return XCircle;
      case 'Late': return AlertCircle;
      default: return Clock;
    }
  };

  if (error) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="text-center py-8">
            <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Data</h3>
            <p className="text-gray-600">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Faculty Attendance Management</h2>
          <p className="text-gray-600">Track and manage faculty attendance records</p>
        </div>
        
        <div className="flex gap-2">
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-40"
          />
          <Select value={selectedFaculty} onValueChange={setSelectedFaculty}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select Faculty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Faculty</SelectItem>
              {enhancedFacultyList.map((faculty) => (
                <SelectItem key={faculty.faculty_id} value={faculty.faculty_id}>
                  {faculty.name} ({faculty.employee_code})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Faculty</p>
                    <p className="text-2xl font-bold text-gray-900">{enhancedFacultyList.length}</p>
                  </div>
                  <Users className="w-8 h-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Present Today</p>
                    <p className="text-2xl font-bold text-green-600">
                      {attendanceRecords.filter(r => r.overall_status === 'Present').length}
                    </p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Absent Today</p>
                    <p className="text-2xl font-bold text-red-600">
                      {attendanceRecords.filter(r => r.overall_status === 'Absent').length}
                    </p>
                  </div>
                  <XCircle className="w-8 h-8 text-red-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">On Leave</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {attendanceRecords.filter(r => r.overall_status === 'On Leave').length}
                    </p>
                  </div>
                  <Calendar className="w-8 h-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Daily Attendance Records */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Daily Attendance Summary - {format(new Date(selectedDate), 'PPP')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {attendanceRecords.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No attendance records found for this date</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2">Faculty</th>
                        <th className="text-left py-2">Department</th>
                        <th className="text-center py-2">Total Periods</th>
                        <th className="text-center py-2">Present</th>
                        <th className="text-center py-2">Absent</th>
                        <th className="text-center py-2">Status</th>
                        <th className="text-center py-2">Working Hours</th>
                      </tr>
                    </thead>
                    <tbody>
                      {attendanceRecords.map((record) => {
                        const StatusIcon = getStatusIcon(record.overall_status);
                        return (
                          <tr key={record.id} className="border-b hover:bg-gray-50">
                            <td className="py-3">
                              <div>
                                <p className="font-medium text-gray-900">{record.faculty_name}</p>
                                <p className="text-sm text-gray-600">{record.employee_code}</p>
                              </div>
                            </td>
                            <td className="py-3 text-gray-900">{record.department_name}</td>
                            <td className="py-3 text-center">{record.total_periods}</td>
                            <td className="py-3 text-center text-green-600">{record.present_periods}</td>
                            <td className="py-3 text-center text-red-600">{record.absent_periods}</td>
                            <td className="py-3 text-center">
                              <Badge className={getStatusColor(record.overall_status)}>
                                <StatusIcon className="w-3 h-3 mr-1" />
                                {record.overall_status}
                              </Badge>
                            </td>
                            <td className="py-3 text-center">
                              {record.total_working_hours || 'N/A'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Session-wise Attendance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Session-wise Attendance
              </CardTitle>
            </CardHeader>
            <CardContent>
              {attendanceSessions.length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No sessions found for this date</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {attendanceSessions.map((session) => {
                    const StatusIcon = getStatusIcon(session.status);
                    return (
                      <div key={session.id} className="border rounded-lg p-4 hover:bg-gray-50">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-4">
                              <div>
                                <p className="font-medium text-gray-900">{session.faculty_name}</p>
                                <p className="text-sm text-gray-600">{session.employee_code}</p>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-900">
                                  Period {session.period_number} - {session.subject_name}
                                </p>
                                <p className="text-sm text-gray-600">
                                  {session.class_section} | {session.scheduled_start_time} - {session.scheduled_end_time}
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={getStatusColor(session.status)}>
                              <StatusIcon className="w-3 h-3 mr-1" />
                              {session.status}
                            </Badge>
                            {session.status === 'Scheduled' && user?.role !== 'student' && (
                              <div className="flex gap-1">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleMarkAttendance(session.id, 'Present')}
                                  className="text-green-600 hover:text-green-700"
                                >
                                  Present
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleMarkAttendance(session.id, 'Absent')}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  Absent
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                        {session.actual_start_time && (
                          <div className="mt-2 text-sm text-gray-600">
                            Actual: {session.actual_start_time} - {session.actual_end_time}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default FacultyAttendanceManagement;
