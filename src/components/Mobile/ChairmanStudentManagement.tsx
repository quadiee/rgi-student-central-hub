
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { 
  Search, 
  Filter, 
  Users, 
  Award,
  Clock,
  BookOpen,
  Download,
  Eye,
  GraduationCap,
  TrendingUp,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { cn } from '../../lib/utils';
import MobileDataCard from './MobileDataCard';
import { useStudentStats } from '../../hooks/useStudentStats';

interface ChairmanStudentManagementProps {
  className?: string;
}

const ChairmanStudentManagement: React.FC<ChairmanStudentManagementProps> = ({ className }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  
  const { stats, students, loading, refetch } = useStudentStats();

  useEffect(() => {
    refetch();
  }, []);

  const filteredStudents = students.filter(student => {
    const matchesSearch = 
      student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.roll_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.department_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDepartment = selectedDepartment === 'all' || 
      student.department_name === selectedDepartment;

    return matchesSearch && matchesDepartment;
  });

  const getAttendanceStatus = (percentage: number) => {
    if (percentage >= 90) return { label: 'Excellent', color: 'text-green-600 bg-green-100', icon: CheckCircle };
    if (percentage >= 75) return { label: 'Good', color: 'text-blue-600 bg-blue-100', icon: TrendingUp };
    if (percentage >= 60) return { label: 'Warning', color: 'text-orange-600 bg-orange-100', icon: AlertTriangle };
    return { label: 'Critical', color: 'text-red-600 bg-red-100', icon: AlertTriangle };
  };

  if (loading) {
    return (
      <div className={cn("p-4 space-y-6 safe-area-pb", className)}>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("p-4 space-y-6 safe-area-pb", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Student Overview
          </h2>
          <div className="flex items-center space-x-2 mt-1">
            <p className="text-sm text-gray-500">Institutional Student Management</p>
            <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
              <Eye className="w-3 h-3 mr-1" />
              View Only
            </Badge>
          </div>
        </div>
        <Button variant="outline" size="sm" className="text-purple-600 border-purple-200 hover:bg-purple-50">
          <Download className="w-4 h-4 mr-2" />
          Export
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Students</p>
                <p className="text-2xl font-bold text-blue-600">{stats.totalStudents}</p>
                <p className="text-xs text-gray-500">{stats.activeStudents} active</p>
              </div>
              <Users className="w-8 h-8 text-blue-600 opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Departments</p>
                <p className="text-2xl font-bold text-green-600">{stats.totalDepartments}</p>
                <p className="text-xs text-gray-500">Active programs</p>
              </div>
              <GraduationCap className="w-8 h-8 text-green-600 opacity-80" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Student Insights */}
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Award className="w-5 h-5 text-purple-600" />
            <span>Student Insights</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 rounded-lg bg-white/70 shadow-sm">
              <div className="text-2xl font-bold text-green-600">{stats.excellentAttendance}</div>
              <div className="text-sm text-gray-600 mt-1">Excellent Attendance</div>
              <div className="text-xs text-gray-500">(≥90%)</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-white/70 shadow-sm">
              <div className="text-2xl font-bold text-red-600">{stats.criticalAttendance}</div>
              <div className="text-sm text-gray-600 mt-1">Need Attention</div>
              <div className="text-xs text-gray-500">(less than 75%)</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-white/70 shadow-sm">
              <div className="text-2xl font-bold text-blue-600">{stats.avgAttendance}%</div>
              <div className="text-sm text-gray-600 mt-1">Avg Attendance</div>
              <div className="text-xs text-gray-500">Institute-wide</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-white/70 shadow-sm">
              <div className="text-2xl font-bold text-purple-600">{stats.topPerformers}</div>
              <div className="text-sm text-gray-600 mt-1">Top Performers</div>
              <div className="text-xs text-gray-500">(greater than 95%)</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search and Filter */}
      <div className="space-y-3">
        <div className="flex space-x-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search students..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-purple-200 focus:ring-purple-500"
            />
          </div>
          <Button variant="outline" size="icon" className="border-purple-200 hover:bg-purple-50">
            <Filter className="w-4 h-4 text-purple-600" />
          </Button>
        </div>
      </div>

      {/* Student List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-800">Student Records</h3>
          <Badge variant="secondary" className="text-xs">
            {filteredStudents.length} students
          </Badge>
        </div>
        
        {filteredStudents.length === 0 ? (
          <Card className="shadow-sm">
            <CardContent className="text-center py-8">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No students found</p>
              <p className="text-sm text-gray-400 mt-1">Try adjusting your search criteria</p>
            </CardContent>
          </Card>
        ) : (
          filteredStudents.slice(0, 10).map((student) => {
            const attendanceStatus = getAttendanceStatus(student.attendance_percentage || 0);
            return (
              <MobileDataCard
                key={student.student_id}
                title={student.name || 'Unknown Student'}
                subtitle={`${student.roll_number || 'N/A'} • ${student.department_name || 'No Dept'} • ${student.current_year || 'N/A'} Year`}
                status={{
                  label: student.is_active ? 'Active' : 'Inactive',
                  variant: student.is_active ? 'default' : 'secondary'
                }}
                data={[
                  {
                    label: 'Attendance',
                    value: `${student.attendance_percentage || 0}%`,
                    icon: Clock,
                    color: attendanceStatus.color.includes('green') ? 'text-green-600' : 
                           attendanceStatus.color.includes('orange') ? 'text-orange-600' : 'text-red-600'
                  },
                  {
                    label: 'Department',
                    value: student.department_code || 'N/A',
                    icon: BookOpen,
                    color: 'text-purple-600'
                  },
                  {
                    label: 'Year',
                    value: `Year ${student.current_year || 'N/A'}`,
                    icon: GraduationCap,
                    color: 'text-blue-600'
                  },
                  {
                    label: 'Status',
                    value: attendanceStatus.label,
                    icon: attendanceStatus.icon,
                    color: attendanceStatus.color.includes('green') ? 'text-green-600' : 
                           attendanceStatus.color.includes('orange') ? 'text-orange-600' : 'text-red-600'
                  }
                ]}
                actions={[
                  {
                    label: 'View Profile',
                    icon: Eye,
                    onClick: () => console.log('View student:', student.student_id)
                  }
                ]}
                onClick={() => console.log('Student clicked:', student.student_id)}
                className="hover:shadow-md transition-all duration-200 border-l-4 border-l-purple-200"
              />
            );
          })
        )}
      </div>

      {/* Department Summary */}
      {stats.departmentStats && stats.departmentStats.length > 0 && (
        <Card className="bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
              <span>Department Performance</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.departmentStats.map((dept) => (
                <div key={dept.department} className="flex items-center justify-between p-3 rounded-lg bg-white/70 shadow-sm">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-lg bg-emerald-600 flex items-center justify-center">
                      <span className="text-white font-bold text-sm">{dept.department.substring(0, 3)}</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{dept.department}</p>
                      <p className="text-sm text-gray-600">{dept.avgAttendance}% avg attendance</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-emerald-600">{dept.totalStudents}</p>
                    <p className="text-xs text-gray-500">Students</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ChairmanStudentManagement;
