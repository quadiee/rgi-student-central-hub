import React, { useState, useEffect } from 'react';
import { Search, Filter, Users, GraduationCap, CreditCard, Award } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { useAuth } from '../../contexts/SupabaseAuthContext';
import { supabase } from '../../integrations/supabase/client';
import { useToast } from '../ui/use-toast';
import MobileDataCard from './MobileDataCard';
import StudentProfile from '../Students/StudentProfile';

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
  guardianName?: string;
  guardianPhone?: string;
  course?: string;
  yearSection?: string;
  section?: string;
  admissionDate?: string;
  bloodGroup?: string;
  emergencyContact?: string;
  profileImage?: string;
  scholarships?: ScholarshipData[];
}

interface ScholarshipData {
  id: string;
  scholarship_type: 'PMSS' | 'FG';
  eligible_amount: number;
  applied_status: boolean;
  application_date?: string;
  received_by_institution: boolean;
  receipt_date?: string;
  academic_year: string;
  remarks?: string;
}

interface ChairmanStudentManagementProps {
  className?: string;
}

const ChairmanStudentManagement: React.FC<ChairmanStudentManagementProps> = ({ className }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [students, setStudents] = useState<StudentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<StudentData | null>(null);
  const [showProfile, setShowProfile] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      
      // Fetch students with their scholarships
      const { data: studentsData, error: studentsError } = await supabase
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
          guardian_name,
          guardian_phone,
          course,
          year_section,
          section,
          admission_date,
          blood_group,
          emergency_contact,
          profile_photo_url,
          departments:department_id (
            name,
            code
          )
        `)
        .eq('role', 'student')
        .eq('is_active', true)
        .order('roll_number');

      if (studentsError) throw studentsError;

      // Fetch scholarships for all students
      const { data: scholarshipsData, error: scholarshipsError } = await supabase
        .from('scholarships')
        .select('*')
        .eq('academic_year', '2024-25');

      if (scholarshipsError) throw scholarshipsError;

      // Combine students with their scholarships
      const studentsWithScholarships = studentsData?.map(student => ({
        ...student,
        department_name: student.departments?.name || 'Unknown',
        department_code: student.departments?.code || 'UNK',
        guardianName: student.guardian_name,
        guardianPhone: student.guardian_phone,
        yearSection: student.year_section,
        admissionDate: student.admission_date,
        bloodGroup: student.blood_group,
        emergencyContact: student.emergency_contact,
        profileImage: student.profile_photo_url,
        scholarships: scholarshipsData?.filter(s => s.student_id === student.id) || []
      })) || [];

      setStudents(studentsWithScholarships);
    } catch (error) {
      console.error('Error fetching students:', error);
      toast({
        title: 'Error',
        description: 'Failed to load student data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStudentClick = (student: StudentData) => {
    // Transform student data to match StudentProfile props
    const transformedStudent = {
      id: student.id,
      name: student.name,
      email: student.email,
      rollNumber: student.roll_number,
      roll_number: student.roll_number,
      course: student.course || 'Not specified',
      year: student.year,
      semester: student.semester,
      phone: student.phone || '',
      profileImage: student.profileImage,
      admissionDate: student.admissionDate,
      guardianName: student.guardianName,
      guardianPhone: student.guardianPhone,
      address: student.address,
      bloodGroup: student.bloodGroup,
      emergencyContact: student.emergencyContact,
      department: student.department_name,
      yearSection: student.yearSection,
      section: student.section,
      community: student.community as 'SC' | 'ST' | 'OBC' | 'General' | 'EWS' | undefined,
      first_generation: student.first_generation,
      totalFees: 0,
      paidAmount: 0,
      dueAmount: 0,
      feeStatus: 'Pending'
    };

    setSelectedStudent(transformedStudent);
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
      student.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  const getScholarshipInfo = (student: StudentData) => {
    const scholarships = student.scholarships || [];
    if (scholarships.length === 0) return 'No scholarships';
    
    const types = scholarships.map(s => s.scholarship_type).join(', ');
    const totalAmount = scholarships.reduce((sum, s) => sum + s.eligible_amount, 0);
    return `${types} - ₹${totalAmount.toLocaleString()}`;
  };

  if (showProfile && selectedStudent) {
    return (
      <StudentProfile
        student={selectedStudent}
        onBack={handleBackToList}
      />
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Users className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-semibold">Students Overview</h2>
        </div>
        <Badge variant="outline" className="text-sm">
          {filteredStudents.length} students
        </Badge>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search students..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Students List */}
      <div className="space-y-3">
        {filteredStudents.map((student) => (
          <MobileDataCard
            key={student.id}
            title={student.name}
            subtitle={`${student.roll_number} • ${student.department_name}`}
            status={{
              label: student.is_active ? 'Active' : 'Inactive',
              variant: student.is_active ? 'default' : 'secondary'
            }}
            data={[
              {
                label: 'Year',
                value: `${student.year}`,
                icon: GraduationCap
              },
              {
                label: 'Email',
                value: student.email,
                icon: Users
              },
              {
                label: 'Community',
                value: student.community || 'General',
                icon: Users
              },
              {
                label: 'Scholarships',
                value: getScholarshipInfo(student),
                icon: Award,
                color: student.scholarships?.length ? 'text-green-600' : 'text-gray-500'
              }
            ]}
            onClick={() => handleStudentClick(student)}
            actions={[
              {
                label: 'View Profile',
                icon: Users,
                onClick: () => handleStudentClick(student)
              }
            ]}
          />
        ))}
      </div>

      {filteredStudents.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>No students found</p>
        </div>
      )}
    </div>
  );
};

export default ChairmanStudentManagement;
