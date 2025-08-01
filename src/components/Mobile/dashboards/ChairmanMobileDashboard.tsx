
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
  Eye,
  GraduationCap,
  Star
} from 'lucide-react';
import { useFeeTypeAnalytics } from '../../../hooks/useFeeTypeAnalytics';
import { useInstitutionalStats } from '../../../hooks/useInstitutionalStats';
import { useScholarshipStats } from '../../../hooks/useScholarshipStats';
import { formatCurrency } from '../../../utils/feeValidation';

const ChairmanMobileDashboard: React.FC = () => {
  console.log('👑 ChairmanMobileDashboard - Component rendering started');
  
  const { user } = useAuth();
  const { analytics, loading, getTotalStats } = useFeeTypeAnalytics();
  const { stats: institutionalStats, loading: statsLoading } = useInstitutionalStats();
  const { stats: scholarshipStats, loading: scholarshipLoading } = useScholarshipStats();
  
  console.log('👑 ChairmanMobileDashboard - Hook states:', {
    user: user ? { id: user.id, role: user.role } : null,
    analyticsLoading: loading,
    statsLoading,
    scholarshipLoading,
    analyticsCount: analytics?.length || 0
  });
  
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

  if (loading || statsLoading || scholarshipLoading) {
    console.log('👑 ChairmanMobileDashboard - Still loading, showing loading state');
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-32 bg-gradient-to-r from-purple-100 to-blue-100 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  console.log('👑 ChairmanMobileDashboard - Rendering full dashboard');

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="text-center py-6">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          Chairman's Dashboard
        </h2>
        <p className="text-gray-600 mt-2">Strategic overview of institutional performance</p>
      </div>

      {/* Executive Stats */}
      <QuickStatsCards stats={executiveStats} />

      {/* Fee Collection Overview */}
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-purple-600" />
            <span>Fee Collection Overview</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-white/70 rounded-lg border border-purple-100 hover:shadow-md transition-all">
                <DollarSign className="w-8 h-8 mx-auto text-green-600 mb-2" />
                <p className="text-sm font-medium text-gray-600">Total Collected</p>
                <p className="text-lg font-bold text-green-600">
                  {formatCurrency(totalStats.totalCollected || 0)}
                </p>
              </div>
              <div className="text-center p-4 bg-white/70 rounded-lg border border-purple-100 hover:shadow-md transition-all">
                <BarChart3 className="w-8 h-8 mx-auto text-orange-600 mb-2" />
                <p className="text-sm font-medium text-gray-600">Total Pending</p>
                <p className="text-lg font-bold text-orange-600">
                  {formatCurrency(totalStats.totalPending || 0)}
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-white/70 rounded-lg border border-purple-100 hover:shadow-md transition-all">
                <Building className="w-8 h-8 mx-auto text-blue-600 mb-2" />
                <p className="text-sm font-medium text-gray-600">Total Fees</p>
                <p className="text-lg font-bold text-blue-600">
                  {formatCurrency(totalStats.totalFees || 0)}
                </p>
              </div>
              <div className="text-center p-4 bg-white/70 rounded-lg border border-purple-100 hover:shadow-md transition-all">
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
              <div className="bg-white/90 rounded-lg p-4 border border-purple-100">
                <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                  <Award className="w-4 h-4 mr-2 text-purple-600" />
                  Top Performing Fee Types
                </h4>
                <div className="space-y-2">
                  {analytics
                    .sort((a, b) => b.collection_percentage - a.collection_percentage)
                    .slice(0, 3)
                    .map((feeType, index) => (
                      <div key={feeType.fee_type_id} className="flex justify-between items-center p-2 rounded-lg bg-gradient-to-r from-purple-50 to-blue-50">
                        <div className="flex items-center space-x-2">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                            index === 0 ? 'bg-yellow-500 text-white' : 
                            index === 1 ? 'bg-gray-400 text-white' : 
                            'bg-orange-500 text-white'
                          }`}>
                            {index + 1}
                          </div>
                          <span className="font-medium text-sm">{feeType.fee_type_name}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-green-600 font-semibold block text-sm">
                            {feeType.collection_percentage.toFixed(1)}%
                          </span>
                          <span className="text-gray-500 text-xs">
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

      {/* Scholarship Overview */}
      <Card className="bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Award className="w-5 h-5 text-emerald-600" />
            <span>Scholarship Overview</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-white/70 rounded-lg border border-emerald-100 hover:shadow-md transition-all">
                <GraduationCap className="w-8 h-8 mx-auto text-emerald-600 mb-2" />
                <p className="text-sm font-medium text-gray-600">Scholarship Students</p>
                <p className="text-lg font-bold text-emerald-600">
                  {scholarshipStats.scholarshipStudents}
                </p>
              </div>
              <div className="text-center p-4 bg-white/70 rounded-lg border border-emerald-100 hover:shadow-md transition-all">
                <Award className="w-8 h-8 mx-auto text-blue-600 mb-2" />
                <p className="text-sm font-medium text-gray-600">Total Scholarships</p>
                <p className="text-lg font-bold text-blue-600">
                  {scholarshipStats.totalScholarships}
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-white/70 rounded-lg border border-emerald-100 hover:shadow-md transition-all">
                <DollarSign className="w-8 h-8 mx-auto text-green-600 mb-2" />
                <p className="text-sm font-medium text-gray-600">Eligible Amount</p>
                <p className="text-lg font-bold text-green-600">
                  {formatCurrency(scholarshipStats.totalEligibleAmount)}
                </p>
              </div>
              <div className="text-center p-4 bg-white/70 rounded-lg border border-emerald-100 hover:shadow-md transition-all">
                <Star className="w-8 h-8 mx-auto text-purple-600 mb-2" />
                <p className="text-sm font-medium text-gray-600">Received Amount</p>
                <p className="text-lg font-bold text-purple-600">
                  {formatCurrency(scholarshipStats.totalReceivedAmount)}
                </p>
              </div>
            </div>

            {/* Enhanced Scholarship Breakdown */}
            <div className="bg-white/90 rounded-lg p-4 border border-emerald-100">
              <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                <BarChart3 className="w-4 h-4 mr-2 text-emerald-600" />
                Scholarship Distribution
              </h4>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="flex justify-between items-center p-2 rounded-lg bg-gradient-to-r from-emerald-50 to-teal-50">
                  <span className="font-medium">PMSS (SC/ST)</span>
                  <span className="text-blue-600 font-bold text-sm">{scholarshipStats.pmssScholarships}</span>
                </div>
                <div className="flex justify-between items-center p-2 rounded-lg bg-gradient-to-r from-emerald-50 to-teal-50">
                  <span className="font-medium">First Generation</span>
                  <span className="text-green-600 font-bold text-sm">{scholarshipStats.fgScholarships}</span>
                </div>
                <div className="flex justify-between items-center p-2 rounded-lg bg-gradient-to-r from-emerald-50 to-teal-50">
                  <span className="font-medium">Applied</span>
                  <span className="text-purple-600 font-bold text-sm">{scholarshipStats.appliedScholarships}</span>
                </div>
                <div className="flex justify-between items-center p-2 rounded-lg bg-gradient-to-r from-emerald-50 to-teal-50">
                  <span className="font-medium">Received</span>
                  <span className="text-emerald-600 font-bold text-sm">{scholarshipStats.receivedScholarships}</span>
                </div>
              </div>
              
              {/* Scholarship Success Rate */}
              <div className="mt-3 p-3 bg-gradient-to-r from-emerald-100 to-teal-100 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">Success Rate</span>
                  <span className="text-lg font-bold text-emerald-600">
                    {scholarshipStats.appliedScholarships > 0 ? 
                      `${((scholarshipStats.receivedScholarships / scholarshipStats.appliedScholarships) * 100).toFixed(1)}%` : 
                      '0%'
                    }
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Executive Actions */}
      <Card className="shadow-lg border border-purple-100">
        <CardHeader>
          <CardTitle className="text-purple-700">Strategic Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" className="h-16 flex flex-col items-center justify-center bg-purple-50 hover:bg-purple-100 border-purple-200 hover:shadow-md transition-all">
              <BarChart3 className="w-5 h-5 mb-1 text-purple-600" />
              <span className="text-xs font-medium">Analytics</span>
            </Button>
            <Button variant="outline" className="h-16 flex flex-col items-center justify-center bg-blue-50 hover:bg-blue-100 border-blue-200 hover:shadow-md transition-all">
              <Users className="w-5 h-5 mb-1 text-blue-600" />
              <span className="text-xs font-medium">Faculty</span>
            </Button>
            <Button variant="outline" className="h-16 flex flex-col items-center justify-center bg-green-50 hover:bg-green-100 border-green-200 hover:shadow-md transition-all">
              <DollarSign className="w-5 h-5 mb-1 text-green-600" />
              <span className="text-xs font-medium">Finances</span>
            </Button>
            <Button variant="outline" className="h-16 flex flex-col items-center justify-center bg-orange-50 hover:bg-orange-100 border-orange-200 hover:shadow-md transition-all">
              <GraduationCap className="w-5 h-5 mb-1 text-orange-600" />
              <span className="text-xs font-medium">Students</span>
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
