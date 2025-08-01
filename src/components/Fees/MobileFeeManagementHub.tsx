
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, Receipt, GraduationCap, TrendingUp, FileText, Upload, Lock, Plus, Menu, RefreshCw } from 'lucide-react';
import { useAuth } from '../../contexts/SupabaseAuthContext';
import { useIsMobile } from '../../hooks/use-mobile';
import FeeListManagement from './FeeListManagement';
import ScholarshipManagement from './ScholarshipManagement';
import DepartmentAnalytics from './DepartmentAnalytics';
import MobileFeeTypeAnalytics from './MobileFeeTypeAnalytics';
import AdminReportGenerator from './AdminReportGenerator';
import BulkFeeActions from './BulkFeeActions';
import EnhancedFeeAssignment from './EnhancedFeeAssignment';
import { Button } from '../ui/button';
import ChairmanMobileHeader from '../Mobile/ChairmanMobileHeader';
import ChairmanMobileTabs from '../Mobile/ChairmanMobileTabs';
import { cn } from '../../lib/utils';

const MobileFeeManagementHub: React.FC = () => {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState('analytics');
  const [selectedRecords, setSelectedRecords] = useState<string[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  
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

  const handleBulkUpdate = () => {
    setSelectedRecords([]);
  };

  const handleClearSelection = () => {
    setSelectedRecords([]);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    // Simulate refresh delay
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  };

  // Define tabs based on user role with enhanced mobile design
  const getAllTabs = () => {
    const baseTabs = [
      {
        id: 'analytics',
        label: 'Analytics',
        icon: TrendingUp,
        color: 'text-blue-600',
        description: 'Department analytics'
      },
      {
        id: 'scholarships',
        label: 'Scholarships',
        icon: GraduationCap,
        color: 'text-green-600',
        description: 'Scholarship management'
      },
      {
        id: 'fee-type-analytics',
        label: 'Fee Analytics',
        icon: BarChart3,
        color: 'text-purple-600',
        description: 'Fee type analysis'
      },
      {
        id: 'records',
        label: 'Fee Records',
        icon: Receipt,
        color: 'text-orange-600',
        description: 'Student fee records'
      }
    ];

    // Chairman only sees basic tabs (view-only)
    if (user?.role === 'chairman') {
      return baseTabs;
    }

    // Admin and Principal see all tabs
    if (['admin', 'principal'].includes(user?.role || '')) {
      return [
        ...baseTabs,
        {
          id: 'assign',
          label: 'Assign Fees',
          icon: Plus,
          color: 'text-indigo-600',
          description: 'Fee assignment'
        },
        {
          id: 'reports',
          label: 'Reports',
          icon: FileText,
          color: 'text-gray-600',
          description: 'Generate reports'
        },
        {
          id: 'bulk',
          label: 'Bulk Ops',
          icon: Upload,
          color: 'text-red-600',
          description: 'Bulk operations'
        }
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
      case 'fee-type-analytics':
        return <MobileFeeTypeAnalytics />;
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

  if (!isMobile) {
    // Return desktop version for non-mobile devices
    return (
      <div className="container mx-auto py-6 px-4">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Fee Management Hub</h1>
            <p className="text-sm text-gray-600 mt-1">
              {user?.role === 'chairman' 
                ? 'Chairman Dashboard - View Only Access' 
                : 'Manage all fee-related operations'
              }
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
          <TabsList 
            className="grid w-full" 
            style={{ gridTemplateColumns: `repeat(${tabs.length}, 1fr)` }}
          >
            {tabs.map(tab => (
              <TabsTrigger 
                key={tab.id} 
                value={tab.id} 
                className="data-[state=active]:bg-blue-500 data-[state=active]:text-white flex items-center gap-2"
              >
                <tab.icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>
          <TabsContent value={activeTab} className="focus:outline-none">
            {renderTabContent()}
          </TabsContent>
        </Tabs>
      </div>
    );
  }

  // Mobile-optimized version for Chairman
  return (
    <div className={cn(
      "min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50",
      user?.role === 'chairman' ? 'pb-20' : 'pb-4'
    )}>
      {/* Enhanced Header for Chairman */}
      {user?.role === 'chairman' ? (
        <ChairmanMobileHeader
          title="Fee Management"
          subtitle="Institutional Fee Oversight"
          onSearch={() => {}}
          showNotifications={true}
          notificationCount={5}
        />
      ) : (
        // Standard header for other roles
        <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-lg border-b border-gray-200 px-4 py-3 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-bold text-gray-800">Fee Management</h1>
              <p className="text-xs text-gray-600">Manage fee operations</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-2"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      )}
      
      {/* Enhanced Tabs for Chairman */}
      <ChairmanMobileTabs
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        title="Fee Management Sections"
      />

      {/* Content */}
      <div className="animate-fade-in">
        {renderTabContent()}
      </div>

      {/* Chairman Role Indicator */}
      {user?.role === 'chairman' && (
        <div className="fixed bottom-16 left-0 right-0 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 text-center shadow-lg">
          <div className="flex items-center justify-center space-x-2">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
            <p className="text-xs font-medium">Chairman's View • Read-Only Access</p>
            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
          </div>
        </div>
      )}

      {/* Global Refresh Indicator */}
      {refreshing && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 animate-fade-in">
          <div className="bg-blue-600 text-white px-4 py-2 rounded-full shadow-lg flex items-center space-x-2">
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span className="text-sm">Refreshing data...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default MobileFeeManagementHub;
