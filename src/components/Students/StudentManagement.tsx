import React, { useState, useEffect } from 'react';
import { Search, Filter, Users, Eye, Edit, Trash2, Plus, UserPlus } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useAuth } from '../../contexts/SupabaseAuthContext';
import { useToast } from '../ui/use-toast';
import { supabase } from '../../integrations/supabase/client';
import { useIsMobile } from '../../hooks/use-mobile';
import { Student } from '../../types/user-student-fees';

interface StudentManagementProps {
  onViewStudent?: (student: Student) => void;
}

const StudentManagement: React.FC<StudentManagementProps> = ({ onViewStudent }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [departments, setDepartments] = useState<string[]>([]);

  useEffect(() => {
    fetchStudents();
    fetchDepartments();
    // eslint-disable-next-line
  }, [user]);

  const fetchDepartments = async () => {
    try {
      const { data, error } = await supabase
        .from('departments')
        .select('name, code')
        .eq('is_active', true);

      if (error) throw error;
      setDepartments(data?.map(d => d.code) || []);
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  const fetchStudents = async () => {
    if (!user) return;
    try {
      setLoading(true);
      let query = supabase
        .from('profiles')
        .select(`
          id, 
          name, 
          email, 
          roll_number,
          course,
          year,
          semester,
          phone,
          profile_photo_url,
          admission_date,
          guardian_name,
          guardian_phone,
          address,
          blood_group,
          emergency_contact,
          department_id,
          year_section,
          section,
          total_fees,
          paid_amount,
          due_amount,
          fee_status,
          is_active,
          departments:departments!profiles_department_id_fkey(name, code)
        `)
        .eq('role', 'student')
        .eq('is_active', true);

      // Apply role-based filtering
      if (user.role === 'hod') {
        query = query.eq('department_id', user.department_id);
      }

      const { data, error } = await query;

      if (error) throw error;

      const transformedStudents: Student[] = (data || []).map((profile: any) => ({
        id: profile.id,
        name: profile.name || 'Unknown',
        rollNumber: profile.roll_number || '',
        course: profile.course || '',
        year: profile.year || 0,
        semester: profile.semester || 0,
        email: profile.email,
        phone: profile.phone || '',
        profileImage: profile.profile_photo_url || '',
        admissionDate: profile.admission_date || '',
        guardianName: profile.guardian_name || '',
        guardianPhone: profile.guardian_phone || '',
        address: profile.address || '',
        bloodGroup: profile.blood_group || '',
        emergencyContact: profile.emergency_contact || '',
        department: profile.departments?.code || 'Unknown',
        yearSection: profile.year_section || '',
        section: profile.section || '',
        totalFees: profile.total_fees || 0,
        paidAmount: profile.paid_amount || 0,
        dueAmount: profile.due_amount || 0,
        feeStatus: profile.fee_status || 'Pending'
      }));

      setStudents(transformedStudents);
    } catch (error) {
      console.error('Error fetching students:', error);
      toast({
        title: "Error",
        description: "Failed to fetch students",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteStudent = async (studentId: string) => {
    if (!confirm('Are you sure you want to deactivate this student?')) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_active: false })
        .eq('id', studentId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Student deactivated successfully",
      });

      fetchStudents(); // Refresh the list
    } catch (error) {
      console.error('Error deactivating student:', error);
      toast({
        title: "Error",
        description: "Failed to deactivate student",
        variant: "destructive"
      });
    }
  };

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.rollNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = !selectedDepartment || student.department === selectedDepartment;
    const matchesYear = !selectedYear || student.year.toString() === selectedYear;

    return matchesSearch && matchesDepartment && matchesYear;
  });

  const getStudentStatus = (student: Student) => {
    if (student.dueAmount === 0) return { label: 'Paid', color: 'bg-green-100 text-green-800' };
    if (student.paidAmount && student.paidAmount > 0) return { label: 'Partial', color: 'bg-yellow-100 text-yellow-800' };
    return { label: 'Pending', color: 'bg-red-100 text-red-800' };
  };

  if (!user || !['admin', 'principal', 'hod'].includes(user.role)) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Access denied. Insufficient privileges.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading students...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold text-gray-800`}>
          Student Management
        </h2>
        {['admin', 'principal'].includes(user.role) && (
          <Button className="flex items-center space-x-2" size={isMobile ? 'sm' : 'default'}>
            <UserPlus className="w-4 h-4" />
            <span>Invite Student</span>
          </Button>
        )}
      </div>

      {/* Summary Stats */}
      <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-4'} gap-4`}>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Students</p>
                <p className="text-2xl font-bold text-blue-600">{students.length}</p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Fees Paid</p>
                <p className="text-2xl font-bold text-green-600">
                  {students.filter(s => s.dueAmount === 0).length}
                </p>
              </div>
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 font-bold">✓</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Partial Payment</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {students.filter(s => s.paidAmount && s.paidAmount > 0 && s.dueAmount && s.dueAmount > 0).length}
                </p>
              </div>
              <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <span className="text-yellow-600 font-bold">~</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-red-600">
                  {students.filter(s => s.dueAmount && s.dueAmount > 0 && (!s.paidAmount || s.paidAmount === 0)).length}
                </p>
              </div>
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                <span className="text-red-600 font-bold">!</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-4'} gap-4`}>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={selectedDepartment || ''} onValueChange={setSelectedDepartment}>
              <SelectTrigger>
                <SelectValue placeholder="All Departments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Departments</SelectItem>
                {departments.map(dept => (
                  <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedYear || ''} onValueChange={setSelectedYear}>
              <SelectTrigger>
                <SelectValue placeholder="All Years" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Years</SelectItem>
                {[1, 2, 3, 4].map(year => (
                  <SelectItem key={year} value={year.toString()}>Year {year}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button variant="outline" className="flex items-center space-x-2">
              <Filter className="w-4 h-4" />
              <span>More Filters</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Student List */}
      <Card>
        <CardHeader>
          <CardTitle>Students ({filteredStudents.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isMobile ? (
            // Mobile Card View
            <div className="space-y-4">
              {filteredStudents.map(student => {
                const status = getStudentStatus(student);
                return (
                  <div key={student.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-medium">
                            {student.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">{student.name}</h3>
                          <p className="text-sm text-gray-500">{student.rollNumber}</p>
                        </div>
                      </div>
                      <div className="flex space-x-1">
                        {onViewStudent && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onViewStudent(student)}
                          >
                            <Eye className="w-3 h-3" />
                          </Button>
                        )}
                        {['admin', 'principal'].includes(user.role) && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 hover:text-red-700"
                            onClick={() => handleDeleteStudent(student.id)}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Department:</span>
                        <p className="font-medium">{student.department}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Year:</span>
                        <p className="font-medium">Year {student.year}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Fee Due:</span>
                        <p className="font-medium text-red-600">₹{student.dueAmount?.toLocaleString() || 0}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Status:</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${status.color}`}>
                          {status.label}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            // Desktop Table View
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Student
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Roll Number
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Department
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Year
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fee Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredStudents.map(student => {
                    const status = getStudentStatus(student);
                    return (
                      <tr key={student.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                              <span className="text-white text-sm font-medium">
                                {student.name.split(' ').map(n => n[0]).join('')}
                              </span>
                            </div>
                            <div className="ml-3">
                              <div className="text-sm font-medium text-gray-900">{student.name}</div>
                              <div className="text-sm text-gray-500">{student.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {student.rollNumber}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {student.department}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          Year {student.year}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col">
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${status.color} mb-1`}>
                              {status.label}
                            </span>
                            <span className="text-xs text-gray-500">
                              Due: ₹{student.dueAmount?.toLocaleString() || 0}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            {onViewStudent && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => onViewStudent(student)}
                                className="flex items-center space-x-1"
                              >
                                <Eye className="w-3 h-3" />
                                <span>View</span>
                              </Button>
                            )}
                            <Button size="sm" variant="outline">
                              <Edit className="w-3 h-3" />
                            </Button>
                            {['admin', 'principal'].includes(user.role) && (
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="text-red-600 hover:text-red-700"
                                onClick={() => handleDeleteStudent(student.id)}
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {filteredStudents.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No students found matching the search criteria.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentManagement;