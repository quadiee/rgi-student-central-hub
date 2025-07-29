
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
  Building,
  BarChart3
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
      
      // Get faculty data from profiles table
      let query = supabase
        .from('profiles')
        .select(`
          id,
          name,
          role,
          department_id,
          is_active,
          created_at,
          departments:department_id (
            name,
            code
          )
        `)
        .eq('role', 'faculty');

      // Add department filter if user is HOD
      if (user.role === 'hod' && user.department_id) {
        query = query.eq('department_id', user.department_id);
      }

      const { data: facultyData, error } = await query;

      if (error) throw error;

      // Process data for analytics
      const processedAnalytics = processAnalyticsData(facultyData || []);
      setAnalytics(processedAnalytics);
      
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const processAnalyticsData = (faculty: any[]) => {
    // Department-wise faculty count
    const deptCounts = faculty.reduce((acc, member) => {
      const deptName = member.departments?.name || 'Unknown';
      acc[deptName] = (acc[deptName] || 0) + 1;
      return acc;
    }, {});

    const departmentData = Object.entries(deptCounts).map(([name, count]) => ({
      department: name,
      count
    }));

    // Active vs Inactive faculty
    const activeCount = faculty.filter(f => f.is_active).length;
    const inactiveCount = faculty.length - activeCount;

    const statusData = [
      { status: 'Active', count: activeCount },
      { status: 'Inactive', count: inactiveCount }
    ];

    // Monthly joining trends (last 12 months)
    const monthlyData = faculty.reduce((acc, member) => {
      const date = new Date(member.created_at);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      acc[monthKey] = (acc[monthKey] || 0) + 1;
      return acc;
    }, {});

    const joiningTrends = Object.entries(monthlyData)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-12)
      .map(([month, count]) => ({
        month,
        count
      }));

    return {
      totalFaculty: faculty.length,
      activeFaculty: activeCount,
      inactiveFaculty: inactiveCount,
      departmentData,
      statusData,
      joiningTrends,
      summary: {
        totalDepartments: departmentData.length,
        averagePerDept: (faculty.length / departmentData.length) || 0,
        retentionRate: (activeCount / faculty.length) * 100 || 0
      }
    };
  };

  const COLORS = ['hsl(var(--primary))', 'hsl(var(--success))', 'hsl(var(--warning))', 'hsl(var(--destructive))', '#8884D8', '#82CA9D'];

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
          <h2 className="text-2xl font-bold text-foreground">Faculty Analytics</h2>
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
            <SelectItem value="Computer Science">Computer Science</SelectItem>
            <SelectItem value="Electronics">Electronics</SelectItem>
            <SelectItem value="Mechanical">Mechanical</SelectItem>
            <SelectItem value="Civil">Civil</SelectItem>
            <SelectItem value="Electrical">Electrical</SelectItem>
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
                <p className="text-2xl font-bold text-foreground">{analytics.totalFaculty || 0}</p>
                <p className="text-xs text-muted-foreground">
                  Active: {analytics.activeFaculty || 0}
                </p>
              </div>
              <Users className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Departments</p>
                <p className="text-2xl font-bold text-foreground">{analytics.summary?.totalDepartments || 0}</p>
                <p className="text-xs text-muted-foreground">
                  With faculty
                </p>
              </div>
              <Building className="h-8 w-8 text-success" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Retention Rate</p>
                <p className="text-2xl font-bold text-foreground">{(analytics.summary?.retentionRate || 0).toFixed(1)}%</p>
                <p className="text-xs text-muted-foreground">
                  Active faculty
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-warning" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg per Dept</p>
                <p className="text-2xl font-bold text-foreground">{(analytics.summary?.averagePerDept || 0).toFixed(1)}</p>
                <p className="text-xs text-muted-foreground">
                  Faculty members
                </p>
              </div>
              <BarChart3 className="h-8 w-8 text-purple-600" />
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
                <Bar dataKey="count" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Faculty Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analytics.statusData || []}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ status, count }) => `${status}: ${count}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {(analytics.statusData || []).map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Key Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Key Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {((analytics.activeFaculty / analytics.totalFaculty) * 100 || 0).toFixed(1)}%
              </div>
              <p className="text-sm text-muted-foreground">Active Faculty Rate</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-success">
                {(analytics.totalFaculty / analytics.summary?.totalDepartments || 0).toFixed(1)}
              </div>
              <p className="text-sm text-muted-foreground">Avg Faculty per Department</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-warning">
                {analytics.summary?.totalDepartments || 0}
              </div>
              <p className="text-sm text-muted-foreground">Total Departments</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FacultyAnalytics;
