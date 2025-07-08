import React, { useState, useEffect } from 'react';
import { Users, Plus, Upload, Filter, Download, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Checkbox } from '../ui/checkbox';
import { Badge } from '../ui/badge';
import { useToast } from '../ui/use-toast';
import { supabase } from '../../integrations/supabase/client';
import { useAuth } from '../../contexts/SupabaseAuthContext';
import FeeTemplateManager from './FeeTemplateManager';
import BatchFeeProcessor from './BatchFeeProcessor';

interface Student {
  id: string;
  name: string;
  email: string;
  roll_number: string;
  year?: number;
  semester?: number;
  department: {
    id: string;
    name: string;
    code: string;
  };
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

const EnhancedFeeAssignment: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [students, setStudents] = useState<Student[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [feeTypes, setFeeTypes] = useState<FeeType[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [yearFilter, setYearFilter] = useState('');
  
  // Fee assignment form data
  const [feeData, setFeeData] = useState({
    academic_year: '2024-25',
    semester: 5,
    fee_type_id: '',
    amount: '',
    due_date: '',
    description: ''
  });

  const [showTemplates, setShowTemplates] = useState(false);
  const [showBatchProcessor, setShowBatchProcessor] = useState(false);

  useEffect(() => {
    fetchStudents();
    fetchDepartments();
    fetchFeeTypes();
  }, [departmentFilter, yearFilter, searchTerm]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      console.log('Fetching students with filters:', { departmentFilter, yearFilter, searchTerm });
      
      // Completely simplified approach - just get the basic student data first
      let query = supabase
        .from('profiles')
        .select('id, name, email, roll_number, year, semester, department_id')
        .eq('role', 'student')
        .eq('is_active', true);

      // Apply filters
      if (departmentFilter) {
        query = query.eq('department_id', departmentFilter);
      }

      if (yearFilter) {
        query = query.eq('year', parseInt(yearFilter));
      }

      if (searchTerm) {
        query = query.or(`name.ilike.%${searchTerm}%,roll_number.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`);
      }

      console.log('Executing profiles query...');
      const { data: profilesData, error: profilesError } = await query.order('roll_number');

      if (profilesError) {
        console.error('Profiles query error:', profilesError);
        throw profilesError;
      }

      console.log('Profiles fetched:', profilesData?.length || 0, 'records');

      if (!profilesData || profilesData.length === 0) {
        console.log('No student profiles found');
        setStudents([]);
        return;
      }

      // Now get departments separately
      console.log('Fetching departments...');
      const { data: departmentsData, error: departmentsError } = await supabase
        .from('departments')
        .select('id, name, code')
        .eq('is_active', true);

      if (departmentsError) {
        console.error('Departments query error:', departmentsError);
        throw departmentsError;
      }

      console.log('Departments fetched:', departmentsData?.length || 0, 'records');

      // Create a department lookup map
      const departmentMap = new Map();
      (departmentsData || []).forEach(dept => {
        departmentMap.set(dept.id, dept);
      });

      console.log('Department map created with', departmentMap.size, 'entries');

      // Map students with their departments
      const mappedStudents: Student[] = profilesData
        .filter(profile => profile.id && profile.name && profile.email)
        .map(profile => {
          const department = departmentMap.get(profile.department_id) || {
            id: profile.department_id || '',
            name: 'Unknown Department',
            code: 'UNK'
          };

          return {
            id: profile.id,
            name: profile.name,
            email: profile.email,
            roll_number: profile.roll_number || '',
            year: profile.year,
            semester: profile.semester,
            department: {
              id: department.id,
              name: department.name,
              code: department.code
            }
          };
        });

      console.log('Final mapped students:', mappedStudents.length);
      setStudents(mappedStudents);

      if (mappedStudents.length === 0) {
        toast({
          title: "No Students Found",
          description: "No students match your current filter criteria.",
          variant: "default"
        });
      } else {
        console.log('Successfully loaded', mappedStudents.length, 'students');
      }

    } catch (error) {
      console.error('Error in fetchStudents:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast({
        title: "Error Loading Students",
        description: `Failed to fetch students: ${errorMessage}`,
        variant: "destructive"
      });
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const { data, error } = await supabase
        .from('departments')
        .select('id, name, code')
        .eq('is_active', true)
        .order('name');

      if (error) {
        console.error('Error fetching departments:', error);
        throw error;
      }
      
      console.log('Departments loaded:', data);
      setDepartments(data || []);
    } catch (error) {
      console.error('Error fetching departments:', error);
      toast({
        title: "Error",
        description: "Failed to load departments",
        variant: "destructive"
      });
    }
  };

