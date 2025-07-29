
import React, { useState, useEffect } from 'react';
import { supabase } from '../../integrations/supabase/client';
import { useAuth } from '../../contexts/SupabaseAuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Users, UserCheck, Clock, Award, MapPin, Calendar } from 'lucide-react';

interface FacultyAnalytics {
  totalFaculty: number;
  genderDistribution: { name: string; value: number; color: string }[];
  departmentDistribution: { name: string; value: number; color: string }[];
  ageGroups: { name: string; value: number; color: string }[];
  experienceGroups: { name: string; value: number; color: string }[];
  activeVsInactive: { name: string; value: number; color: string }[];
  attendanceOverview: {
    totalPresent: number;
    totalAbsent: number;
    averageAttendance: number;
  };
}

const FacultyAnalyticsOverview: React.FC = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<FacultyAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchAnalytics();
    }
  }, [user]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      
      const { data: facultyData, error } = await supabase.rpc('get_faculty_with_details', {
        p_user_id: user?.id
      });

      if (error) throw error;

      // Process analytics data
      const processedAnalytics: FacultyAnalytics = {
        totalFaculty: facultyData?.length || 0,
        genderDistribution: processGenderDistribution(facultyData || []),
        departmentDistribution: processDepartmentDistribution(facultyData || []),
        ageGroups: processAgeGroups(facultyData || []),
        experienceGroups: processExperienceGroups(facultyData || []),
        activeVsInactive: processActiveStatus(facultyData || []),
        attendanceOverview: processAttendanceOverview(facultyData || [])
      };

      setAnalytics(processedAnalytics);
    } catch (error) {
      console.error('Error fetching faculty analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const processGenderDistribution = (data: any[]) => {
    const genderCounts = data.reduce((acc: any, faculty: any) => {
      const gender = faculty.gender || 'Not Specified';
      acc[gender] = (acc[gender] || 0) + 1;
      return acc;
    }, {});

    const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b'];
    return Object.entries(genderCounts).map(([name, value], index) => ({
      name,
      value: value as number,
      color: colors[index % colors.length]
    }));
  };

  const processDepartmentDistribution = (data: any[]) => {
    const deptCounts = data.reduce((acc: any, faculty: any) => {
      const dept = faculty.department_name || 'Unknown';
      acc[dept] = (acc[dept] || 0) + 1;
      return acc;
    }, {});

    const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#f97316'];
    return Object.entries(deptCounts).map(([name, value], index) => ({
      name,
      value: value as number,
      color: colors[index % colors.length]
    }));
  };

  const processAgeGroups = (data: any[]) => {
    const ageGroups = { '20-30': 0, '31-40': 0, '41-50': 0, '51-60': 0, '60+': 0, 'Unknown': 0 };
    
    data.forEach((faculty: any) => {
      const age = faculty.age;
      if (!age) {
        ageGroups['Unknown']++;
      } else if (age <= 30) {
        ageGroups['20-30']++;
      } else if (age <= 40) {
        ageGroups['31-40']++;
      } else if (age <= 50) {
        ageGroups['41-50']++;
      } else if (age <= 60) {
        ageGroups['51-60']++;
      } else {
        ageGroups['60+']++;
      }
    });

    const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#6b7280'];
    return Object.entries(ageGroups).map(([name, value], index) => ({
      name,
      value,
      color: colors[index]
    }));
  };

  const processExperienceGroups = (data: any[]) => {
    const expGroups = { '0-5': 0, '6-10': 0, '11-15': 0, '16-20': 0, '20+': 0, 'Unknown': 0 };
    
    data.forEach((faculty: any) => {
      const exp = faculty.years_of_experience;
      if (!exp) {
        expGroups['Unknown']++;
      } else if (exp <= 5) {
        expGroups['0-5']++;
      } else if (exp <= 10) {
        expGroups['6-10']++;
      } else if (exp <= 15) {
        expGroups['11-15']++;
      } else if (exp <= 20) {
        expGroups['16-20']++;
      } else {
        expGroups['20+']++;
      }
    });

    const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#6b7280'];
    return Object.entries(expGroups).map(([name, value], index) => ({
      name: `${name} years`,
      value,
      color: colors[index]
    }));
  };

  const processActiveStatus = (data: any[]) => {
    const activeCount = data.filter(f => f.is_active).length;
    const inactiveCount = data.length - activeCount;
    
    return [
      { name: 'Active', value: activeCount, color: '#10b981' },
      { name: 'Inactive', value: inactiveCount, color: '#ef4444' }
    ];
  };

  const processAttendanceOverview = (data: any[]) => {
    const totalPresent = data.reduce((sum, faculty) => sum + (faculty.present_days || 0), 0);
    const totalAbsent = data.reduce((sum, faculty) => sum + (faculty.absent_days || 0), 0);
    const averageAttendance = data.length > 0 
      ? data.reduce((sum, faculty) => sum + (faculty.attendance_percentage || 0), 0) / data.length
      : 0;

    return {
      totalPresent,
      totalAbsent,
      averageAttendance: Math.round(averageAttendance * 100) / 100
    };
  };

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    if (percent < 0.05) return null; // Don't show label for slices less than 5%
    
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize="12">
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No analytics data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Faculty</p>
                <p className="text-2xl font-bold">{analytics.totalFaculty}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Faculty</p>
                <p className="text-2xl font-bold">{analytics.activeVsInactive.find(a => a.name === 'Active')?.value || 0}</p>
              </div>
              <UserCheck className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg. Attendance</p>
                <p className="text-2xl font-bold">{analytics.attendanceOverview.averageAttendance}%</p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Departments</p>
                <p className="text-2xl font-bold">{analytics.departmentDistribution.length}</p>
              </div>
              <MapPin className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gender Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Gender Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={analytics.genderDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomizedLabel}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {analytics.genderDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-2 mt-4">
              {analytics.genderDistribution.map((entry, index) => (
                <Badge key={index} variant="outline" className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }}></div>
                  {entry.name}: {entry.value}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Department Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Department-wise Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={analytics.departmentDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Age Group Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Age Group Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={analytics.ageGroups}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Experience Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Experience Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={analytics.experienceGroups}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#f59e0b" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FacultyAnalyticsOverview;
