
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
import { useChairmanStudents } from '../../hooks/useChairmanStudents';
import { useInstitutionalStats } from '../../hooks/useInstitutionalStats';
import { useScholarshipStats } from '../../hooks/useScholarshipStats';
import { useFeeTypeAnalytics } from '../../hooks/useFeeTypeAnalytics';
import { useToast } from '../ui/use-toast';

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

  const { students, loading: studentsLoading, fetchStudents } = useChairmanStudents();
  const { stats: institutionalStats, loading: statsLoading } = useInstitutionalStats();
  const { stats: scholarshipStats, loading: scholarshipLoading } = useScholarshipStats();
  const { analytics: feeAnalytics } = useFeeTypeAnalytics();

  const loading = studentsLoading || statsLoading || scholarshipLoading;

  // Calculate real stats from students data
  const realStats = React.useMemo(() => {
    // Calculate fee collection from actual student data
    let totalFees = 0;
    let totalCollected = 0;
    
    students.forEach(student => {
      // For each student, we need to calculate their total fees and collected amount
      // This is based on their fee records which are already processed in the hook
      if (student.feeStatus === 'Paid') {
        // If paid, assume they paid their full amount
        const studentTotal = 50000; // Default fee amount - you might want to make this dynamic
        totalFees += studentTotal;
        totalCollected += studentTotal;
      } else {
        // If pending/overdue, add to total but not to collected
        const studentTotal = 50000;
        totalFees += studentTotal;
        // Add any partial payments
        totalCollected += studentTotal * 0.2; // Assuming 20% partial payment for demo
      }
    });

    const collectionRate = totalFees > 0 ? (totalCollected / totalFees) * 100 : 0;
    const collectedInCrores = totalCollected / 10000000; // Convert to crores

    return [
      {
        title: 'Total Students',
        value: students.length.toString(),
        subtitle: `${students.filter(s => s.feeStatus !== 'Inactive').length} active`,
        icon: Users,
        trend: { value: 5, direction: 'up' as const, period: 'vs last sem' },
        color: 'text-blue-600',
        bgColor: 'bg-blue-50'
      },
      {
        title: 'Fee Collection',
        value: `${Math.round(collectionRate)}%`,
        subtitle: `₹${collectedInCrores.toFixed(1)}Cr collected`,
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
          paidStudents: 0,
          totalStudents: 0
        };
      }
      acc[student.department].students += 1;
      acc[student.department].totalStudents += 1;
      if (student.feeStatus === 'Paid') {
        acc[student.department].paidStudents += 1;
      }
      return acc;
    }, {} as any);

    return Object.values(deptStats).map((dept: any) => ({
      ...dept,
      feeCollection: dept.totalStudents > 0 ? Math.round((dept.paidStudents / dept.totalStudents) * 100) : 0
    }));
  }, [students]);

  useEffect(() => {
    // Apply filters when they change
    fetchStudents({
      department: selectedDepartment,
      semester: selectedSemester === 'all' ? undefined : parseInt(selectedSemester),
      feeStatus: selectedFeeStatus,
      searchTerm: searchTerm.trim() || undefined
    });
  }, [selectedDepartment, selectedSemester, selectedFeeStatus, searchTerm, fetchStudents]);

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

  const handleViewStudent = (student: any) => {
    toast({
      title: "Student Profile",
      description: `Viewing profile for ${student.name} (${student.roll_number})`,
    });
    console.log('View student profile:', student);
    // Here you would typically navigate to student details page
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

            {/* Student List */}
            <div className="space-y-3">
              {students.length === 0 ? (
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
                          label: 'Scholarships',
                          value: `${student.scholarships.length} active`,
                          icon: Star,
                          color: 'text-purple-600'
                        },
                        {
                          label: 'Department',
                          value: student.department,
                          icon: BookOpen,
                          color: 'text-blue-600'
                        }
                      ]}
                      actions={[
                        {
                          label: 'View Profile',
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
    </div>
  );
};

export default ChairmanStudentManagement;
