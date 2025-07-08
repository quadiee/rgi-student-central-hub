
import React, { useState } from 'react';
import { Users, Upload, FileText, List, Settings, BarChart3 } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { useAuth } from '../../contexts/SupabaseAuthContext';
import AdminFeeAssignment from './AdminFeeAssignment';
import CSVFeeUploader from './CSVFeeUploader';
import FeeListManagement from './FeeListManagement';
import StudentFeeDashboard from './StudentFeeDashboard';
import HODFeeDashboard from './HODFeeDashboard';
import RealTimeFeeDashboard from './RealTimeFeeDashboard';

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

  const isAdmin = user.role && ['admin', 'principal'].includes(user.role);
  const isHOD = user.role === 'hod';
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
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-6">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Dashboard
          </TabsTrigger>
          
          {(isAdmin || isHOD) && (
            <TabsTrigger value="list-management" className="flex items-center gap-2">
              <List className="w-4 h-4" />
              Fee Records
            </TabsTrigger>
          )}
          
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
          
          {(isAdmin || isHOD) && (
            <TabsTrigger value="real-time" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Real-time Stats
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          {isStudent && <StudentFeeDashboard />}
          {isHOD && <HODFeeDashboard />}
          {isAdmin && <RealTimeFeeDashboard />}
        </TabsContent>

        {(isAdmin || isHOD) && (
          <TabsContent value="list-management" className="space-y-6">
            <FeeListManagement />
          </TabsContent>
        )}

        {isAdmin && (
          <>
            <TabsContent value="assign-fees" className="space-y-6">
              <AdminFeeAssignment />
            </TabsContent>

            <TabsContent value="csv-upload" className="space-y-6">
              <CSVFeeUploader />
            </TabsContent>
          </>
        )}

        {(isAdmin || isHOD) && (
          <TabsContent value="real-time" className="space-y-6">
            <RealTimeFeeDashboard />
          </TabsContent>
        )}
      </Tabs>

      {/* Quick Stats for Overview */}
      {activeTab === 'dashboard' && (isAdmin || isHOD) && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
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
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full justify-start"
                onClick={() => setActiveTab('list-management')}
              >
                <List className="w-4 h-4 mr-2" />
                Manage Records
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default FeeManagementHub;
