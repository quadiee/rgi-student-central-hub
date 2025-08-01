
import React, { useState, useEffect } from 'react';
import { supabase } from '../../integrations/supabase/client';
import { useAuth } from '../../contexts/SupabaseAuthContext';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Search, Filter, Users, Mail, Phone, Calendar, Building, UserPlus } from 'lucide-react';
import { toast } from 'sonner';

interface FacultyMember {
  faculty_id: string;
  user_id: string | null;
  name: string;
  email: string;
  employee_code: string;
  designation: string;
  department_name: string;
  joining_date: string;
  phone: string | null;
  is_active: boolean;
}

interface FacultyListManagementProps {
  onEditFaculty: (faculty: FacultyMember) => void;
  onViewDetails: (faculty: FacultyMember) => void;
}

const FacultyListManagement: React.FC<FacultyListManagementProps> = ({
  onEditFaculty,
  onViewDetails
}) => {
  const { user } = useAuth();
  const [facultyList, setFacultyList] = useState<FacultyMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [departments, setDepartments] = useState<any[]>([]);

  useEffect(() => {
    fetchFacultyMembers();
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const { data, error } = await supabase
        .from('departments')
        .select('id, name, code')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setDepartments(data || []);
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  const fetchFacultyMembers = async () => {
    try {
      setLoading(true);
      
      // Use the updated database function to get real faculty data
      const { data, error } = await supabase.rpc('get_faculty_with_details', {
        p_user_id: user?.id
      });

      if (error) {
        console.error('Error fetching faculty:', error);
        toast.error('Failed to fetch faculty members');
        return;
      }

      // Map the data to our interface
      const mappedData: FacultyMember[] = (data || []).map((faculty: any) => ({
        faculty_id: faculty.faculty_id,
        user_id: faculty.user_id,
        name: faculty.name || 'N/A',
        email: faculty.email || 'N/A',
        employee_code: faculty.employee_code || 'N/A',
        designation: faculty.designation || 'N/A',
        department_name: faculty.department_name || 'Unknown Department',
        joining_date: faculty.joining_date || '',
        phone: faculty.phone,
        is_active: faculty.is_active || false
      }));

      setFacultyList(mappedData);
    } catch (error) {
      console.error('Error fetching faculty members:', error);
      toast.error('Failed to fetch faculty members');
    } finally {
      setLoading(false);
    }
  };

  const filteredFaculty = facultyList.filter(faculty => {
    const matchesSearch = 
      faculty.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faculty.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faculty.employee_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faculty.department_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDepartment = departmentFilter === 'all' || 
      faculty.department_name === departments.find(d => d.id === departmentFilter)?.name;
    
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && faculty.is_active) ||
      (statusFilter === 'inactive' && !faculty.is_active);

    return matchesSearch && matchesDepartment && matchesStatus;
  });

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Show empty state if no faculty members exist
  if (facultyList.length === 0) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-12">
            <Users className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Faculty Members Found</h3>
            <p className="text-muted-foreground text-center mb-6 max-w-md">
              There are no faculty members in the system yet. Start by inviting faculty members to join your institution.
            </p>
            <div className="flex gap-2">
              <Button className="gap-2">
                <UserPlus className="h-4 w-4" />
                Invite Faculty Member
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Search & Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by name, email, employee code, or department..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by Department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {departments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Faculty List */}
      <div className="grid gap-4">
        {filteredFaculty.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center p-8">
              <Users className="h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-500 text-center">
                {searchTerm || departmentFilter !== 'all' || statusFilter !== 'all'
                  ? 'No faculty members found matching your criteria'
                  : 'No faculty members found'}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredFaculty.map((faculty) => (
            <Card key={faculty.faculty_id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <Users className="h-6 w-6 text-blue-600" />
                        </div>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-lg text-gray-900 truncate">
                            {faculty.name}
                          </h3>
                          <Badge variant={faculty.is_active ? 'default' : 'secondary'}>
                            {faculty.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                          {!faculty.user_id && (
                            <Badge variant="outline">Pending Activation</Badge>
                          )}
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-2">
                          {faculty.designation}
                        </p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 flex-shrink-0" />
                            <span className="truncate">{faculty.email}</span>
                          </div>
                          
                          {faculty.phone && (
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4 flex-shrink-0" />
                              <span>{faculty.phone}</span>
                            </div>
                          )}
                          
                          <div className="flex items-center gap-2">
                            <Building className="h-4 w-4 flex-shrink-0" />
                            <span className="truncate">{faculty.department_name}</span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 flex-shrink-0" />
                            <span>Joined: {formatDate(faculty.joining_date)}</span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <span className="font-medium">ID:</span>
                            <span>{faculty.employee_code}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex-shrink-0">
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onViewDetails(faculty)}
                      >
                        View Details
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEditFaculty(faculty)}
                      >
                        Edit
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Summary */}
      {filteredFaculty.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>
                Showing {filteredFaculty.length} of {facultyList.length} faculty members
              </span>
              <span>
                Active: {facultyList.filter(f => f.is_active).length} | 
                Inactive: {facultyList.filter(f => !f.is_active).length}
              </span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FacultyListManagement;
