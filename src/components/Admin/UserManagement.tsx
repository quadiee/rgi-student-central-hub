import React, { useState, useEffect } from 'react';
import { Search, Shield, User, Users } from 'lucide-react';
import { Button } from '../ui/button';
import { useToast } from '../ui/use-toast';
import { supabase } from '../../integrations/supabase/client';

// Department UUID to Name map (replace with your actual UUIDs and names)
const DEPARTMENTS: Record<string, string> = {
  // "uuid-1": "CSE",
  // "uuid-2": "ECE",
  // Add all department UUIDs and their names here
};

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  department_id: string; // use department_id instead of department
  roll_number?: string;
  employee_id?: string;
  is_active: boolean;
  created_at: string;
}

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserProfile[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0 });
  const { toast } = useToast();

  const roles = ['student', 'hod', 'principal', 'admin'];

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, selectedRole]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, email, role, department_id, roll_number, employee_id, is_active, created_at')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      
      const usersData = data || [];
      setUsers(usersData);
      
      const total = usersData.length;
      const active = usersData.filter(u => u.is_active).length;
      setStats({ total, active, inactive: total - active });
      
    } catch (error) {
      console.error('Error loading users:', error);
      toast({
        title: "Error",
        description: "Failed to load users. Please check your database connection.",
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
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.roll_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.employee_id?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (selectedRole !== 'all') {
      filtered = filtered.filter(user => user.role === selectedRole);
    }
    
    setFilteredUsers(filtered);
  };

  const handleToggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_active: !currentStatus })
        .eq('id', userId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `User ${!currentStatus ? 'activated' : 'deactivated'} successfully`,
      });
      
      loadUsers();
    } catch (error) {
      console.error('Error updating user status:', error);
      toast({
        title: "Error",
        description: "Failed to update user status",
        variant: "destructive",
      });
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Shield className="w-4 h-4" />;
      case 'principal':
        return <Users className="w-4 h-4" />;
      default:
        return <User className="w-4 h-4" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'principal':
        return 'bg-purple-100 text-purple-800';
      case 'hod':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Helper to get department name from id
  const getDepartmentName = (department_id: string) => {
    return DEPARTMENTS[department_id] || department_id || 'Unknown';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-800">User Management</h3>
        <div className="flex space-x-4 text-sm text-gray-600">
          <span>Total: {stats.total}</span>
          <span>Active: {stats.active}</span>
          <span>Inactive: {stats.inactive}</span>
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
            />
          </div>
        </div>
        <select
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Roles</option>
          {roles.map(role => (
            <option key={role} value={role}>
              {role.charAt(0).toUpperCase() + role.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
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
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-8 w-8">
                        <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-600">
                            {user.name?.charAt(0) || user.email.charAt(0)}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{user.name || 'No Name'}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                        {user.roll_number && (
                          <div className="text-xs text-gray-400">Roll: {user.roll_number}</div>
                        )}
                        {user.employee_id && (
                          <div className="text-xs text-gray-400">Emp ID: {user.employee_id}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getRoleColor(user.role)}`}>
                      {getRoleIcon(user.role)}
                      <span className="ml-1">{user.role}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {getDepartmentName(user.department_id)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      user.is_active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {user.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleUserStatus(user.id, user.is_active)}
                      className={user.is_active ? 'text-red-600 hover:text-red-800' : 'text-green-600 hover:text-green-800'}
                    >
                      {user.is_active ? 'Deactivate' : 'Activate'}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
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

export default UserManagement;