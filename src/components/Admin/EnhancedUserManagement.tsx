import React, { useState, useEffect } from 'react';
import { Search, Shield, User, Users, Building, Mail, KeyRound, MailPlus } from 'lucide-react';
import { Button } from '../ui/button';
import { useToast } from '../ui/use-toast';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../integrations/supabase/client';
import UserRemovalManager from './UserRemovalManager';
import ProfileFixer from './ProfileFixer';
// Import auth helpers
import { sendMagicLink } from '../../lib/sendMagicLink';
import { changeEmail } from '../../lib/changeEmail';
import { resetPassword } from '../../lib/resetPassword';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  department_id: string;
  department?: string;
  roll_number?: string;
  employee_id?: string;
  is_active: boolean;
  created_at: string;
}

interface DepartmentData {
  id: string;
  name: string;
  code: string;
  description?: string;
  is_active: boolean;
}

// Simple Modal dialog
const Modal: React.FC<{ open: boolean, onClose: () => void, title: string, children: React.ReactNode }> = ({ open, onClose, title, children }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
        <button className="absolute top-2 right-2 text-xl text-gray-400 hover:text-gray-700" onClick={onClose}>&times;</button>
        <h3 className="text-lg font-semibold mb-4">{title}</h3>
        <div>{children}</div>
      </div>
    </div>
  );
};

