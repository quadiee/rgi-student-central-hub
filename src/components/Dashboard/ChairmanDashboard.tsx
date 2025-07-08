
import React, { useState } from 'react';
import { Crown, BarChart3, List, PieChart, RefreshCw, Sparkles, TrendingUp } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Button } from '../ui/button';
import { useIsMobile } from '../../hooks/use-mobile';
import DepartmentAnalytics from '../Fees/DepartmentAnalytics';
import FeeTypeAnalytics from '../Fees/FeeTypeAnalytics';
import FeeListManagement from '../Fees/FeeListManagement';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';

const ChairmanDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dept-analytics');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const isMobile = useIsMobile();

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate refresh delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsRefreshing(false);
  };

  const tabs = [
    {
      id: 'dept-analytics',
      label: isMobile ? 'Departments' : 'Department Analytics',
      icon: BarChart3,
      component: DepartmentAnalytics,
      description: 'Departmental performance overview'
    },
    {
      id: 'fee-type-analytics',
      label: isMobile ? 'Fee Types' : 'Fee Type Analytics',
      icon: PieChart,
      component: FeeTypeAnalytics,
      description: 'Fee collection by type'
    },
    {
      id: 'fee-records',
      label: isMobile ? 'Records' : 'Fee Records',
      icon: List,
      component: FeeListManagement,
      description: 'Detailed fee management'
    }
  ];

  const quickStats = [
    {
      title: 'Total Collection',
      value: '₹2.4M',
      trend: { value: 12, direction: 'up' as const },
      icon: TrendingUp
    },
    {
      title: 'Active Students',
      value: '1,248',
      trend: { value: 5, direction: 'up' as const },
      icon: Crown
    },
    {
      title: 'Pending Fees',
      value: '₹125K',
      trend: { value: 8, direction: 'down' as const },
      icon: BarChart3
    }
  ];

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* Enhanced Header with Gradient Background */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-600 rounded-2xl" />
        
        <div className="relative p-6 lg:p-8 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 lg:p-4 bg-white/20 backdrop-blur-sm rounded-2xl shadow-lg">
                <Crown className="w-8 h-8 lg:w-10 lg:h-10 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h1 className="text-2xl lg:text-4xl font-bold font-heading">
                    Chairman Dashboard
                  </h1>
                  <Badge variant="secondary" className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
                    Executive
                  </Badge>
                </div>
                <p className="text-lg lg:text-xl text-purple-100 font-medium">
                  {isMobile ? 'Institution Overview' : 'Executive Overview & Strategic Management'}
                </p>
                <div className="flex items-center space-x-4 mt-2">
                  <div className="flex items-center space-x-1">
                    <Sparkles className="w-4 h-4 text-yellow-300" />
                    <span className="text-sm text-purple-100">Real-time Analytics</span>
                  </div>
                  {!isMobile && (
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                      <span className="text-sm text-purple-100">System Online</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {!isMobile && (
              <div className="flex items-center space-x-3">
                <Button
                  variant="glass"
                  size="sm"
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                >
                  <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                  {!isMobile && 'Refresh'}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
        {quickStats.map((stat, index) => (
          <Card key={index} className="bg-gradient-to-br from-white to-gray-50 border-gray-200 hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {stat.title}
                </CardTitle>
                <div className="p-2 bg-purple-100 rounded-lg">
                  <stat.icon className="w-4 h-4 text-purple-600" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline space-x-2">
                <div className="text-2xl font-bold text-gray-900">
                  {stat.value}
                </div>
                <Badge
                  variant="secondary"
                  className={`text-xs px-2 py-1 ${
                    stat.trend.direction === 'up' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-red-100 text-red-700'
                  }`}
                >
                  {stat.trend.direction === 'up' ? '↗' : '↘'} {stat.trend.value}%
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Enhanced Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className={`
          grid w-full bg-gray-100 dark:bg-gray-800 rounded-2xl p-1 shadow-inner
          ${isMobile 
            ? 'grid-cols-1 gap-1 h-auto' 
            : 'grid-cols-3 h-14'
          }
        `}>
          {tabs.map((tab) => (
            <TabsTrigger 
              key={tab.id}
              value={tab.id} 
              className={`
                flex items-center gap-3 rounded-xl transition-all duration-300 font-medium
                ${isMobile 
                  ? 'justify-start px-4 py-4 text-sm min-h-[56px] w-full' 
                  : 'justify-center px-6 py-3 text-sm h-12'
                }
                data-[state=active]:bg-white data-[state=active]:text-gray-900 
                data-[state=active]:shadow-lg data-[state=active]:shadow-black/10
                hover:bg-white/60 hover:text-gray-900
              `}
            >
              <tab.icon className="w-5 h-5 flex-shrink-0" />
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
        {tabs.map((tab) => (
          <TabsContent 
            key={tab.id}
            value={tab.id} 
            className={`
              space-y-6 animate-fade-in
              ${isMobile ? 'px-1' : ''}
            `}
          >
            <div className="min-h-[500px] bg-white dark:bg-gray-900 rounded-2xl shadow-soft border border-gray-200 dark:border-gray-800">
              <tab.component />
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default ChairmanDashboard;
