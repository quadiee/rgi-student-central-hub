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
  CreditCard,
  CheckCircle,
  AlertCircle,
  XCircle,
  Star,
  BookOpen,
  MapPin,
  Phone,
  Mail
} from 'lucide-react';
import { cn } from '../../lib/utils';
import MobileDataCard from './MobileDataCard';
import ChairmanMobileHeader from './ChairmanMobileHeader';
import ChairmanMobileStatsGrid from './ChairmanMobileStatsGrid';
import ChairmanMobileTabs from './ChairmanMobileTabs';
import StudentDetailsModal from '../Students/StudentDetailsModal';
import { useChairmanStudents } from '../../hooks/useChairmanStudents';
import { useInstitutionalStats } from '../../hooks/useInstitutionalStats';
import { useScholarshipStats } from '../../hooks/useScholarshipStats';
import { useFeeTypeAnalytics } from '../../hooks/useFeeTypeAnalytics';
import { useDebounce } from '../../hooks/useDebounce';
import { useToast } from '../ui/use-toast';
import { supabase } from '../../integrations/supabase/client';

interface ChairmanStudentManagementProps {
  className?: string;
}

const ChairmanStudentManagement: React.FC<ChairmanStudentManagementProps> = ({ className }) => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedSemester, setSelectedSemester] = useState('all');
  const [selectedFeeStatus, setSelectedFeeStatus] = useState('all');
  const [activeSection, setActiveSection] = useState('overview');
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);

  // Debounce search term to prevent excessive API calls
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const { students, loading: studentsLoading, fetchStudents } = useChairmanStudents();
  const { stats: institutionalStats, loading: statsLoading } = useInstitutionalStats();
  const { stats: scholarshipStats, loading: scholarshipLoading } = useScholarshipStats();
  const { analytics: feeAnalytics } = useFeeTypeAnalytics();

  const loading = studentsLoading || (initialLoad && (statsLoading || scholarshipLoading));

  // Calculate real stats from students data
  const realStats = React.useMemo(() => {
    const totalFees = students.reduce((sum, student) => sum + student.totalFees, 0);
    const totalCollected = students.reduce((sum, student) => sum + student.totalPaid, 0);
    const collectionRate = totalFees > 0 ? (totalCollected / totalFees) * 100 : 0;
    const collectedInCrores = totalCollected / 10000000; // Convert to crores

    return [
      {
        title: 'Total Students',
        value: students.length.toString(),
        subtitle: `${students.length} active`,
        icon: Users,
        trend: { value: 5, direction: 'up' as const, period: 'vs last sem' },
        color: 'text-blue-600',
        bgColor: 'bg-blue-50'
      },
      {
        title: 'Fee Collection',
        value: `${Math.round(collectionRate)}%`,
        subtitle: `₹${collectedInCrores.toFixed(2)}Cr collected`,
        icon: CreditCard,
        trend: { value: 12, direction: 'up' as const, period: 'vs last month' },
        color: 'text-green-600',
        bgColor: 'bg-green-50'
      },
      {
        title: 'Academic Performance',
        value: '92.1%',
        subtitle: 'Pass percentage',
        icon: TrendingUp,
        trend: { value: 3, direction: 'up' as const, period: 'vs last year' },
        color: 'text-purple-600',
        bgColor: 'bg-purple-50'
      },
      {
        title: 'Scholarships',
        value: scholarshipStats.scholarshipStudents.toString(),
        subtitle: `₹${Math.round(scholarshipStats.totalReceivedAmount / 100000)}L awarded`,
        icon: Star,
        trend: { value: 18, direction: 'up' as const, period: 'vs last year' },
        color: 'text-orange-600',
        bgColor: 'bg-orange-50'
      }
    ];
  }, [students, scholarshipStats]);

  const sections = [
    {
      id: 'overview',
      label: 'Overview',
      icon: TrendingUp,
      description: 'Student statistics & insights',
      color: 'text-blue-600',
      count: undefined
    },
    {
      id: 'directory',
      label: 'Directory',
      icon: Users,
      description: 'Student directory',
      color: 'text-indigo-600',
      count: students.length
    }
  ];

  // Department breakdown with real fee collection data
  const departmentBreakdown = React.useMemo(() => {
    const deptStats = students.reduce((acc, student) => {
      if (!acc[student.department]) {
        acc[student.department] = {
          code: student.department,
          students: 0,
          totalFees: 0,
          totalCollected: 0
        };
      }
      acc[student.department].students += 1;
      acc[student.department].totalFees += student.totalFees;
      acc[student.department].totalCollected += student.totalPaid;
      return acc;
    }, {} as any);

    return Object.values(deptStats).map((dept: any) => ({
      ...dept,
      feeCollection: dept.totalFees > 0 ? Math.round((dept.totalCollected / dept.totalFees) * 100) : 0
    }));
  }, [students]);

  // Apply filters when they change (with debounced search)
  useEffect(() => {
    if (initialLoad) {
      setInitialLoad(false);
      return;
    }

    fetchStudents({
      department: selectedDepartment,
      semester: selectedSemester === 'all' ? undefined : parseInt(selectedSemester),
      feeStatus: selectedFeeStatus,
      searchTerm: debouncedSearchTerm.trim() || undefined
    });
  }, [selectedDepartment, selectedSemester, selectedFeeStatus, debouncedSearchTerm, fetchStudents]);

  const getFeeStatusColor = (status: string) => {
    switch (status) {
      case 'Paid': return 'text-green-600 bg-green-50 border-green-200';
      case 'Pending': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'Overdue': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getFeeStatusIcon = (status: string) => {
    switch (status) {
      case 'Paid': return CheckCircle;
      case 'Pending': return AlertCircle;
      case 'Overdue': return XCircle;
      default: return AlertCircle;
    }
  };

  const handleViewStudent = async (student: any) => {
    try {
      // Fetch complete student details from the database using the specific relationship
      const { data: studentData, error } = await supabase
        .from('profiles')
        .select(`
          *,
          departments!profiles_department_id_fkey (
            name,
            code
          )
        `)
        .eq('id', student.id)
        .single();

      if (error) throw error;

      if (studentData) {
        // Transform the data to match the expected Student interface
        const transformedStudent = {
          id: studentData.id,
          name: studentData.name || 'N/A',
          email: studentData.email || 'N/A',
          rollNumber: studentData.roll_number || 'N/A',
          department: studentData.departments?.name || 'N/A',
          course: 'B.Tech', // Default course
          section: studentData.year_section || 'N/A',
          year: studentData.year || 0,
          semester: studentData.semester || 0,
          phone: studentData.phone,
          address: studentData.address,
          guardianName: null, // Not available in profiles table
          guardianPhone: null, // Not available in profiles table
          emergencyContact: null, // Not available in profiles table
          bloodGroup: null, // Not available in profiles table
          admissionDate: studentData.created_at,
          profileImage: studentData.profile_photo_url,
          feeStatus: student.feeStatus || 'Pending',
          totalFees: student.totalFees || 0,
          paidAmount: student.totalPaid || 0,
          dueAmount: student.dueAmount || 0
        };

        setSelectedStudent(transformedStudent);
        setShowStudentModal(true);
      }
    } catch (error) {
      console.error('Error fetching student details:', error);
      toast({
        title: "Error",
        description: "Failed to load student details",
        variant: "destructive"
      });
    }
  };

  const handleContactStudent = (student: any) => {
    if (student.phone) {
      window.open(`tel:${student.phone}`, '_blank');
    } else {
      toast({
        title: "No Phone Number",
        description: "Phone number not available for this student",
        variant: "destructive"
      });
    }
  };

  const handleEmailStudent = (student: any) => {
    if (student.email) {
      window.open(`mailto:${student.email}`, '_blank');
    } else {
      toast({
        title: "No Email",
        description: "Email not available for this student",
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
                  <span>Department-wise Overview</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {departmentBreakdown.map((dept, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-blue-50 border border-blue-100">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center">
                          <span className="text-white font-bold text-sm">{dept.code}</span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{dept.code}</p>
                          <p className="text-sm text-gray-600">{dept.students} students</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-green-600">{dept.feeCollection}%</p>
                        <p className="text-xs text-gray-500">Fee Collection</p>
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
                  placeholder="Search students..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="flex space-x-2">
                <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                  <SelectTrigger className="w-28">
                    <SelectValue placeholder="Dept" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="CSE">CSE</SelectItem>
                    <SelectItem value="ECE">ECE</SelectItem>
                    <SelectItem value="MECH">MECH</SelectItem>
                    <SelectItem value="CIVIL">CIVIL</SelectItem>
                    <SelectItem value="EEE">EEE</SelectItem>
                    <SelectItem value="BME">BME</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={selectedSemester} onValueChange={setSelectedSemester}>
                  <SelectTrigger className="w-24">
                    <SelectValue placeholder="Sem" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    {[1,2,3,4,5,6,7,8].map(sem => (
                      <SelectItem key={sem} value={sem.toString()}>{sem}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedFeeStatus} onValueChange={setSelectedFeeStatus}>
                  <SelectTrigger className="w-24">
                    <SelectValue placeholder="Fees" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Show subtle loading indicator for filter changes */}
            {studentsLoading && !initialLoad && (
              <div className="text-center py-2">
                <div className="inline-flex items-center space-x-2 text-sm text-gray-500">
                  <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
                  <span>Updating...</span>
                </div>
              </div>
            )}

            {/* Student List */}
            <div className="space-y-3">
              {students.length === 0 && !studentsLoading ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No students found</p>
                    <p className="text-sm text-gray-400 mt-1">Try adjusting your filters</p>
                  </CardContent>
                </Card>
              ) : (
                students.map((student) => {
                  const StatusIcon = getFeeStatusIcon(student.feeStatus);
                  return (
                    <MobileDataCard
                      key={student.id}
                      title={student.name}
                      subtitle={`${student.roll_number} • ${student.department} • Sem ${student.semester || 'N/A'}`}
                      status={{
                        label: student.feeStatus,
                        variant: student.feeStatus === 'Paid' ? 'default' : 'secondary'
                      }}
                      data={[
                        {
                          label: 'Fee Status',
                          value: student.feeStatus,
                          icon: StatusIcon,
                          color: getFeeStatusColor(student.feeStatus).split(' ')[0]
                        },
                        {
                          label: 'Total Fees',
                          value: `₹${student.totalFees.toLocaleString()}`,
                          icon: CreditCard,
                          color: 'text-blue-600'
                        },
                        {
                          label: 'Scholarships',
                          value: `${student.scholarships.length} active`,
                          icon: Star,
                          color: 'text-purple-600'
                        }
                      ]}
                      actions={[
                        {
                          label: 'View Details',
                          icon: Eye,
                          onClick: () => handleViewStudent(student)
                        },
                        ...(student.phone ? [{
                          label: 'Call',
                          icon: Phone,
                          onClick: () => handleContactStudent(student)
                        }] : []),
                        ...(student.email ? [{
                          label: 'Email',
                          icon: Mail,
                          onClick: () => handleEmailStudent(student)
                        }] : [])
                      ]}
                      onClick={() => handleViewStudent(student)}
                      className="hover:shadow-md transition-shadow cursor-pointer"
                    />
                  );
                })
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
        title="Student Management"
        subtitle="Institutional Student Oversight"
        onSearch={() => {}}
        showNotifications={true}
        notificationCount={3}
      />
      
      <ChairmanMobileTabs
        tabs={sections}
        activeTab={activeSection}
        onTabChange={setActiveSection}
        title="Student Sections"
      />

      <div className="pb-20">
        {renderContent()}
      </div>

      {/* Student Details Modal */}
      {selectedStudent && (
        <StudentDetailsModal
          isOpen={showStudentModal}
          onClose={() => {
            setShowStudentModal(false);
            setSelectedStudent(null);
          }}
          student={selectedStudent}
        />
      )}
    </div>
  );
};

export default ChairmanStudentManagement;
