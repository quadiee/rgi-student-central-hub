
import React, { useState, useEffect } from 'react';
import { UserPlus, Upload, DollarSign, Users } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useAuth } from '../../contexts/SupabaseAuthContext';
import { useToast } from '../ui/use-toast';
import { supabase } from '../../integrations/supabase/client';

interface Student {
  id: string;
  name: string;
  roll_number: string;
  email: string;
  department_id: string;
}

interface FeeType {
  id: string;
  name: string;
  description: string;
  is_mandatory: boolean;
}

const AdminFeeAssignment: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [students, setStudents] = useState<Student[]>([]);
  const [feeTypes, setFeeTypes] = useState<FeeType[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [feeAmount, setFeeAmount] = useState('');
  const [selectedFeeType, setSelectedFeeType] = useState('');
  const [semester, setSemester] = useState('');
  const [academicYear, setAcademicYear] = useState('2024-25');
  const [dueDate, setDueDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [studentsLoading, setStudentsLoading] = useState(false);

  useEffect(() => {
    loadStudents();
    loadFeeTypes();
  }, []);

  const loadStudents = async () => {
    try {
      setStudentsLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, roll_number, email, department_id')
        .eq('role', 'student')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setStudents(data || []);
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

  const assignFeesToStudents = async () => {
    if (!feeAmount || !semester || !dueDate || !selectedFeeType || selectedStudents.length === 0) {
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
      setSelectedFeeType('');
      setSemester('');
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

  const selectAllStudents = () => {
    setSelectedStudents(students.map(s => s.id));
  };

  const clearSelection = () => {
    setSelectedStudents([]);
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
            <span>Assign Fees to Students</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Fee Details */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fee Type *
              </label>
              <Select value={selectedFeeType} onValueChange={setSelectedFeeType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select fee type" />
                </SelectTrigger>
                <SelectContent>
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fee Amount (₹) *
              </label>
              <Input
                type="number"
                value={feeAmount}
                onChange={(e) => setFeeAmount(e.target.value)}
                placeholder="Enter fee amount"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Semester *
              </label>
              <Select value={semester} onValueChange={setSemester}>
                <SelectTrigger>
                  <SelectValue placeholder="Select semester" />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                    <SelectItem key={sem} value={sem.toString()}>
                      Semester {sem}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Due Date *
              </label>
              <Input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Academic Year
            </label>
            <Input
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
              placeholder="e.g., 2024-25"
            />
          </div>

          {/* Student Selection */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Select Students</h3>
              <div className="space-x-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={selectAllStudents}
                  disabled={studentsLoading}
                >
                  <Users className="w-4 h-4 mr-2" />
                  Select All ({students.length})
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={clearSelection}
                >
                  Clear Selection
                </Button>
              </div>
            </div>

            <div className="border rounded-lg max-h-96 overflow-y-auto">
              {studentsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  <span className="ml-2">Loading students...</span>
                </div>
              ) : students.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No students found
                </div>
              ) : (
                students.map(student => (
                  <div key={student.id} className="flex items-center p-3 border-b last:border-b-0 hover:bg-gray-50">
                    <input
                      type="checkbox"
                      id={student.id}
                      checked={selectedStudents.includes(student.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedStudents([...selectedStudents, student.id]);
                        } else {
                          setSelectedStudents(selectedStudents.filter(id => id !== student.id));
                        }
                      }}
                      className="mr-3"
                    />
                    <label htmlFor={student.id} className="flex-1 cursor-pointer">
                      <div className="font-medium">{student.name}</div>
                      <div className="text-sm text-gray-600">
                        {student.roll_number} - {student.email}
                      </div>
                    </label>
                  </div>
                ))
              )}
            </div>

            {selectedStudents.length > 0 && (
              <div className="mt-2 text-sm text-blue-600">
                {selectedStudents.length} students selected
              </div>
            )}
          </div>

          {/* Submit Button */}
          <Button
            onClick={assignFeesToStudents}
            disabled={loading || selectedStudents.length === 0 || !selectedFeeType}
            className="w-full"
          >
            {loading ? (
              'Assigning Fees...'
            ) : (
              <>
                <UserPlus className="w-4 h-4 mr-2" />
                Assign {selectedFeeType ? feeTypes.find(ft => ft.id === selectedFeeType)?.name : 'Fee'} to {selectedStudents.length} Students
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminFeeAssignment;
