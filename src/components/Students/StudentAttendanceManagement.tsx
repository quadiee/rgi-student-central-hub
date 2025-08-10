
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Calendar, Clock, Users, CheckCircle, XCircle, AlertTriangle, Plus, Download, Upload } from 'lucide-react';
import { useStudentAttendance } from '../../hooks/useStudentAttendance';
import { useAuth } from '../../contexts/SupabaseAuthContext';
import { useToast } from '../ui/use-toast';

const StudentAttendanceManagement: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { 
    attendanceSessions, 
    loading, 
    fetchAttendanceSessions, 
    markAttendance, 
    batchMarkAttendance,
    createAttendanceSession 
  } = useStudentAttendance();
  
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [classes, setClasses] = useState<string[]>([]);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [selectedSessions, setSelectedSessions] = useState<string[]>([]);

  useEffect(() => {
    if (user) {
      fetchAttendanceSessions(selectedDate);
    }
  }, [user, selectedDate]);

  useEffect(() => {
    // Extract unique classes and subjects from sessions
    const uniqueClasses = [...new Set(attendanceSessions.map(s => s.class_section).filter(Boolean))];
    const uniqueSubjects = [...new Set(attendanceSessions.map(s => s.subject_name).filter(Boolean))];
    setClasses(uniqueClasses);
    setSubjects(uniqueSubjects);
  }, [attendanceSessions]);

  const filteredSessions = attendanceSessions.filter(session => {
    return (
      (selectedClass === 'all' || session.class_section === selectedClass) &&
      (selectedSubject === 'all' || session.subject_name === selectedSubject)
    );
  });

  const handleQuickMarkAttendance = async (sessionId: string, status: string) => {
    try {
      await markAttendance(sessionId, status);
      toast({
        title: "Success",
        description: "Attendance marked successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to mark attendance",
        variant: "destructive",
      });
    }
  };

  const handleBulkMarkAttendance = async (status: string) => {
    if (selectedSessions.length === 0) {
      toast({
        title: "Warning",
        description: "Please select sessions to mark attendance",
        variant: "destructive",
      });
      return;
    }

    try {
      const updates = selectedSessions.map(sessionId => ({ sessionId, status }));
      await batchMarkAttendance(updates);
      setSelectedSessions([]);
      toast({
        title: "Success",
        description: `Marked ${selectedSessions.length} sessions as ${status}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to bulk mark attendance",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'present':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Present</Badge>;
      case 'absent':
        return <Badge className="bg-red-100 text-red-800"><XCircle className="h-3 w-3 mr-1" />Absent</Badge>;
      case 'late':
        return <Badge className="bg-orange-100 text-orange-800"><Clock className="h-3 w-3 mr-1" />Late</Badge>;
      case 'excused':
        return <Badge className="bg-blue-100 text-blue-800"><AlertTriangle className="h-3 w-3 mr-1" />Excused</Badge>;
      case 'scheduled':
        return <Badge variant="outline">Scheduled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getSessionStats = () => {
    const total = filteredSessions.length;
    const present = filteredSessions.filter(s => s.status === 'Present').length;
    const absent = filteredSessions.filter(s => s.status === 'Absent').length;
    const late = filteredSessions.filter(s => s.status === 'Late').length;
    const scheduled = filteredSessions.filter(s => s.status === 'Scheduled').length;
    
    return { total, present, absent, late, scheduled };
  };

  const stats = getSessionStats();

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
        <h2 className="text-2xl font-bold text-gray-900">Student Attendance Management</h2>
        <div className="flex gap-2">
          <Button variant="outline" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Import
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Session
          </Button>
        </div>
      </div>

      {/* Filters and Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="space-y-4">
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
                <Label htmlFor="class">Class/Section</Label>
                <Select value={selectedClass} onValueChange={setSelectedClass}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select class" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Classes</SelectItem>
                    {classes.map((cls) => (
                      <SelectItem key={cls} value={cls}>
                        {cls}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="subject">Subject</Label>
                <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select subject" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Subjects</SelectItem>
                    {subjects.map((subject) => (
                      <SelectItem key={subject} value={subject}>
                        {subject}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-sm text-muted-foreground">Total Sessions</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <p className="text-2xl font-bold">{stats.present}</p>
              <p className="text-sm text-muted-foreground">Present</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <XCircle className="h-8 w-8 text-red-600 mx-auto mb-2" />
              <p className="text-2xl font-bold">{stats.absent}</p>
              <p className="text-sm text-muted-foreground">Absent</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bulk Actions */}
      {selectedSessions.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {selectedSessions.length} session(s) selected
              </span>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="text-green-600 hover:text-green-700"
                  onClick={() => handleBulkMarkAttendance('Present')}
                >
                  Mark Present
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-red-600 hover:text-red-700"
                  onClick={() => handleBulkMarkAttendance('Absent')}
                >
                  Mark Absent
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setSelectedSessions([])}
                >
                  Clear Selection
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Attendance Sessions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Attendance Sessions for {new Date(selectedDate).toLocaleDateString()}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3">
                    <input
                      type="checkbox"
                      checked={selectedSessions.length === filteredSessions.length && filteredSessions.length > 0}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedSessions(filteredSessions.map(s => s.id));
                        } else {
                          setSelectedSessions([]);
                        }
                      }}
                      className="rounded border-gray-300"
                    />
                  </th>
                  <th className="text-left p-3">Student</th>
                  <th className="text-left p-3">Roll Number</th>
                  <th className="text-left p-3">Subject</th>
                  <th className="text-left p-3">Class</th>
                  <th className="text-left p-3">Period</th>
                  <th className="text-left p-3">Time</th>
                  <th className="text-left p-3">Status</th>
                  <th className="text-left p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSessions.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center py-8 text-muted-foreground">
                      No attendance sessions found
                    </td>
                  </tr>
                ) : (
                  filteredSessions.map((session, index) => (
                    <tr key={index} className="border-b hover:bg-muted/50">
                      <td className="p-3">
                        <input
                          type="checkbox"
                          checked={selectedSessions.includes(session.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedSessions([...selectedSessions, session.id]);
                            } else {
                              setSelectedSessions(selectedSessions.filter(id => id !== session.id));
                            }
                          }}
                          className="rounded border-gray-300"
                        />
                      </td>
                      <td className="p-3 font-medium">{session.student_name}</td>
                      <td className="p-3">{session.roll_number}</td>
                      <td className="p-3">{session.subject_name}</td>
                      <td className="p-3">{session.class_section}</td>
                      <td className="p-3">{session.period_number}</td>
                      <td className="p-3 text-sm">
                        {session.scheduled_start_time} - {session.scheduled_end_time}
                      </td>
                      <td className="p-3">{getStatusBadge(session.status)}</td>
                      <td className="p-3">
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-green-600 hover:text-green-700"
                            onClick={() => handleQuickMarkAttendance(session.id, 'Present')}
                            disabled={session.status === 'Present'}
                          >
                            P
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 hover:text-red-700"
                            onClick={() => handleQuickMarkAttendance(session.id, 'Absent')}
                            disabled={session.status === 'Absent'}
                          >
                            A
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-orange-600 hover:text-orange-700"
                            onClick={() => handleQuickMarkAttendance(session.id, 'Late')}
                            disabled={session.status === 'Late'}
                          >
                            L
                          </Button>
                        </div>
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

export default StudentAttendanceManagement;
