
import React, { useState } from 'react';
import { Crown, BarChart3, List, PieChart } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import DepartmentAnalytics from '../Fees/DepartmentAnalytics';
import FeeTypeAnalytics from '../Fees/FeeTypeAnalytics';
import FeeListManagement from '../Fees/FeeListManagement';

const ChairmanDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dept-analytics');

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-6 text-white">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-3 bg-white/20 rounded-lg">
            <Crown className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Chairman Dashboard</h1>
            <p className="text-purple-100">Executive Overview & Fee Management System</p>
          </div>
        </div>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="dept-analytics" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Department Analytics
          </TabsTrigger>
          <TabsTrigger value="fee-type-analytics" className="flex items-center gap-2">
            <PieChart className="w-4 h-4" />
            Fee Type Analytics
          </TabsTrigger>
          <TabsTrigger value="fee-records" className="flex items-center gap-2">
            <List className="w-4 h-4" />
            Fee Records
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dept-analytics" className="space-y-6">
          <DepartmentAnalytics />
        </TabsContent>

        <TabsContent value="fee-type-analytics" className="space-y-6">
          <FeeTypeAnalytics />
        </TabsContent>

        <TabsContent value="fee-records" className="space-y-6">
          <FeeListManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ChairmanDashboard;
