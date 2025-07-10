
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { useToast } from '../ui/use-toast';
import { supabase } from '../../integrations/supabase/client';
import { Plus } from 'lucide-react';

interface Student {
  id: string;
  name: string;
  roll_number: string;
  community: string;
  first_generation: boolean;
  department_name: string;
}

interface ScholarshipCreateDialogProps {
  onScholarshipCreated: () => void;
}

const ScholarshipCreateDialog: React.FC<ScholarshipCreateDialogProps> = ({ onScholarshipCreated }) => {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [formData, setFormData] = useState({
    student_id: '',
    scholarship_type: '',
    eligible_amount: 0,
    academic_year: '2024-25',
    semester: 5,
    remarks: ''
  });

  useEffect(() => {
    if (open) {
      fetchEligibleStudents();
    }
  }, [open]);

  const fetchEligibleStudents = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          name,
          roll_number,
          community,
          first_generation,
          departments!profiles_department_id_fkey(name)
        `)
        .eq('role', 'student')
        .eq('is_active', true)
        .or('community.in.(SC,ST),first_generation.eq.true');

      if (error) throw error;

      const studentsData = data.map(student => ({
        ...student,
        department_name: student.departments?.name || 'Unknown'
      }));

      setStudents(studentsData);
    } catch (error) {
      console.error('Error fetching students:', error);
      toast({
        title: "Error",
        description: "Failed to fetch eligible students",
        variant: "destructive"
      });
    }
  };

  const handleStudentChange = (studentId: string) => {
    const selectedStudent = students.find(s => s.id === studentId);
    if (selectedStudent) {
      let scholarshipType = '';
      let eligibleAmount = 0;

      if (selectedStudent.community === 'SC' || selectedStudent.community === 'ST') {
        scholarshipType = 'PMSS';
        eligibleAmount = 50000;
      } else if (selectedStudent.first_generation) {
        scholarshipType = 'FG';
        eligibleAmount = 25000;
      }

      setFormData(prev => ({
        ...prev,
        student_id: studentId,
        scholarship_type: scholarshipType,
        eligible_amount: eligibleAmount
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.student_id || !formData.scholarship_type) {
      toast({
        title: "Error",
        description: "Please select a student and scholarship type",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('scholarships')
        .insert({
          student_id: formData.student_id,
          scholarship_type: formData.scholarship_type,
          eligible_amount: formData.eligible_amount,
          academic_year: formData.academic_year,
          semester: formData.semester,
          applied_status: false,
          received_by_institution: false,
          remarks: formData.remarks || null
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Scholarship record created successfully"
      });

      setOpen(false);
      setFormData({
        student_id: '',
        scholarship_type: '',
        eligible_amount: 0,
        academic_year: '2024-25',
        semester: 5,
        remarks: ''
      });
      onScholarshipCreated();
    } catch (error) {
      console.error('Error creating scholarship:', error);
      toast({
        title: "Error",
        description: "Failed to create scholarship record",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Create Scholarship
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Scholarship</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="student">Student</Label>
            <Select value={formData.student_id} onValueChange={handleStudentChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select student" />
              </SelectTrigger>
              <SelectContent>
                {students.map(student => (
                  <SelectItem key={student.id} value={student.id}>
                    {student.name} ({student.roll_number}) - {student.department_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="scholarship_type">Scholarship Type</Label>
            <Input
              id="scholarship_type"
              value={formData.scholarship_type === 'PMSS' ? 'PMSS (SC/ST)' : formData.scholarship_type === 'FG' ? 'First Generation' : ''}
              readOnly
              placeholder="Auto-selected based on student eligibility"
            />
          </div>

          <div>
            <Label htmlFor="eligible_amount">Eligible Amount</Label>
            <Input
              id="eligible_amount"
              type="number"
              value={formData.eligible_amount}
              onChange={(e) => setFormData(prev => ({ ...prev, eligible_amount: parseInt(e.target.value) || 0 }))}
            />
          </div>

          <div>
            <Label htmlFor="academic_year">Academic Year</Label>
            <Input
              id="academic_year"
              value={formData.academic_year}
              onChange={(e) => setFormData(prev => ({ ...prev, academic_year: e.target.value }))}
            />
          </div>

          <div>
            <Label htmlFor="semester">Semester</Label>
            <Select value={formData.semester.toString()} onValueChange={(value) => setFormData(prev => ({ ...prev, semester: parseInt(value) }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                  <SelectItem key={sem} value={sem.toString()}>Semester {sem}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="remarks">Remarks (Optional)</Label>
            <Textarea
              id="remarks"
              value={formData.remarks}
              onChange={(e) => setFormData(prev => ({ ...prev, remarks: e.target.value }))}
              placeholder="Additional notes or comments"
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Scholarship'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ScholarshipCreateDialog;
