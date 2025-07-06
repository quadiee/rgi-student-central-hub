
import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Users, Building, Save, X } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { useAuth } from '../../contexts/SupabaseAuthContext';
import { useToast } from '../ui/use-toast';
import { supabase } from '../../integrations/supabase/client';
import { useIsMobile } from '../../hooks/use-mobile';

interface Department {
  id: string;
  name: string;
  code: string;
  description?: string;
  hod_id?: string;
  is_active: boolean;
  created_at: string;
  hod_name?: string;
  student_count?: number;
}

const DepartmentManagement: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    hod_id: ''
  });

  useEffect(() => {
    if (user) {
      fetchDepartments();
    }
  }, [user]);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('departments')
        .select(`
          *,
          profiles:hod_id(name)
        `)
        .order('name');

      if (error) throw error;

      // Get student counts for each department
      const departmentsWithCounts = await Promise.all(
        (data || []).map(async (dept) => {
          const { count } = await supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true })
            .eq('department_id', dept.id)
            .eq('role', 'student')
            .eq('is_active', true);

          return {
            ...dept,
            hod_name: dept.profiles?.name || 'Not Assigned',
            student_count: count || 0
          };
        })
      );

      setDepartments(departmentsWithCounts);
    } catch (error) {
      console.error('Error fetching departments:', error);
      toast({
        title: "Error",
        description: "Failed to fetch departments",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.name || !formData.code) {
      toast({
        title: "Error",
        description: "Name and code are required",
        variant: "destructive"
      });
      return;
    }

    try {
      if (editingId) {
        // Update existing department
        const { error } = await supabase
          .from('departments')
          .update({
            name: formData.name,
            code: formData.code.toUpperCase(),
            description: formData.description || null,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingId);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Department updated successfully"
        });
      } else {
        // Create new department
        const { error } = await supabase
          .from('departments')
          .insert({
            name: formData.name,
            code: formData.code.toUpperCase(),
            description: formData.description || null,
            is_active: true
          });

        if (error) throw error;

        toast({
          title: "Success",
          description: "Department created successfully"
        });
      }

      setFormData({ name: '', code: '', description: '', hod_id: '' });
      setEditingId(null);
      setShowAddForm(false);
      fetchDepartments();
    } catch (error) {
      console.error('Error saving department:', error);
      toast({
        title: "Error",
        description: "Failed to save department",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (dept: Department) => {
    setFormData({
      name: dept.name,
      code: dept.code,
      description: dept.description || '',
      hod_id: dept.hod_id || ''
    });
    setEditingId(dept.id);
    setShowAddForm(true);
  };

  const handleDelete = async (deptId: string) => {
    if (!confirm('Are you sure you want to deactivate this department?')) return;

    try {
      const { error } = await supabase
        .from('departments')
        .update({ is_active: false })
        .eq('id', deptId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Department deactivated successfully"
      });

      fetchDepartments();
    } catch (error) {
      console.error('Error deactivating department:', error);
      toast({
        title: "Error",
        description: "Failed to deactivate department",
        variant: "destructive"
      });
    }
  };

  const cancelEdit = () => {
    setFormData({ name: '', code: '', description: '', hod_id: '' });
    setEditingId(null);
    setShowAddForm(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading departments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold text-gray-800`}>
          Department Management
        </h2>
        <Button 
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Department</span>
        </Button>
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingId ? 'Edit Department' : 'Add New Department'}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-2'} gap-4`}>
              <div>
                <label className="block text-sm font-medium mb-2">Department Name *</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="e.g., Computer Science Engineering"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Department Code *</label>
                <Input
                  value={formData.code}
                  onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                  placeholder="e.g., CSE"
                  maxLength={10}
                />
              </div>
              <div className={isMobile ? 'col-span-1' : 'col-span-2'}>
                <label className="block text-sm font-medium mb-2">Description</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Brief description of the department..."
                  rows={3}
                />
              </div>
            </div>
            <div className="flex space-x-2 mt-4">
              <Button onClick={handleSave} className="flex items-center space-x-2">
                <Save className="w-4 h-4" />
                <span>{editingId ? 'Update' : 'Create'}</span>
              </Button>
              <Button variant="outline" onClick={cancelEdit} className="flex items-center space-x-2">
                <X className="w-4 h-4" />
                <span>Cancel</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Departments List */}
      <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-2'} gap-6`}>
        {departments.map((dept) => (
          <Card key={dept.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Building className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900">{dept.name}</h3>
                    <p className="text-sm text-gray-600">{dept.code}</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(dept)}
                  >
                    <Edit className="w-3 h-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-red-600 hover:text-red-700"
                    onClick={() => handleDelete(dept.id)}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>

              {dept.description && (
                <p className="text-sm text-gray-600 mb-4">{dept.description}</p>
              )}

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-600">Students:</span>
                  <span className="font-medium">{dept.student_count}</span>
                </div>
                <div>
                  <span className="text-gray-600">HOD:</span>
                  <span className="font-medium ml-1">{dept.hod_name}</span>
                </div>
                <div>
                  <span className="text-gray-600">Status:</span>
                  <span className={`ml-1 px-2 py-1 rounded-full text-xs font-medium ${
                    dept.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {dept.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Created:</span>
                  <span className="font-medium ml-1">
                    {new Date(dept.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {departments.length === 0 && !loading && (
        <div className="text-center py-12">
          <Building className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No departments found. Create your first department!</p>
        </div>
      )}
    </div>
  );
};

export default DepartmentManagement;
