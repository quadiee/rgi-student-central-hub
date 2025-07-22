import React, { useState, useEffect } from 'react';
import { supabase } from '../../integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Textarea } from '../../components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { toast } from 'sonner';
import { Loader2, User, Briefcase } from 'lucide-react';

interface FacultyEditModalProps {
  faculty: {
    id: string;
    user_id: string;
    name: string;
    email: string;
    employee_code: string;
    designation: string;
    department_name: string;
    joining_date: string;
    phone: string;
    is_active: boolean;
  };
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

interface Department {
  id: string;
  name: string;
  code: string;
}

const FacultyEditModal: React.FC<FacultyEditModalProps> = ({
  faculty,
  isOpen,
  onClose,
  onUpdate
}) => {
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [facultyDetails, setFacultyDetails] = useState<any>(null);
  
  // Basic Information
  const [basicInfo, setBasicInfo] = useState({
    name: faculty.name,
    email: faculty.email,
    phone: faculty.phone || '',
    employee_code: faculty.employee_code,
    designation: faculty.designation,
    department_id: '',
    joining_date: faculty.joining_date,
    blood_group: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    current_address: '',
    permanent_address: '',
    is_active: faculty.is_active
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

  useEffect(() => {
    if (isOpen) {
      fetchDepartments();
      fetchFacultyDetails();
    }
  }, [isOpen]);

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

  const fetchFacultyDetails = async () => {
    try {
      // Fetch user profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', faculty.user_id)
        .single();

      if (profileError) throw profileError;

      // Fetch faculty profile
      const { data: facultyData, error: facultyError } = await supabase
        .from('faculty_profiles')
        .select('*')
        .eq('user_id', faculty.user_id)
        .single();

      if (facultyError) throw facultyError;

      setFacultyDetails(facultyData);
      
      // Update basic info with fetched data
      setBasicInfo(prev => ({
        ...prev,
        department_id: profileData.department_id || '',
        blood_group: facultyData.blood_group || '',
        emergency_contact_name: facultyData.emergency_contact_name || '',
        emergency_contact_phone: facultyData.emergency_contact_phone || '',
        current_address: facultyData.current_address || '',
        permanent_address: facultyData.permanent_address || ''
      }));

      // Update professional info with fetched data
      setProfessionalInfo({
        salary_grade: facultyData.salary_grade || '',
        pf_number: facultyData.pf_number || '',
        aadhar_number: facultyData.aadhar_number || '',
        pan_number: facultyData.pan_number || '',
        bank_account_number: facultyData.bank_account_number || '',
        bank_name: facultyData.bank_name || '',
        bank_branch: facultyData.bank_branch || '',
        ifsc_code: facultyData.ifsc_code || '',
        confirmation_date: facultyData.confirmation_date || '',
        marital_status: facultyData.marital_status || '',
        spouse_name: facultyData.spouse_name || '',
        children_count: facultyData.children_count || 0,
        medical_conditions: facultyData.medical_conditions || ''
      });

    } catch (error) {
      console.error('Error fetching faculty details:', error);
    }
  };

  const handleUpdateFaculty = async () => {
    try {
      setLoading(true);

      // Validate required fields
      if (!basicInfo.name || !basicInfo.email || !basicInfo.employee_code || 
          !basicInfo.designation || !basicInfo.department_id) {
        toast.error('Please fill in all required fields');
        return;
      }

      // Update user profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          name: basicInfo.name,
          email: basicInfo.email,
          phone: basicInfo.phone,
          department_id: basicInfo.department_id,
          employee_id: basicInfo.employee_code,
          blood_group: basicInfo.blood_group,
          address: basicInfo.current_address,
          is_active: basicInfo.is_active
        })
        .eq('id', faculty.user_id);

      if (profileError) throw profileError;

      // Update faculty profile
      const { error: facultyError } = await supabase
        .from('faculty_profiles')
        .update({
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
          is_active: basicInfo.is_active,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', faculty.user_id);

      if (facultyError) throw facultyError;

      toast.success('Faculty information updated successfully!');
      onUpdate();
      onClose();
    } catch (error: any) {
      console.error('Error updating faculty:', error);
      toast.error(error.message || 'Failed to update faculty information');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Faculty - {faculty.name}</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="basic">Basic Information</TabsTrigger>
            <TabsTrigger value="professional">Professional Details</TabsTrigger>
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

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={basicInfo.is_active}
                    onChange={(e) => setBasicInfo({...basicInfo, is_active: e.target.checked})}
                    className="rounded"
                  />
                  <Label htmlFor="is_active">Active Faculty Member</Label>
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
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-between pt-6 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleUpdateFaculty} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Update Faculty
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FacultyEditModal;
