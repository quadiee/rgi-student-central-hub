
import React, { useState } from 'react';
import { useAuth } from '../../contexts/SupabaseAuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { DollarSign, Users, FileText, Upload, Settings, BarChart3 } from 'lucide-react';
import AdminFeeAssignment from './AdminFeeAssignment';
import EnhancedStudentFeeView from './EnhancedStudentFeeView';
import CSVFeeUploader from './CSVFeeUploader';
import PaymentProcessor from './PaymentProcessor';
import AdminReportGenerator from './AdminReportGenerator';
import RealTimeFeeDashboard from './RealTimeFeeDashboard';
import HODFeeView from './HODFeeView';
import PrincipalFeeView from './PrincipalFeeView';
import StudentPaymentPortal from './StudentPaymentPortal';
import FeeSystemStatus from './FeeSystemStatus';

const FeeManagementHub: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  if (!user) {
    return (
      <div className="text-center py-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Fee Management</h2>
        <p className="text-gray-600">Please log in to access fee management features.</p>
      </div>
    );
  }

  const renderRoleBasedContent = () => {
    switch (user.role) {
      case 'student':
        return (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="payments">Pay Fees</TabsTrigger>
              <TabsTrigger value="history">Payment History</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <EnhancedStudentFeeView />
            </TabsContent>

            <TabsContent value="payments">
              <StudentPaymentPortal />
            </TabsContent>

            <TabsContent value="history">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <FileText className="w-5 h-5" />
                    <span>Payment History</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Payment history will be integrated here */}
                  <p className="text-gray-600">Your payment history and receipts will be displayed here.</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        );

      case 'hod':
        return (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Department Overview</TabsTrigger>
              <TabsTrigger value="students">Student Fees</TabsTrigger>
              <TabsTrigger value="reports">Reports</TabsTrigger>
              <TabsTrigger value="status">System Status</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <HODFeeView />
            </TabsContent>

            <TabsContent value="students">
              <Card>
                <CardHeader>
                  <CardTitle>Department Student Fee Management</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">
                    View and manage fee records for students in your department.
                  </p>
                  <RealTimeFeeDashboard />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reports">
              <AdminReportGenerator />
            </TabsContent>

            <TabsContent value="status">
              <FeeSystemStatus />
            </TabsContent>
          </Tabs>
        );

      case 'admin':
      case 'principal':
        return (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="assignment">Fee Assignment</TabsTrigger>
              <TabsTrigger value="payments">Process Payments</TabsTrigger>
              <TabsTrigger value="upload">CSV Upload</TabsTrigger>
              <TabsTrigger value="reports">Reports</TabsTrigger>
              <TabsTrigger value="status">System Status</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              {user.role === 'principal' ? <PrincipalFeeView /> : <RealTimeFeeDashboard />}
            </TabsContent>

            <TabsContent value="assignment">
              <AdminFeeAssignment />
            </TabsContent>

            <TabsContent value="payments">
              <PaymentProcessor />
            </TabsContent>

            <TabsContent value="upload">
              <CSVFeeUploader />
            </TabsContent>

            <TabsContent value="reports">
              <AdminReportGenerator />
            </TabsContent>

            <TabsContent value="status">
              <FeeSystemStatus />
            </TabsContent>
          </Tabs>
        );

      default:
        return (
          <div className="text-center py-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Access Denied</h2>
            <p className="text-gray-600">Your role does not have access to fee management features.</p>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Fee Management System</h1>
          <p className="text-gray-600 mt-2">
            {user.role === 'student' 
              ? 'Manage your fee payments and view payment history'
              : user.role === 'hod'
              ? 'Manage fees for your department students'
              : 'Comprehensive fee management and administration'
            }
          </p>
        </div>
        
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <DollarSign className="w-4 h-4" />
          <span>Role: {user.role.toUpperCase()}</span>
        </div>
      </div>

      {renderRoleBasedContent()}
    </div>
  );
};

export default FeeManagementHub;
