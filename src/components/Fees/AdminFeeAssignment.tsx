
import React, { useState, useEffect } from 'react';
import { UserPlus, Upload, DollarSign, Users, Search } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { useAuth } from '../../contexts/SupabaseAuthContext';
import { useToast } from '../ui/use-toast';
import { supabase } from '../../integrations/supabase/client';

interface Student {
  id: string;
  name: string;
  roll_number: string;
  email: string;
  department_id: string;
  department_name: string;
  year: number;
}

interface FeeType {
  id: string;
  name: string;
  description: string;
  is_mandatory: boolean;
}

interface Department {
  id: string;
  name: string;
  code: string;
}

const AdminFeeAssignment: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [feeTypes, setFeeTypes] = useState<FeeType[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [feeAmount, setFeeAmount] = useState('');
  const [selectedFeeType, setSelectedFeeType] = useState('default');
  const [semester, setSemester] = useState('default');
  const [academicYear, setAcademicYear] = useState('2024-25');
  const [dueDate, setDueDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [studentSearch, setStudentSearch] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [yearFilter, setYearFilter] = useState('all');

  useEffect(() => {
    loadDepartments();
    loadFeeTypes();
  }, []);

  useEffect(() => {
    if (departments.length > 0) {
      loadStudents();
    }
  }, [departments]);

  useEffect(() => {
    filterStudents();
  }, [students, studentSearch, departmentFilter, yearFilter]);

  const loadDepartments = async () => {
    try {
      const { data, error } = await supabase
        .from('departments')
        .select('id, name, code')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setDepartments(data || []);
    } catch (error) {
      console.error('Error loading departments:', error);
      toast({
        title: "Error",
        description: "Failed to load departments",
        variant: "destructive"
      });
    }
  };

  const loadStudents = async () => {
    try {
      setStudentsLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id, 
          name, 
          roll_number, 
          email, 
          department_id,
          year,
          departments!inner(name)
        `)
        .eq('role', 'student')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      
      const studentsWithDept = (data || []).map(student => ({
        ...student,
        department_name: (student as any).departments?.name || 'Unknown'
      }));

      setStudents(studentsWithDept);
      setFilteredStudents(studentsWithDept);
    } catch (error) {
      console.error('Error loading students:', error);
      toast({
        title: "Error",
        description: "Failed to load students",
        variant: "destructive"
      });
    } finally {
      setStudentsLoading(false);
    }
  };

  const loadFeeTypes = async () => {
    try {
      const { data, error } = await supabase
        .from('fee_types')
        .select('id, name, description, is_mandatory')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setFeeTypes(data || []);
    } catch (error) {
      console.error('Error loading fee types:', error);
      toast({
        title: "Error",
        description: "Failed to load fee types",
        variant: "destructive"
      });
    }
  };

  const filterStudents = () => {
    let filtered = students;

    // Search filter
    if (studentSearch) {
      filtered = filtered.filter(student =>
        student.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
        student.roll_number.toLowerCase().includes(studentSearch.toLowerCase()) ||
        student.email.toLowerCase().includes(studentSearch.toLowerCase())
      );
    }

    // Department filter
    if (departmentFilter !== 'all') {
      filtered = filtered.filter(student => student.department_id === departmentFilter);
    }

    // Year filter
    if (yearFilter !== 'all') {
      filtered = filtered.filter(student => student.year === parseInt(yearFilter));
    }

    setFilteredStudents(filtered);
  };

  const assignFeesToStudents = async () => {
    if (!feeAmount || semester === 'default' || !dueDate || selectedFeeType === 'default' || selectedStudents.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please fill all required fields and select at least one student",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      // Create fee records for selected students
      const feeRecords = selectedStudents.map(studentId => ({
        student_id: studentId,
        academic_year: academicYear,
        semester: parseInt(semester),
        fee_type_id: selectedFeeType,
        original_amount: parseFloat(feeAmount),
        final_amount: parseFloat(feeAmount),
        due_date: dueDate,
        status: 'Pending' as const
      }));

      const { error } = await supabase
        .from('fee_records')
        .insert(feeRecords);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Fee assigned to ${selectedStudents.length} students successfully`,
      });

      // Reset form
      setSelectedStudents([]);
      setFeeAmount('');
      setSelectedFeeType('default');
      setSemester('default');
      setDueDate('');

    } catch (error) {
      console.error('Error assigning fees:', error);
      toast({
        title: "Error",
        description: "Failed to assign fees to students",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const selectAllFiltered = () => {
    setSelectedStudents(filteredStudents.map(s => s.id));
  };

  const clearSelection = () => {
    setSelectedStudents([]);
  };

  const toggleStudent = (studentId: string) => {
    setSelectedStudents(prev =>
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  if (!user || !['admin', 'principal'].includes(user.role)) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Access denied. Admin privileges required.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <DollarSign className="w-5 h-5" />
            <span>Enhanced Fee Assignment</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Fee Details */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="feeType">Fee Type *</Label>
              <Select value={selectedFeeType} onValueChange={setSelectedFeeType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select fee type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Select fee type</SelectItem>
                  {feeTypes.map(feeType => (
                    <SelectItem key={feeType.id} value={feeType.id}>
                      <div>
                        <div className="font-medium">{feeType.name}</div>
                        {feeType.description && (
                          <div className="text-xs text-gray-500">{feeType.description}</div>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="feeAmount">Fee Amount (₹) *</Label>
              <Input
                id="feeAmount"
                type="number"
                value={feeAmount}
                onChange={(e) => setFeeAmount(e.target.value)}
                placeholder="Enter fee amount"
              />
            </div>

            <div>
              <Label htmlFor="semester">Semester *</Label>
              <Select value={semester} onValueChange={setSemester}>
                <SelectTrigger>
                  <SelectValue placeholder="Select semester" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Select semester</SelectItem>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                    <SelectItem key={sem} value={sem.toString()}>
                      Semester {sem}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="dueDate">Due Date *</Label>
              <Input
                id="dueDate"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="academicYear">Academic Year</Label>
            <Input
              id="academicYear"
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
              placeholder="e.g., 2024-25"
            />
          </div>

          {/* Student Filters */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Select Students</h3>
              <div className="flex items-center gap-2">
                <Badge variant="outline">
                  {filteredStudents.length} students available
                </Badge>
                <Badge variant="secondary">
                  {selectedStudents.length} selected
                </Badge>
              </div>
            </div>

            {/* Filter Controls */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search students..."
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {departments.map(dept => (
                    <SelectItem key={dept.id} value={dept.id}>
                      {dept.name} ({dept.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={yearFilter} onValueChange={setYearFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Years</SelectItem>
                  {[1, 2, 3, 4].map(year => (
                    <SelectItem key={year} value={year.toString()}>
                      Year {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={selectAllFiltered}
                  disabled={studentsLoading || filteredStudents.length === 0}
                  className="flex-1"
                >
                  <Users className="w-4 h-4 mr-1" />
                  Select All ({filteredStudents.length})
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={clearSelection}
                  className="flex-1"
                >
                  Clear
                </Button>
              </div>
            </div>

            {/* Students List */}
            <div className="border rounded-lg max-h-96 overflow-y-auto">
              {studentsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  <span className="ml-2">Loading students...</span>
                </div>
              ) : filteredStudents.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No students found matching the current filters
                </div>
              ) : (
                <div className="space-y-1 p-2">
                  {filteredStudents.map(student => (
                    <div 
                      key={student.id} 
                      className={`flex items-center p-3 rounded border hover:bg-gray-50 cursor-pointer ${
                        selectedStudents.includes(student.id) ? 'bg-blue-50 border-blue-200' : ''
                      }`}
                      onClick={() => toggleStudent(student.id)}
                    >
                      <input
                        type="checkbox"
                        checked={selectedStudents.includes(student.id)}
                        onChange={() => toggleStudent(student.id)}
                        className="mr-3"
                      />
                      <div className="flex-1">
                        <div className="font-medium">{student.name}</div>
                        <div className="text-sm text-gray-600">
                          {student.roll_number} • {student.department_name} • Year {student.year}
                        </div>
                        <div className="text-xs text-gray-500">{student.email}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <Button
            onClick={assignFeesToStudents}
            disabled={loading || selectedStudents.length === 0 || selectedFeeType === 'default'}
            className="w-full"
            size="lg"
          >
            {loading ? (
              'Assigning Fees...'
            ) : (
              <>
                <UserPlus className="w-4 h-4 mr-2" />
                Assign {selectedFeeType !== 'default' ? feeTypes.find(ft => ft.id === selectedFeeType)?.name : 'Fee'} to {selectedStudents.length} Students
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminFeeAssignment;
