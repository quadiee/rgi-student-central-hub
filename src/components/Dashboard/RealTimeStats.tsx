
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Users, GraduationCap, DollarSign, TrendingUp, AlertTriangle } from 'lucide-react';
import { useDashboardStats } from '../../hooks/useDashboardStats';
import { useAuth } from '../../contexts/SupabaseAuthContext';

const RealTimeStats: React.FC = () => {
  const { user } = useAuth();
  const { stats, loading, error } = useDashboardStats();

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-full"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card className="col-span-full">
        <CardContent className="pt-6">
          <div className="flex items-center text-red-600">
            <AlertTriangle className="h-5 w-5 mr-2" />
            <span>Error loading dashboard stats: {error}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const statsCards = [
    {
      title: 'Total Students',
      value: stats.totalStudents.toLocaleString(),
      icon: GraduationCap,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      description: 'Active students enrolled',
      show: ['admin', 'principal', 'chairman', 'hod'].includes(user?.role || '')
    },
    {
      title: 'Faculty Members',
      value: stats.totalFaculty.toLocaleString(),
      icon: Users,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      description: 'Active faculty members',
      show: ['admin', 'principal', 'chairman', 'hod'].includes(user?.role || '')
    },
    {
      title: 'Total Revenue',
      value: formatCurrency(stats.totalRevenue),
      icon: DollarSign,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      description: 'Fees collected',
      show: ['admin', 'principal', 'chairman', 'hod'].includes(user?.role || '')
    },
    {
      title: 'Pending Fees',
      value: formatCurrency(stats.pendingFees),
      icon: TrendingUp,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      description: 'Outstanding payments',
      show: true // Show to all users
    }
  ];

  const visibleStats = statsCards.filter(stat => stat.show);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {visibleStats.map((stat) => (
        <Card key={stat.title} className="relative overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center justify-between">
              {stat.title}
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {stat.value}
            </div>
            <p className="text-xs text-gray-500">
              {stat.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default RealTimeStats;
