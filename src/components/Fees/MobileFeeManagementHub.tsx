
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart3, Receipt, GraduationCap, TrendingUp, FileText, Upload, Lock, Plus, Menu } from 'lucide-react';
import { useAuth } from '../../contexts/SupabaseAuthContext';
import { useIsMobile } from '../../hooks/use-mobile';
import FeeListManagement from './FeeListManagement';
import ScholarshipManagement from './ScholarshipManagement';
import DepartmentAnalytics from './DepartmentAnalytics';
import FeeTypeAnalytics from './FeeTypeAnalytics';
import AdminReportGenerator from './AdminReportGenerator';
import BulkFeeActions from './BulkFeeActions';
import EnhancedFeeAssignment from './EnhancedFeeAssignment';
import { Button } from '../ui/button';
import { Sheet, SheetContent, SheetTrigger } from '../ui/sheet';

const MobileFeeManagementHub: React.FC = () => {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState('analytics');
  const [selectedRecords, setSelectedRecords] = useState<string[]>([]);
  const [showTabMenu, setShowTabMenu] = useState(false);
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
    setShowTabMenu(false);
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
      { id: 'analytics', label: 'Analytics', icon: TrendingUp, color: 'text-blue-600' },
      { id: 'scholarships', label: 'Scholarships', icon: GraduationCap, color: 'text-green-600' },
      { id: 'fee-type-analytics', label: 'Fee Analytics', icon: BarChart3, color: 'text-purple-600' },
      { id: 'records', label: 'Fee Records', icon: Receipt, color: 'text-orange-600' },
    ];

    // Chairman only sees basic tabs (view-only)
    if (user?.role === 'chairman') {
      return baseTabs;
    }

    // Admin and Principal see all tabs
    if (['admin', 'principal'].includes(user?.role || '')) {
      return [
        ...baseTabs,
        { id: 'assign', label: 'Assign Fees', icon: Plus, color: 'text-indigo-600' },
        { id: 'reports', label: 'Reports', icon: FileText, color: 'text-gray-600' },
        { id: 'bulk', label: 'Bulk Ops', icon: Upload, color: 'text-red-600' },
      ];
    }

    // Default for other roles (HOD, etc.)
    return baseTabs;
  };

  const tabs = getAllTabs();
  const currentTab = tabs.find(tab => tab.id === activeTab);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'analytics':
        return <DepartmentAnalytics />;
      case 'scholarships':
        return <ScholarshipManagement />;
      case 'fee-type-analytics':
        return <FeeTypeAnalytics />;
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
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Fee Management Hub</h1>
          <p className="text-sm text-gray-600 mt-1">
            {user?.role === 'chairman' ? 'Chairman Dashboard - View Only Access' : 'Manage all fee-related operations'}
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
          <TabsList className="grid w-full" style={{ gridTemplateColumns: `repeat(${tabs.length}, 1fr)` }}>
            {tabs.map((tab) => (
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

  // Mobile-optimized version
  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Mobile Header */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-200 px-4 py-3 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold text-gray-900 truncate">
              {currentTab?.label || 'Fee Management'}
            </h1>
            <p className="text-xs text-gray-500 truncate">
              {user?.role === 'chairman' ? 'Chairman Dashboard' : 'Fee Management Hub'}
            </p>
          </div>
          
          {/* Mobile Tab Selector */}
          <Sheet open={showTabMenu} onOpenChange={setShowTabMenu}>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="ml-2">
                <Menu className="w-4 h-4 mr-2" />
                Menu
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="max-h-[50vh]">
              <div className="py-4">
                <h3 className="font-semibold text-gray-900 mb-4">Select Section</h3>
                <div className="grid grid-cols-2 gap-3">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    
                    return (
                      <Button
                        key={tab.id}
                        variant={isActive ? "default" : "outline"}
                        onClick={() => handleTabChange(tab.id)}
                        className={`h-16 flex flex-col items-center justify-center gap-2 ${
                          isActive 
                            ? user?.role === 'chairman' 
                              ? 'bg-gradient-to-r from-purple-600 to-blue-600' 
                              : 'bg-blue-600'
                            : 'hover:bg-gray-50'
                        }`}
                      >
                        <Icon className={`w-5 h-5 ${isActive ? 'text-white' : tab.color}`} />
                        <span className={`text-xs font-medium ${isActive ? 'text-white' : 'text-gray-700'}`}>
                          {tab.label}
                        </span>
                      </Button>
                    );
                  })}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Mobile Content */}
      <div className="flex-1 overflow-auto px-4 py-4">
        {renderTabContent()}
      </div>

      {/* Chairman Role Indicator */}
      {user?.role === 'chairman' && (
        <div className="sticky bottom-0 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 text-center">
          <p className="text-xs font-medium">Chairman View - Read Only Access</p>
        </div>
      )}
    </div>
  );
};

export default MobileFeeManagementHub;
