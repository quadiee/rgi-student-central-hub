
import React, { useState, useEffect } from 'react';
import { useFacultyAttendance } from '../../hooks/useFacultyAttendance';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Search, Filter, Eye, Calendar, Phone, Mail, MapPin } from 'lucide-react';
import { useIsMobile } from '../../hooks/use-mobile';

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

const EnhancedFacultyList: React.FC<EnhancedFacultyListProps> = ({
  onViewDetails
}) => {
  const { enhancedFacultyList, loading, fetchEnhancedFacultyList } = useFacultyAttendance();
  const isMobile = useIsMobile();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [genderFilter, setGenderFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [filteredFaculty, setFilteredFaculty] = useState<EnhancedFacultyMember[]>([]);

  useEffect(() => {
    fetchEnhancedFacultyList();
  }, [fetchEnhancedFacultyList]);

  useEffect(() => {
    let filtered = enhancedFacultyList;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(faculty => 
        faculty.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        faculty.employee_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        faculty.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Department filter
    if (departmentFilter !== 'all') {
      filtered = filtered.filter(faculty => faculty.department_name === departmentFilter);
    }

    // Gender filter
    if (genderFilter !== 'all') {
      filtered = filtered.filter(faculty => faculty.gender === genderFilter);
    }

    // Status filter
    if (statusFilter !== 'all') {
      const isActive = statusFilter === 'active';
      filtered = filtered.filter(faculty => faculty.is_active === isActive);
    }

    setFilteredFaculty(filtered);
  }, [enhancedFacultyList, searchTerm, departmentFilter, genderFilter, statusFilter]);

  const getUniqueValues = (key: keyof EnhancedFacultyMember) => {
    return Array.from(new Set(enhancedFacultyList.map(faculty => faculty[key]).filter(Boolean)));
  };

  const getAttendanceColor = (percentage: number) => {
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 75) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search faculty by name, employee code, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex gap-2">
          <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              {getUniqueValues('department_name').map(dept => (
                <SelectItem key={dept} value={dept as string}>{dept}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={genderFilter} onValueChange={setGenderFilter}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Genders</SelectItem>
              <SelectItem value="Male">Male</SelectItem>
              <SelectItem value="Female">Female</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
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

      {/* Faculty Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{filteredFaculty.length}</p>
              <p className="text-sm text-muted-foreground">Total Faculty</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {filteredFaculty.filter(f => f.is_active).length}
              </p>
              <p className="text-sm text-muted-foreground">Active</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">
                {filteredFaculty.filter(f => f.gender === 'Male').length}
              </p>
              <p className="text-sm text-muted-foreground">Male</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-pink-600">
                {filteredFaculty.filter(f => f.gender === 'Female').length}
              </p>
              <p className="text-sm text-muted-foreground">Female</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Faculty List */}
      <div className="grid grid-cols-1 gap-4">
        {filteredFaculty.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">No faculty members found matching your criteria.</p>
            </CardContent>
          </Card>
        ) : (
          filteredFaculty.map((faculty) => (
            <Card key={faculty.faculty_id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold">{faculty.name}</h3>
                      <Badge variant={faculty.is_active ? 'default' : 'secondary'}>
                        {faculty.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                      {faculty.gender && (
                        <Badge variant="outline">{faculty.gender}</Badge>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Employee ID:</span>
                        {faculty.employee_code}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Designation:</span>
                        {faculty.designation}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        {faculty.department_name} ({faculty.department_code})
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        {faculty.email}
                      </div>
                      
                      {faculty.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          {faculty.phone}
                        </div>
                      )}
                      
                      {faculty.age && (
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Age:</span>
                          {faculty.age} years
                        </div>
                      )}
                      
                      {faculty.years_of_experience && (
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Experience:</span>
                          {faculty.years_of_experience} years
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-3">
                    <div className="text-center">
                      <p className={`text-2xl font-bold ${getAttendanceColor(faculty.attendance_percentage)}`}>
                        {faculty.attendance_percentage.toFixed(1)}%
                      </p>
                      <p className="text-xs text-muted-foreground">Attendance</p>
                      <p className="text-xs text-muted-foreground">
                        {faculty.present_days}/{faculty.total_attendance_days} days
                      </p>
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onViewDetails(faculty)}
                      className="gap-2"
                    >
                      <Eye className="h-4 w-4" />
                      View Details
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default EnhancedFacultyList;
