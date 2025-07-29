
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
  Calendar
} from 'lucide-react';
import { cn } from '../../lib/utils';
import MobileDataCard from './MobileDataCard';
import { useFacultyAttendance } from '../../hooks/useFacultyAttendance';
import { useInstitutionalStats } from '../../hooks/useInstitutionalStats';

interface ChairmanFacultyManagementProps {
  className?: string;
}

const ChairmanFacultyManagement: React.FC<ChairmanFacultyManagementProps> = ({ className }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  
  const { enhancedFacultyList, loading, fetchEnhancedFacultyList } = useFacultyAttendance();
  const { stats: institutionalStats } = useInstitutionalStats();

  useEffect(() => {
    fetchEnhancedFacultyList();
  }, []);

  const filteredFaculty = enhancedFacultyList.filter(faculty => {
    const matchesSearch = 
      faculty.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faculty.employee_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faculty.department_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDepartment = selectedDepartment === 'all' || 
      faculty.department_name === selectedDepartment;

    return matchesSearch && matchesDepartment;
  });

  // Group faculty by department for statistics
  const facultyByDepartment = enhancedFacultyList.reduce((acc, faculty) => {
    const dept = faculty.department_name;
    if (!acc[dept]) {
      acc[dept] = {
        total: 0,
        active: 0,
        avgExperience: 0,
        totalExperience: 0
      };
    }
    acc[dept].total += 1;
    if (faculty.is_active) acc[dept].active += 1;
    if (faculty.years_of_experience) {
      acc[dept].totalExperience += faculty.years_of_experience;
    }
    return acc;
  }, {} as Record<string, any>);

  // Calculate average experience for each department
  Object.keys(facultyByDepartment).forEach(dept => {
    const deptData = facultyByDepartment[dept];
    deptData.avgExperience = deptData.total > 0 ? 
      (deptData.totalExperience / deptData.total).toFixed(1) : 0;
  });

  const getExperienceLevel = (years: number) => {
    if (years >= 15) return { label: 'Senior', color: 'text-purple-600 bg-purple-100' };
    if (years >= 8) return { label: 'Experienced', color: 'text-blue-600 bg-blue-100' };
    if (years >= 3) return { label: 'Mid-level', color: 'text-green-600 bg-green-100' };
    return { label: 'Junior', color: 'text-orange-600 bg-orange-100' };
  };

  if (loading) {
    return (
      <div className={cn("p-4 space-y-6", className)}>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("p-4 space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Faculty Overview
          </h2>
          <p className="text-sm text-gray-500 mt-1">Institutional Faculty Management</p>
        </div>
        <Button variant="outline" size="sm" className="text-purple-600 border-purple-200">
          <Download className="w-4 h-4 mr-2" />
          Export
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Faculty</p>
                <p className="text-2xl font-bold text-blue-600">{institutionalStats.totalFaculty}</p>
                <p className="text-xs text-gray-500">{institutionalStats.activeFaculty} active</p>
              </div>
              <Users className="w-8 h-8 text-blue-600 opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Departments</p>
                <p className="text-2xl font-bold text-green-600">{institutionalStats.totalDepartments}</p>
                <p className="text-xs text-gray-500">Active departments</p>
              </div>
              <Clock className="w-8 h-8 text-green-600 opacity-80" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Department-wise Faculty */}
      {Object.keys(facultyByDepartment).length > 0 && (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-blue-600" />
              <span>Department-wise Distribution</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(facultyByDepartment).map(([dept, data]: [string, any]) => (
                <div key={dept} className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center">
                      <span className="text-white font-bold text-sm">{dept.substring(0, 3)}</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{dept}</p>
                      <p className="text-sm text-gray-600">
                        {data.active} active • {data.avgExperience}y avg exp
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-blue-600">{data.total}</p>
                    <p className="text-xs text-gray-500">Faculty</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search and Filter */}
      <div className="space-y-3">
        <div className="flex space-x-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search faculty..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline" size="icon">
            <Filter className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Faculty List */}
      <div className="space-y-3">
        <h3 className="font-semibold text-gray-800">Faculty Members</h3>
        {filteredFaculty.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No faculty members found</p>
            </CardContent>
          </Card>
        ) : (
          filteredFaculty.map((faculty) => {
            const expLevel = getExperienceLevel(faculty.years_of_experience || 0);
            return (
              <MobileDataCard
                key={faculty.faculty_id}
                title={faculty.name}
                subtitle={`${faculty.employee_code} • ${faculty.department_name} • ${faculty.designation}`}
                status={{
                  label: faculty.is_active ? 'Active' : 'Inactive',
                  variant: faculty.is_active ? 'default' : 'secondary'
                }}
                data={[
                  {
                    label: 'Experience',
                    value: faculty.years_of_experience ? `${faculty.years_of_experience} years` : 'Not specified',
                    icon: Calendar,
                    color: 'text-blue-600'
                  },
                  {
                    label: 'Level',
                    value: expLevel.label,
                    icon: GraduationCap,
                    color: 'text-purple-600'
                  },
                  {
                    label: 'Attendance',
                    value: `${faculty.attendance_percentage || 0}%`,
                    icon: Clock,
                    color: (faculty.attendance_percentage || 0) >= 90 ? 'text-green-600' : 'text-orange-600'
                  },
                  {
                    label: 'Department',
                    value: faculty.department_code || 'N/A',
                    icon: BookOpen,
                    color: 'text-emerald-600'
                  }
                ]}
                actions={[
                  {
                    label: 'View Profile',
                    icon: Eye,
                    onClick: () => console.log('View faculty:', faculty.faculty_id)
                  }
                ]}
                onClick={() => console.log('Faculty clicked:', faculty.faculty_id)}
                className="hover:shadow-md transition-shadow"
              />
            );
          })
        )}
      </div>

      {/* Performance Insights */}
      {enhancedFacultyList.length > 0 && (
        <Card className="bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Award className="w-5 h-5 text-emerald-600" />
              <span>Faculty Insights</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 rounded-lg bg-white/70">
                <span className="text-sm font-medium text-gray-700">Senior Faculty (15+ years)</span>
                <span className="text-lg font-bold text-green-600">
                  {enhancedFacultyList.filter(f => (f.years_of_experience || 0) >= 15).length}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-white/70">
                <span className="text-sm font-medium text-gray-700">Experienced Faculty (8+ years)</span>
                <span className="text-lg font-bold text-purple-600">
                  {enhancedFacultyList.filter(f => (f.years_of_experience || 0) >= 8).length}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-white/70">
                <span className="text-sm font-medium text-gray-700">Active Faculty</span>
                <span className="text-lg font-bold text-blue-600">
                  {enhancedFacultyList.filter(f => f.is_active).length}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ChairmanFacultyManagement;
