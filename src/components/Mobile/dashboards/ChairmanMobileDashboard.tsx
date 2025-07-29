
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/SupabaseAuthContext';
import QuickStatsCards from '../QuickStatsCards';
import RecentActivityFeed from '../RecentActivityFeed';
import NotificationCenter from '../NotificationCenter';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { 
  Users, 
  TrendingUp, 
  DollarSign, 
  BarChart3, 
  Building,
  Award,
  Clock,
  AlertCircle
} from 'lucide-react';
import { useFeeTypeAnalytics } from '../../../hooks/useFeeTypeAnalytics';
import { formatCurrency } from '../../../utils/feeValidation';

const ChairmanMobileDashboard: React.FC = () => {
  const { user } = useAuth();
  const { analytics, loading, getTotalStats } = useFeeTypeAnalytics();
  const [realTimeStats, setRealTimeStats] = useState({
    totalStudents: 0,
    totalRevenue: 0,
    academicScore: 8.7
  });

  const totalStats = getTotalStats();

  useEffect(() => {
    // Load additional real-time stats
    const loadStats = async () => {
      // This would typically fetch from your existing dashboard stats function
      setRealTimeStats(prev => ({
        ...prev,
        totalStudents: totalStats.totalStudents || 2847,
        totalRevenue: totalStats.totalCollected || 42000000
      }));
    };

    if (!loading && analytics.length > 0) {
      loadStats();
    }
  }, [analytics, loading, totalStats]);

  const executiveStats = [
    {
      title: 'Total Students',
      value: realTimeStats.totalStudents.toLocaleString(),
      change: '+142 this year',
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Faculty Strength',
      value: '186',
      change: '+12 recruited',
      icon: Users,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Fee Collection',
      value: formatCurrency(totalStats.totalCollected),
      change: `${((totalStats.totalCollected / totalStats.totalFees) * 100).toFixed(1)}% collected`,
      icon: DollarSign,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'Academic Score',
      value: `${realTimeStats.academicScore}/10`,
      change: '+0.3 this sem',
      icon: Award,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    }
  ];

  if (loading) {
    return (
      <div className="p-4 space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-32 bg-gradient-to-r from-purple-100 to-blue-100 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      {/* Welcome Section */}
      <div className="text-center py-6">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          Chairman's Dashboard
        </h2>
        <p className="text-gray-600 mt-2">Strategic overview of institutional performance</p>
      </div>

      {/* Executive Stats */}
      <QuickStatsCards stats={executiveStats} />

      {/* Fee Type Performance Overview */}
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-purple-600" />
            <span>Fee Collection Overview</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-white/50 rounded-lg">
                <BarChart3 className="w-8 h-8 mx-auto text-purple-600 mb-2" />
                <p className="text-sm font-medium text-gray-600">Fee Types</p>
                <p className="text-xl font-bold text-purple-600">{analytics.length}</p>
              </div>
              <div className="text-center p-4 bg-white/50 rounded-lg">
                <Building className="w-8 h-8 mx-auto text-blue-600 mb-2" />
                <p className="text-sm font-medium text-gray-600">Collection Rate</p>
                <p className="text-xl font-bold text-blue-600">
                  {totalStats.totalFees > 0 ? 
                    `${((totalStats.totalCollected / totalStats.totalFees) * 100).toFixed(1)}%` : 
                    '0%'
                  }
                </p>
              </div>
            </div>
            
            {/* Top Performing Fee Types */}
            {analytics.length > 0 && (
              <div className="bg-white/70 rounded-lg p-3">
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Top Performing Fee Types</h4>
                <div className="space-y-2">
                  {analytics
                    .sort((a, b) => b.collection_percentage - a.collection_percentage)
                    .slice(0, 3)
                    .map((feeType, index) => (
                      <div key={feeType.fee_type_id} className="flex justify-between items-center text-xs">
                        <span className="font-medium">{feeType.fee_type_name}</span>
                        <span className="text-green-600 font-semibold">
                          {feeType.collection_percentage.toFixed(1)}%
                        </span>
                      </div>
                    ))
                  }
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Executive Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" className="h-16 flex flex-col items-center justify-center bg-purple-50 hover:bg-purple-100 border-purple-200">
              <BarChart3 className="w-5 h-5 mb-1 text-purple-600" />
              <span className="text-xs">Analytics</span>
            </Button>
            <Button variant="outline" className="h-16 flex flex-col items-center justify-center bg-blue-50 hover:bg-blue-100 border-blue-200">
              <Users className="w-5 h-5 mb-1 text-blue-600" />
              <span className="text-xs">Faculty Review</span>
            </Button>
            <Button variant="outline" className="h-16 flex flex-col items-center justify-center bg-green-50 hover:bg-green-100 border-green-200">
              <DollarSign className="w-5 h-5 mb-1 text-green-600" />
              <span className="text-xs">Finance</span>
            </Button>
            <Button variant="outline" className="h-16 flex flex-col items-center justify-center bg-orange-50 hover:bg-orange-100 border-orange-200">
              <AlertCircle className="w-5 h-5 mb-1 text-orange-600" />
              <span className="text-xs">Issues</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <RecentActivityFeed limit={3} />

      {/* Notifications */}
      <NotificationCenter />
    </div>
  );
};

export default ChairmanMobileDashboard;
