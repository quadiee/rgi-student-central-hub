import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, User, Search, AlertTriangle } from 'lucide-react';
import { Button } from '../ui/button';
import { useToast } from '../ui/use-toast';
import { supabase } from '../../integrations/supabase/client';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  department_id: string;
  department_name?: string;
  is_active: boolean;
}

const AdminImpersonationPanel: React.FC = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserProfile[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [loading, setLoading] = useState(false);
  const [isImpersonating, setIsImpersonating] = useState(false);
  const [adminUserId, setAdminUserId] = useState<string | null>(null);
  const { toast } = useToast();

  // On mount, load users and check impersonation state
  useEffect(() => {
    loadUsers();
    const adminId = localStorage.getItem('originalAdminUserId');
    setIsImpersonating(!!adminId);
    setAdminUserId(adminId);
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    filterUsers();
    // eslint-disable-next-line
  }, [users, searchTerm, selectedRole]);

  const loadUsers = async () => {
    try {
      setLoading(true);
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
            name,
            code
          )
        `)
        .eq('is_active', true)
        .order('name');

      if (error) {
        console.error('Supabase error loading users:', error);
        throw error;
      }

      const usersData = (data || []).map((user: any) => ({
        ...user,
        department_name: user.departments?.name || 'Unknown'
      }));

      setUsers(usersData);
    } catch (error) {
      console.error('Error loading users:', error);
      toast({
        title: "Error",
        description: "Failed to load users",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = users;

    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedRole !== 'all') {
      filtered = filtered.filter(user => user.role === selectedRole);
    }

    setFilteredUsers(filtered);
  };

  // Helper to get the current user from Supabase
  const getCurrentUserId = async (): Promise<string | null> => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user?.id || null;
  };

  const handleImpersonate = async (targetUser: UserProfile) => {
    try {
      setLoading(true);

      // Store the current admin user id before impersonating
      let originalAdminId = adminUserId;
      if (!originalAdminId) {
        originalAdminId = await getCurrentUserId();
        if (originalAdminId) {
          localStorage.setItem('originalAdminUserId', originalAdminId);
          setAdminUserId(originalAdminId);
        }
      }

      const res = await fetch("/functions/v1/impersonate-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: targetUser.id }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast({
          title: "Error",
          description: data.error || "Impersonation failed.",
          variant: "destructive",
        });
        return;
      }

      const { access_token, refresh_token } = data;
      if (access_token && refresh_token) {
        await supabase.auth.setSession({ access_token, refresh_token });
        setIsImpersonating(true);
        toast({
          title: "Impersonation Started",
          description: `Now viewing as ${targetUser.name} (${targetUser.role})`,
        });
        // Optionally reload to refresh the session context
        window.location.reload();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Impersonation failed.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExitImpersonation = async () => {
    try {
      setLoading(true);
      const originalAdminId = localStorage.getItem('originalAdminUserId');
      if (!originalAdminId) {
        toast({
          title: "Error",
          description: "Original admin user ID unknown.",
          variant: "destructive",
        });
        return;
      }

      const res = await fetch("/functions/v1/stop-impersonation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminUserId: originalAdminId }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast({
          title: "Error",
          description: data.error || "Failed to exit impersonation.",
          variant: "destructive",
        });
        return;
      }

      const { access_token, refresh_token } = data;
      if (access_token && refresh_token) {
        await supabase.auth.setSession({ access_token, refresh_token });
        setIsImpersonating(false);
        localStorage.removeItem('originalAdminUserId');
        setAdminUserId(null);
        toast({
          title: "Impersonation Ended",
          description: "Returned to admin view.",
        });
        // Optionally reload to refresh the session context
        window.location.reload();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to exit impersonation.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-800">User Impersonation</h3>
        {isImpersonating && (
          <Button
            onClick={handleExitImpersonation}
            variant="outline"
            className="flex items-center space-x-2"
            disabled={loading}
          >
            <EyeOff className="w-4 h-4" />
            <span>Exit Impersonation</span>
          </Button>
        )}
      </div>

      {isImpersonating && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <div className="flex items-center space-x-2">
            <Eye className="w-5 h-5 text-yellow-600" />
            <span className="text-yellow-800 font-medium">
              You are currently impersonating another user. Click "Exit Impersonation" to return to your admin view.
            </span>
          </div>
        </div>
      )}

      <div className="bg-red-50 border border-red-200 rounded-xl p-4">
        <div className="flex items-center space-x-2">
          <AlertTriangle className="w-5 h-5 text-red-600" />
          <div className="text-red-800">
            <p className="font-medium">Warning: Use impersonation responsibly</p>
            <p className="text-sm">
              Impersonation allows you to see the application exactly as another user would. 
              All actions taken while impersonating will be logged and attributed to the admin user.
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex space-x-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            />
          </div>
        </div>
        <select
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={loading}
        >
          <option value="all">All Roles</option>
          <option value="student">Student</option>
          <option value="hod">HOD</option>
          <option value="principal">Principal</option>
        </select>
      </div>

      {/* Users List */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Department
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((targetUser) => (
                  <tr key={targetUser.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8">
                          <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                            <User className="w-4 h-4 text-gray-600" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{targetUser.name}</div>
                          <div className="text-sm text-gray-500">{targetUser.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 capitalize">
                        {targetUser.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {targetUser.department_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Button
                        onClick={() => handleImpersonate(targetUser)}
                        variant="outline"
                        size="sm"
                        className="flex items-center space-x-1"
                        disabled={isImpersonating || loading}
                      >
                        <Eye className="w-4 h-4" />
                        <span>Impersonate</span>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {filteredUsers.length === 0 && !loading && (
          <div className="text-center py-8">
            <p className="text-gray-500">
              {searchTerm || selectedRole !== 'all' ? 'No users match your filters' : 'No users found'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminImpersonationPanel;