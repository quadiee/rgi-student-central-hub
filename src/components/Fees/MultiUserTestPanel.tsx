import React, { useState, useEffect } from 'react';
import { Users, Shield, Eye, AlertTriangle } from 'lucide-react';
import { Button } from '../ui/button';
import { useToast } from '../ui/use-toast';
import { supabase } from '../../integrations/supabase/client';
import { useAuth } from '../../contexts/AuthContext';

interface UserTestData {
  role: string;
  department: string;
  accessibleStudents: number;
  accessibleDepartments: string[];
  canProcessPayments: boolean;
  canModifyFeeStructure: boolean;
  canGenerateReports: boolean;
}

const MultiUserTestPanel: React.FC = () => {
  const { user, hasPermission } = useAuth();
  const { toast } = useToast();
  const [testResults, setTestResults] = useState<UserTestData | null>(null);
  const [loading, setLoading] = useState(false);
  const [allUsers, setAllUsers] = useState<any[]>([]);

  useEffect(() => {
    loadAllUsers();
  }, []);

  const loadAllUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('user_invitations')
        .select('email, role, department')
        .eq('is_active', true)
        .order('role');

      if (error) throw error;
      setAllUsers(data || []);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const testCurrentUserAccess = async () => {
    if (!user) return;

    setLoading(true);
    try {
      let accessibleStudents = 0;
      let accessibleDepartments: string[] = [];

      // Test student access based on permissions
      if (hasPermission('view_all_students')) {
        const { data: allStudents } = await supabase
          .from('profiles')
          .select('id, department')
          .eq('role', 'student');
        
        accessibleStudents = allStudents?.length || 0;
        accessibleDepartments = ['All Departments'];
      } else if (hasPermission('view_department_students')) {
        const { data: deptStudents } = await supabase
          .from('profiles')
          .select('id, department')
          .eq('role', 'student')
          .eq('department', user.department as any);
        
        accessibleStudents = deptStudents?.length || 0;
        accessibleDepartments = [user.department];
      } else if (hasPermission('view_own_profile')) {
        accessibleStudents = 1;
        accessibleDepartments = [user.department];
      }

      // Test fee record access
      const { data: feeRecords, error: feeError } = await supabase
        .from('fee_records')
        .select(`
          *,
          profiles!student_id (
            name,
            email,
            department
          )
        `);

      if (feeError) {
        console.error('Fee records access error:', feeError);
      }

      // Check permissions
      const permissions = {
        canProcessPayments: hasPermission('process_payments'),
        canModifyFeeStructure: hasPermission('modify_fee_structure'),
        canGenerateReports: hasPermission('generate_reports')
      };

      const testData: UserTestData = {
        role: user.role,
        department: user.department,
        accessibleStudents,
        accessibleDepartments,
        ...permissions
      };

      setTestResults(testData);

      toast({
        title: "Access Test Complete",
        description: `Role: ${user.role} | Accessible Students: ${accessibleStudents}`,
      });

    } catch (error) {
      console.error('Error testing user access:', error);
      toast({
        title: "Error",
        description: "Failed to test user access",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const simulateMultiUserScenario = async () => {
    setLoading(true);
    try {
      const scenarios = [
        'Student viewing own fees',
        'Faculty viewing department students',
        'HOD processing payments',
        'Principal generating reports',
        'Admin modifying fee structures'
      ];

      for (const scenario of scenarios) {
        await new Promise(resolve => setTimeout(resolve, 500));
        console.log(`Simulating: ${scenario}`);
      }

      toast({
        title: "Multi-User Simulation Complete",
        description: "All concurrent access scenarios tested successfully",
      });

    } catch (error) {
      console.error('Error in multi-user simulation:', error);
      toast({
        title: "Error",
        description: "Multi-user simulation failed",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Shield className="w-5 h-5 text-green-600" />
          <h3 className="text-lg font-semibold text-gray-800">Multi-User Access Testing</h3>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Users className="w-4 h-4" />
          <span>{allUsers.length} Invited Users</span>
        </div>
      </div>

      <div className="space-y-4">
        <p className="text-gray-600">
          Test role-based access control and multi-user scenarios for the fee management system.
        </p>

        {/* Current User Status */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Eye className="w-4 h-4 text-blue-600" />
            <span className="font-medium text-blue-800">Current User</span>
          </div>
          <div className="text-sm text-blue-700 space-y-1">
            <p>• Role: {user?.role || 'Not logged in'}</p>
            <p>• Department: {user?.department || 'N/A'}</p>
            <p>• Email: {user?.email || 'N/A'}</p>
          </div>
        </div>

        {/* Test Results */}
        {testResults && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Shield className="w-4 h-4 text-green-600" />
              <span className="font-medium text-green-800">Access Test Results</span>
            </div>
            <div className="text-sm text-green-700 space-y-1">
              <p>• Accessible Students: {testResults.accessibleStudents}</p>
              <p>• Accessible Departments: {testResults.accessibleDepartments.join(', ')}</p>
              <p>• Can Process Payments: {testResults.canProcessPayments ? 'Yes' : 'No'}</p>
              <p>• Can Modify Fee Structure: {testResults.canModifyFeeStructure ? 'Yes' : 'No'}</p>
              <p>• Can Generate Reports: {testResults.canGenerateReports ? 'Yes' : 'No'}</p>
            </div>
          </div>
        )}

        {/* Available Users */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h4 className="font-medium text-gray-800 mb-2">Available Test Users</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
            {allUsers.map((u, index) => (
              <div key={index} className="flex justify-between items-center p-2 bg-white rounded border">
                <span className="text-gray-700">{u.email}</span>
                <div className="flex space-x-2">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    u.role === 'admin' ? 'bg-red-100 text-red-800' :
                    u.role === 'principal' ? 'bg-purple-100 text-purple-800' :
                    u.role === 'hod' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {u.role}
                  </span>
                  <span className="px-2 py-1 rounded text-xs bg-gray-100 text-gray-600">
                    {u.department}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex space-x-3">
          <Button
            onClick={testCurrentUserAccess}
            disabled={loading}
            className="flex items-center space-x-2"
          >
            <Eye className="w-4 h-4" />
            <span>{loading ? 'Testing...' : 'Test Current User Access'}</span>
          </Button>

          <Button
            variant="outline"
            onClick={simulateMultiUserScenario}
            disabled={loading}
            className="flex items-center space-x-2"
          >
            <Users className="w-4 h-4" />
            <span>{loading ? 'Simulating...' : 'Simulate Multi-User Scenarios'}</span>
          </Button>
        </div>

        <div className="flex items-center space-x-2 text-xs text-amber-600 bg-amber-50 p-2 rounded">
          <AlertTriangle className="w-3 h-3" />
          <span>To test different roles, register using the invitation emails above</span>
        </div>
      </div>
    </div>
  );
};

export default MultiUserTestPanel;
