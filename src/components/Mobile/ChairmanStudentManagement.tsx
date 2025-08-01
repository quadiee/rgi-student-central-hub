
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { 
  Search, 
  Filter, 
  Users, 
  GraduationCap,
  TrendingUp,
  Download,
  Eye,
  Calendar,
  MapPin,
  BookOpen,
  Star,
  CreditCard,
  CheckCircle,
  AlertCircle,
  XCircle
} from 'lucide-react';
import { cn } from '../../lib/utils';
import MobileDataCard from './MobileDataCard';
import ChairmanMobileHeader from './ChairmanMobileHeader';
import ChairmanMobileStatsGrid from './ChairmanMobileStatsGrid';
import ChairmanMobileTabs from './ChairmanMobileTabs';

interface ChairmanStudentManagementProps {
  className?: string;
}

const ChairmanStudentManagement: React.FC<ChairmanStudentManagementProps> = ({ className }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedSemester, setSelectedSemester] = useState('all');
  const [selectedFeeStatus, setSelectedFeeStatus] = useState('all');
  const [activeSection, setActiveSection] = useState('overview');
  const [loading, setLoading] = useState(true);

  // Mock data - replace with actual data fetching
  const stats = [
    {
      title: 'Total Students',
      value: '2,847',
      subtitle: '2,689 active',
      icon: Users,
      trend: { value: 5, direction: 'up' as const, period: 'vs last sem' },
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Fee Collection',
      value: '87.3%',
      subtitle: '₹1.2Cr collected',
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
      value: '347',
      subtitle: '₹28L awarded',
      icon: Star,
      trend: { value: 18, direction: 'up' as const, period: 'vs last year' },
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    }
  ];

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
      id: 'academics',
      label: 'Academics',
      icon: BookOpen,
      description: 'Academic performance',
      color: 'text-green-600',
      count: 2847
    },
    {
      id: 'fees',
      label: 'Fee Status',
      icon: CreditCard,
      description: 'Fee collection status',
      color: 'text-purple-600',
      count: 362
    },
    {
      id: 'scholarships',
      label: 'Scholarships',
      icon: Star,
      description: 'Scholarship management',
      color: 'text-orange-600',
      count: 347
    },
    {
      id: 'directory',
      label: 'Directory',
      icon: Users,
      description: 'Student directory',
      color: 'text-indigo-600',
      count: undefined
    }
  ];

  const mockStudents = [
    {
      id: '1',
      name: 'Rajesh Kumar',
      rollNumber: '21CSE001',
      department: 'CSE',
      semester: 6,
      feeStatus: 'Paid',
      academicPerformance: 89.5,
      scholarships: ['Merit Scholarship'],
      phone: '+91 98765 43210',
      email: 'rajesh.kumar@student.rgce.edu.in'
    },
    {
      id: '2',
      name: 'Priya Sharma',
      rollNumber: '21ECE015',
      department: 'ECE',
      semester: 6,
      feeStatus: 'Pending',
      academicPerformance: 94.2,
      scholarships: ['Merit Scholarship', 'Government Scholarship'],
      phone: '+91 87654 32109',
      email: 'priya.sharma@student.rgce.edu.in'
    }
  ];

  useEffect(() => {
    // Simulate data loading
    setTimeout(() => setLoading(false), 1000);
  }, []);

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
            <ChairmanMobileStatsGrid stats={stats} />
            
            {/* Department-wise Breakdown */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MapPin className="w-5 h-5 text-blue-600" />
                  <span>Department-wise Overview</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { dept: 'Computer Science & Engineering', code: 'CSE', students: 847, feeCollection: 92.3 },
                    { dept: 'Electronics & Communication', code: 'ECE', students: 623, feeCollection: 89.1 },
                    { dept: 'Mechanical Engineering', code: 'MECH', students: 567, feeCollection: 84.7 },
                    { dept: 'Civil Engineering', code: 'CIVIL', students: 489, feeCollection: 91.2 },
                    { dept: 'Electrical Engineering', code: 'EEE', students: 321, feeCollection: 88.9 }
                  ].map((dept, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-100">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-lg bg-purple-600 flex items-center justify-center">
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
                  className="pl-10 bg-white/80 backdrop-blur-sm border-white/50 focus:bg-white"
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
              {mockStudents.map((student) => {
                const StatusIcon = getFeeStatusIcon(student.feeStatus);
                return (
                  <MobileDataCard
                    key={student.id}
                    title={student.name}
                    subtitle={`${student.rollNumber} • ${student.department} • Sem ${student.semester}`}
                    status={{
                      label: student.feeStatus,
                      variant: student.feeStatus === 'Paid' ? 'default' : 'secondary'
                    }}
                    data={[
                      {
                        label: 'Performance',
                        value: `${student.academicPerformance}%`,
                        icon: TrendingUp,
                        color: student.academicPerformance >= 90 ? 'text-green-600' : 'text-orange-600'
                      },
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
                        label: 'Contact',
                        value: student.phone,
                        icon: Calendar,
                        color: 'text-blue-600'
                      }
                    ]}
                    actions={[
                      {
                        label: 'View Profile',
                        icon: Eye,
                        onClick: () => console.log('View student:', student.id)
                      }
                    ]}
                    onClick={() => console.log('Student clicked:', student.id)}
                    className="hover:shadow-md transition-shadow"
                  />
                );
              })}
            </div>
          </div>
        );

      default:
        return (
          <div className="p-4">
            <Card>
              <CardContent className="text-center py-8">
                <GraduationCap className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Coming Soon</p>
                <p className="text-sm text-gray-400 mt-1">This section is under development</p>
              </CardContent>
            </Card>
          </div>
        );
    }
  };

  return (
    <div className={cn("min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50", className)}>
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

      {/* Chairman Role Indicator */}
      <div className="fixed bottom-16 left-0 right-0 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 text-center shadow-lg">
        <div className="flex items-center justify-center space-x-2">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
          <p className="text-xs font-medium">Chairman's View • Executive Access</p>
          <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
        </div>
      </div>
    </div>
  );
};

export default ChairmanStudentManagement;