const EnhancedUserManagement: React.FC = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserProfile[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0 });
  const [departments, setDepartments] = useState<DepartmentData[]>([]);
  const { toast } = useToast();

  // Modal state
  const [modal, setModal] = useState<null | {
    type: 'magic-link' | 'change-email' | 'reset-password',
    user: UserProfile
  }>(null);

  // For change email
  const [newEmail, setNewEmail] = useState('');
  // Status message for modal actions
  const [actionStatus, setActionStatus] = useState('');

  const roles = ['student', 'hod', 'principal', 'admin'];

  useEffect(() => {
    loadUsers();
    loadDepartments();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, selectedRole, selectedDepartment]);

  const loadDepartments = async () => {
    try {
      const { data, error } = await supabase
        .from('departments')
        .select('*')
        .eq('is_active', true);

      if (error) {
        setDepartments([
          { id: 'cse-uuid', name: 'Computer Science Engineering', code: 'CSE', is_active: true },
          { id: 'ece-uuid', name: 'Electronics & Communication', code: 'ECE', is_active: true },
          { id: 'mech-uuid', name: 'Mechanical Engineering', code: 'MECH', is_active: true },
          { id: 'civil-uuid', name: 'Civil Engineering', code: 'CIVIL', is_active: true },
          { id: 'eee-uuid', name: 'Electrical Engineering', code: 'EEE', is_active: true },
          { id: 'admin-uuid', name: 'Administration', code: 'ADMIN', is_active: true }
        ]);
        return;
      }
      setDepartments(data || []);
    } catch (error) {
      //
    }
  };

  const loadUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      const usersData = data || [];
      setUsers(usersData);

      const total = usersData.length;
      const active = usersData.filter(u => u.is_active).length;
      setStats({ total, active, inactive: total - active });
    } catch (error) {
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
    if (selectedDepartment !== 'all') {
      filtered = filtered.filter(user => user.department_id === selectedDepartment);
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
      case 'hod':
        return <Building className="w-4 h-4" />;
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

  const getDepartmentName = (deptId: string) => {
    const dept = departments.find(d => d.id === deptId);
    return dept ? dept.name : deptId;
  };

  const handleUserRemoved = () => {
    loadUsers(); // Refresh the users list after removal
  };

  const handleAuthAction = async () => {
    if (!modal) return;
    setActionStatus('Processing...');
    if (modal.type === 'magic-link') {
      const error = await sendMagicLink(modal.user.email);
      if (error) setActionStatus("Failed: " + error.message);
      else setActionStatus("Magic link sent!");
    } else if (modal.type === 'change-email') {
      if (!newEmail) {
        setActionStatus('Please enter a new email address.');
        return;
      }
      const error = await changeEmail(newEmail);
      if (error) setActionStatus("Failed: " + error.message);
      else setActionStatus("Change email request sent! (Confirm via email)");
    } else if (modal.type === 'reset-password') {
      const error = await resetPassword(modal.user.email);
      if (error) setActionStatus("Failed: " + error.message);
      else setActionStatus("Reset password email sent!");
    }
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
        <h3 className="text-lg font-semibold text-gray-800">Enhanced User Management</h3>
        <div className="flex space-x-4 text-sm text-gray-600">
          <span>Total: {stats.total}</span>
          <span>Active: {stats.active}</span>
          <span>Inactive: {stats.inactive}</span>
        </div>
      </div>

      {/* Profile Fixer Component */}
      <ProfileFixer />

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
        <select
          value={selectedDepartment}
          onChange={(e) => setSelectedDepartment(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Departments</option>
          {departments.map(dept => (
            <option key={dept.id} value={dept.id}>
              {dept.name} ({dept.code})
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
                    <div>
                      <div className="font-medium">{getDepartmentName(user.department_id)}</div>
                      <div className="text-xs text-gray-500">{user.department_id}</div>
                    </div>
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
                    <div className="flex flex-col gap-2">
                      {/* Admin action buttons */}
                      <div className="flex gap-1 flex-wrap">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleUserStatus(user.id, user.is_active)}
                          className={user.is_active ? 'text-red-600 hover:text-red-800' : 'text-green-600 hover:text-green-800'}
                        >
                          {user.is_active ? 'Deactivate' : 'Activate'}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => { setModal({ type: 'magic-link', user }); setActionStatus(''); }}
                          title="Send Magic Link"
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Mail className="w-4 h-4 mr-1" /> Magic Link
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => { setModal({ type: 'change-email', user }); setActionStatus(''); setNewEmail(''); }}
                          title="Change Email"
                          className="text-purple-600 hover:text-purple-800"
                        >
                          <MailPlus className="w-4 h-4 mr-1" /> Change Email
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => { setModal({ type: 'reset-password', user }); setActionStatus(''); }}
                          title="Reset Password"
                          className="text-yellow-600 hover:text-yellow-800"
                        >
                          <KeyRound className="w-4 h-4 mr-1" /> Reset Password
                        </Button>
                      </div>
                      {/* User Removal Manager Component */}
                      <div className="mt-2">
                        <UserRemovalManager
                          userId={user.id}
                          userName={user.name || user.email}
                          userEmail={user.email}
                          onUserRemoved={handleUserRemoved}
                        />
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">
              {searchTerm || selectedRole !== 'all' || selectedDepartment !== 'all' 
                ? 'No users match your filters' 
                : 'No users found'}
            </p>
          </div>
        )}
      </div>

      {/* Modal dialog for user actions */}
      <Modal
        open={!!modal}
        onClose={() => setModal(null)}
        title={
          modal
            ? modal.type === 'magic-link'
              ? `Send Magic Link to ${modal.user.name || modal.user.email}`
              : modal.type === 'change-email'
                ? `Change Email for ${modal.user.name || modal.user.email}`
                : `Reset Password for ${modal.user.name || modal.user.email}`
            : ''
        }
      >
        {modal && (
          <div>
            {modal.type === 'magic-link' && (
              <div>
                <p>
                  Send a magic login link to <span className="font-semibold">{modal.user.email}</span>?
                </p>
                <Button
                  className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
                  onClick={handleAuthAction}
                >
                  Send Magic Link
                </Button>
              </div>
            )}
            {modal.type === 'change-email' && (
              <div>
                <p>
                  Change email for <span className="font-semibold">{modal.user.name || modal.user.email}</span>.<br />
                  Enter new email address below:
                </p>
                <input
                  type="email"
                  className="border px-3 py-2 rounded w-full my-4"
                  placeholder="New email address"
                  value={newEmail}
                  onChange={e => setNewEmail(e.target.value)}
                />
                <Button
                  className="bg-purple-600 text-white px-4 py-2 rounded"
                  onClick={handleAuthAction}
                  disabled={!newEmail}
                >
                  Change Email
                </Button>
              </div>
            )}
            {modal.type === 'reset-password' && (
              <div>
                <p>
                  Send password reset email to <span className="font-semibold">{modal.user.email}</span>?
                </p>
                <Button
                  className="mt-4 bg-yellow-600 text-white px-4 py-2 rounded"
                  onClick={handleAuthAction}
                >
                  Send Reset Password Email
                </Button>
              </div>
            )}
            {actionStatus && <div className="mt-4 text-sm text-gray-700">{actionStatus}</div>}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default EnhancedUserManagement;
