
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { Mail, Phone, MapPin, Calendar, User, Briefcase, Heart, Shield, Clock } from 'lucide-react';

interface FacultyDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  faculty: {
    faculty_id: string;
    user_id: string;
    name: string;
    email: string;
    employee_code: string;
    designation: string;
    department_name: string;
    department_code: string;
    joining_date: string;
    phone: string | null;
    gender: string | null;
    age: number | null;
    years_of_experience: number | null;
    is_active: boolean;
    emergency_contact_name: string | null;
    emergency_contact_phone: string | null;
    current_address: string | null;
    blood_group: string | null;
    marital_status: string | null;
    total_attendance_days: number;
    present_days: number;
    absent_days: number;
    attendance_percentage: number;
  };
}

const FacultyDetailsModal: React.FC<FacultyDetailsModalProps> = ({
  isOpen,
  onClose,
  faculty
}) => {
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getAttendanceColor = (percentage: number) => {
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 75) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Faculty Details - {faculty.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header Card */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start gap-6">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="h-10 w-10 text-blue-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-2xl font-bold">{faculty.name}</h2>
                    <Badge variant={faculty.is_active ? 'default' : 'secondary'}>
                      {faculty.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <p className="text-lg text-muted-foreground mb-2">
                    {faculty.designation} • {faculty.department_name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Employee Code: {faculty.employee_code}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Personal Information */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-3">
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Email:</span>
                    <span className="text-sm">{faculty.email}</span>
                  </div>
                  
                  {faculty.phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Phone:</span>
                      <span className="text-sm">{faculty.phone}</span>
                    </div>
                  )}
                  
                  {faculty.gender && (
                    <div className="flex items-center gap-3">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Gender:</span>
                      <span className="text-sm">{faculty.gender}</span>
                    </div>
                  )}
                  
                  {faculty.age && (
                    <div className="flex items-center gap-3">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Age:</span>
                      <span className="text-sm">{faculty.age} years</span>
                    </div>
                  )}
                  
                  {faculty.marital_status && (
                    <div className="flex items-center gap-3">
                      <Heart className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Marital Status:</span>
                      <span className="text-sm">{faculty.marital_status}</span>
                    </div>
                  )}
                  
                  {faculty.blood_group && (
                    <div className="flex items-center gap-3">
                      <Shield className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Blood Group:</span>
                      <span className="text-sm">{faculty.blood_group}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  Professional Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-3">
                  <div className="flex items-center gap-3">
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Designation:</span>
                    <span className="text-sm">{faculty.designation}</span>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Department:</span>
                    <span className="text-sm">{faculty.department_name} ({faculty.department_code})</span>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Joining Date:</span>
                    <span className="text-sm">{formatDate(faculty.joining_date)}</span>
                  </div>
                  
                  {faculty.years_of_experience && (
                    <div className="flex items-center gap-3">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Experience:</span>
                      <span className="text-sm">{faculty.years_of_experience} years</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contact & Address Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5" />
                Contact & Address Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium mb-3">Emergency Contact</h4>
                  <div className="space-y-2">
                    {faculty.emergency_contact_name ? (
                      <div className="flex items-center gap-3">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{faculty.emergency_contact_name}</span>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No emergency contact information</p>
                    )}
                    
                    {faculty.emergency_contact_phone && (
                      <div className="flex items-center gap-3">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{faculty.emergency_contact_phone}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium mb-3">Current Address</h4>
                  {faculty.current_address ? (
                    <div className="flex items-start gap-3">
                      <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                      <span className="text-sm">{faculty.current_address}</span>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No address information</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Attendance Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Attendance Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">{faculty.total_attendance_days}</p>
                  <p className="text-sm text-muted-foreground">Total Days</p>
                </div>
                
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{faculty.present_days}</p>
                  <p className="text-sm text-muted-foreground">Present Days</p>
                </div>
                
                <div className="text-center">
                  <p className="text-2xl font-bold text-red-600">{faculty.absent_days}</p>
                  <p className="text-sm text-muted-foreground">Absent Days</p>
                </div>
                
                <div className="text-center">
                  <p className={`text-2xl font-bold ${getAttendanceColor(faculty.attendance_percentage)}`}>
                    {faculty.attendance_percentage.toFixed(1)}%
                  </p>
                  <p className="text-sm text-muted-foreground">Attendance Rate</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FacultyDetailsModal;
