
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { 
  Search, 
  Filter, 
  Users, 
  GraduationCap,
  IndianRupee,
  Award,
  Download,
  Eye,
  Calendar,
  MapPin
} from 'lucide-react';
import { cn } from '../../lib/utils';
import MobileDataCard from './MobileDataCard';
import StudentProfile from '../Students/StudentProfile';
import { supabase } from '../../integrations/supabase/client';
import { useAuth } from '../../contexts/SupabaseAuthContext';
import { useInstitutionalStats } from '../../hooks/useInstitutionalStats';
import { useUserConversion } from '../../hooks/useUserConversion';
import { Student } from '../../types';

interface StudentData {
  id: string;
  name: string;
  email: string;
  roll_number: string;
  year: number;
  semester: number;
  department_id: string;
  department_name: string;
  department_code: string;
  is_active: boolean;
  community?: string;
  first_generation: boolean;
  phone?: string;
  address?: string;
}

interface ChairmanStudentManagementProps {
  className?: string;
}

const ChairmanStudentManagement: React.FC<ChairmanStudentManagementProps> = ({ className }) => {
  const { user } = useAuth();
  const { convertUserProfileToUser } = useUserConversion();
  const { stats: institutionalStats } = useInstitutionalStats();
  const [students, setStudents] = useState<StudentData[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showProfile, setShowProfile] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedYear, setSelectedYear] = useState('all');
  const [departments, setDepartments] = useState<any[]>([]);

  useEffect(() => {
    fetchStudents();
    fetchDepartments();
  }, [user]);

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

  const fetchStudents = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          name,
          email,
          roll_number,
          year,
          semester,
          department_id,
          is_active,
          community,
          first_generation,
          phone,
          address,
          departments:department_id (
            name,
            code
          )
        `)
        .eq('role', 'student')
        .eq('is_active', true);

      if (error) throw error;

      const mappedStudents: StudentData[] = (data || []).map((student: any) => ({
        id: student.id,
        name: student.name || 'N/A',
        email: student.email || 'N/A',
        roll_number: student.roll_number || 'N/A',
        year: student.year || 0,
        semester: student.semester || 0,
        department_id: student.department_id,
        department_name: student.departments?.name || 'Unknown',
        department_code: student.departments?.code || 'N/A',
        is_active: student.is_active,
        community: student.community,
        first_generation: student.first_generation || false,
        phone: student.phone,
        address: student.address
      }));

      setStudents(mappedStudents);
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  const convertToStudentType = (studentData: StudentData): Student => {
    return {
      id: studentData.id,
      name: studentData.name,
      rollNumber: studentData.roll_number,
      roll_number: studentData.roll_number,
      email: studentData.email,
      phone: studentData.phone || '',
      course: `${studentData.department_name}`,
      year: studentData.year,
      semester: studentData.semester,
      department: studentData.department_name,
      yearSection: `${studentData.year}`,
      section: '',
      admissionDate: '',
      guardianName: '',
      guardianPhone: '',
      address: studentData.address || '',
      emergencyContact: '',
      community: studentData.community as 'SC' | 'ST' | 'OBC' | 'General' | 'EWS',
      first_generation: studentData.first_generation
    };
  };

  const handleStudentClick = (studentData: StudentData) => {
    const student = convertToStudentType(studentData);
    setSelectedStudent(student);
    setShowProfile(true);
  };

  const handleBackToList = () => {
    setShowProfile(false);
    setSelectedStudent(null);
  };

  const filteredStudents = students.filter(student => {
    const matchesSearch = 
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.roll_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.department_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDepartment = selectedDepartment === 'all' || 
      student.department_id === selectedDepartment;
    
    const matchesYear = selectedYear === 'all' || 
      student.year.toString() === selectedYear;

    return matchesSearch && matchesDepartment && matchesYear;
  });

  // Group students by department for statistics
  const studentsByDepartment = students.reduce((acc, student) => {
    const dept = student.department_name;
    if (!acc[dept]) {
      acc[dept] = {
        total: 0,
        active: 0,
        code: student.department_code
      };
    }
    acc[dept].total += 1;
    if (student.is_active) acc[dept].active += 1;
    return acc;
  }, {} as Record<string, any>);

  const getYearLabel = (year: number) => {
    if (year === 1) return '1st Year';
    if (year === 2) return '2nd Year';
    if (year === 3) return '3rd Year';
    if (year === 4) return '4th Year';
    return `${year}th Year`;
  };

  if (loading) {
    return (
      <div className={cn("p-4 space-y-6", className)}>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        </div>
      </div>
    );
  }

  // Show student profile if selected
  if (showProfile && selectedStudent) {
    return (
      <StudentProfile
        student={selectedStudent}
        onBack={handleBackToList}
      />
    );
  }

  return (
    <div className={cn("p-4 space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Student Overview
          </h2>
          <p className="text-sm text-gray-500 mt-1">Institutional Student Management</p>
        </div>
        <Button variant="outline" size="sm" className="text-purple-600 border-purple-200">
          <Download className="w-4 h-4 mr-2" />
          Export
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Students</p>
                <p className="text-2xl font-bold text-blue-600">{institutionalStats.totalStudents}</p>
                <p className="text-xs text-gray-500">{institutionalStats.activeStudents} active</p>
              </div>
              <Users className="w-8 h-8 text-blue-600 opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Departments</p>
                <p className="text-2xl font-bold text-purple-600">{Object.keys(studentsByDepartment).length}</p>
                <p className="text-xs text-gray-500">With students</p>
              </div>
              <GraduationCap className="w-8 h-8 text-purple-600 opacity-80" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Department-wise Students */}
      {Object.keys(studentsByDepartment).length > 0 && (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-blue-600" />
              <span>Department-wise Distribution</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(studentsByDepartment).map(([dept, data]: [string, any]) => (
                <div key={dept} className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-100">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-lg bg-purple-600 flex items-center justify-center">
                      <span className="text-white font-bold text-sm">{data.code}</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{dept}</p>
                      <p className="text-sm text-gray-600">{data.active} active students</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-purple-600">{data.total}</p>
                    <p className="text-xs text-gray-500">Students</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search and Filters */}
      <div className="space-y-3">
        <div className="flex space-x-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search students..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline" size="icon">
            <Filter className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex space-x-2">
          <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              {departments.map((dept) => (
                <SelectItem key={dept.id} value={dept.id}>
                  {dept.code}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Years</SelectItem>
              <SelectItem value="1">1st Year</SelectItem>
              <SelectItem value="2">2nd Year</SelectItem>
              <SelectItem value="3">3rd Year</SelectItem>
              <SelectItem value="4">4th Year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Students List */}
      <div className="space-y-3">
        <h3 className="font-semibold text-gray-800">Students</h3>
        {filteredStudents.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No students found</p>
            </CardContent>
          </Card>
        ) : (
          filteredStudents.map((student) => (
            <MobileDataCard
              key={student.id}
              title={student.name}
              subtitle={`${student.roll_number} • ${student.department_code} • ${getYearLabel(student.year)}`}
              status={{
                label: student.is_active ? 'Active' : 'Inactive',
                variant: student.is_active ? 'default' : 'secondary'
              }}
              data={[
                {
                  label: 'Year',
                  value: getYearLabel(student.year),
                  icon: Calendar,
                  color: 'text-blue-600'
                },
                {
                  label: 'Department',
                  value: student.department_code,
                  icon: MapPin,
                  color: 'text-purple-600'
                },
                {
                  label: 'Community',
                  value: student.community || 'General',
                  icon: Users,
                  color: 'text-green-600'
                },
                {
                  label: 'First Gen',
                  value: student.first_generation ? 'Yes' : 'No',
                  icon: Award,
                  color: student.first_generation ? 'text-emerald-600' : 'text-gray-500'
                }
              ]}
              actions={[
                {
                  label: 'View Profile',
                  icon: Eye,
                  onClick: () => handleStudentClick(student)
                }
              ]}
              onClick={() => handleStudentClick(student)}
              className="hover:shadow-md transition-shadow"
            />
          ))
        )}
      </div>

      {/* Student Insights */}
      {students.length > 0 && (
        <Card className="bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Award className="w-5 h-5 text-emerald-600" />
              <span>Student Insights</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 rounded-lg bg-white/70">
                <span className="text-sm font-medium text-gray-700">First Generation Students</span>
                <span className="text-lg font-bold text-green-600">
                  {students.filter(s => s.first_generation).length}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-white/70">
                <span className="text-sm font-medium text-gray-700">SC/ST Students</span>
                <span className="text-lg font-bold text-purple-600">
                  {students.filter(s => s.community && ['SC', 'ST'].includes(s.community)).length}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-white/70">
                <span className="text-sm font-medium text-gray-700">Final Year Students</span>
                <span className="text-lg font-bold text-blue-600">
                  {students.filter(s => s.year === 4).length}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ChairmanStudentManagement;
