
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { Button } from '../../ui/button';
import { 
  Users, 
  UserCheck, 
  TrendingUp, 
  Award,
  BookOpen,
  Building,
  Clock,
  Eye,
  GraduationCap,
  Star
} from 'lucide-react';
import { useInstitutionalStats } from '../../../hooks/useInstitutionalStats';
import { useFacultyStats } from '../../../hooks/useFacultyStats';

const ChairmanFacultyDesktop: React.FC = () => {
  const { stats: institutionalStats, loading: statsLoading } = useInstitutionalStats();
  const { stats: facultyStats, loading: facultyLoading } = useFacultyStats();

  const facultyOverviewCards = [
    {
      title: 'Total Faculty',
      value: statsLoading ? '...' : institutionalStats.totalFaculty.toLocaleString(),
      subtitle: `${institutionalStats.activeFaculty} currently active`,
      icon: Users,
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
      trend: '+3.2% growth this year'
    },
    {
      title: 'Research Publications',
      value: facultyStats.total_research_papers?.toString() || '127',
      subtitle: 'Published this academic year',
      icon: BookOpen,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      trend: '+18% from last year'
    },
    {
      title: 'Teaching Excellence',
      value: '94.2%',
      subtitle: 'Average faculty rating',
      icon: Star,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50',
      trend: '+2.8% improvement'
    },
    {
      title: 'Departments',
      value: statsLoading ? '...' : institutionalStats.totalDepartments.toString(),
      subtitle: 'All departments active',
      icon: Building,
      color: 'bg-orange-500',
      bgColor: 'bg-orange-50',
      trend: 'Full coverage'
    }
  ];

  const departmentFacultyBreakdown = [
    { name: 'Computer Science', faculty: 28, phd: 18, experience: '8.5 years' },
    { name: 'Electronics & Comm.', faculty: 25, phd: 16, experience: '9.2 years' },
    { name: 'Mechanical', faculty: 24, phd: 14, experience: '10.1 years' },
    { name: 'Civil Engineering', faculty: 18, phd: 11, experience: '11.5 years' },
    { name: 'Electrical', faculty: 16, phd: 9, experience: '9.8 years' }
  ];

  const facultyActions = [
    { label: 'Performance Analytics', icon: TrendingUp },
    { label: 'Recruitment Pipeline', icon: UserCheck },
    { label: 'Research Initiatives', icon: Award },
    { label: 'Faculty Records', icon: Eye }
  ];

  if (statsLoading || facultyLoading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 bg-gradient-to-r from-green-100 to-blue-100 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">Faculty Management Overview</h2>
            <p className="text-green-100">Strategic oversight of academic human resources</p>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
              Chairman View
            </Badge>
            <GraduationCap className="w-8 h-8" />
          </div>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {facultyOverviewCards.map((card, index) => (
          <Card key={index} className={`${card.bgColor} border-2 hover:shadow-lg transition-all`}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-700">
                  {card.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${card.color} text-white`}>
                  <card.icon className="w-4 h-4" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-2xl font-bold text-gray-900">{card.value}</div>
                <p className="text-sm text-gray-600">{card.subtitle}</p>
                <p className="text-xs text-green-600 font-medium">{card.trend}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Department Faculty Analysis & Quick Actions */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Department Faculty Breakdown */}
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-green-600" />
              <span>Faculty Distribution by Department</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {departmentFacultyBreakdown.map((dept, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      {dept.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{dept.name}</p>
                      <p className="text-sm text-gray-600">{dept.faculty} faculty members</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-center">
                      <div className="text-sm font-bold text-blue-600">{dept.phd}</div>
                      <div className="text-xs text-gray-500">PhD holders</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm font-bold text-purple-600">{dept.experience}</div>
                      <div className="text-xs text-gray-500">Avg. exp.</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Strategic Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-gray-800">Strategic Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {facultyActions.map((action, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="w-full h-14 flex items-center justify-start space-x-3 hover:bg-green-50 hover:border-green-200"
                >
                  <action.icon className="w-5 h-5 text-green-600" />
                  <span className="font-medium">{action.label}</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ChairmanFacultyDesktop;
