
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Users, GraduationCap, Calendar, TrendingUp } from 'lucide-react';
import { useAuth } from '../contexts/SupabaseAuthContext';
import EnhancedFacultyAttendanceOverview from '../components/Faculty/EnhancedFacultyAttendanceOverview';
import StudentAttendanceOverview from '../components/Students/StudentAttendanceOverview';
import StudentAttendanceManagement from '../components/Students/StudentAttendanceManagement';

const AttendanceHub: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  const canManageAttendance = user?.role && ['admin', 'principal', 'chairman', 'hod', 'faculty'].includes(user.role);
  const isStudent = user?.role === 'student';

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
                  <p className="text-muted-foreground mb-4">
                    Quick overview of faculty attendance status and performance metrics.
                  </p>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Today's Attendance</span>
                      <span className="text-sm font-medium">85%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Monthly Average</span>
                      <span className="text-sm font-medium">92%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">On Leave</span>
                      <span className="text-sm font-medium">3 Faculty</span>
                    </div>
                  </div>
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
                  <p className="text-muted-foreground mb-4">
                    Overview of student attendance across all departments and classes.
                  </p>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Today's Attendance</span>
                      <span className="text-sm font-medium">78%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Monthly Average</span>
                      <span className="text-sm font-medium">82%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Below 75%</span>
                      <span className="text-sm font-medium text-red-600">45 Students</span>
                    </div>
                  </div>
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
        // Student view - show only their own attendance
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
