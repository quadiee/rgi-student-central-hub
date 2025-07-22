
import React, { useState, useEffect } from 'react';
import { supabase } from '../../integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Badge } from '../../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { 
  User, 
  Briefcase, 
  GraduationCap, 
  Award, 
  BookOpen, 
  Calendar, 
  FileText,
  TrendingUp,
  Phone,
  Mail,
  MapPin,
  Building,
  CreditCard,
  Heart
} from 'lucide-react';

interface FacultyDetailsModalProps {
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
}

const FacultyDetailsModal: React.FC<FacultyDetailsModalProps> = ({
  faculty,
  isOpen,
  onClose
}) => {
  const [loading, setLoading] = useState(true);
  const [facultyDetails, setFacultyDetails] = useState<any>(null);
  const [qualifications, setQualifications] = useState<any[]>([]);
  const [experience, setExperience] = useState<any[]>([]);
  const [specializations, setSpecializations] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [research, setResearch] = useState<any[]>([]);
  const [leaves, setLeaves] = useState<any[]>([]);

  useEffect(() => {
    if (isOpen && faculty) {
      fetchFacultyDetails();
    }
  }, [isOpen, faculty]);

  const fetchFacultyDetails = async () => {
    try {
      setLoading(true);

      // Fetch faculty profile details
      const { data: profileData, error: profileError } = await supabase
        .from('faculty_profiles')
        .select('*')
        .eq('user_id', faculty.user_id)
        .single();

      if (profileError) throw profileError;
      setFacultyDetails(profileData);

      // Fetch qualifications
      const { data: qualData } = await supabase
        .from('faculty_qualifications')
        .select('*')
        .eq('faculty_id', profileData.id)
        .order('year_of_passing', { ascending: false });
      setQualifications(qualData || []);

      // Fetch experience
      const { data: expData } = await supabase
        .from('faculty_experience')
        .select('*')
        .eq('faculty_id', profileData.id)
        .order('from_date', { ascending: false });
      setExperience(expData || []);

      // Fetch specializations
      const { data: specData } = await supabase
        .from('faculty_specializations')
        .select('*')
        .eq('faculty_id', profileData.id);
      setSpecializations(specData || []);

      // Fetch courses
      const { data: courseData } = await supabase
        .from('faculty_courses')
        .select('*')
        .eq('faculty_id', profileData.id)
        .eq('is_active', true)
        .order('academic_year', { ascending: false });
      setCourses(courseData || []);

      // Fetch research
      const { data: researchData } = await supabase
        .from('faculty_research')
        .select('*')
        .eq('faculty_id', profileData.id)
        .order('created_at', { ascending: false });
      setResearch(researchData || []);

      // Fetch leaves
      const { data: leaveData } = await supabase
        .from('faculty_leaves')
        .select('*')
        .eq('faculty_id', profileData.id)
        .order('applied_date', { ascending: false })
        .limit(10);
      setLeaves(leaveData || []);

    } catch (error) {
      console.error('Error fetching faculty details:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/3" />
            <div className="h-32 bg-muted rounded" />
            <div className="h-64 bg-muted rounded" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Faculty Details</DialogTitle>
        </DialogHeader>

        {/* Faculty Header */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start gap-6">
              <Avatar className="h-24 w-24">
                <AvatarImage src="" />
                <AvatarFallback className="text-2xl">
                  {faculty.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-2xl font-bold">{faculty.name}</h2>
                  <Badge variant={faculty.is_active ? "default" : "secondary"}>
                    {faculty.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <p className="text-lg text-muted-foreground mb-3">
                  {faculty.designation}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-muted-foreground" />
                    <span>{faculty.department_name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                    <span>{faculty.employee_code}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{faculty.email}</span>
                  </div>
                  {faculty.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{faculty.phone}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="qualifications">Education</TabsTrigger>
            <TabsTrigger value="experience">Experience</TabsTrigger>
            <TabsTrigger value="courses">Courses</TabsTrigger>
            <TabsTrigger value="research">Research</TabsTrigger>
            <TabsTrigger value="leaves">Leaves</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Personal Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Personal Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="font-medium text-muted-foreground">Joining Date</p>
                      <p>{new Date(faculty.joining_date).toLocaleDateString()}</p>
                    </div>
                    {facultyDetails?.confirmation_date && (
                      <div>
                        <p className="font-medium text-muted-foreground">Confirmation Date</p>
                        <p>{new Date(facultyDetails.confirmation_date).toLocaleDateString()}</p>
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-muted-foreground">Blood Group</p>
                      <p>{facultyDetails?.blood_group || 'Not specified'}</p>
                    </div>
                    <div>
                      <p className="font-medium text-muted-foreground">Marital Status</p>
                      <p>{facultyDetails?.marital_status || 'Not specified'}</p>
                    </div>
                    {facultyDetails?.spouse_name && (
                      <div>
                        <p className="font-medium text-muted-foreground">Spouse Name</p>
                        <p>{facultyDetails.spouse_name}</p>
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-muted-foreground">Children</p>
                      <p>{facultyDetails?.children_count || 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Contact & Emergency */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Phone className="h-5 w-5" />
                    Contact Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {facultyDetails?.emergency_contact_name && (
                    <div>
                      <p className="font-medium text-muted-foreground">Emergency Contact</p>
                      <p>{facultyDetails.emergency_contact_name}</p>
                      {facultyDetails?.emergency_contact_phone && (
                        <p className="text-sm text-muted-foreground">{facultyDetails.emergency_contact_phone}</p>
                      )}
                    </div>
                  )}
                  {facultyDetails?.current_address && (
                    <div>
                      <p className="font-medium text-muted-foreground">Current Address</p>
                      <p className="text-sm">{facultyDetails.current_address}</p>
                    </div>
                  )}
                  {facultyDetails?.permanent_address && (
                    <div>
                      <p className="font-medium text-muted-foreground">Permanent Address</p>
                      <p className="text-sm">{facultyDetails.permanent_address}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Professional Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="h-5 w-5" />
                    Professional Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {facultyDetails?.salary_grade && (
                      <div>
                        <p className="font-medium text-muted-foreground">Salary Grade</p>
                        <p>{facultyDetails.salary_grade}</p>
                      </div>
                    )}
                    {facultyDetails?.pf_number && (
                      <div>
                        <p className="font-medium text-muted-foreground">PF Number</p>
                        <p>{facultyDetails.pf_number}</p>
                      </div>
                    )}
                    {facultyDetails?.aadhar_number && (
                      <div>
                        <p className="font-medium text-muted-foreground">Aadhar Number</p>
                        <p>{facultyDetails.aadhar_number.replace(/(\d{4})/g, '$1 ')}</p>
                      </div>
                    )}
                    {facultyDetails?.pan_number && (
                      <div>
                        <p className="font-medium text-muted-foreground">PAN Number</p>
                        <p>{facultyDetails.pan_number}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Bank Information */}
              {(facultyDetails?.bank_name || facultyDetails?.bank_account_number) && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CreditCard className="h-5 w-5" />
                      Bank Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-1 gap-4 text-sm">
                      {facultyDetails?.bank_name && (
                        <div>
                          <p className="font-medium text-muted-foreground">Bank Name</p>
                          <p>{facultyDetails.bank_name}</p>
                        </div>
                      )}
                      {facultyDetails?.bank_account_number && (
                        <div>
                          <p className="font-medium text-muted-foreground">Account Number</p>
                          <p>{facultyDetails.bank_account_number}</p>
                        </div>
                      )}
                      {facultyDetails?.bank_branch && (
                        <div>
                          <p className="font-medium text-muted-foreground">Branch</p>
                          <p>{facultyDetails.bank_branch}</p>
                        </div>
                      )}
                      {facultyDetails?.ifsc_code && (
                        <div>
                          <p className="font-medium text-muted-foreground">IFSC Code</p>
                          <p>{facultyDetails.ifsc_code}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="qualifications" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5" />
                  Educational Qualifications
                </CardTitle>
              </CardHeader>
              <CardContent>
                {qualifications.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No qualifications recorded yet.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {qualifications.map((qual, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="font-semibold text-lg">
                              {qual.degree_name}
                              {qual.specialization && ` in ${qual.specialization}`}
                            </h4>
                            <p className="text-muted-foreground">
                              {qual.institution_name}
                              {qual.university_name && ` (${qual.university_name})`}
                            </p>
                          </div>
                          {qual.is_highest && (
                            <Badge variant="default">Highest</Badge>
                          )}
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="font-medium text-muted-foreground">Type</p>
                            <p>{qual.degree_type}</p>
                          </div>
                          <div>
                            <p className="font-medium text-muted-foreground">Year</p>
                            <p>{qual.year_of_passing}</p>
                          </div>
                          <div>
                            <p className="font-medium text-muted-foreground">Percentage</p>
                            <p>{qual.percentage || 'N/A'}%</p>
                          </div>
                          <div>
                            <p className="font-medium text-muted-foreground">Grade</p>
                            <p>{qual.grade || 'N/A'}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="experience" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  Work Experience
                </CardTitle>
              </CardHeader>
              <CardContent>
                {experience.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No experience recorded yet.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {experience.map((exp, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="font-semibold text-lg">{exp.designation}</h4>
                            <p className="text-muted-foreground">{exp.organization_name}</p>
                          </div>
                          <Badge variant={exp.is_current ? "default" : "secondary"}>
                            {exp.is_current ? "Current" : "Previous"}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm mb-3">
                          <div>
                            <p className="font-medium text-muted-foreground">Type</p>
                            <p>{exp.experience_type}</p>
                          </div>
                          <div>
                            <p className="font-medium text-muted-foreground">From</p>
                            <p>{new Date(exp.from_date).toLocaleDateString()}</p>
                          </div>
                          <div>
                            <p className="font-medium text-muted-foreground">To</p>
                            <p>{exp.to_date ? new Date(exp.to_date).toLocaleDateString() : 'Present'}</p>
                          </div>
                        </div>
                        {exp.responsibilities && (
                          <div className="mb-2">
                            <p className="font-medium text-muted-foreground mb-1">Responsibilities</p>
                            <p className="text-sm">{exp.responsibilities}</p>
                          </div>
                        )}
                        {exp.achievements && (
                          <div>
                            <p className="font-medium text-muted-foreground mb-1">Achievements</p>
                            <p className="text-sm">{exp.achievements}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="courses" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Course Assignments
                </CardTitle>
              </CardHeader>
              <CardContent>
                {courses.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No courses assigned yet.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {courses.map((course, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="font-semibold">{course.course_name}</h4>
                            <p className="text-sm text-muted-foreground">{course.course_code}</p>
                          </div>
                          <Badge variant="outline">{course.course_type}</Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="font-medium text-muted-foreground">Semester</p>
                            <p>{course.semester}</p>
                          </div>
                          <div>
                            <p className="font-medium text-muted-foreground">Academic Year</p>
                            <p>{course.academic_year}</p>
                          </div>
                          {course.credits && (
                            <div>
                              <p className="font-medium text-muted-foreground">Credits</p>
                              <p>{course.credits}</p>
                            </div>
                          )}
                          {course.hours_per_week && (
                            <div>
                              <p className="font-medium text-muted-foreground">Hours/Week</p>
                              <p>{course.hours_per_week}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="research" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Research Activities
                </CardTitle>
              </CardHeader>
              <CardContent>
                {research.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No research activities recorded yet.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {research.map((item, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h4 className="font-semibold text-lg">{item.title}</h4>
                            <p className="text-muted-foreground">{item.research_type}</p>
                          </div>
                          <Badge variant="outline">{item.status}</Badge>
                        </div>
                        {item.description && (
                          <p className="text-sm mb-3">{item.description}</p>
                        )}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                          {item.journal_name && (
                            <div>
                              <p className="font-medium text-muted-foreground">Journal</p>
                              <p>{item.journal_name}</p>
                            </div>
                          )}
                          {item.conference_name && (
                            <div>
                              <p className="font-medium text-muted-foreground">Conference</p>
                              <p>{item.conference_name}</p>
                            </div>
                          )}
                          {item.funding_amount && (
                            <div>
                              <p className="font-medium text-muted-foreground">Funding</p>
                              <p>₹{item.funding_amount.toLocaleString()}</p>
                            </div>
                          )}
                          {item.funding_agency && (
                            <div>
                              <p className="font-medium text-muted-foreground">Funding Agency</p>
                              <p>{item.funding_agency}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="leaves" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Leave History
                </CardTitle>
              </CardHeader>
              <CardContent>
                {leaves.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No leave records found.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {leaves.map((leave, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="font-semibold">{leave.leave_type}</h4>
                            <p className="text-sm text-muted-foreground">
                              {new Date(leave.from_date).toLocaleDateString()} - {new Date(leave.to_date).toLocaleDateString()}
                            </p>
                          </div>
                          <Badge 
                            variant={
                              leave.status === 'Approved' ? 'default' : 
                              leave.status === 'Rejected' ? 'destructive' : 
                              'secondary'
                            }
                          >
                            {leave.status}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm mb-2">
                          <div>
                            <p className="font-medium text-muted-foreground">Total Days</p>
                            <p>{leave.total_days}</p>
                          </div>
                          <div>
                            <p className="font-medium text-muted-foreground">Applied Date</p>
                            <p>{new Date(leave.applied_date).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div>
                          <p className="font-medium text-muted-foreground mb-1">Reason</p>
                          <p className="text-sm">{leave.reason}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end pt-6 border-t">
          <Button onClick={onClose}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FacultyDetailsModal;
