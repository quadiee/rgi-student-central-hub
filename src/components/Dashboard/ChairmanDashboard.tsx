
import React, { useState } from 'react';
import { Crown, BarChart3, List, PieChart, RefreshCw } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Button } from '../ui/button';
import { useIsMobile } from '../../hooks/use-mobile';
import DepartmentAnalytics from '../Fees/DepartmentAnalytics';
import FeeTypeAnalytics from '../Fees/FeeTypeAnalytics';
import FeeListManagement from '../Fees/FeeListManagement';

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
      label: isMobile ? 'Dept Analytics' : 'Department Analytics',
      icon: BarChart3,
      component: DepartmentAnalytics
    },
    {
      id: 'fee-type-analytics',
      label: isMobile ? 'Fee Types' : 'Fee Type Analytics',
      icon: PieChart,
      component: FeeTypeAnalytics
    },
    {
      id: 'fee-records',
      label: isMobile ? 'Records' : 'Fee Records',
      icon: List,
      component: FeeListManagement
    }
  ];

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Mobile-Optimized Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg md:rounded-xl p-4 md:p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 md:space-x-3">
            <div className="p-2 md:p-3 bg-white/20 rounded-md md:rounded-lg">
              <Crown className="w-5 h-5 md:w-8 md:h-8" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-xl md:text-3xl font-bold leading-tight">
                Chairman Dashboard
              </h1>
              <p className="text-sm md:text-base text-purple-100 mt-1 md:mt-0">
                {isMobile ? 'Executive Overview' : 'Executive Overview & Fee Management System'}
              </p>
            </div>
          </div>
          
          {/* Mobile Refresh Button */}
          {isMobile && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="text-white hover:bg-white/20 p-2"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
          )}
        </div>
      </div>

      {/* Mobile-Optimized Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 md:space-y-6">
        <TabsList className={`
          grid w-full
          ${isMobile 
            ? 'grid-cols-1 gap-1 h-auto p-1' 
            : 'grid-cols-3 h-10 p-1'
          }
        `}>
          {tabs.map((tab) => (
            <TabsTrigger 
              key={tab.id}
              value={tab.id} 
              className={`
                flex items-center gap-2 
                ${isMobile 
                  ? 'justify-start px-3 py-2 text-sm min-h-[44px] w-full' 
                  : 'justify-center px-3 py-1.5 text-sm'
                }
                transition-all duration-200
                data-[state=active]:bg-background 
                data-[state=active]:text-foreground 
                data-[state=active]:shadow-sm
              `}
            >
              <tab.icon className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">{tab.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Tab Content with Mobile Optimization */}
        {tabs.map((tab) => (
          <TabsContent 
            key={tab.id}
            value={tab.id} 
            className={`
              space-y-4 md:space-y-6
              ${isMobile ? 'px-1' : ''}
            `}
          >
            <div className="min-h-[400px]">
              <tab.component />
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default ChairmanDashboard;
