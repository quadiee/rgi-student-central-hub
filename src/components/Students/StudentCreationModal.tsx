
import React, { useState } from 'react';
import { X, User, Phone, Mail, MapPin, Users, Heart, AlertTriangle } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Checkbox } from '../ui/checkbox';
import { Student } from '../../types/user-student-fees';
import { supabase } from '../../integrations/supabase/client';
import { useToast } from '../ui/use-toast';
import { v4 as uuidv4 } from 'uuid';

interface StudentCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStudentCreated: (student: Student) => void;
}

const StudentCreationModal: React.FC<StudentCreationModalProps> = ({
  isOpen,
  onClose,
  onStudentCreated
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    rollNumber: '',
    email: '',
    phone: '',
    course: '',
    year: 1,
    semester: 1,
    department: '',
    section: 'A',
    guardianName: '',
    guardianPhone: '',
    address: '',
    bloodGroup: '',
    emergencyContact: '',
    community: 'General' as 'SC' | 'ST' | 'OBC' | 'General' | 'EWS',
    first_generation: false,
    admissionDate: new Date().toISOString().split('T')[0]
  });

  const handleInputChange = (field: string, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Generate a UUID for the new profile
      const profileId = uuidv4();
      
      // Create the student profile with correct database field names
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: profileId,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          roll_number: formData.rollNumber,
          course: formData.course,
          year: formData.year,
          semester: formData.semester,
          section: formData.section,
          guardian_name: formData.guardianName,
          guardian_phone: formData.guardianPhone,
          address: formData.address,
          blood_group: formData.bloodGroup,
          emergency_contact: formData.emergencyContact,
          community: formData.community,
          first_generation: formData.first_generation,
          admission_date: formData.admissionDate,
          role: 'student',
          is_active: true,
          profile_completed: true,
          department_id: formData.department || null
        })
        .select()
        .single();

      if (profileError) throw profileError;

      // Calculate scholarship eligibility
      if (profile) {
        const { error: scholarshipError } = await supabase
          .rpc('calculate_scholarship_eligibility', {
            p_student_id: profile.id,
            p_academic_year: '2024-25'
          });

        if (scholarshipError) {
          console.warn('Failed to calculate scholarship eligibility:', scholarshipError);
        }
      }

      const newStudent: Student = {
        id: profile.id,
        name: formData.name,
        rollNumber: formData.rollNumber,
        email: formData.email,
        phone: formData.phone,
        course: formData.course,
        year: formData.year,
        semester: formData.semester,
        department: formData.department,
        section: formData.section,
        guardianName: formData.guardianName,
        guardianPhone: formData.guardianPhone,
        address: formData.address,
        bloodGroup: formData.bloodGroup,
        emergencyContact: formData.emergencyContact,
        community: formData.community,
        first_generation: formData.first_generation,
        admissionDate: formData.admissionDate,
        feeStatus: 'Pending'
      };

      onStudentCreated(newStudent);
      toast({
        title: "Success",
        description: `Student profile has been created successfully. Scholarship eligibility has been calculated.`,
      });
      onClose();
    } catch (error) {
      console.error('Error creating student:', error);
      toast({
        title: "Error",
        description: "Failed to create student. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <User className="w-5 h-5" />
            Add New Student
          </h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="rollNumber">Roll Number *</Label>
              <Input
                id="rollNumber"
                value={formData.rollNumber}
                onChange={(e) => handleInputChange('rollNumber', e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
              />
            </div>
          </div>

          {/* Academic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="course">Course</Label>
              <Input
                id="course"
                value={formData.course}
                onChange={(e) => handleInputChange('course', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="department">Department</Label>
              <Select value={formData.department} onValueChange={(value) => handleInputChange('department', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CSE">Computer Science</SelectItem>
                  <SelectItem value="ECE">Electronics & Communication</SelectItem>
                  <SelectItem value="EEE">Electrical & Electronics</SelectItem>
                  <SelectItem value="MECH">Mechanical</SelectItem>
                  <SelectItem value="CIVIL">Civil</SelectItem>
                  <SelectItem value="IT">Information Technology</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="year">Year</Label>
              <Select value={formData.year.toString()} onValueChange={(value) => handleInputChange('year', parseInt(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1st Year</SelectItem>
                  <SelectItem value="2">2nd Year</SelectItem>
                  <SelectItem value="3">3rd Year</SelectItem>
                  <SelectItem value="4">4th Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="section">Section</Label>
              <Select value={formData.section} onValueChange={(value) => handleInputChange('section', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A">Section A</SelectItem>
                  <SelectItem value="B">Section B</SelectItem>
                  <SelectItem value="C">Section C</SelectItem>
                  <SelectItem value="D">Section D</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Scholarship Information */}
          <div className="border rounded-lg p-4 bg-blue-50">
            <h3 className="font-medium text-blue-800 mb-3 flex items-center gap-2">
              <Users className="w-4 h-4" />
              Scholarship Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="community">Community</Label>
                <Select value={formData.community} onValueChange={(value) => handleInputChange('community', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="General">General</SelectItem>
                    <SelectItem value="SC">SC (Scheduled Caste)</SelectItem>
                    <SelectItem value="ST">ST (Scheduled Tribe)</SelectItem>
                    <SelectItem value="OBC">OBC (Other Backward Class)</SelectItem>
                    <SelectItem value="EWS">EWS (Economically Weaker Section)</SelectItem>
                  </SelectContent>
                </Select>
                {formData.community === 'SC' || formData.community === 'ST' ? (
                  <p className="text-sm text-green-600 mt-1">✓ Eligible for PMSS (₹50,000)</p>
                ) : null}
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="first_generation"
                  checked={formData.first_generation}
                  onCheckedChange={(checked) => handleInputChange('first_generation', checked)}
                />
                <Label htmlFor="first_generation" className="text-sm">
                  First Generation Graduate
                </Label>
                {formData.first_generation ? (
                  <p className="text-sm text-green-600">✓ Eligible for FG (₹25,000)</p>
                ) : null}
              </div>
            </div>
          </div>

          {/* Guardian Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="guardianName">Guardian Name</Label>
              <Input
                id="guardianName"
                value={formData.guardianName}
                onChange={(e) => handleInputChange('guardianName', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="guardianPhone">Guardian Phone</Label>
              <Input
                id="guardianPhone"
                value={formData.guardianPhone}
                onChange={(e) => handleInputChange('guardianPhone', e.target.value)}
              />
            </div>
          </div>

          {/* Additional Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="bloodGroup">Blood Group</Label>
              <Select value={formData.bloodGroup} onValueChange={(value) => handleInputChange('bloodGroup', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Blood Group" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A+">A+</SelectItem>
                  <SelectItem value="A-">A-</SelectItem>
                  <SelectItem value="B+">B+</SelectItem>
                  <SelectItem value="B-">B-</SelectItem>
                  <SelectItem value="AB+">AB+</SelectItem>
                  <SelectItem value="AB-">AB-</SelectItem>
                  <SelectItem value="O+">O+</SelectItem>
                  <SelectItem value="O-">O-</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="emergencyContact">Emergency Contact</Label>
              <Input
                id="emergencyContact"
                value={formData.emergencyContact}
                onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Student'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StudentCreationModal;
