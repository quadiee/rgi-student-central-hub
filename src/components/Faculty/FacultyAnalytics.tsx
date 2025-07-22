
import React, { useState, useEffect } from 'react';
import { supabase } from '../../integrations/supabase/client';
import { useAuth } from '../../contexts/SupabaseAuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Badge } from '../../components/ui/badge';
import { 
  Users, 
  GraduationCap, 
  Briefcase, 
  BookOpen, 
  Award, 
  TrendingUp,
  UserCheck,
  Building,
  Calendar,
  FileText
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const FacultyAnalytics: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<any>({});
  const [departmentFilter, setDepartmentFilter] = useState('all');

  useEffect(() => {
    fetchAnalytics();
  }, [user, departmentFilter]);

  const fetchAnalytics = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Get faculty count by department
      const { data: facultyByDept, error: facultyError } = await supabase
        .from('faculty_profiles')
        .select(`
          id,
          designation,
          is_active,
          profiles!user_id (
            departments:department_id (
              name,
              code
            )
          )
        `)
        .eq('is_active', true);

      if (facultyError) throw facultyError;

      // Get qualifications data
      const { data: qualifications, error: qualError } = await supabase
        .from('faculty_qualifications')
        .select(`
          degree_type,
          is_highest,
          faculty_profiles!faculty_id (
            profiles!user_id (
              departments:department_id (
                name
              )
            )
          )
        `);

      if (qualError) throw qualError;

      // Get courses data
      const { data: courses, error: courseError } = await supabase
        .from('faculty_courses')
        .select(`
          course_type,
          is_active,
          faculty_profiles!faculty_id (
            profiles!user_id (
              departments:department_id (
                name
              )
            )
          )
        `)
        .eq('is_active', true);

      if (courseError) throw courseError;

      // Process data
      const processedAnalytics = processAnalyticsData(facultyByDept || [], qualifications || [], courses || []);
      setAnalytics(processedAnalytics);
      
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const processAnalyticsData = (faculty: any[], qualifications: any[], courses: any[]) => {
    // Department-wise faculty count
    const deptCounts = faculty.reduce((acc, member) => {
      const deptName = member.profiles?.departments?.name || 'Unknown';
      acc[deptName] = (acc[deptName] || 0) + 1;
      return acc;
    }, {});

    const departmentData = Object.entries(deptCounts).map(([name, count]) => ({
      department: name,
      count
    }));

    // Designation-wise distribution
    const designationCounts = faculty.reduce((acc, member) => {
      acc[member.designation] = (acc[member.designation] || 0) + 1;
      return acc;
    }, {});

    const designationData = Object.entries(designationCounts).map(([designation, count]) => ({
      designation,
      count
    }));

    // Qualification distribution
    const qualificationCounts = qualifications.reduce((acc, qual) => {
      acc[qual.degree_type] = (acc[qual.degree_type] || 0) + 1;
      return acc;
    }, {});

    const qualificationData = Object.entries(qualificationCounts).map(([type, count]) => ({
      type,
      count
    }));

    // Course type distribution
    const courseTypeCounts = courses.reduce((acc, course) => {
      acc[course.course_type] = (acc[course.course_type] || 0) + 1;
      return acc;
    }, {});

    return {
      totalFaculty: faculty.length,
      departmentData,
      designationData,
      qualificationData,
      courseTypeCounts,
      summary: {
        totalDepartments: departmentData.length,
        totalCourses: courses.length,
        totalQualifications: qualifications.length,
        activeFaculty: faculty.filter(f => f.is_active).length
      }
    };
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

  if (loading) {
    return (
      <div className="space-y-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-32 bg-muted rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Filters */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Faculty Analytics</h2>
          <p className="text-muted-foreground">
            Comprehensive analytics and insights about faculty members
          </p>
        </div>
        <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="All Departments" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Departments</SelectItem>
            <SelectItem value="CSE">Computer Science</SelectItem>
            <SelectItem value="ECE">Electronics</SelectItem>
            <SelectItem value="MECH">Mechanical</SelectItem>
            <SelectItem value="CIVIL">Civil</SelectItem>
            <SelectItem value="EEE">Electrical</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Faculty</p>
                <p className="text-2xl font-bold">{analytics.totalFaculty || 0}</p>
                <p className="text-xs text-muted-foreground">
                  Active: {analytics.summary?.activeFaculty || 0}
                </p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Departments</p>
                <p className="text-2xl font-bold">{analytics.summary?.totalDepartments || 0}</p>
                <p className="text-xs text-muted-foreground">
                  With faculty
                </p>
              </div>
              <Building className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Courses</p>
                <p className="text-2xl font-bold">{analytics.summary?.totalCourses || 0}</p>
                <p className="text-xs text-muted-foreground">
                  Currently assigned
                </p>
              </div>
              <BookOpen className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Qualifications</p>
                <p className="text-2xl font-bold">{analytics.summary?.totalQualifications || 0}</p>
                <p className="text-xs text-muted-foreground">
                  Recorded
                </p>
              </div>
              <GraduationCap className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Faculty by Department
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.departmentData || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="department" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Designation Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              Faculty by Designation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analytics.designationData || []}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ designation, count }) => `${designation}: ${count}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {(analytics.designationData || []).map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Qualification Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
              Qualification Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {(analytics.qualificationData || []).map((qual: any, index: number) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="font-medium">{qual.type}</span>
                  </div>
                  <Badge variant="outline">{qual.count}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Course Type Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Course Type Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(analytics.courseTypeCounts || {}).map(([type, count], index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="font-medium">{type}</span>
                  </div>
                  <Badge variant="outline">{count as number}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Key Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {((analytics.summary?.activeFaculty / analytics.totalFaculty) * 100 || 0).toFixed(1)}%
              </div>
              <p className="text-sm text-muted-foreground">Faculty Retention Rate</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {(analytics.summary?.totalCourses / analytics.totalFaculty || 0).toFixed(1)}
              </div>
              <p className="text-sm text-muted-foreground">Avg Courses per Faculty</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {(analytics.summary?.totalQualifications / analytics.totalFaculty || 0).toFixed(1)}
              </div>
              <p className="text-sm text-muted-foreground">Avg Qualifications per Faculty</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {(analytics.totalFaculty / analytics.summary?.totalDepartments || 0).toFixed(1)}
              </div>
              <p className="text-sm text-muted-foreground">Avg Faculty per Department</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FacultyAnalytics;
