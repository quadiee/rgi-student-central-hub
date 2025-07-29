
import React, { useState } from 'react';
import { useAuth } from '../../contexts/SupabaseAuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Users, BarChart3, Calendar, Clock } from 'lucide-react';
import { useIsMobile } from '../../hooks/use-mobile';
import FacultyAnalyticsOverview from './FacultyAnalyticsOverview';
import EnhancedFacultyList from './EnhancedFacultyList';
import FacultyAttendanceOverview from './FacultyAttendanceOverview';
import FacultyDetailsModal from './FacultyDetailsModal';

interface EnhancedFacultyMember {
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
}

const StreamlinedFacultyManagement: React.FC = () => {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedFaculty, setSelectedFaculty] = useState<EnhancedFacultyMember | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  if (!user || !['admin', 'principal', 'chairman', 'hod'].includes(user.role)) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold">Access Denied</h3>
              <p className="text-muted-foreground">
                You don't have permission to access faculty management.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleViewDetails = (faculty: EnhancedFacultyMember) => {
    setSelectedFaculty(faculty);
    setShowDetailsModal(true);
  };

  const handleDetailsModalClose = () => {
    setShowDetailsModal(false);
    setSelectedFaculty(null);
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Faculty Management</h1>
          <p className="text-muted-foreground">
            Comprehensive faculty analytics and attendance management system
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className={`grid w-full ${isMobile ? 'grid-cols-3' : 'grid-cols-3'}`}>
          <TabsTrigger value="overview">
            <BarChart3 className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="faculty-list">
            <Users className="h-4 w-4 mr-2" />
            Faculty List
          </TabsTrigger>
          <TabsTrigger value="attendance">
            <Calendar className="h-4 w-4 mr-2" />
            Attendance
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Faculty Analytics Overview
              </CardTitle>
              <CardDescription>
                Comprehensive analytics showing faculty distribution by gender, department, age, and experience
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FacultyAnalyticsOverview />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="faculty-list">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Faculty Directory
              </CardTitle>
              <CardDescription>
                Complete faculty list with search, filters, and detailed information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EnhancedFacultyList onViewDetails={handleViewDetails} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="attendance">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Faculty Attendance Overview
              </CardTitle>
              <CardDescription>
                Real-time attendance tracking and comprehensive reports
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FacultyAttendanceOverview />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Faculty Details Modal */}
      {showDetailsModal && selectedFaculty && (
        <FacultyDetailsModal
          isOpen={showDetailsModal}
          onClose={handleDetailsModalClose}
          faculty={selectedFaculty}
        />
      )}
    </div>
  );
};

export default StreamlinedFacultyManagement;
