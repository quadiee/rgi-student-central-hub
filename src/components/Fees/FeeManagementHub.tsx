
import React, { useState } from 'react';
import { Users, Upload, FileText, List, Settings, BarChart3, PieChart } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { useAuth } from '../../contexts/SupabaseAuthContext';
import EnhancedFeeAssignment from './EnhancedFeeAssignment';
import CSVFeeUploader from './CSVFeeUploader';
import FeeListManagement from './FeeListManagement';
import StudentFeeDashboard from './StudentFeeDashboard';
import HODFeeDashboard from './HODFeeDashboard';
import RealTimeFeeDashboard from './RealTimeFeeDashboard';
import DepartmentAnalytics from './DepartmentAnalytics';
import FeeTypeAnalytics from './FeeTypeAnalytics';

const FeeManagementHub: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-gray-600">Please log in to access fee management</p>
        </div>
      </div>
    );
  }

  // Strict role-based access control
  const isAdmin = user.role === 'admin';
  const isHOD = user.role === 'hod';
  const isChairmanOrPrincipal = user.role === 'chairman' || user.role === 'principal';
  const isStudent = user.role === 'student';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Fee Management System</h1>
        <div className="text-sm text-gray-600">
          {user.name} - {user.role?.toUpperCase()}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-8">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Dashboard
          </TabsTrigger>
          
          {(isAdmin || isHOD || isChairmanOrPrincipal) && (
            <TabsTrigger value="list-management" className="flex items-center gap-2">
              <List className="w-4 h-4" />
              Fee Records
            </TabsTrigger>
          )}
          
          {/* Only Admin gets advanced features */}
          {isAdmin && (
            <>
              <TabsTrigger value="assign-fees" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Assign Fees
              </TabsTrigger>
              <TabsTrigger value="csv-upload" className="flex items-center gap-2">
                <Upload className="w-4 h-4" />
                CSV Upload
              </TabsTrigger>
            </>
          )}
          
          {(isAdmin || isHOD || isChairmanOrPrincipal) && (
            <>
              <TabsTrigger value="real-time" className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Real-time Stats
              </TabsTrigger>
              <TabsTrigger value="dept-analytics" className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Dept Analytics
              </TabsTrigger>
              <TabsTrigger value="fee-type-analytics" className="flex items-center gap-2">
                <PieChart className="w-4 h-4" />
                Fee Type Analytics
              </TabsTrigger>
            </>
          )}
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          {isStudent && <StudentFeeDashboard />}
          {isHOD && <HODFeeDashboard />}
          {(isAdmin || isChairmanOrPrincipal) && <RealTimeFeeDashboard />}
        </TabsContent>

        {(isAdmin || isHOD || isChairmanOrPrincipal) && (
          <TabsContent value="list-management" className="space-y-6">
            <FeeListManagement />
          </TabsContent>
        )}

        {/* Admin-only features */}
        {isAdmin && (
          <>
            <TabsContent value="assign-fees" className="space-y-6">
              <EnhancedFeeAssignment />
            </TabsContent>

            <TabsContent value="csv-upload" className="space-y-6">
              <CSVFeeUploader />
            </TabsContent>
          </>
        )}

        {(isAdmin || isHOD || isChairmanOrPrincipal) && (
          <>
            <TabsContent value="real-time" className="space-y-6">
              <RealTimeFeeDashboard />
            </TabsContent>

            <TabsContent value="dept-analytics" className="space-y-6">
              <DepartmentAnalytics />
            </TabsContent>

            <TabsContent value="fee-type-analytics" className="space-y-6">
              <FeeTypeAnalytics />
            </TabsContent>
          </>
        )}
      </Tabs>

      {/* Quick Stats for Overview - Only for authorized roles */}
      {activeTab === 'dashboard' && (isAdmin || isHOD || isChairmanOrPrincipal) && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {/* Only Admin gets assign fees and CSV upload */}
              {isAdmin && (
                <>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full justify-start"
                    onClick={() => setActiveTab('assign-fees')}
                  >
                    <Users className="w-4 h-4 mr-2" />
                    Assign Fees
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full justify-start"
                    onClick={() => setActiveTab('csv-upload')}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload CSV
                  </Button>
                </>
              )}
              {/* All authorized roles can manage records */}
              {(isAdmin || isHOD || isChairmanOrPrincipal) && (
                <>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full justify-start"
                    onClick={() => setActiveTab('list-management')}
                  >
                    <List className="w-4 h-4 mr-2" />
                    Manage Records
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full justify-start"
                    onClick={() => setActiveTab('dept-analytics')}
                  >
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Department Analytics
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full justify-start"
                    onClick={() => setActiveTab('fee-type-analytics')}
                  >
                    <PieChart className="w-4 h-4 mr-2" />
                    Fee Type Analytics
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default FeeManagementHub;
