import React, { useState, useEffect } from 'react';
import { Plus, Search, User, Edit, Trash2, FileText, Users, Download } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { useToast } from '../ui/use-toast';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Student } from '../../types/index';
import StudentCreationModal from './StudentCreationModal';
import StudentProfile from './StudentProfile';
import { useIsMobile } from '../../hooks/use-mobile';
import { supabase } from '../../integrations/supabase/client';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../ui/alert-dialog';
import BatchFeeProcessor from '../Fees/BatchFeeProcessor';
import * as XLSX from 'xlsx';

const StudentManagement: React.FC = () => {
  const { toast } = useToast();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreationModal, setShowCreationModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showProfile, setShowProfile] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<string | null>(null);
  const isMobile = useIsMobile();
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [yearFilter, setYearFilter] = useState<string>('all');
  const [showBatchFeeProcessor, setShowBatchFeeProcessor] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState<Student[]>([]);

  useEffect(() => {
    fetchStudents();
  }, [departmentFilter, yearFilter]);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('profiles')
        .select('*')
        .eq('role', 'student');

      if (departmentFilter !== 'all') {
        query = query.eq('department_id', departmentFilter);
      }

      if (yearFilter !== 'all') {
        query = query.eq('year', parseInt(yearFilter));
      }

      const { data, error } = await query;

      if (error) throw error;

      const transformedStudents: Student[] = (data || []).map(student => ({
        id: student.id,
        name: student.name || student.email,
        rollNumber: student.roll_number || '',
        email: student.email,
        phone: student.phone || '',
        course: student.course || '',
        year: student.year || 1,
        semester: student.semester || 1,
        department: student.department_id || '',
        section: student.section || '',
        guardianName: student.guardian_name || '',
        guardianPhone: student.guardian_phone || '',
        address: student.address || '',
        bloodGroup: student.blood_group || '',
        emergencyContact: student.emergency_contact || '',
        admissionDate: student.admission_date || '',
        feeStatus: 'Pending',
        yearSection: `${student.year}-${student.section}`,
        profileImage: student.profile_photo_url || '',
        community: (student.community as 'SC' | 'ST' | 'OBC' | 'General' | 'EWS') || 'General',
        first_generation: student.first_generation || false,
        totalFees: student.total_fees || 0,
        paidAmount: student.paid_amount || 0,
        dueAmount: student.due_amount || 0
      }));

      setStudents(transformedStudents);
    } catch (error) {
      console.error('Error fetching students:', error);
      toast({
        title: "Error",
        description: "Failed to fetch students. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStudentCreated = (newStudent: Student) => {
    setStudents(prev => [...prev, newStudent]);
  };

  const handleViewProfile = (student: Student) => {
    setSelectedStudent(student);
    setShowProfile(true);
  };

  const handleCloseProfile = () => {
    setShowProfile(false);
    setSelectedStudent(null);
  };

  const confirmDeleteStudent = (studentId: string) => {
    setStudentToDelete(studentId);
    setShowDeleteConfirmation(true);
  };

  const cancelDeleteStudent = () => {
    setStudentToDelete(null);
    setShowDeleteConfirmation(false);
  };

  const deleteStudent = async () => {
    if (!studentToDelete) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', studentToDelete);

      if (error) throw error;

      setStudents(prev => prev.filter(student => student.id !== studentToDelete));
      toast({
        title: "Success",
        description: "Student deleted successfully.",
      });
    } catch (error) {
      console.error('Error deleting student:', error);
      toast({
        title: "Error",
        description: "Failed to delete student. Please try again.",
        variant: "destructive"
      });
    } finally {
      setStudentToDelete(null);
      setShowDeleteConfirmation(false);
    }
  };

  const filteredStudents = students.filter(student => {
    const searchTermLower = searchTerm.toLowerCase();
    return (
      student.name?.toLowerCase().includes(searchTermLower) ||
      student.rollNumber?.toLowerCase().includes(searchTermLower) ||
      student.email?.toLowerCase().includes(searchTermLower)
    );
  });

  const handleSelectStudent = (student: Student) => {
    setSelectedStudents(prev => {
      if (prev.find(s => s.id === student.id)) {
        return prev.filter(s => s.id !== student.id);
      } else {
        return [...prev, student];
      }
    });
  };

  const isStudentSelected = (student: Student) => {
    return selectedStudents.some(s => s.id === student.id);
  };

  const handleProcessComplete = () => {
    setShowBatchFeeProcessor(false);
    setSelectedStudents([]);
  };

  const handleExportToExcel = () => {
    const wb = XLSX.utils.book_new();
    const wsData = [
      ['Name', 'Roll Number', 'Email', 'Phone', 'Course', 'Year', 'Semester', 'Department', 'Section', 'Guardian Name', 'Guardian Phone', 'Address', 'Blood Group', 'Emergency Contact', 'Community', 'First Generation', 'Admission Date'],
      ...filteredStudents.map(student => [
        student.name,
        student.rollNumber,
        student.email,
        student.phone,
        student.course,
        student.year,
        student.semester,
        student.department,
        student.section,
        student.guardianName,
        student.guardianPhone,
        student.address,
        student.bloodGroup,
        student.emergencyContact,
        student.community,
        student.first_generation,
        student.admissionDate,
      ]),
    ];
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    XLSX.utils.book_append_sheet(wb, ws, 'Students');
    XLSX.writeFile(wb, `student_data_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <Users className="w-6 h-6" />
          Student Management
        </h2>
        <Button onClick={() => setShowCreationModal(true)} className="flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>Add Student</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="md:col-span-2">
          <Input
            type="text"
            placeholder="Search by name, roll number, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Filter by Department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              <SelectItem value="CSE">Computer Science</SelectItem>
              <SelectItem value="ECE">Electronics & Communication</SelectItem>
              <SelectItem value="EEE">Electrical & Electronics</SelectItem>
              <SelectItem value="MECH">Mechanical</SelectItem>
              <SelectItem value="CIVIL">Civil</SelectItem>
              <SelectItem value="IT">Information Technology</SelectItem>
            </SelectContent>
          </Select>

          <Select value={yearFilter} onValueChange={setYearFilter}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Filter by Year" />
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

      <div className="mb-4 flex justify-between items-center">
        <Button
          variant="outline"
          onClick={() => setShowBatchFeeProcessor(true)}
          disabled={selectedStudents.length === 0}
        >
          Batch Fee Process ({selectedStudents.length} Selected)
        </Button>
        <Button
          variant="outline"
          onClick={handleExportToExcel}
          disabled={students.length === 0}
        >
          <Download className="w-4 h-4 mr-2" />
          Export to Excel
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <Table>
          <TableCaption>A list of your registered students.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">Select</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Roll Number</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Year & Section</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredStudents.map((student) => (
              <TableRow key={student.id}>
                <TableCell className="font-medium">
                  <Input
                    type="checkbox"
                    checked={isStudentSelected(student)}
                    onChange={() => handleSelectStudent(student)}
                  />
                </TableCell>
                <TableCell className="font-medium">{student.name}</TableCell>
                <TableCell>{student.rollNumber}</TableCell>
                <TableCell>{student.email}</TableCell>
                <TableCell>{student.department}</TableCell>
                <TableCell>{student.yearSection}</TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleViewProfile(student)}
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    View
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => confirmDeleteStudent(student.id)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {/* Student Creation Modal */}
      <StudentCreationModal
        isOpen={showCreationModal}
        onClose={() => setShowCreationModal(false)}
        onStudentCreated={handleStudentCreated}
      />

      {/* Student Profile Modal */}
      {selectedStudent && (
        <StudentProfile
          student={selectedStudent}
          onBack={handleCloseProfile}
        />
      )}

      {/* Delete Confirmation Modal */}
      <AlertDialog open={showDeleteConfirmation} onOpenChange={setShowDeleteConfirmation}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the student from our
              servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelDeleteStudent}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={deleteStudent}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Batch Fee Processor Modal */}
      <BatchFeeProcessor
        open={showBatchFeeProcessor}
        onOpenChange={setShowBatchFeeProcessor}
        selectedStudents={selectedStudents}
        onProcessComplete={handleProcessComplete}
      />
    </div>
  );
};

export default StudentManagement;
