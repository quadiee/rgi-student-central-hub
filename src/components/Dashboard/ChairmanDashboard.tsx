
import React, { useState } from 'react';
import { Crown, BarChart3, List, PieChart, RefreshCw, Sparkles, TrendingUp, Users, DollarSign, Award, Building2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Button } from '../ui/button';
import { useIsMobile } from '../../hooks/use-mobile';
import DepartmentAnalytics from '../Fees/DepartmentAnalytics';
import FeeTypeAnalytics from '../Fees/FeeTypeAnalytics';
import FeeListManagement from '../Fees/FeeListManagement';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import ExecutiveStatsCard from './ExecutiveStatsCard';
import StrategicActionCenter from './StrategicActionCenter';
import ExecutiveAnalyticsPanel from './ExecutiveAnalyticsPanel';
import { useFeeTypeAnalytics } from '../../hooks/useFeeTypeAnalytics';
import { useInstitutionalStats } from '../../hooks/useInstitutionalStats';
import { useScholarshipStats } from '../../hooks/useScholarshipStats';
import { formatCurrency } from '../../utils/feeValidation';

const ChairmanDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('executive-overview');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const isMobile = useIsMobile();
  
  const { analytics, getTotalStats } = useFeeTypeAnalytics();
  const { stats: institutionalStats, loading: statsLoading } = useInstitutionalStats();
  const { stats: scholarshipStats, loading: scholarshipLoading } = useScholarshipStats();
  
  const totalStats = getTotalStats();

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate refresh delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsRefreshing(false);
  };

  // Executive Statistics
  const executiveStats = [
    {
      title: 'Total Students',
      value: statsLoading ? '...' : institutionalStats.totalStudents.toLocaleString(),
      subtitle: `${institutionalStats.activeStudents} active students`,
      icon: Users,
      trend: {
        value: 5,
        direction: 'up' as const,
        period: 'vs last semester'
      },
      status: 'excellent' as const
    },
    {
      title: 'Fee Collection Rate',
      value: totalStats.totalFees > 0 ? 
        `${((totalStats.totalCollected / totalStats.totalFees) * 100).toFixed(1)}%` : '0%',
      subtitle: `${formatCurrency(totalStats.totalCollected)} collected`,
      icon: DollarSign,
      trend: {
        value: 12,
        direction: 'up' as const,
        period: 'vs last month'
      },
      status: (totalStats.totalFees > 0 && (totalStats.totalCollected / totalStats.totalFees) > 0.9 ? 'excellent' : 'good') as const
    },
    {
      title: 'Active Faculty',
      value: statsLoading ? '...' : institutionalStats.activeFaculty.toLocaleString(),
      subtitle: `across ${institutionalStats.totalDepartments} departments`,
      icon: Building2,
      trend: {
        value: 3,
        direction: 'up' as const,
        period: 'vs last year'
      },
      status: 'good' as const
    },
    {
      title: 'Scholarship Impact',
      value: scholarshipStats.scholarshipStudents.toLocaleString(),
      subtitle: `${formatCurrency(scholarshipStats.totalReceivedAmount)} received`,
      icon: Award,
      trend: {
        value: 18,
        direction: 'up' as const,
        period: 'vs last year'
      },
      status: 'excellent' as const
    }
  ];

  const tabs = [
    {
      id: 'executive-overview',
      label: isMobile ? 'Overview' : 'Executive Overview',
      icon: Crown,
      description: 'Strategic institutional insights'
    },
    {
      id: 'analytics-dashboard',
      label: isMobile ? 'Analytics' : 'Analytics Dashboard',
      icon: BarChart3,
      description: 'Performance metrics and trends'
    },
    {
      id: 'dept-analytics',
      label: isMobile ? 'Departments' : 'Department Analytics',
      icon: BarChart3,
      description: 'Departmental performance overview'
    },
    {
      id: 'fee-type-analytics',
      label: isMobile ? 'Fee Types' : 'Fee Type Analytics',
      icon: PieChart,
      description: 'Fee collection by type'
    },
    {
      id: 'fee-records',
      label: isMobile ? 'Records' : 'Fee Records',
      icon: List,
      description: 'Detailed fee management'
    }
  ];

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* Enhanced Executive Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-600 rounded-2xl" />
        
        <div className="relative p-6 lg:p-8 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-4 bg-white/20 backdrop-blur-sm rounded-2xl shadow-lg">
                <Crown className="w-10 h-10 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h1 className="text-3xl lg:text-4xl font-bold font-heading">
                    Executive Dashboard
                  </h1>
                  <Badge variant="secondary" className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
                    Chairman
                  </Badge>
                </div>
                <p className="text-lg lg:text-xl text-purple-100 font-medium">
                  Strategic oversight and institutional governance
                </p>
                <div className="flex items-center space-x-4 mt-3">
                  <div className="flex items-center space-x-1">
                    <Sparkles className="w-4 h-4 text-yellow-300" />
                    <span className="text-sm text-purple-100">Real-time Analytics</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                    <span className="text-sm text-purple-100">All Systems Operational</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleRefresh} 
                disabled={isRefreshing}
                className="bg-white/20 hover:bg-white/30 text-white border-white/30"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                {!isMobile && 'Refresh'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Executive Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {executiveStats.map((stat, index) => (
          <ExecutiveStatsCard
            key={index}
            title={stat.title}
            value={stat.value}
            subtitle={stat.subtitle}
            icon={stat.icon}
            trend={stat.trend}
            status={stat.status}
          />
        ))}
      </div>

      {/* Enhanced Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className={`
          grid w-full bg-gray-100 dark:bg-gray-800 rounded-2xl p-1 shadow-inner
          ${isMobile ? 'grid-cols-2 gap-1 h-auto' : 'grid-cols-5 h-14'}
        `}>
          {tabs.map(tab => (
            <TabsTrigger 
              key={tab.id} 
              value={tab.id} 
              className={`
                flex items-center gap-2 rounded-xl transition-all duration-300 font-medium
                ${isMobile ? 'justify-center px-3 py-3 text-xs min-h-[48px]' : 'justify-center px-4 py-3 text-sm h-12'}
                data-[state=active]:bg-white data-[state=active]:text-gray-900 
                data-[state=active]:shadow-lg data-[state=active]:shadow-black/10
                hover:bg-white/60 hover:text-gray-900
              `}
            >
              <tab.icon className="w-4 h-4 flex-shrink-0" />
              <div className="flex flex-col items-start">
                <span className="truncate">{tab.label}</span>
                {!isMobile && (
                  <span className="text-xs text-gray-500 font-normal">
                    {tab.description}
                  </span>
                )}
              </div>
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Tab Content */}
        <TabsContent value="executive-overview" className="space-y-6 animate-fade-in">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2">
              <ExecutiveAnalyticsPanel />
            </div>
            <div>
              <StrategicActionCenter />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="analytics-dashboard" className="space-y-6 animate-fade-in">
          <ExecutiveAnalyticsPanel />
        </TabsContent>

        <TabsContent value="dept-analytics" className="space-y-6 animate-fade-in">
          <div className="min-h-[500px] bg-white dark:bg-gray-900 rounded-2xl shadow-soft border border-gray-200 dark:border-gray-800 p-6">
            <DepartmentAnalytics />
          </div>
        </TabsContent>

        <TabsContent value="fee-type-analytics" className="space-y-6 animate-fade-in">
          <div className="min-h-[500px] bg-white dark:bg-gray-900 rounded-2xl shadow-soft border border-gray-200 dark:border-gray-800 p-6">
            <FeeTypeAnalytics />
          </div>
        </TabsContent>

        <TabsContent value="fee-records" className="space-y-6 animate-fade-in">
          <div className="min-h-[500px] bg-white dark:bg-gray-900 rounded-2xl shadow-soft border border-gray-200 dark:border-gray-800 p-6">
            <FeeListManagement />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ChairmanDashboard;
