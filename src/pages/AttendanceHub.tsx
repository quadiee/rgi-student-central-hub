
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Users, GraduationCap, Calendar, TrendingUp } from 'lucide-react';
import { useAuth } from '../contexts/SupabaseAuthContext';
import EnhancedFacultyAttendanceOverview from '../components/Faculty/EnhancedFacultyAttendanceOverview';
import StudentAttendanceOverview from '../components/Students/StudentAttendanceOverview';
import StudentAttendanceManagement from '../components/Students/StudentAttendanceManagement';
import { useFacultyStats } from '../hooks/useFacultyStats';
import { useStudentAttendance } from '../hooks/useStudentAttendance';

const AttendanceHub: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const { facultyStats, loading: facultyLoading } = useFacultyStats();
  const { studentsWithAttendance, loading: studentLoading } = useStudentAttendance();

  const canManageAttendance = user?.role && ['admin', 'principal', 'chairman', 'hod', 'faculty'].includes(user.role);
  const isStudent = user?.role === 'student';

  // Calculate real-time stats from actual data
  const facultyPresentToday = facultyStats?.filter(f => f.attendance_percentage > 0).length || 0;
  const studentPresentToday = studentsWithAttendance?.filter(s => s.attendance_percentage > 0).length || 0;
  const avgFacultyAttendance = facultyStats?.length > 0 
    ? Math.round((facultyStats.reduce((sum, f) => sum + f.attendance_percentage, 0) / facultyStats.length)) 
    : 0;
  const avgStudentAttendance = studentsWithAttendance?.length > 0 
    ? Math.round((studentsWithAttendance.reduce((sum, s) => sum + s.attendance_percentage, 0) / studentsWithAttendance.length)) 
    : 0;
  const lowAttendanceStudents = studentsWithAttendance?.filter(s => s.attendance_percentage < 75).length || 0;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Attendance Management</h1>
          <p className="text-muted-foreground">
            Comprehensive attendance tracking for faculty and students
          </p>
        </div>
      </div>

      {!isStudent ? (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="faculty" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Faculty
            </TabsTrigger>
            <TabsTrigger value="students" className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4" />
              Students
            </TabsTrigger>
            {canManageAttendance && (
              <TabsTrigger value="manage" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Manage
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Faculty Attendance Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {facultyLoading ? (
                    <div className="animate-pulse space-y-2">
                      <div className="h-4 bg-gray-200 rounded"></div>
                      <div className="h-4 bg-gray-200 rounded"></div>
                      <div className="h-4 bg-gray-200 rounded"></div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Total Faculty</span>
                        <span className="text-sm font-medium">{facultyStats?.length || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Active Today</span>
                        <span className="text-sm font-medium">{facultyPresentToday}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Average Attendance</span>
                        <span className="text-sm font-medium">{avgFacultyAttendance}%</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GraduationCap className="h-5 w-5" />
                    Student Attendance Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {studentLoading ? (
                    <div className="animate-pulse space-y-2">
                      <div className="h-4 bg-gray-200 rounded"></div>
                      <div className="h-4 bg-gray-200 rounded"></div>
                      <div className="h-4 bg-gray-200 rounded"></div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Total Students</span>
                        <span className="text-sm font-medium">{studentsWithAttendance?.length || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Average Attendance</span>
                        <span className="text-sm font-medium">{avgStudentAttendance}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Below 75%</span>
                        <span className={`text-sm font-medium ${lowAttendanceStudents > 0 ? 'text-red-600' : 'text-green-600'}`}>
                          {lowAttendanceStudents} Students
                        </span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="faculty">
            <EnhancedFacultyAttendanceOverview />
          </TabsContent>

          <TabsContent value="students">
            <StudentAttendanceOverview />
          </TabsContent>

          {canManageAttendance && (
            <TabsContent value="manage">
              <StudentAttendanceManagement />
            </TabsContent>
          )}
        </Tabs>
      ) : (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                My Attendance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                View your personal attendance records and statistics.
              </p>
            </CardContent>
          </Card>
          <StudentAttendanceOverview />
        </div>
      )}
    </div>
  );
};

export default AttendanceHub;
