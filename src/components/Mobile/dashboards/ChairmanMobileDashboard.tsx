
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
  Eye
} from 'lucide-react';
import { useFeeTypeAnalytics } from '../../../hooks/useFeeTypeAnalytics';
import { useInstitutionalStats } from '../../../hooks/useInstitutionalStats';
import { formatCurrency } from '../../../utils/feeValidation';

const ChairmanMobileDashboard: React.FC = () => {
  const { user } = useAuth();
  const { analytics, loading, getTotalStats } = useFeeTypeAnalytics();
  const { stats: institutionalStats, loading: statsLoading } = useInstitutionalStats();
  
  const totalStats = getTotalStats();

  const executiveStats = [
    {
      title: 'Total Students',
      value: statsLoading ? '...' : institutionalStats.totalStudents.toLocaleString(),
      change: `${institutionalStats.activeStudents} active`,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Faculty Strength',
      value: statsLoading ? '...' : institutionalStats.totalFaculty.toLocaleString(),
      change: `${institutionalStats.activeFaculty} active`,
      icon: Users,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Fee Collection',
      value: formatCurrency(totalStats.totalCollected || 0),
      change: `${totalStats.totalFees > 0 ? ((totalStats.totalCollected / totalStats.totalFees) * 100).toFixed(1) : 0}% collected`,
      icon: DollarSign,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'Departments',
      value: statsLoading ? '...' : institutionalStats.totalDepartments.toLocaleString(),
      change: 'All active',
      icon: Building,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    }
  ];

  if (loading || statsLoading) {
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
        <div className="mt-2 inline-flex items-center gap-2 text-sm text-gray-500 bg-gray-50 px-3 py-1 rounded-full">
          <Eye className="w-4 h-4" />
          <span>View-only access</span>
        </div>
      </div>

      {/* Executive Stats */}
      <QuickStatsCards stats={executiveStats} />

      {/* Fee Collection Overview */}
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
                <DollarSign className="w-8 h-8 mx-auto text-green-600 mb-2" />
                <p className="text-sm font-medium text-gray-600">Total Collected</p>
                <p className="text-lg font-bold text-green-600">
                  {formatCurrency(totalStats.totalCollected || 0)}
                </p>
              </div>
              <div className="text-center p-4 bg-white/50 rounded-lg">
                <BarChart3 className="w-8 h-8 mx-auto text-orange-600 mb-2" />
                <p className="text-sm font-medium text-gray-600">Total Pending</p>
                <p className="text-lg font-bold text-orange-600">
                  {formatCurrency(totalStats.totalPending || 0)}
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-white/50 rounded-lg">
                <Building className="w-8 h-8 mx-auto text-blue-600 mb-2" />
                <p className="text-sm font-medium text-gray-600">Total Fees</p>
                <p className="text-lg font-bold text-blue-600">
                  {formatCurrency(totalStats.totalFees || 0)}
                </p>
              </div>
              <div className="text-center p-4 bg-white/50 rounded-lg">
                <TrendingUp className="w-8 h-8 mx-auto text-purple-600 mb-2" />
                <p className="text-sm font-medium text-gray-600">Collection Rate</p>
                <p className="text-lg font-bold text-purple-600">
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
                        <div className="text-right">
                          <span className="text-green-600 font-semibold block">
                            {feeType.collection_percentage.toFixed(1)}%
                          </span>
                          <span className="text-gray-500">
                            {formatCurrency(feeType.total_collected)}
                          </span>
                        </div>
                      </div>
                    ))
                  }
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Executive Actions - View Only */}
      <Card>
        <CardHeader>
          <CardTitle>Executive Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" className="h-16 flex flex-col items-center justify-center bg-purple-50 hover:bg-purple-100 border-purple-200">
              <BarChart3 className="w-5 h-5 mb-1 text-purple-600" />
              <span className="text-xs">View Analytics</span>
            </Button>
            <Button variant="outline" className="h-16 flex flex-col items-center justify-center bg-blue-50 hover:bg-blue-100 border-blue-200">
              <Users className="w-5 h-5 mb-1 text-blue-600" />
              <span className="text-xs">View Faculty</span>
            </Button>
            <Button variant="outline" className="h-16 flex flex-col items-center justify-center bg-green-50 hover:bg-green-100 border-green-200">
              <DollarSign className="w-5 h-5 mb-1 text-green-600" />
              <span className="text-xs">View Finances</span>
            </Button>
            <Button variant="outline" className="h-16 flex flex-col items-center justify-center bg-orange-50 hover:bg-orange-100 border-orange-200">
              <Award className="w-5 h-5 mb-1 text-orange-600" />
              <span className="text-xs">View Students</span>
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
