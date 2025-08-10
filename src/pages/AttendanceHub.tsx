
import React, { useState } from 'react';
import { useAuth } from '../contexts/SupabaseAuthContext';
import { useIsMobile } from '../hooks/use-mobile';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Users, GraduationCap, Calendar, Clock, AlertTriangle } from 'lucide-react';
import { useFacultyStats } from '../hooks/useFacultyStats';
import { useStudentAttendance } from '../hooks/useStudentAttendance';
import StudentAttendanceOverview from '../components/Students/StudentAttendanceOverview';
import FacultyAttendanceOverview from '../components/Faculty/FacultyAttendanceOverview';
import EnhancedFacultyAttendanceOverview from '../components/Faculty/EnhancedFacultyAttendanceOverview';

const AttendanceHub: React.FC = () => {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState('overview');
  
  // Get attendance data with proper error handling
  const { stats: facultyStats, loading: facultyLoading, error: facultyError } = useFacultyStats();
  const { studentsWithAttendance, loading: studentLoading, error: studentError } = useStudentAttendance();

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold">Authentication Required</h3>
          <p className="text-muted-foreground">Please log in to access attendance data.</p>
        </div>
      </div>
    );
  }

  // Show loading state
  if (facultyLoading || studentLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-foreground">Attendance Management</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-muted rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded w-1/3 mb-2"></div>
                <div className="h-3 bg-muted rounded w-full"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Show error state
  if (facultyError || studentError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertTriangle className="mx-auto h-12 w-12 text-red-500 mb-4" />
              <h3 className="text-lg font-semibold">Error Loading Data</h3>
              <p className="text-muted-foreground mb-4">
                {facultyError || studentError || 'Failed to load attendance data'}
              </p>
              <button 
                onClick={() => window.location.reload()} 
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
              >
                Retry
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Safe data access with fallbacks
  const totalFaculty = facultyStats?.totalFaculty || 0;
  const activeFaculty = facultyStats?.activeFaculty || 0;
  const avgAttendance = facultyStats?.avgAttendance || 0;
  const totalStudents = studentsWithAttendance?.length || 0;

  const statsCards = [
    {
      title: 'Total Faculty',
      value: totalFaculty.toLocaleString(),
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      description: `${activeFaculty} active`,
    },
    {
      title: 'Total Students',
      value: totalStudents.toLocaleString(),
      icon: GraduationCap,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      description: 'Enrolled students',
    },
    {
      title: 'Avg Attendance',
      value: `${avgAttendance.toFixed(1)}%`,
      icon: Calendar,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      description: 'Faculty average',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Attendance Management</h1>
          <p className="text-muted-foreground">
            Comprehensive attendance tracking and analytics
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statsCards.map((stat) => (
          <Card key={stat.title} className="relative overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
                {stat.title}
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground mb-1">
                {stat.value}
              </div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Attendance Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="overview">
            <Clock className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="detailed">
            <Users className="h-4 w-4 mr-2" />
            Detailed View
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {totalFaculty === 0 && totalStudents === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4 opacity-50" />
                  <h3 className="text-lg font-semibold mb-2">No Attendance Data</h3>
                  <p className="text-muted-foreground">
                    No attendance records found. Start by adding faculty and students to the system.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Faculty Attendance
                  </CardTitle>
                  <CardDescription>
                    Faculty attendance overview and trends
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {totalFaculty > 0 ? (
                    <FacultyAttendanceOverview />
                  ) : (
                    <div className="text-center py-8">
                      <Users className="mx-auto h-8 w-8 text-muted-foreground mb-2 opacity-50" />
                      <p className="text-muted-foreground">No faculty data available</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GraduationCap className="h-5 w-5" />
                    Student Attendance
                  </CardTitle>
                  <CardDescription>
                    Student attendance overview and analytics
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {totalStudents > 0 ? (
                    <StudentAttendanceOverview />
                  ) : (
                    <div className="text-center py-8">
                      <GraduationCap className="mx-auto h-8 w-8 text-muted-foreground mb-2 opacity-50" />
                      <p className="text-muted-foreground">No student data available</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="detailed">
          <Card>
            <CardHeader>
              <CardTitle>Enhanced Faculty Attendance</CardTitle>
              <CardDescription>
                Detailed faculty attendance analytics with department breakdowns
              </CardDescription>
            </CardHeader>
            <CardContent>
              {totalFaculty > 0 ? (
                <EnhancedFacultyAttendanceOverview />
              ) : (
                <div className="text-center py-12">
                  <Calendar className="mx-auto h-16 w-16 text-muted-foreground mb-4 opacity-50" />
                  <h3 className="text-lg font-semibold mb-2">No Faculty Data</h3>
                  <p className="text-muted-foreground">
                    Add faculty members to the system to view detailed attendance analytics.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AttendanceHub;
