import React, { useState } from 'react';
import { Users, UserPlus, Download, Upload, Settings, Filter } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { useAuth } from '../../contexts/SupabaseAuthContext';
import UserListManagement from './UserListManagement';
import UserCreationModal from './UserCreationModal';
import BulkUserOperations from './BulkUserOperations';
import UserInvitationManager from './UserInvitationManager';
import UserAnalytics from './UserAnalytics';
const UserManagementHub: React.FC = () => {
  const {
    user
  } = useAuth();
  const [activeTab, setActiveTab] = useState('users');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const handleDataChange = () => {
    setRefreshTrigger(prev => prev + 1);
  };
  if (!user || !['admin', 'principal', 'chairman'].includes(user.role || '')) {
    return <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-gray-600">Access denied. Admin privileges required.</p>
        </div>
      </div>;
  }
  return <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">User Management System</h1>
        <div className="text-sm text-gray-600">
          {user.name} - {user.role?.toUpperCase()}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Users
          </TabsTrigger>
          <TabsTrigger value="invitations" className="flex items-center gap-2">
            <UserPlus className="w-4 h-4" />
            Invitations
          </TabsTrigger>
          <TabsTrigger value="bulk-ops" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Bulk Operations
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="import-export" className="flex items-center gap-2">
            <Upload className="w-4 h-4" />
            Import/Export
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-6">
          <UserListManagement refreshTrigger={refreshTrigger} onDataChange={handleDataChange} />
        </TabsContent>

        <TabsContent value="invitations" className="space-y-6">
          <UserInvitationManager onDataChange={handleDataChange} />
        </TabsContent>

        <TabsContent value="bulk-ops" className="space-y-6">
          <BulkUserOperations onDataChange={handleDataChange} />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <UserAnalytics />
        </TabsContent>

        <TabsContent value="import-export" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Import/Export Users</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button variant="outline" className="h-20 flex-col gap-2">
                  <Upload className="w-6 h-6" />
                  Import Users from CSV
                </Button>
                <Button variant="outline" className="h-20 flex-col gap-2">
                  <Download className="w-6 h-6" />
                  Export Users to CSV
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 px-0">
            <UserCreationModal onUserCreated={handleDataChange} />
            <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => setActiveTab('invitations')}>
              <UserPlus className="w-4 h-4 mr-2" />
              Send Invitations
            </Button>
            <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => setActiveTab('bulk-ops')}>
              <Settings className="w-4 h-4 mr-2" />
              Bulk Operations
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>;
};
export default UserManagementHub;