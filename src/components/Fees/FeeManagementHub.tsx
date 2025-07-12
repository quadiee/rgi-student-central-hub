import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart3, Receipt, GraduationCap, TrendingUp, FileText, Upload, Lock, Link } from 'lucide-react';
import { useAuth } from '../../contexts/SupabaseAuthContext';
import RealTimeFeeDashboard from './RealTimeFeeDashboard';
import FeeListManagement from './FeeListManagement';
import ScholarshipManagement from './ScholarshipManagement';
import DepartmentAnalytics from './DepartmentAnalytics';
import AdminReportGenerator from './AdminReportGenerator';
import BulkFeeActions from './BulkFeeActions';
import ScholarshipFeeConnector from './ScholarshipFeeConnector';

const FeeManagementHub: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [permissions, setPermissions] = useState({
    canCreate: false,
    canEdit: false,
    canDelete: false,
    canViewAll: false,
    canViewDepartment: false
  });

  useEffect(() => {
    if (user) {
      setPermissions({
        canCreate: ['admin', 'principal', 'chairman'].includes(user.role || ''),
        canEdit: ['admin', 'principal', 'chairman'].includes(user.role || ''),
        canDelete: ['admin', 'principal'].includes(user.role || ''),
        canViewAll: ['admin', 'principal', 'chairman'].includes(user.role || ''),
        canViewDepartment: user.role === 'hod'
      });
    }
  }, [user]);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
  };

  const handleRefresh = () => {
    // Implement refresh logic here, e.g., reload data
    console.log('Data Refreshed!');
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'records', label: 'Fee Records', icon: Receipt },
    { id: 'scholarships', label: 'Scholarships', icon: GraduationCap },
    { id: 'connect', label: 'Connect Scholarships', icon: Link }, // Add new tab
    { id: 'analytics', label: 'Analytics', icon: TrendingUp },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'bulk', label: 'Bulk Operations', icon: Upload },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <RealTimeFeeDashboard />;
      case 'records':
        return <FeeListManagement />;
      case 'scholarships':
        return <ScholarshipManagement />;
      case 'connect':
        return permissions.canModifyFeeStructure ? (
          <ScholarshipFeeConnector onConnectionUpdate={handleRefresh} />
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Lock className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>You don't have permission to connect scholarships</p>
          </div>
        );
      case 'analytics':
        return <DepartmentAnalytics />;
      case 'reports':
        return <AdminReportGenerator />;
      case 'bulk':
        return permissions.canModifyFeeStructure ? (
          <BulkFeeActions />
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Lock className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>You don't have permission to perform bulk operations</p>
          </div>
        );
      default:
        return <RealTimeFeeDashboard />;
    }
  };

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Fee Management Hub</h1>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
        <TabsList>
          {tabs.map((tab) => (
            <TabsTrigger key={tab.id} value={tab.id} className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
              <tab.icon className="w-4 h-4 mr-2" />
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value={activeTab} className="focus:outline-none">
          {renderTabContent()}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FeeManagementHub;
