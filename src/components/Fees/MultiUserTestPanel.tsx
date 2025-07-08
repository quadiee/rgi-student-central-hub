
import React, { useState, useEffect } from 'react';
import { Users, RefreshCw, Database, Eye, ArrowRight } from 'lucide-react';
import { Button } from '../ui/button';
import { useToast } from '../ui/use-toast';
import { useAuth } from '../../contexts/SupabaseAuthContext';
import { supabase } from '../../integrations/supabase/client';
import { useUserConversion } from '../../hooks/useUserConversion';

interface TestUser {
  id: string;
  name: string;
  email: string;
  role: string;
  department_name: string;
  department_id: string;
  is_active: boolean;
}

const MultiUserTestPanel: React.FC = () => {
  const { profile } = useAuth();
  const { convertUserProfileToUser } = useUserConversion();
  const { toast } = useToast();
  const [testUsers, setTestUsers] = useState<TestUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<TestUser | null>(null);
  const [viewingAs, setViewingAs] = useState<TestUser | null>(null);

  const loadTestUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          name,
          email,
          role,
          department_id,
          is_active,
          departments:department_id (
            name
          )
        `)
        .eq('is_active', true)
        .order('role')
        .limit(20);

      if (error) throw error;

      const users = (data || []).map(profile => ({
        id: profile.id,
        name: profile.name,
        email: profile.email,
        role: profile.role,
        department_name: profile.departments?.name || 'Unknown',
        department_id: profile.department_id,
        is_active: profile.is_active
      }));

      setTestUsers(users);
    } catch (error) {
      console.error('Error loading test users:', error);
      toast({
        title: "Error",
        description: "Failed to load test users",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const simulateUserView = (user: TestUser) => {
    setViewingAs(user);
    toast({
      title: "View Switched",
      description: `Now viewing as ${user.name} (${user.role})`,
    });
  };

  const resetView = () => {
    setViewingAs(null);
    toast({
      title: "View Reset",
      description: "Returned to your original view",
    });
  };

  useEffect(() => {
    loadTestUsers();
  }, []);

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'principal':
        return 'bg-purple-100 text-purple-800';
      case 'hod':
        return 'bg-blue-100 text-blue-800';
      case 'student':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getVisibleUsers = () => {
    if (!profile) return [];
    
    const userRole = profile.role;
    const userDepartment = profile.department_name;
    
    switch (userRole) {
      case 'admin':
      case 'principal':
        return testUsers; // Can see all users
      case 'hod':
        return testUsers.filter(user => 
          user.department_name === userDepartment || user.role === 'admin' || user.role === 'principal'
        );
      case 'student':
        return testUsers.filter(user => 
          user.department_name === userDepartment && user.role === 'student'
        );
      default:
        return [];
    }
  };

  const visibleUsers = getVisibleUsers();

  if (!profile) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <p className="text-gray-500">Please log in to use the multi-user test panel.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-800">Multi-User Test Panel</h3>
          </div>
          <div className="flex space-x-2">
            {viewingAs && (
              <Button onClick={resetView} variant="outline" size="sm">
                Reset View
              </Button>
            )}
            <Button onClick={loadTestUsers} disabled={loading} variant="outline" size="sm">
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {viewingAs && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <div className="flex items-center space-x-2">
              <Eye className="w-4 h-4 text-blue-600" />
              <span className="text-blue-800 font-medium">
                Currently viewing as: {viewingAs.name} ({viewingAs.role})
              </span>
            </div>
          </div>
        )}

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-gray-700">
              Available Test Users ({visibleUsers.length})
            </h4>
            <div className="text-sm text-gray-500">
              Your access level: <span className="font-medium capitalize">{profile.role}</span>
              {profile.department_name && (
                <span> - {profile.department_name}</span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {visibleUsers.map((user) => (
              <div key={user.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <h5 className="font-medium text-gray-800">{user.name}</h5>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                    {user.role}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-1">{user.email}</p>
                <p className="text-xs text-gray-500 mb-3">{user.department_name}</p>
                
                <div className="flex space-x-2">
                  <Button
                    onClick={() => simulateUserView(user)}
                    size="sm"
                    variant="outline"
                    className="flex-1 text-xs"
                    disabled={viewingAs?.id === user.id}
                  >
                    <Eye className="w-3 h-3 mr-1" />
                    {viewingAs?.id === user.id ? 'Current View' : 'View As'}
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {visibleUsers.length === 0 && (
            <div className="text-center py-8">
              <Database className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No users available for testing</p>
              <p className="text-sm text-gray-400 mt-1">
                Create some test users or check your access permissions
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Usage Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <h4 className="font-medium text-blue-800 mb-2">How to Use:</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Click "View As" to simulate viewing the application as different users</li>
          <li>• Test different role permissions and department access levels</li>
          <li>• Use "Reset View" to return to your original perspective</li>
          <li>• Users shown are filtered based on your current access level</li>
        </ul>
      </div>
    </div>
  );
};

export default MultiUserTestPanel;