  const fetchFeeTypes = async () => {
    try {
      const { data, error } = await supabase
        .from('fee_types')
        .select('id, name, description, is_mandatory')
        .eq('is_active', true)
        .order('name');

      if (error) {
        console.error('Error fetching fee types:', error);
        throw error;
      }
      
      console.log('Fee types loaded:', data);
      setFeeTypes(data || []);
    } catch (error) {
      console.error('Error fetching fee types:', error);
      toast({
        title: "Error",
        description: "Failed to load fee types",
        variant: "destructive"
      });
    }
  };

  const handleStudentSelection = (studentId: string, checked: boolean) => {
    if (checked) {
      setSelectedStudents([...selectedStudents, studentId]);
    } else {
      setSelectedStudents(selectedStudents.filter(id => id !== studentId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedStudents(students.map(s => s.id));
    } else {
      setSelectedStudents([]);
    }
  };

  const handleAssignFees = async () => {
    if (selectedStudents.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one student",
        variant: "destructive"
      });
      return;
    }

    if (!feeData.fee_type_id || !feeData.amount || !feeData.due_date) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);

      const feeRecords = selectedStudents.map(studentId => ({
        student_id: studentId,
        academic_year: feeData.academic_year,
        semester: feeData.semester,
        fee_type_id: feeData.fee_type_id,
        original_amount: parseFloat(feeData.amount),
        final_amount: parseFloat(feeData.amount),
        due_date: feeData.due_date,
        status: 'Pending' as const
      }));

      const { data, error } = await supabase
        .from('fee_records')
        .insert(feeRecords)
        .select();

      if (error) throw error;

      toast({
        title: "Success",
        description: `Fee assigned to ${selectedStudents.length} students successfully`,
      });

