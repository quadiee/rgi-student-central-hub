
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart3, Receipt, GraduationCap, TrendingUp, FileText, Upload, Lock, Plus } from 'lucide-react';
import { useAuth } from '../../contexts/SupabaseAuthContext';
import FeeListManagement from './FeeListManagement';
import ScholarshipManagement from './ScholarshipManagement';
import DepartmentAnalytics from './DepartmentAnalytics';
import AdminReportGenerator from './AdminReportGenerator';
import BulkFeeActions from './BulkFeeActions';
import EnhancedFeeAssignment from './EnhancedFeeAssignment';

const FeeManagementHub: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('analytics');
  const [selectedRecords, setSelectedRecords] = useState<string[]>([]);
  const [permissions, setPermissions] = useState({
    canCreate: false,
    canEdit: false,
    canDelete: false,
    canViewAll: false,
    canViewDepartment: false,
    canModifyFeeStructure: false
  });

  useEffect(() => {
    if (user) {
      // Chairman can only view, no editing permissions
      const canModify = ['admin', 'principal'].includes(user.role || '');
      setPermissions({
        canCreate: canModify,
        canEdit: canModify,
        canDelete: ['admin', 'principal'].includes(user.role || ''),
        canViewAll: canModify || user.role === 'chairman',
        canViewDepartment: user.role === 'hod',
        canModifyFeeStructure: canModify
      });
    }
  }, [user]);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
  };

  const handleRefresh = () => {
    console.log('Data Refreshed!');
  };

  const handleBulkUpdate = () => {
    setSelectedRecords([]);
  };

  const handleClearSelection = () => {
    setSelectedRecords([]);
  };

  // Define tabs based on user role
  const getAllTabs = () => {
    const baseTabs = [
      { id: 'analytics', label: 'Analytics', icon: TrendingUp },
      { id: 'scholarships', label: 'Scholarships', icon: GraduationCap },
      { id: 'records', label: 'Fee Records', icon: Receipt },
    ];

    // Chairman only sees basic tabs (view-only)
    if (user?.role === 'chairman') {
      return baseTabs;
    }

    // Admin and Principal see all tabs
    if (['admin', 'principal'].includes(user?.role || '')) {
      return [
        ...baseTabs,
        { id: 'assign', label: 'Assign Fees', icon: Plus },
        { id: 'reports', label: 'Reports', icon: FileText },
        { id: 'bulk', label: 'Bulk Operations', icon: Upload },
      ];
    }

    // Default for other roles (HOD, etc.)
    return baseTabs;
  };

  const tabs = getAllTabs();

  const renderTabContent = () => {
    switch (activeTab) {
      case 'analytics':
        return <DepartmentAnalytics />;
      case 'scholarships':
        return <ScholarshipManagement />;
      case 'records':
        return <FeeListManagement />;
      case 'assign':
        return permissions.canModifyFeeStructure ? (
          <EnhancedFeeAssignment />
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Lock className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>You don't have permission to assign fees</p>
          </div>
        );
      case 'reports':
        return <AdminReportGenerator />;
      case 'bulk':
        return permissions.canModifyFeeStructure ? (
          <BulkFeeActions 
            selectedRecords={selectedRecords}
            onBulkUpdate={handleBulkUpdate}
            onClear={handleClearSelection}
          />
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Lock className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>You don't have permission to perform bulk operations</p>
          </div>
        );
      default:
        return <DepartmentAnalytics />;
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
