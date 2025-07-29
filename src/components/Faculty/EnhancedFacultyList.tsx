
import React, { useState, useEffect } from 'react';
import { supabase } from '../../integrations/supabase/client';
import { useAuth } from '../../contexts/SupabaseAuthContext';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Search, Filter, Users, Mail, Phone, Calendar, Building, Eye, Download, UserCheck, Clock } from 'lucide-react';
import { toast } from 'sonner';
import FacultyAttendanceModal from './FacultyAttendanceModal';

interface EnhancedFacultyMember {
  faculty_id: string;
  user_id: string;
  name: string;
  email: string;
  employee_code: string;
  designation: string;
  department_name: string;
  department_code: string;
  joining_date: string;
  phone: string | null;
  gender: string | null;
  age: number | null;
  years_of_experience: number | null;
  is_active: boolean;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  current_address: string | null;
  blood_group: string | null;
  marital_status: string | null;
  total_attendance_days: number;
  present_days: number;
  absent_days: number;
  attendance_percentage: number;
}

interface EnhancedFacultyListProps {
  onViewDetails: (faculty: EnhancedFacultyMember) => void;
}

const EnhancedFacultyList: React.FC<EnhancedFacultyListProps> = ({ onViewDetails }) => {
  const { user } = useAuth();
  const [facultyList, setFacultyList] = useState<EnhancedFacultyMember[]>([]);
  const [filteredFaculty, setFilteredFaculty] = useState<EnhancedFacultyMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [genderFilter, setGenderFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [ageFilter, setAgeFilter] = useState<string>('all');
  const [departments, setDepartments] = useState<any[]>([]);
  const [selectedFaculty, setSelectedFaculty] = useState<EnhancedFacultyMember | null>(null);
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);

  useEffect(() => {
    fetchFacultyMembers();
    fetchDepartments();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [facultyList, searchTerm, departmentFilter, genderFilter, statusFilter, ageFilter]);

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
      
      const { data, error } = await supabase.rpc('get_faculty_with_details', {
        p_user_id: user?.id
      });

      if (error) {
        console.error('Error fetching faculty:', error);
        toast.error('Failed to fetch faculty members');
        return;
      }

      const mappedData: EnhancedFacultyMember[] = (data || []).map((faculty: any) => ({
        faculty_id: faculty.faculty_id,
        user_id: faculty.user_id,
        name: faculty.name || 'N/A',
        email: faculty.email || 'N/A',
        employee_code: faculty.employee_code || 'N/A',
        designation: faculty.designation || 'N/A',
        department_name: faculty.department_name || 'Unknown Department',
        department_code: faculty.department_code || 'N/A',
        joining_date: faculty.joining_date || '',
        phone: faculty.phone,
        gender: faculty.gender,
        age: faculty.age,
        years_of_experience: faculty.years_of_experience,
        is_active: faculty.is_active || false,
        emergency_contact_name: faculty.emergency_contact_name,
        emergency_contact_phone: faculty.emergency_contact_phone,
        current_address: faculty.current_address,
        blood_group: faculty.blood_group,
        marital_status: faculty.marital_status,
        total_attendance_days: faculty.total_attendance_days || 0,
        present_days: faculty.present_days || 0,
        absent_days: faculty.absent_days || 0,
        attendance_percentage: faculty.attendance_percentage || 0
      }));

      setFacultyList(mappedData);
    } catch (error) {
      console.error('Error fetching faculty members:', error);
      toast.error('Failed to fetch faculty members');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = facultyList.filter(faculty => {
      const matchesSearch = 
        faculty.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        faculty.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        faculty.employee_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        faculty.department_name.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesDepartment = departmentFilter === 'all' || 
        faculty.department_name === departments.find(d => d.id === departmentFilter)?.name;
      
      const matchesGender = genderFilter === 'all' || faculty.gender === genderFilter;
      
      const matchesStatus = statusFilter === 'all' || 
        (statusFilter === 'active' && faculty.is_active) ||
        (statusFilter === 'inactive' && !faculty.is_active);

      const matchesAge = ageFilter === 'all' || 
        (ageFilter === '20-30' && faculty.age && faculty.age <= 30) ||
        (ageFilter === '31-40' && faculty.age && faculty.age > 30 && faculty.age <= 40) ||
        (ageFilter === '41-50' && faculty.age && faculty.age > 40 && faculty.age <= 50) ||
        (ageFilter === '51-60' && faculty.age && faculty.age > 50 && faculty.age <= 60) ||
        (ageFilter === '60+' && faculty.age && faculty.age > 60);

      return matchesSearch && matchesDepartment && matchesGender && matchesStatus && matchesAge;
    });

    setFilteredFaculty(filtered);
  };

  const handleViewAttendance = (faculty: EnhancedFacultyMember) => {
    setSelectedFaculty(faculty);
    setShowAttendanceModal(true);
  };

  const exportToCSV = () => {
    const csvData = filteredFaculty.map(faculty => ({
      'Name': faculty.name,
      'Employee Code': faculty.employee_code,
      'Department': faculty.department_name,
      'Designation': faculty.designation,
      'Email': faculty.email,
      'Phone': faculty.phone || 'N/A',
      'Gender': faculty.gender || 'N/A',
      'Age': faculty.age || 'N/A',
      'Experience (Years)': faculty.years_of_experience || 'N/A',
      'Joining Date': faculty.joining_date ? new Date(faculty.joining_date).toLocaleDateString() : 'N/A',
      'Status': faculty.is_active ? 'Active' : 'Inactive',
      'Attendance %': faculty.attendance_percentage.toFixed(1)
    }));

    const csvContent = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `faculty-list-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const getAttendanceColor = (percentage: number) => {
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 75) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Search & Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            <div className="xl:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search faculty..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Department" />
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

            <Select value={genderFilter} onValueChange={setGenderFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Genders</SelectItem>
                <SelectItem value="Male">Male</SelectItem>
                <SelectItem value="Female">Female</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>

            <Select value={ageFilter} onValueChange={setAgeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Age Group" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Ages</SelectItem>
                <SelectItem value="20-30">20-30 years</SelectItem>
                <SelectItem value="31-40">31-40 years</SelectItem>
                <SelectItem value="41-50">41-50 years</SelectItem>
                <SelectItem value="51-60">51-60 years</SelectItem>
                <SelectItem value="60+">60+ years</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
              
              <Button variant="outline" onClick={exportToCSV}>
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Summary */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between text-sm">
            <span>
              Showing {filteredFaculty.length} of {facultyList.length} faculty members
            </span>
            <div className="flex gap-4">
              <span>Active: {filteredFaculty.filter(f => f.is_active).length}</span>
              <span>Inactive: {filteredFaculty.filter(f => !f.is_active).length}</span>
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
                No faculty members found matching your criteria
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
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-3">
                          {faculty.designation} • {faculty.department_name}
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
                            <Calendar className="h-4 w-4 flex-shrink-0" />
                            <span>Joined: {formatDate(faculty.joining_date)}</span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <UserCheck className="h-4 w-4 flex-shrink-0" />
                            <span>ID: {faculty.employee_code}</span>
                          </div>
                          
                          {faculty.gender && (
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4 flex-shrink-0" />
                              <span>{faculty.gender}</span>
                            </div>
                          )}
                          
                          {faculty.age && (
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 flex-shrink-0" />
                              <span>Age: {faculty.age}</span>
                            </div>
                          )}
                          
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 flex-shrink-0" />
                            <span className={getAttendanceColor(faculty.attendance_percentage)}>
                              Attendance: {faculty.attendance_percentage.toFixed(1)}%
                            </span>
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
                        onClick={() => handleViewAttendance(faculty)}
                      >
                        <Clock className="h-4 w-4 mr-1" />
                        Attendance
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onViewDetails(faculty)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Details
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Attendance Modal */}
      {selectedFaculty && (
        <FacultyAttendanceModal
          isOpen={showAttendanceModal}
          onClose={() => setShowAttendanceModal(false)}
          faculty={selectedFaculty}
        />
      )}
    </div>
  );
};

export default EnhancedFacultyList;
