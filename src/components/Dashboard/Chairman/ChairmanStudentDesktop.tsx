
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { Button } from '../../ui/button';
import { 
  Users, 
  GraduationCap, 
  TrendingUp, 
  UserCheck,
  BookOpen,
  Award,
  Calendar,
  Eye
} from 'lucide-react';
import { useInstitutionalStats } from '../../../hooks/useInstitutionalStats';
import { useScholarshipStats } from '../../../hooks/useScholarshipStats';
import { formatCurrency } from '../../../utils/feeValidation';

const ChairmanStudentDesktop: React.FC = () => {
  const { stats: institutionalStats, loading: statsLoading } = useInstitutionalStats();
  const { stats: scholarshipStats, loading: scholarshipLoading } = useScholarshipStats();

  const studentOverviewCards = [
    {
      title: 'Total Enrollment',
      value: statsLoading ? '...' : institutionalStats.totalStudents.toLocaleString(),
      subtitle: `${institutionalStats.activeStudents} currently active`,
      icon: Users,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      trend: '+5.2% from last year'
    },
    {
      title: 'Academic Performance',
      value: '87.3%',
      subtitle: 'Average performance rate',
      icon: BookOpen,
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
      trend: '+2.1% improvement'
    },
    {
      title: 'Scholarship Recipients',
      value: scholarshipStats.scholarshipStudents.toString(),
      subtitle: `${formatCurrency(scholarshipStats.totalReceivedAmount)} distributed`,
      icon: Award,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50',
      trend: `${scholarshipStats.receivedScholarships} active scholarships`
    },
    {
      title: 'Placement Rate',
      value: '92.5%',
      subtitle: 'Final year placements',
      icon: TrendingUp,
      color: 'bg-orange-500',
      bgColor: 'bg-orange-50',
      trend: '+8.3% from last batch'
    }
  ];

  const departmentBreakdown = [
    { name: 'Computer Science', students: 348, percentage: 28 },
    { name: 'Electronics & Comm.', students: 312, percentage: 25 },
    { name: 'Mechanical', students: 298, percentage: 24 },
    { name: 'Civil Engineering', students: 186, percentage: 15 },
    { name: 'Electrical', students: 98, percentage: 8 }
  ];

  const quickActions = [
    { label: 'Admission Analytics', icon: UserCheck },
    { label: 'Academic Calendar', icon: Calendar },
    { label: 'Performance Reports', icon: TrendingUp },
    { label: 'Student Records', icon: Eye }
  ];

  if (statsLoading || scholarshipLoading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">Student Management Overview</h2>
            <p className="text-blue-100">Comprehensive view of institutional student body</p>
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
        {studentOverviewCards.map((card, index) => (
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

      {/* Department Analysis & Quick Actions */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Department Breakdown */}
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-blue-600" />
              <span>Student Distribution by Department</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {departmentBreakdown.map((dept, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      {dept.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{dept.name}</p>
                      <p className="text-sm text-gray-600">{dept.students} students</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-blue-600">{dept.percentage}%</div>
                    <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-500 rounded-full" 
                        style={{ width: `${dept.percentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-gray-800">Strategic Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {quickActions.map((action, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="w-full h-14 flex items-center justify-start space-x-3 hover:bg-blue-50 hover:border-blue-200"
                >
                  <action.icon className="w-5 h-5 text-blue-600" />
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

export default ChairmanStudentDesktop;
