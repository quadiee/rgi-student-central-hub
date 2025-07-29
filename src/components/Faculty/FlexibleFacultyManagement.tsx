
import React, { useState } from 'react';
import { useAuth } from '../../contexts/SupabaseAuthContext';
import { useIsMobile } from '../../hooks/use-mobile';
import MobileFacultyManagement from './MobileFacultyManagement';
import DesktopFacultyManagement from './DesktopFacultyManagement';
import FacultyEmptyState from './FacultyEmptyState';
import FacultyCreationModal from './FacultyCreationModal';
import { useFacultyAttendance } from '../../hooks/useFacultyAttendance';
import { Card, CardContent } from '../ui/card';
import { Users, AlertCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { useToast } from '../../hooks/use-toast';
import { supabase } from '../../integrations/supabase/client';

const FlexibleFacultyManagement: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const { enhancedFacultyList, loading, fetchEnhancedFacultyList } = useFacultyAttendance();
  const [showCreationModal, setShowCreationModal] = useState(false);

  React.useEffect(() => {
    fetchEnhancedFacultyList();
  }, []);

  const createSampleData = async () => {
    if (!user) return;
    
    try {
      // Get departments first
      const { data: departments } = await supabase
        .from('departments')
        .select('id, name, code')
        .limit(3);

      if (!departments || departments.length === 0) {
        toast({
          title: "No Departments Found",
          description: "Please create departments first",
          variant: "destructive"
        });
        return;
      }

      const sampleFaculty = [
        {
          name: 'Dr. Rajesh Kumar',
          email: 'rajesh.kumar@rgce.edu.in',
          employee_code: 'FAC001',
          designation: 'Professor',
          department_id: departments[0].id
        },
        {
          name: 'Prof. Priya Sharma',
          email: 'priya.sharma@rgce.edu.in',
          employee_code: 'FAC002',
          designation: 'Associate Professor',
          department_id: departments[0].id
        },
        {
          name: 'Dr. Amit Patel',
          email: 'amit.patel@rgce.edu.in',
          employee_code: 'FAC003',
          designation: 'Assistant Professor',
          department_id: departments[1]?.id || departments[0].id
        }
      ];

      for (const faculty of sampleFaculty) {
        // Create user invitation first
        await supabase
          .from('user_invitations')
          .insert([{
            email: faculty.email,
            role: 'faculty',
            department: departments.find(d => d.id === faculty.department_id)?.code || 'CSE',
            employee_id: faculty.employee_code,
            invited_by: user.id,
            is_active: true,
            expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
          }]);

        // Create demo profile (in production, this would be done by user signup)
        const profileId = crypto.randomUUID();
        
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([{
            id: profileId,
            name: faculty.name,
            email: faculty.email,
            role: 'faculty',
            department_id: faculty.department_id,
            employee_id: faculty.employee_code,
            is_active: true, // Set to true for demo
            profile_completed: true
          }]);

        if (profileError) {
          console.warn('Profile creation failed for', faculty.name, profileError);
          continue;
        }

        // Create faculty profile
        await supabase
          .from('faculty_profiles')
          .insert([{
            user_id: profileId,
            employee_code: faculty.employee_code,
            designation: faculty.designation,
            joining_date: new Date().toISOString().split('T')[0],
            is_active: true
          }]);
      }

      toast({
        title: "Sample Data Created",
        description: "3 sample faculty members have been added"
      });

      fetchEnhancedFacultyList();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create sample data",
        variant: "destructive"
      });
    }
  };

  // Access control
  if (!user || !['admin', 'principal', 'chairman', 'hod'].includes(user.role)) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <AlertCircle className="mx-auto h-12 w-12 text-destructive" />
              <div>
                <h3 className="text-lg font-semibold">Access Denied</h3>
                <p className="text-muted-foreground">
                  You don't have permission to access faculty management.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading faculty data...</p>
        </div>
      </div>
    );
  }

  // Empty state - show when no faculty data exists
  if (!enhancedFacultyList || enhancedFacultyList.length === 0) {
    return (
      <div className="container mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Faculty Management</h1>
          <p className="text-muted-foreground">Manage your institution's faculty members</p>
        </div>
        
        <FacultyEmptyState 
          onAddFaculty={() => setShowCreationModal(true)}
        />
        
        <div className="mt-6 text-center">
          <Button variant="outline" onClick={createSampleData}>
            Create Sample Data
          </Button>
        </div>

        <FacultyCreationModal
          isOpen={showCreationModal}
          onClose={() => setShowCreationModal(false)}
          onSuccess={fetchEnhancedFacultyList}
        />
      </div>
    );
  }

  // Render appropriate interface based on device
  const FacultyInterface = isMobile ? MobileFacultyManagement : DesktopFacultyManagement;
  
  return <FacultyInterface />;
};

export default FlexibleFacultyManagement;
