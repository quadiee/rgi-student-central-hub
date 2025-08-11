import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { 
  Search, 
  Users, 
  TrendingUp,
  Eye,
  Calendar,
  MapPin,
  BookOpen,
  Star,
  Award
} from 'lucide-react';
import { cn } from '../../lib/utils';
import MobileDataCard from './MobileDataCard';
import ChairmanMobileHeader from './ChairmanMobileHeader';
import ChairmanMobileStatsGrid from './ChairmanMobileStatsGrid';
import ChairmanMobileTabs from './ChairmanMobileTabs';
import FacultyDetailsModal from '../Faculty/FacultyDetailsModal';
import { useFacultyStats } from '../../hooks/useFacultyStats';
import { supabase } from '../../integrations/supabase/client';
import { useToast } from '../ui/use-toast';

interface ChairmanFacultyManagementProps {
  className?: string;
}

const ChairmanFacultyManagement: React.FC<ChairmanFacultyManagementProps> = ({ className }) => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [activeSection, setActiveSection] = useState('overview');
  const [departments, setDepartments] = useState<any[]>([]);
  const [selectedFaculty, setSelectedFaculty] = useState<any>(null);
  const [showFacultyModal, setShowFacultyModal] = useState(false);

  const { stats, loading, refetch } = useFacultyStats();

  useEffect(() => {
    refetch();
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const { data, error } = await supabase
        .from('departments')
        .select('id, name, code')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setDepartments(data || []);
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  const realStats = [
    {
      title: 'Total Faculty',
      value: stats.totalFaculty.toString(),
      subtitle: `${stats.activeFaculty} active`,
      icon: Users,
      trend: { value: 2, direction: 'up' as const, period: 'vs last year' },
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Avg Experience',
      value: `${Math.round(stats.avgExperience)} yrs`,
      subtitle: `${stats.seniorFaculty} senior faculty`,
      icon: Award,
      trend: { value: 1, direction: 'up' as const, period: 'vs last year' },
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Attendance',
      value: `${Math.round(stats.avgAttendance)}%`,
      subtitle: 'Average attendance',
      icon: Calendar,
      trend: { value: 5, direction: 'up' as const, period: 'vs last month' },
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'Top Performers',
      value: stats.topPerformers.toString(),
      subtitle: `${stats.excellentPerformers} excellent`,
      icon: Star,
      trend: { value: 8, direction: 'up' as const, period: 'vs last month' },
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    }
  ];

  const sections = [
    {
      id: 'overview',
      label: 'Overview',
      icon: TrendingUp,
      description: 'Faculty statistics & insights',
      color: 'text-blue-600',
      count: undefined
    },
    {
      id: 'directory',
      label: 'Directory',
      icon: Users,
      description: 'Faculty directory',
      color: 'text-indigo-600',
      count: stats.faculty?.length || 0
    }
  ];

  // Filter faculty based on search and department
  const filteredFaculty = React.useMemo(() => {
    if (!stats.faculty) return [];
    
    return stats.faculty.filter((faculty: any) => {
      const matchesSearch = !searchTerm || 
        faculty.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        faculty.employee_code?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesDepartment = selectedDepartment === 'all' || 
        faculty.department_id === selectedDepartment;
      
      return matchesSearch && matchesDepartment;
    });
  }, [stats.faculty, searchTerm, selectedDepartment]);

  const handleViewFaculty = async (faculty: any) => {
    try {
      // Fetch complete faculty details from the database using the specific relationship
      const { data: facultyData, error } = await supabase
        .from('faculty_profiles')
        .select(`
          *,
          profiles!faculty_profiles_user_id_fkey (
            id,
            name,
            email,
            phone,
            department_id,
            departments!profiles_department_id_fkey (
              name,
              code
            )
          )
        `)
        .eq('id', faculty.faculty_id)
        .single();

      if (error) throw error;

      if (facultyData) {
        // Transform the data to match the expected structure
        const transformedFaculty = {
          faculty_id: facultyData.id,
          user_id: facultyData.user_id,
          name: facultyData.profiles?.name || 'N/A',
          email: facultyData.profiles?.email || 'N/A',
          employee_code: facultyData.employee_code,
          designation: facultyData.designation,
          department_name: facultyData.profiles?.departments?.name || 'N/A',
          department_code: facultyData.profiles?.departments?.code || 'N/A',
          joining_date: facultyData.joining_date,
          phone: facultyData.profiles?.phone,
          gender: faculty.gender,
          age: faculty.age,
          years_of_experience: faculty.years_of_experience,
          is_active: facultyData.is_active,
          emergency_contact_name: facultyData.emergency_contact_name,
          emergency_contact_phone: facultyData.emergency_contact_phone,
          current_address: facultyData.current_address,
          blood_group: facultyData.blood_group,
          marital_status: facultyData.marital_status,
          total_attendance_days: faculty.total_attendance_days || 0,
          present_days: faculty.present_days || 0,
          absent_days: faculty.absent_days || 0,
          attendance_percentage: faculty.attendance_percentage || 0
        };

        setSelectedFaculty(transformedFaculty);
        setShowFacultyModal(true);
      }
    } catch (error) {
      console.error('Error fetching faculty details:', error);
      toast({
        title: "Error",
        description: "Failed to load faculty details",
        variant: "destructive"
      });
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="space-y-4 p-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-xl animate-pulse" />
          ))}
        </div>
      );
    }

    switch (activeSection) {
      case 'overview':
        return (
          <div className="p-4 space-y-6">
            <ChairmanMobileStatsGrid stats={realStats} />
            
            {/* Department-wise Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MapPin className="w-5 h-5 text-blue-600" />
                  <span>Department-wise Faculty</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(stats.departmentStats).map(([deptName, deptStats]: [string, any]) => (
                    <div key={deptName} className="flex items-center justify-between p-3 rounded-lg bg-blue-50 border border-blue-100">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center">
                          <span className="text-white font-bold text-sm">{deptStats.code}</span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{deptName}</p>
                          <p className="text-sm text-gray-600">{deptStats.total} faculty</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-green-600">{Math.round(deptStats.avgExperience)} yrs</p>
                        <p className="text-xs text-gray-500">Avg Experience</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'directory':
        return (
          <div className="p-4 space-y-4">
            {/* Search and Filters */}
            <div className="space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search faculty..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="flex space-x-2">
                <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    {departments.map((dept) => (
                      <SelectItem key={dept.id} value={dept.id}>
                        {dept.code}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Faculty List */}
            <div className="space-y-3">
              {filteredFaculty.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No faculty found</p>
                    <p className="text-sm text-gray-400 mt-1">Try adjusting your search or filters</p>
                  </CardContent>
                </Card>
              ) : (
                filteredFaculty.map((faculty: any) => (
                  <MobileDataCard
                    key={faculty.faculty_id}
                    title={faculty.name || 'N/A'}
                    subtitle={`${faculty.employee_code || 'N/A'} • ${faculty.designation || 'N/A'}`}
                    status={{
                      label: faculty.is_active ? 'Active' : 'Inactive',
                      variant: faculty.is_active ? 'default' : 'secondary'
                    }}
                    data={[
                      {
                        label: 'Department',
                        value: faculty.department_name || 'N/A',
                        icon: BookOpen,
                        color: 'text-blue-600'
                      },
                      {
                        label: 'Experience',
                        value: `${faculty.years_of_experience || 0} years`,
                        icon: Award,
                        color: 'text-green-600'
                      },
                      {
                        label: 'Attendance',
                        value: `${Math.round(faculty.attendance_percentage || 0)}%`,
                        icon: Calendar,
                        color: faculty.attendance_percentage >= 90 ? 'text-green-600' : 'text-orange-600'
                      }
                    ]}
                    actions={[
                      {
                        label: 'View Details',
                        icon: Eye,
                        onClick: () => handleViewFaculty(faculty)
                      }
                    ]}
                    onClick={() => handleViewFaculty(faculty)}
                    className="hover:shadow-md transition-shadow cursor-pointer"
                  />
                ))
              )}
            </div>
          </div>
        );

      default:
        return (
          <div className="p-4">
            <Card>
              <CardContent className="text-center py-8">
                <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Coming Soon</p>
                <p className="text-sm text-gray-400 mt-1">This section is under development</p>
              </CardContent>
            </Card>
          </div>
        );
    }
  };

  return (
    <div className={cn("min-h-screen bg-gray-50", className)}>
      <ChairmanMobileHeader
        title="Faculty Management"
        subtitle="Institutional Faculty Oversight"
        onSearch={() => {}}
        showNotifications={true}
        notificationCount={2}
      />
      
      <ChairmanMobileTabs
        tabs={sections}
        activeTab={activeSection}
        onTabChange={setActiveSection}
        title="Faculty Sections"
      />

      <div className="pb-20">
        {renderContent()}
      </div>

      {/* Faculty Details Modal */}
      {selectedFaculty && (
        <FacultyDetailsModal
          isOpen={showFacultyModal}
          onClose={() => {
            setShowFacultyModal(false);
            setSelectedFaculty(null);
          }}
          faculty={selectedFaculty}
        />
      )}
    </div>
  );
};

export default ChairmanFacultyManagement;
