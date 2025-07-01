import React, { useState, useEffect } from 'react';
import { Shield, Users } from 'lucide-react';
import { Button } from '../ui/button';
import { useToast } from '../ui/use-toast';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../integrations/supabase/client';

interface Role {
  id: string;
  name: string;
  description: string;
  is_active: boolean;
}

interface Permission {
  id: string;
  name: string;
  description: string;
  resource_type: string;
  action_type: string;
}

interface RolePermission {
  role_id: string;
  permission_id: string;
}

const UserRoleManager: React.FC = () => {
  const { user } = useAuth();
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [rolePermissions, setRolePermissions] = useState<RolePermission[]>([]);
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      const [rolesResponse, permissionsResponse, rolePermissionsResponse] = await Promise.all([
        supabase.from('roles').select('*').eq('is_active', true),
        supabase.from('permissions').select('*'),
        supabase.from('role_permissions').select('*')
      ]);

      if (rolesResponse.error) throw rolesResponse.error;
      if (permissionsResponse.error) throw permissionsResponse.error;
      if (rolePermissionsResponse.error) throw rolePermissionsResponse.error;

      setRoles(rolesResponse.data || []);
      setPermissions(permissionsResponse.data || []);
      setRolePermissions(rolePermissionsResponse.data || []);

      if (rolesResponse.data && rolesResponse.data.length > 0) {
        setSelectedRole(rolesResponse.data[0].id);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Error",
        description: "Failed to load roles and permissions",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const togglePermission = async (permissionId: string) => {
    if (!selectedRole) return;

    const existingRolePermission = rolePermissions.find(
      rp => rp.role_id === selectedRole && rp.permission_id === permissionId
    );

    try {
      if (existingRolePermission) {
        // Remove permission
        const { error } = await supabase
          .from('role_permissions')
          .delete()
          .eq('role_id', selectedRole)
          .eq('permission_id', permissionId);

        if (error) throw error;

        setRolePermissions(prev => 
          prev.filter(rp => !(rp.role_id === selectedRole && rp.permission_id === permissionId))
        );
      } else {
        // Add permission
        const { error } = await supabase
          .from('role_permissions')
          .insert({ role_id: selectedRole, permission_id: permissionId });

        if (error) throw error;

        setRolePermissions(prev => [...prev, { role_id: selectedRole, permission_id: permissionId }]);
      }

      toast({
        title: "Success",
        description: "Permission updated successfully",
      });
    } catch (error) {
      console.error('Error updating permission:', error);
      toast({
        title: "Error",
        description: "Failed to update permission",
        variant: "destructive"
      });
    }
  };

  const hasRolePermission = (permissionId: string): boolean => {
    return rolePermissions.some(rp => rp.role_id === selectedRole && rp.permission_id === permissionId);
  };

  const groupedPermissions = permissions.reduce((acc, permission) => {
    const key = permission.resource_type;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(permission);
    return acc;
  }, {} as Record<string, Permission[]>);

  // Only check if user is admin (case-insensitive)
  const isAdmin = user?.role?.toLowerCase() === 'admin';

  // NO extra permission checks here; only admin role is required
  if (!isAdmin) {
    return (
      <div className="text-center py-8">
        <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">You don't have permission to manage roles.</p>
      </div>
    );
  }

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
        <h3 className="text-lg font-semibold text-gray-800">Role & Permission Management</h3>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Roles List */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h4 className="text-md font-semibold text-gray-800 mb-4 flex items-center">
            <Shield className="w-5 h-5 mr-2" />
            Roles
          </h4>
          <div className="space-y-2">
            {roles.map((role) => (
              <button
                key={role.id}
                onClick={() => setSelectedRole(role.id)}
                className={`w-full text-left p-3 rounded-lg transition-colors ${
                  selectedRole === role.id
                    ? 'bg-blue-100 text-blue-700 border-blue-200'
                    : 'hover:bg-gray-50 border-gray-200'
                } border`}
              >
                <div className="font-medium capitalize">{role.name}</div>
                <div className="text-sm text-gray-500">{role.description}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Permissions */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-6">
          <h4 className="text-md font-semibold text-gray-800 mb-4 flex items-center">
            <Users className="w-5 h-5 mr-2" />
            Permissions for {roles.find(r => r.id === selectedRole)?.name || 'Selected Role'}
          </h4>
          
          {selectedRole ? (
            <div className="space-y-6">
              {Object.entries(groupedPermissions).map(([resourceType, perms]) => (
                <div key={resourceType} className="border rounded-lg p-4">
                  <h5 className="text-sm font-semibold text-gray-700 mb-3 capitalize">
                    {resourceType.replace('_', ' ')} Permissions
                  </h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {perms.map((permission) => (
                      <div
                        key={permission.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-900">
                            {permission.name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </div>
                          <div className="text-xs text-gray-500">{permission.description}</div>
                        </div>
                        <button
                          onClick={() => togglePermission(permission.id)}
                          className={`ml-3 w-12 h-6 rounded-full transition-colors relative ${
                            hasRolePermission(permission.id)
                              ? 'bg-blue-600'
                              : 'bg-gray-300'
                          }`}
                        >
                          <div
                            className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${
                              hasRolePermission(permission.id)
                                ? 'transform translate-x-7'
                                : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              Select a role to manage its permissions
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserRoleManager;