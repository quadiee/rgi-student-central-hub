import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { 
  Search, 
  Users, 
  Award,
  Download,
  Eye,
  Calendar,
  MapPin,
  BookOpen,
  TrendingUp,
  Star,
  Phone,
  Mail,
  GraduationCap
} from 'lucide-react';
import { cn } from '../../lib/utils';
import MobileDataCard from './MobileDataCard';
import { useFacultyStats } from '../../hooks/useFacultyStats';
import ChairmanMobileHeader from './ChairmanMobileHeader';
import ChairmanMobileStatsGrid from './ChairmanMobileStatsGrid';
import ChairmanMobileTabs from './ChairmanMobileTabs';

interface ChairmanFacultyManagementProps {
  className?: string;
}

const ChairmanFacultyManagement: React.FC<ChairmanFacultyManagementProps> = ({ className }) => {
  const { stats, loading, error, refetch } = useFacultyStats();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedExperience, setSelectedExperience] = useState('all');
  const [activeSection, setActiveSection] = useState('overview');

  const filteredFaculty = stats.faculty.filter(faculty => {
    const matchesSearch = 
      faculty.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faculty.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faculty.department_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (faculty.designation && faculty.designation.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesDepartment = selectedDepartment === 'all' || 
      faculty.department_id === selectedDepartment;
    
    const matchesExperience = selectedExperience === 'all' || 
      (selectedExperience === 'senior' && (faculty.experience || 0) >= 10) ||
      (selectedExperience === 'mid' && (faculty.experience || 0) >= 5 && (faculty.experience || 0) < 10) ||
      (selectedExperience === 'junior' && (faculty.experience || 0) < 5);

    return matchesSearch && matchesDepartment && matchesExperience;
  });

  const facultyStatsCards = [
    {
      title: 'Total Faculty',
      value: stats.totalFaculty.toString(),
      subtitle: `${stats.activeFaculty} active`,
      icon: Users,
      trend: { value: 3, direction: 'up' as const, period: 'vs last year' },
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Avg Experience',
      value: `${stats.avgExperience.toFixed(1)}y`,
      subtitle: 'Years of expertise',
      icon: Award,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'Avg Attendance',
      value: `${stats.avgAttendance.toFixed(1)}%`,
      subtitle: 'Faculty attendance',
      icon: TrendingUp,
      trend: { value: 2, direction: 'up' as const, period: 'vs last month' },
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Top Performers',
      value: stats.topPerformers.toString(),
      subtitle: 'Excellence awardees',
      icon: Star,
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
      color: 'text-blue-600'
    },
    {
      id: 'performance',
      label: 'Performance',
      icon: Award,
      description: 'Faculty performance metrics',
      color: 'text-green-600',
      count: stats.excellentPerformers
    },
    {
      id: 'research',
      label: 'Research',
      icon: BookOpen,
      description: 'Research contributions',
      color: 'text-purple-600',
      count: stats.topPerformers
    },
    {
      id: 'directory',
      label: 'Directory',
      icon: Users,
      description: 'Faculty directory',
      color: 'text-indigo-600',
      count: stats.totalFaculty
    }
  ];

  const getExperienceLabel = (experience: number) => {
    if (experience >= 10) return 'Senior';
    if (experience >= 5) return 'Mid-level';
    return 'Junior';
  };

  const getPerformanceColor = (rate: number) => {
    if (rate >= 95) return 'text-green-600';
    if (rate >= 85) return 'text-blue-600';
    if (rate >= 75) return 'text-orange-600';
    return 'text-red-600';
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="p-4">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="p-4">
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-6 text-center">
              <p className="text-red-600">{error}</p>
              <Button onClick={refetch} className="mt-4">Retry</Button>
            </CardContent>
          </Card>
        </div>
      );
    }

    switch (activeSection) {
      case 'overview':
        return (
          <div className="p-4 space-y-6">
            <ChairmanMobileStatsGrid stats={facultyStatsCards} />
            
            {/* Department-wise Faculty Distribution */}
            {Object.keys(stats.departmentStats).length > 0 && (
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="w-5 h-5 text-blue-600" />
                    <span>Department-wise Distribution</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(stats.departmentStats).map(([dept, data]: [string, any]) => (
                      <div key={dept} className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-100">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-lg bg-purple-600 flex items-center justify-center">
                            <span className="text-white font-bold text-sm">{data.code}</span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{dept}</p>
                            <p className="text-sm text-gray-600">
                              {data.active} active • {data.avgExperience.toFixed(1)}y avg exp
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-purple-600">{data.total}</p>
                          <p className="text-xs text-gray-500">Faculty</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
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
                  className="pl-10 bg-white/80 backdrop-blur-sm border-white/50 focus:bg-white"
                />
              </div>

              <div className="flex space-x-2">
                <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    {Object.entries(stats.departmentStats).map(([dept, data]: [string, any]) => (
                      <SelectItem key={dept} value={dept}>{data.code}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedExperience} onValueChange={setSelectedExperience}>
                  <SelectTrigger className="w-28">
                    <SelectValue placeholder="Experience" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    <SelectItem value="senior">Senior (10+ yrs)</SelectItem>
                    <SelectItem value="mid">Mid-level (5-9 yrs)</SelectItem>
                    <SelectItem value="junior">Junior (&lt;5 yrs)</SelectItem>
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
                    <p className="text-gray-500">No faculty members found</p>
                  </CardContent>
                </Card>
              ) : (
                filteredFaculty.map((faculty) => (
                  <MobileDataCard
                    key={faculty.id}
                    title={faculty.name}
                    subtitle={`${faculty.designation || 'Faculty'} • ${faculty.department_code} • ${getExperienceLabel(faculty.experience || 0)}`}
                    status={{
                      label: faculty.is_active ? 'Active' : 'Inactive',
                      variant: faculty.is_active ? 'default' : 'secondary'
                    }}
                    data={[
                      {
                        label: 'Experience',
                        value: `${faculty.experience || 0} years`,
                        icon: Calendar,
                        color: 'text-blue-600'
                      },
                      {
                        label: 'Department',
                        value: faculty.department_code,
                        icon: MapPin,
                        color: 'text-purple-600'
                      },
                      {
                        label: 'Attendance',
                        value: `${(faculty.attendance_rate || 0).toFixed(1)}%`,
                        icon: TrendingUp,
                        color: getPerformanceColor(faculty.attendance_rate || 0)
                      },
                      {
                        label: 'Research',
                        value: `${faculty.research_papers || 0} papers`,
                        icon: BookOpen,
                        color: 'text-green-600'
                      }
                    ]}
                    actions={[
                      {
                        label: 'View Profile',
                        icon: Eye,
                        onClick: () => console.log('View faculty:', faculty.id)
                      }
                    ]}
                    onClick={() => console.log('Faculty clicked:', faculty.id)}
                    className="hover:shadow-md transition-shadow"
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
                <GraduationCap className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Coming Soon</p>
                <p className="text-sm text-gray-400 mt-1">This section is under development</p>
              </CardContent>
            </Card>
          </div>
        );
    }
  };

  useEffect(() => {
    refetch();
  }, [refetch]);

  return (
    <div className={cn("min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50", className)}>
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

export default ChairmanFacultyManagement;
