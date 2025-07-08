
import React, { useState, useEffect } from 'react';
import { Users, TrendingUp, Calendar, Building } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { supabase } from '../../integrations/supabase/client';

interface AnalyticsData {
  totalUsers: number;
  activeUsers: number;
  usersByRole: { role: string; count: number }[];
  usersByDepartment: { department: string; count: number }[];
  userGrowth: { month: string; count: number }[];
  registrationStats: {
    thisMonth: number;
    lastMonth: number;
    growth: number;
  };
}

const UserAnalytics: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

  const fetchAnalytics = async () => {
    try {
      setLoading(true);

      // Fetch all users with department info
      const { data: users, error } = await supabase
        .from('profiles')
        .select(`
          id,
          role,
          is_active,
          created_at,
          departments:department_id (name, code)
        `);

      if (error) throw error;

      // Calculate analytics
      const totalUsers = users.length;
      const activeUsers = users.filter(u => u.is_active).length;

      // Users by role
      const roleCount: { [key: string]: number } = {};
      users.forEach(user => {
        roleCount[user.role] = (roleCount[user.role] || 0) + 1;
      });

      const usersByRole = Object.entries(roleCount).map(([role, count]) => ({
        role: role.charAt(0).toUpperCase() + role.slice(1),
        count
      }));

      // Users by department
      const deptCount: { [key: string]: number } = {};
      users.forEach(user => {
        const deptName = user.departments?.name || 'Unknown';
        deptCount[deptName] = (deptCount[deptName] || 0) + 1;
      });

      const usersByDepartment = Object.entries(deptCount).map(([department, count]) => ({
        department,
        count
      }));

      // User growth by month (last 6 months)
      const monthCounts: { [key: string]: number } = {};
      const now = new Date();
      
      for (let i = 5; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthKey = date.toISOString().slice(0, 7);
        monthCounts[monthKey] = 0;
      }

      users.forEach(user => {
        const monthKey = user.created_at.slice(0, 7);
        if (monthCounts.hasOwnProperty(monthKey)) {
          monthCounts[monthKey]++;
        }
      });

      const userGrowth = Object.entries(monthCounts).map(([month, count]) => ({
        month: new Date(month + '-01').toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
        count
      }));

      // Registration stats
      const thisMonth = new Date().toISOString().slice(0, 7);
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().slice(0, 7);
      
      const thisMonthCount = users.filter(u => u.created_at.startsWith(thisMonth)).length;
      const lastMonthCount = users.filter(u => u.created_at.startsWith(lastMonth)).length;
      
      const growth = lastMonthCount > 0 ? ((thisMonthCount - lastMonthCount) / lastMonthCount) * 100 : 0;

      setAnalytics({
        totalUsers,
        activeUsers,
        usersByRole,
        usersByDepartment,
        userGrowth,
        registrationStats: {
          thisMonth: thisMonthCount,
          lastMonth: lastMonthCount,
          growth
        }
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center text-gray-500">
        Failed to load analytics data
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-3xl font-bold">{analytics.totalUsers}</p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Users</p>
                <p className="text-3xl font-bold">{analytics.activeUsers}</p>
                <p className="text-xs text-gray-500">
                  {((analytics.activeUsers / analytics.totalUsers) * 100).toFixed(1)}% active
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">This Month</p>
                <p className="text-3xl font-bold">{analytics.registrationStats.thisMonth}</p>
                <p className={`text-xs ${analytics.registrationStats.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {analytics.registrationStats.growth >= 0 ? '+' : ''}{analytics.registrationStats.growth.toFixed(1)}% from last month
                </p>
              </div>
              <Calendar className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Departments</p>
                <p className="text-3xl font-bold">{analytics.usersByDepartment.length}</p>
              </div>
              <Building className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Users by Role */}
        <Card>
          <CardHeader>
            <CardTitle>Users by Role</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analytics.usersByRole}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ role, count, percent }) => `${role} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {analytics.usersByRole.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* User Growth */}
        <Card>
          <CardHeader>
            <CardTitle>User Registration Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.userGrowth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Department Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Users by Department</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={analytics.usersByDepartment} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="department" type="category" width={150} />
              <Tooltip />
              <Bar dataKey="count" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserAnalytics;