      // Reset form and selections
      setSelectedStudents([]);
      setFeeData({
        academic_year: '2024-25',
        semester: 5,
        fee_type_id: '',
        amount: '',
        due_date: '',
        description: ''
      });

    } catch (error: any) {
      console.error('Error assigning fees:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to assign fees",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const exportStudentList = () => {
    const csvContent = [
      ['Name', 'Roll Number', 'Email', 'Department', 'Year', 'Semester'].join(','),
      ...students.map(student => [
        student.name,
        student.roll_number,
        student.email,
        student.department?.name || '',
        student.year || '',
        student.semester || ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `students_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Enhanced Fee Assignment</h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowTemplates(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Templates
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowBatchProcessor(true)}
          >
            <Upload className="w-4 h-4 mr-2" />
            Batch Process
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Student Selection */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Select Students ({selectedStudents.length} selected)</span>
                <Button variant="outline" size="sm" onClick={exportStudentList}>
                  <Download className="w-4 h-4 mr-2" />
                  Export List
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Filters */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Search Students</Label>
                  <Input
                    placeholder="Name, roll number, or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                <div>
                  <Label>Department</Label>
                  <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All departments" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Departments</SelectItem>
                      {departments.map(dept => (
                        <SelectItem key={dept.id} value={dept.id}>
                          {dept.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Year</Label>
                  <Select value={yearFilter} onValueChange={setYearFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All years" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Years</SelectItem>
                      <SelectItem value="1">1st Year</SelectItem>
                      <SelectItem value="2">2nd Year</SelectItem>
                      <SelectItem value="3">3rd Year</SelectItem>
                      <SelectItem value="4">4th Year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Select All */}
              <div className="flex items-center space-x-2 p-4 bg-gray-50 rounded-lg">
                <Checkbox
                  id="select-all"
                  checked={selectedStudents.length === students.length && students.length > 0}
                  onCheckedChange={handleSelectAll}
                />
                <Label htmlFor="select-all" className="font-medium">
                  Select All Students ({students.length})
                </Label>
              </div>

              {/* Students List */}
              {loading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <div className="max-h-96 overflow-y-auto space-y-2">
                  {students.map(student => (
                    <div key={student.id} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                      <Checkbox
                        checked={selectedStudents.includes(student.id)}
                        onCheckedChange={(checked) => handleStudentSelection(student.id, checked as boolean)}
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{student.name}</span>
                          <Badge variant="outline">{student.roll_number}</Badge>
                        </div>
                        <p className="text-sm text-gray-600">
                          {student.department?.name} • Year {student.year} • Semester {student.semester}
                        </p>
                      </div>
                    </div>
                  ))}

                  {students.length === 0 && !loading && (
                    <div className="text-center py-8">
                      <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <div className="text-gray-500">
                        <p className="font-medium">No students found</p>
                        <p className="text-sm">Try adjusting your search criteria or filters</p>
                        <Button 
                          variant="outline" 
                          className="mt-2"
                          onClick={() => {
                            setSearchTerm('');
                            setDepartmentFilter('');
                            setYearFilter('');
                          }}
                        >
                          Clear Filters
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Fee Assignment Form */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Fee Assignment Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Academic Year</Label>
                <Input
                  value={feeData.academic_year}
                  onChange={(e) => setFeeData({...feeData, academic_year: e.target.value})}
                />
              </div>

              <div>
                <Label>Semester</Label>
                <Select 
                  value={feeData.semester.toString()} 
                  onValueChange={(value) => setFeeData({...feeData, semester: parseInt(value)})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1,2,3,4,5,6,7,8].map(sem => (
                      <SelectItem key={sem} value={sem.toString()}>
                        Semester {sem}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Fee Type *</Label>
                <Select 
                  value={feeData.fee_type_id} 
                  onValueChange={(value) => setFeeData({...feeData, fee_type_id: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select fee type" />
                  </SelectTrigger>
                  <SelectContent>
                    {feeTypes.map(type => (
                      <SelectItem key={type.id} value={type.id}>
                        <div className="flex items-center gap-2">
                          {type.name}
                          {type.is_mandatory && <Badge variant="destructive" className="text-xs">Mandatory</Badge>}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Amount *</Label>
                <Input
                  type="number"
                  placeholder="Enter amount"
                  value={feeData.amount}
                  onChange={(e) => setFeeData({...feeData, amount: e.target.value})}
                />
              </div>

              <div>
                <Label>Due Date *</Label>
                <Input
                  type="date"
                  value={feeData.due_date}
                  onChange={(e) => setFeeData({...feeData, due_date: e.target.value})}
                />
              </div>

              <div>
                <Label>Description</Label>
                <Input
                  placeholder="Optional description"
                  value={feeData.description}
                  onChange={(e) => setFeeData({...feeData, description: e.target.value})}
                />
              </div>

              {/* Assignment Summary */}
              {selectedStudents.length > 0 && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-2 text-blue-800 mb-2">
                    <CheckCircle className="w-4 h-4" />
                    <span className="font-medium">Assignment Summary</span>
                  </div>
                  <div className="text-sm text-blue-700">
                    <p>Students: {selectedStudents.length}</p>
                    <p>Total Amount: ₹{(parseFloat(feeData.amount || '0') * selectedStudents.length).toLocaleString()}</p>
                    <p>Due Date: {feeData.due_date}</p>
                  </div>
                </div>
              )}

              <Button
                onClick={handleAssignFees}
                disabled={loading || selectedStudents.length === 0 || !feeData.fee_type_id || !feeData.amount || !feeData.due_date}
                className="w-full"
              >
                {loading ? 'Assigning...' : `Assign Fees to ${selectedStudents.length} Students`}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modals */}
      {showTemplates && (
        <FeeTemplateManager 
          open={showTemplates}
          onOpenChange={setShowTemplates}
          onTemplateApplied={(template) => {
            setFeeData({
              ...feeData,
              fee_type_id: template.fee_type_id,
              amount: template.amount.toString(),
              due_date: template.due_date
            });
          }}
        />
      )}

      {showBatchProcessor && (
        <BatchFeeProcessor
          open={showBatchProcessor}
          onOpenChange={setShowBatchProcessor}
          selectedStudents={
            students.filter(student => selectedStudents.includes(student.id)).map(student => ({
              id: student.id,
              name: student.name,
              roll_number: student.roll_number,
              year: student.year || 0,
              department: student.department?.name || ''
            }))
          }
          onProcessComplete={() => {
            toast({
              title: "Success",
              description: "Batch processing completed successfully",
            });
          }}
        />
      )}
    </div>
  );
};

export default EnhancedFeeAssignment;
