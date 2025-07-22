import React, { useState, useEffect } from 'react';
import { supabase } from '../../integrations/supabase/client';
import { useAuth } from '../../contexts/SupabaseAuthContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Textarea } from '../../components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { toast } from 'sonner';
import { Loader2, User, Briefcase, GraduationCap, Award } from 'lucide-react';

interface FacultyCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Department {
  id: string;
  name: string;
  code: string;
}

const FacultyCreationModal: React.FC<FacultyCreationModalProps> = ({
  isOpen,
  onClose
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [activeTab, setActiveTab] = useState('basic');

  // Basic Information
  const [basicInfo, setBasicInfo] = useState({
    name: '',
    email: '',
    phone: '',
    employee_code: '',
    designation: '',
    department_id: '',
    joining_date: '',
    blood_group: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    current_address: '',
    permanent_address: ''
  });

  // Professional Information
  const [professionalInfo, setProfessionalInfo] = useState({
    salary_grade: '',
    pf_number: '',
    aadhar_number: '',
    pan_number: '',
    bank_account_number: '',
    bank_name: '',
    bank_branch: '',
    ifsc_code: '',
    confirmation_date: '',
    marital_status: '',
    spouse_name: '',
    children_count: 0,
    medical_conditions: ''
  });

  // Qualification
  const [qualification, setQualification] = useState({
    degree_type: '',
    degree_name: '',
    specialization: '',
    institution_name: '',
    university_name: '',
    year_of_passing: new Date().getFullYear(),
    percentage: 0,
    grade: '',
    is_highest: true
  });

  // Specialization
  const [specialization, setSpecialization] = useState({
    specialization_area: '',
    proficiency_level: '',
    years_of_experience: 0,
    certifications: ''
  });

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const { data, error } = await supabase
        .from('departments')
        .select('id, name, code')
        .eq('is_active', true);

      if (error) throw error;
      setDepartments(data || []);
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  const handleCreateFaculty = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Validate required fields
      if (!basicInfo.name || !basicInfo.email || !basicInfo.employee_code || 
          !basicInfo.designation || !basicInfo.department_id || !basicInfo.joining_date) {
        toast.error('Please fill in all required basic information fields');
        return;
      }

      // Step 1: Create user profile - using correct field names
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .insert({
          name: basicInfo.name,
          email: basicInfo.email,
          phone: basicInfo.phone,
          role: 'faculty' as const,
          department_id: basicInfo.department_id,
          employee_id: basicInfo.employee_code,
          blood_group: basicInfo.blood_group,
          address: basicInfo.current_address,
          is_active: true
        })
        .select()
        .single();

      if (profileError) throw profileError;

      // Step 2: Create faculty profile
      const { data: facultyData, error: facultyError } = await supabase
        .from('faculty_profiles')
        .insert({
          user_id: profileData.id,
          employee_code: basicInfo.employee_code,
          designation: basicInfo.designation,
          joining_date: basicInfo.joining_date,
          confirmation_date: professionalInfo.confirmation_date || null,
          salary_grade: professionalInfo.salary_grade,
          pf_number: professionalInfo.pf_number,
          aadhar_number: professionalInfo.aadhar_number,
          pan_number: professionalInfo.pan_number,
          bank_account_number: professionalInfo.bank_account_number,
          bank_name: professionalInfo.bank_name,
          bank_branch: professionalInfo.bank_branch,
          ifsc_code: professionalInfo.ifsc_code,
          emergency_contact_name: basicInfo.emergency_contact_name,
          emergency_contact_phone: basicInfo.emergency_contact_phone,
          current_address: basicInfo.current_address,
          permanent_address: basicInfo.permanent_address,
          marital_status: professionalInfo.marital_status,
          spouse_name: professionalInfo.spouse_name,
          children_count: professionalInfo.children_count,
          medical_conditions: professionalInfo.medical_conditions,
          blood_group: basicInfo.blood_group,
          created_by: user.id
        })
        .select()
        .single();

      if (facultyError) throw facultyError;

      // Step 3: Add qualification if provided
      if (qualification.degree_name && qualification.institution_name) {
        const { error: qualError } = await supabase
          .from('faculty_qualifications')
          .insert({
            faculty_id: facultyData.id,
            degree_type: qualification.degree_type,
            degree_name: qualification.degree_name,
            specialization: qualification.specialization,
            institution_name: qualification.institution_name,
            university_name: qualification.university_name,
            year_of_passing: qualification.year_of_passing,
            percentage: qualification.percentage || null,
            grade: qualification.grade,
            is_highest: qualification.is_highest
          });

        if (qualError) throw qualError;
      }

      // Step 4: Add specialization if provided
      if (specialization.specialization_area) {
        const { error: specError } = await supabase
          .from('faculty_specializations')
          .insert({
            faculty_id: facultyData.id,
            specialization_area: specialization.specialization_area,
            proficiency_level: specialization.proficiency_level,
            years_of_experience: specialization.years_of_experience,
            certifications: specialization.certifications ? 
              specialization.certifications.split(',').map(c => c.trim()) : []
          });

        if (specError) throw specError;
      }

      toast.success('Faculty member created successfully!');
      onClose();
    } catch (error: any) {
      console.error('Error creating faculty:', error);
      toast.error(error.message || 'Failed to create faculty member');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Faculty Member</DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic" className="text-xs sm:text-sm">Basic Info</TabsTrigger>
            <TabsTrigger value="professional" className="text-xs sm:text-sm">Professional</TabsTrigger>
            <TabsTrigger value="qualification" className="text-xs sm:text-sm">Qualification</TabsTrigger>
            <TabsTrigger value="specialization" className="text-xs sm:text-sm">Specialization</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      value={basicInfo.name}
                      onChange={(e) => setBasicInfo({...basicInfo, name: e.target.value})}
                      placeholder="Enter full name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={basicInfo.email}
                      onChange={(e) => setBasicInfo({...basicInfo, email: e.target.value})}
                      placeholder="Enter email address"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={basicInfo.phone}
                      onChange={(e) => setBasicInfo({...basicInfo, phone: e.target.value})}
                      placeholder="Enter phone number"
                    />
                  </div>
                  <div>
                    <Label htmlFor="employee_code">Employee Code *</Label>
                    <Input
                      id="employee_code"
                      value={basicInfo.employee_code}
                      onChange={(e) => setBasicInfo({...basicInfo, employee_code: e.target.value})}
                      placeholder="Enter employee code"
                    />
                  </div>
                  <div>
                    <Label htmlFor="designation">Designation *</Label>
                    <Select 
                      value={basicInfo.designation} 
                      onValueChange={(value) => setBasicInfo({...basicInfo, designation: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select designation" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Professor">Professor</SelectItem>
                        <SelectItem value="Associate Professor">Associate Professor</SelectItem>
                        <SelectItem value="Assistant Professor">Assistant Professor</SelectItem>
                        <SelectItem value="Lecturer">Lecturer</SelectItem>
                        <SelectItem value="Senior Lecturer">Senior Lecturer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="department">Department *</Label>
                    <Select 
                      value={basicInfo.department_id} 
                      onValueChange={(value) => setBasicInfo({...basicInfo, department_id: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        {departments.map((dept) => (
                          <SelectItem key={dept.id} value={dept.id}>
                            {dept.name} ({dept.code})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="joining_date">Joining Date *</Label>
                    <Input
                      id="joining_date"
                      type="date"
                      value={basicInfo.joining_date}
                      onChange={(e) => setBasicInfo({...basicInfo, joining_date: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="blood_group">Blood Group</Label>
                    <Select 
                      value={basicInfo.blood_group} 
                      onValueChange={(value) => setBasicInfo({...basicInfo, blood_group: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select blood group" />
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
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="emergency_contact_name">Emergency Contact Name</Label>
                    <Input
                      id="emergency_contact_name"
                      value={basicInfo.emergency_contact_name}
                      onChange={(e) => setBasicInfo({...basicInfo, emergency_contact_name: e.target.value})}
                      placeholder="Enter emergency contact name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="emergency_contact_phone">Emergency Contact Phone</Label>
                    <Input
                      id="emergency_contact_phone"
                      value={basicInfo.emergency_contact_phone}
                      onChange={(e) => setBasicInfo({...basicInfo, emergency_contact_phone: e.target.value})}
                      placeholder="Enter emergency contact phone"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="current_address">Current Address</Label>
                  <Textarea
                    id="current_address"
                    value={basicInfo.current_address}
                    onChange={(e) => setBasicInfo({...basicInfo, current_address: e.target.value})}
                    placeholder="Enter current address"
                  />
                </div>
                <div>
                  <Label htmlFor="permanent_address">Permanent Address</Label>
                  <Textarea
                    id="permanent_address"
                    value={basicInfo.permanent_address}
                    onChange={(e) => setBasicInfo({...basicInfo, permanent_address: e.target.value})}
                    placeholder="Enter permanent address"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="professional" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  Professional Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="salary_grade">Salary Grade</Label>
                    <Input
                      id="salary_grade"
                      value={professionalInfo.salary_grade}
                      onChange={(e) => setProfessionalInfo({...professionalInfo, salary_grade: e.target.value})}
                      placeholder="Enter salary grade"
                    />
                  </div>
                  <div>
                    <Label htmlFor="pf_number">PF Number</Label>
                    <Input
                      id="pf_number"
                      value={professionalInfo.pf_number}
                      onChange={(e) => setProfessionalInfo({...professionalInfo, pf_number: e.target.value})}
                      placeholder="Enter PF number"
                    />
                  </div>
                  <div>
                    <Label htmlFor="aadhar_number">Aadhar Number</Label>
                    <Input
                      id="aadhar_number"
                      value={professionalInfo.aadhar_number}
                      onChange={(e) => setProfessionalInfo({...professionalInfo, aadhar_number: e.target.value})}
                      placeholder="Enter Aadhar number"
                    />
                  </div>
                  <div>
                    <Label htmlFor="pan_number">PAN Number</Label>
                    <Input
                      id="pan_number"
                      value={professionalInfo.pan_number}
                      onChange={(e) => setProfessionalInfo({...professionalInfo, pan_number: e.target.value})}
                      placeholder="Enter PAN number"
                    />
                  </div>
                  <div>
                    <Label htmlFor="bank_name">Bank Name</Label>
                    <Input
                      id="bank_name"
                      value={professionalInfo.bank_name}
                      onChange={(e) => setProfessionalInfo({...professionalInfo, bank_name: e.target.value})}
                      placeholder="Enter bank name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="bank_account_number">Account Number</Label>
                    <Input
                      id="bank_account_number"
                      value={professionalInfo.bank_account_number}
                      onChange={(e) => setProfessionalInfo({...professionalInfo, bank_account_number: e.target.value})}
                      placeholder="Enter account number"
                    />
                  </div>
                  <div>
                    <Label htmlFor="bank_branch">Bank Branch</Label>
                    <Input
                      id="bank_branch"
                      value={professionalInfo.bank_branch}
                      onChange={(e) => setProfessionalInfo({...professionalInfo, bank_branch: e.target.value})}
                      placeholder="Enter bank branch"
                    />
                  </div>
                  <div>
                    <Label htmlFor="ifsc_code">IFSC Code</Label>
                    <Input
                      id="ifsc_code"
                      value={professionalInfo.ifsc_code}
                      onChange={(e) => setProfessionalInfo({...professionalInfo, ifsc_code: e.target.value})}
                      placeholder="Enter IFSC code"
                    />
                  </div>
                  <div>
                    <Label htmlFor="confirmation_date">Confirmation Date</Label>
                    <Input
                      id="confirmation_date"
                      type="date"
                      value={professionalInfo.confirmation_date}
                      onChange={(e) => setProfessionalInfo({...professionalInfo, confirmation_date: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="marital_status">Marital Status</Label>
                    <Select 
                      value={professionalInfo.marital_status} 
                      onValueChange={(value) => setProfessionalInfo({...professionalInfo, marital_status: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select marital status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Single">Single</SelectItem>
                        <SelectItem value="Married">Married</SelectItem>
                        <SelectItem value="Divorced">Divorced</SelectItem>
                        <SelectItem value="Widowed">Widowed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="spouse_name">Spouse Name</Label>
                    <Input
                      id="spouse_name"
                      value={professionalInfo.spouse_name}
                      onChange={(e) => setProfessionalInfo({...professionalInfo, spouse_name: e.target.value})}
                      placeholder="Enter spouse name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="children_count">Number of Children</Label>
                    <Input
                      id="children_count"
                      type="number"
                      min="0"
                      value={professionalInfo.children_count}
                      onChange={(e) => setProfessionalInfo({...professionalInfo, children_count: parseInt(e.target.value) || 0})}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="medical_conditions">Medical Conditions</Label>
                  <Textarea
                    id="medical_conditions"
                    value={professionalInfo.medical_conditions}
                    onChange={(e) => setProfessionalInfo({...professionalInfo, medical_conditions: e.target.value})}
                    placeholder="Enter any medical conditions"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="qualification" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5" />
                  Educational Qualification
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="degree_type">Degree Type</Label>
                    <Select 
                      value={qualification.degree_type} 
                      onValueChange={(value) => setQualification({...qualification, degree_type: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select degree type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="UG">Undergraduate (UG)</SelectItem>
                        <SelectItem value="PG">Postgraduate (PG)</SelectItem>
                        <SelectItem value="PhD">Doctor of Philosophy (PhD)</SelectItem>
                        <SelectItem value="Diploma">Diploma</SelectItem>
                        <SelectItem value="Certificate">Certificate</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="degree_name">Degree Name</Label>
                    <Input
                      id="degree_name"
                      value={qualification.degree_name}
                      onChange={(e) => setQualification({...qualification, degree_name: e.target.value})}
                      placeholder="e.g., B.Tech, M.Tech, PhD"
                    />
                  </div>
                  <div>
                    <Label htmlFor="specialization_qual">Specialization</Label>
                    <Input
                      id="specialization_qual"
                      value={qualification.specialization}
                      onChange={(e) => setQualification({...qualification, specialization: e.target.value})}
                      placeholder="e.g., Computer Science, Electronics"
                    />
                  </div>
                  <div>
                    <Label htmlFor="institution_name">Institution Name</Label>
                    <Input
                      id="institution_name"
                      value={qualification.institution_name}
                      onChange={(e) => setQualification({...qualification, institution_name: e.target.value})}
                      placeholder="Enter institution name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="university_name">University Name</Label>
                    <Input
                      id="university_name"
                      value={qualification.university_name}
                      onChange={(e) => setQualification({...qualification, university_name: e.target.value})}
                      placeholder="Enter university name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="year_of_passing">Year of Passing</Label>
                    <Input
                      id="year_of_passing"
                      type="number"
                      min="1950"
                      max={new Date().getFullYear()}
                      value={qualification.year_of_passing}
                      onChange={(e) => setQualification({...qualification, year_of_passing: parseInt(e.target.value) || new Date().getFullYear()})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="percentage">Percentage</Label>
                    <Input
                      id="percentage"
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      value={qualification.percentage}
                      onChange={(e) => setQualification({...qualification, percentage: parseFloat(e.target.value) || 0})}
                      placeholder="Enter percentage"
                    />
                  </div>
                  <div>
                    <Label htmlFor="grade">Grade</Label>
                    <Input
                      id="grade"
                      value={qualification.grade}
                      onChange={(e) => setQualification({...qualification, grade: e.target.value})}
                      placeholder="e.g., A+, First Class"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="specialization" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Specialization & Expertise
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="specialization_area">Specialization Area</Label>
                    <Input
                      id="specialization_area"
                      value={specialization.specialization_area}
                      onChange={(e) => setSpecialization({...specialization, specialization_area: e.target.value})}
                      placeholder="e.g., Machine Learning, VLSI Design"
                    />
                  </div>
                  <div>
                    <Label htmlFor="proficiency_level">Proficiency Level</Label>
                    <Select 
                      value={specialization.proficiency_level} 
                      onValueChange={(value) => setSpecialization({...specialization, proficiency_level: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select proficiency level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Beginner">Beginner</SelectItem>
                        <SelectItem value="Intermediate">Intermediate</SelectItem>
                        <SelectItem value="Advanced">Advanced</SelectItem>
                        <SelectItem value="Expert">Expert</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="years_of_experience">Years of Experience</Label>
                    <Input
                      id="years_of_experience"
                      type="number"
                      min="0"
                      value={specialization.years_of_experience}
                      onChange={(e) => setSpecialization({...specialization, years_of_experience: parseInt(e.target.value) || 0})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="certifications">Certifications</Label>
                    <Input
                      id="certifications"
                      value={specialization.certifications}
                      onChange={(e) => setSpecialization({...specialization, certifications: e.target.value})}
                      placeholder="Enter certifications (comma separated)"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-between pt-6 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <div className="flex gap-2">
            {activeTab !== 'basic' && (
              <Button 
                variant="outline" 
                onClick={() => {
                  const tabs = ['basic', 'professional', 'qualification', 'specialization'];
                  const currentIndex = tabs.indexOf(activeTab);
                  if (currentIndex > 0) {
                    setActiveTab(tabs[currentIndex - 1]);
                  }
                }}
              >
                Previous
              </Button>
            )}
            {activeTab !== 'specialization' ? (
              <Button 
                onClick={() => {
                  const tabs = ['basic', 'professional', 'qualification', 'specialization'];
                  const currentIndex = tabs.indexOf(activeTab);
                  if (currentIndex < tabs.length - 1) {
                    setActiveTab(tabs[currentIndex + 1]);
                  }
                }}
              >
                Next
              </Button>
            ) : (
              <Button onClick={handleCreateFaculty} disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Faculty
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FacultyCreationModal;
