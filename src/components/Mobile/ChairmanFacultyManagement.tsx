
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
  Award,
  Download,
  Eye,
  Calendar,
  MapPin,
  BookOpen,
  TrendingUp,
  Star
} from 'lucide-react';
import { cn } from '../../lib/utils';
import MobileDataCard from './MobileDataCard';
import { useFacultyStats } from '../../hooks/useFacultyStats';

interface ChairmanFacultyManagementProps {
  className?: string;
}

const ChairmanFacultyManagement: React.FC<ChairmanFacultyManagementProps> = ({ className }) => {
  const { stats, loading, error, fetchStats } = useFacultyStats();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedExperience, setSelectedExperience] = useState('all');

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

  if (loading) {
    return (
      <div className={cn("p-4 space-y-6", className)}>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn("p-4", className)}>
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6 text-center">
            <p className="text-red-600">{error}</p>
            <Button onClick={fetchStats} className="mt-4">
              Retry
            </Button>
          </CardContent>
        </Card>
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
                <p className="text-2xl font-bold text-blue-600">{stats.totalFaculty}</p>
                <p className="text-xs text-gray-500">{stats.activeFaculty} active</p>
              </div>
              <Users className="w-8 h-8 text-blue-600 opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Experience</p>
                <p className="text-2xl font-bold text-purple-600">{stats.avgExperience.toFixed(1)}</p>
                <p className="text-xs text-gray-500">Years</p>
              </div>
              <Award className="w-8 h-8 text-purple-600 opacity-80" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Department-wise Faculty */}
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

      {/* Search and Filters */}
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

        <div className="flex space-x-2">
          <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              {Object.entries(stats.departmentStats).map(([dept, data]: [string, any]) => (
                <SelectItem key={dept} value={dept}>
                  {data.code}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedExperience} onValueChange={setSelectedExperience}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Experience" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              <SelectItem value="senior">Senior (10+ yrs)</SelectItem>
              <SelectItem value="mid">Mid-level (5-9 yrs)</SelectItem>
              <SelectItem value="junior">Junior (Less than 5 yrs)</SelectItem>
            </SelectContent>
          </Select>
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

      {/* Faculty Insights */}
      {stats.faculty.length > 0 && (
        <Card className="bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Star className="w-5 h-5 text-emerald-600" />
              <span>Faculty Insights</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 rounded-lg bg-white/70">
                <span className="text-sm font-medium text-gray-700">Senior Faculty (10+ years)</span>
                <span className="text-lg font-bold text-green-600">
                  {stats.seniorFaculty}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-white/70">
                <span className="text-sm font-medium text-gray-700">Excellent Performers (95%+ attendance)</span>
                <span className="text-lg font-bold text-purple-600">
                  {stats.excellentPerformers}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-white/70">
                <span className="text-sm font-medium text-gray-700">Top Researchers (5+ papers)</span>
                <span className="text-lg font-bold text-blue-600">
                  {stats.topPerformers}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-white/70">
                <span className="text-sm font-medium text-gray-700">Average Attendance</span>
                <span className="text-lg font-bold text-orange-600">
                  {stats.avgAttendance.toFixed(1)}%
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
