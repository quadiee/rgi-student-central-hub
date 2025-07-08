
import React, { useState } from 'react';
import { Users, UserCheck, UserX, Trash2, Mail, Download } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { useToast } from '../ui/use-toast';
import { supabase } from '../../integrations/supabase/client';

interface BulkUserOperationsProps {
  onDataChange: () => void;
}

const BulkUserOperations: React.FC<BulkUserOperationsProps> = ({ onDataChange }) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [selectedOperation, setSelectedOperation] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  const handleBulkOperation = async () => {
    if (!selectedOperation) {
      toast({
        title: "Error",
        description: "Please select an operation",
        variant: "destructive"
      });
      return;
    }

    const confirmation = confirm(
      `Are you sure you want to perform this bulk operation? This action cannot be undone.`
    );

    if (!confirmation) return;

    setLoading(true);

    try {
      let query = supabase.from('profiles').select('id');

      // Apply filters
      if (selectedRole) {
        query = query.eq('role', selectedRole as any);
      }
      if (selectedStatus) {
        query = query.eq('is_active', selectedStatus === 'active');
      }

      const { data: users, error: fetchError } = await query;
      if (fetchError) throw fetchError;

      if (!users || users.length === 0) {
        toast({
          title: "No Users Found",
          description: "No users match the selected criteria",
        });
        setLoading(false);
        return;
      }

      const userIds = users.map(user => user.id);
      let updateData: any = {};

      switch (selectedOperation) {
        case 'activate':
          updateData.is_active = true;
          break;
        case 'deactivate':
          updateData.is_active = false;
          break;
        case 'delete':
          const { error: deleteError } = await supabase
            .from('profiles')
            .delete()
            .in('id', userIds);
          
          if (deleteError) throw deleteError;
          
          toast({
            title: "Success",
            description: `${userIds.length} users deleted successfully`,
          });
          
          onDataChange();
          setLoading(false);
          return;
      }

      if (Object.keys(updateData).length > 0) {
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            ...updateData,
            updated_at: new Date().toISOString()
          })
          .in('id', userIds);

        if (updateError) throw updateError;

        toast({
          title: "Success",
          description: `${userIds.length} users updated successfully`,
        });
      }

      onDataChange();
    } catch (error: any) {
      console.error('Error performing bulk operation:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to perform bulk operation",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExportUsers = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('profiles')
        .select(`
          name,
          email,
          role,
          roll_number,
          employee_id,
          phone,
          is_active,
          created_at,
          departments:department_id (name, code)
        `);

      // Apply filters
      if (selectedRole) {
        query = query.eq('role', selectedRole as any);
      }
      if (selectedStatus) {
        query = query.eq('is_active', selectedStatus === 'active');
      }

      const { data, error } = await query;
      if (error) throw error;

      // Convert to CSV
      const headers = ['Name', 'Email', 'Role', 'Roll Number', 'Employee ID', 'Phone', 'Department', 'Status', 'Created At'];
      const csvContent = [
        headers.join(','),
        ...data.map(user => [
          user.name,
          user.email,
          user.role,
          user.roll_number || '',
          user.employee_id || '',
          user.phone || '',
          user.departments?.name || '',
          user.is_active ? 'Active' : 'Inactive',
          new Date(user.created_at).toLocaleDateString()
        ].join(','))
      ].join('\n');

      // Download CSV
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `users_export_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);

      toast({
        title: "Success",
        description: "Users exported successfully",
      });
    } catch (error: any) {
      console.error('Error exporting users:', error);
      toast({
        title: "Error",
        description: "Failed to export users",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Bulk User Operations
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Filters */}
          <div>
            <h3 className="text-lg font-medium mb-4">Select Users by Criteria</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Role Filter</label>
                <Select value={selectedRole} onValueChange={setSelectedRole}>
                  <SelectTrigger>
                    <SelectValue placeholder="All roles" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Roles</SelectItem>
                    <SelectItem value="student">Students</SelectItem>
                    <SelectItem value="faculty">Faculty</SelectItem>
                    <SelectItem value="hod">HODs</SelectItem>
                    <SelectItem value="admin">Admins</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Status Filter</label>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Statuses</SelectItem>
                    <SelectItem value="active">Active Only</SelectItem>
                    <SelectItem value="inactive">Inactive Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Operation</label>
                <Select value={selectedOperation} onValueChange={setSelectedOperation}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select operation" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="activate">Activate Users</SelectItem>
                    <SelectItem value="deactivate">Deactivate Users</SelectItem>
                    <SelectItem value="delete">Delete Users</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Applied Filters */}
          {(selectedRole || selectedStatus) && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-medium">Applied Filters:</span>
              {selectedRole && (
                <Badge variant="secondary">
                  Role: {selectedRole}
                </Badge>
              )}
              {selectedStatus && (
                <Badge variant="secondary">
                  Status: {selectedStatus}
                </Badge>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-4">
            <Button
              onClick={handleBulkOperation}
              disabled={loading || !selectedOperation}
              variant={selectedOperation === 'delete' ? 'destructive' : 'default'}
              className="flex items-center gap-2"
            >
              {selectedOperation === 'activate' && <UserCheck className="w-4 h-4" />}
              {selectedOperation === 'deactivate' && <UserX className="w-4 h-4" />}
              {selectedOperation === 'delete' && <Trash2 className="w-4 h-4" />}
              {loading ? 'Processing...' : 'Execute Operation'}
            </Button>

            <Button
              onClick={handleExportUsers}
              disabled={loading}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export Filtered Users
            </Button>
          </div>

          {/* Warning */}
          {selectedOperation === 'delete' && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 text-red-800">
                <Trash2 className="w-4 h-4" />
                <span className="font-medium">Warning: Permanent Action</span>
              </div>
              <p className="text-red-600 text-sm mt-1">
                Deleting users will permanently remove them from the system. This action cannot be undone.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6 text-center">
            <UserCheck className="w-8 h-8 mx-auto mb-2 text-green-600" />
            <h3 className="font-medium mb-2">Activate All Inactive Students</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedRole('student');
                setSelectedStatus('inactive');
                setSelectedOperation('activate');
              }}
            >
              Setup & Execute
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <Mail className="w-8 h-8 mx-auto mb-2 text-blue-600" />
            <h3 className="font-medium mb-2">Export All Users</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedRole('');
                setSelectedStatus('');
                handleExportUsers();
              }}
            >
              Export CSV
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <UserX className="w-8 h-8 mx-auto mb-2 text-orange-600" />
            <h3 className="font-medium mb-2">Deactivate Inactive Users</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedRole('');
                setSelectedStatus('active');
                setSelectedOperation('deactivate');
              }}
            >
              Setup Only
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BulkUserOperations;
