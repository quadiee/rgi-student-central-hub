
import React, { useState } from 'react';
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
  ChevronRight,
  Download,
  Eye,
  GraduationCap,
  Calendar
} from 'lucide-react';
import { cn } from '../../lib/utils';
import MobileDataCard from './MobileDataCard';

interface ChairmanFacultyManagementProps {
  className?: string;
}

const ChairmanFacultyManagement: React.FC<ChairmanFacultyManagementProps> = ({ className }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');

  // Mock data - replace with real data from hooks
  const facultyStats = {
    totalFaculty: 145,
    activeFaculty: 142,
    byDepartment: [
      { dept: 'CSE', count: 28, active: 27, avgExperience: 8.5 },
      { dept: 'ECE', count: 24, active: 24, avgExperience: 9.2 },
      { dept: 'EEE', count: 22, active: 22, avgExperience: 7.8 },
      { dept: 'MECH', count: 26, active: 25, avgExperience: 10.1 },
      { dept: 'CIVIL', count: 23, active: 22, avgExperience: 8.9 },
      { dept: 'IT', count: 22, active: 22, avgExperience: 6.5 }
    ],
    qualificationStats: {
      phd: 67,
      mtech: 58,
      me: 20
    },
    averageAttendance: 92.5
  };

  const mockFaculty = [
    {
      id: '1',
      name: 'Dr. Rajesh Kumar',
      employeeId: 'FAC001',
      department: 'CSE',
      designation: 'Professor',
      experience: 12,
      qualification: 'Ph.D',
      subjects: ['Data Structures', 'Algorithms'],
      attendanceRate: 95.5,
      publications: 25,
      isActive: true
    },
    {
      id: '2',
      name: 'Ms. Priya Sharma',
      employeeId: 'FAC045',
      department: 'ECE',
      designation: 'Assistant Professor',
      experience: 6,
      qualification: 'M.Tech',
      subjects: ['Digital Electronics', 'VLSI Design'],
      attendanceRate: 88.2,
      publications: 8,
      isActive: true
    }
  ];

  const getExperienceLevel = (years: number) => {
    if (years >= 15) return { label: 'Senior', color: 'text-purple-600 bg-purple-100' };
    if (years >= 8) return { label: 'Experienced', color: 'text-blue-600 bg-blue-100' };
    if (years >= 3) return { label: 'Mid-level', color: 'text-green-600 bg-green-100' };
    return { label: 'Junior', color: 'text-orange-600 bg-orange-100' };
  };

  return (
    <div className={cn("p-4 space-y-6", className)}>
      {/* Header with View-Only indicator */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Faculty Overview
          </h2>
          <div className="flex items-center space-x-2 mt-1">
            <Eye className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-500">View-Only Access</span>
          </div>
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
                <p className="text-2xl font-bold text-blue-600">{facultyStats.totalFaculty}</p>
                <p className="text-xs text-gray-500">{facultyStats.activeFaculty} active</p>
              </div>
              <Users className="w-8 h-8 text-blue-600 opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Attendance</p>
                <p className="text-2xl font-bold text-green-600">{facultyStats.averageAttendance}%</p>
                <p className="text-xs text-gray-500">Institutional average</p>
              </div>
              <Clock className="w-8 h-8 text-green-600 opacity-80" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Qualification Distribution */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <GraduationCap className="w-5 h-5 text-purple-600" />
            <span>Qualification Distribution</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center p-3 rounded-lg bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200">
              <p className="text-xl font-bold text-purple-600">{facultyStats.qualificationStats.phd}</p>
              <p className="text-sm text-gray-600">Ph.D</p>
              <p className="text-xs text-gray-500">
                {((facultyStats.qualificationStats.phd / facultyStats.totalFaculty) * 100).toFixed(1)}%
              </p>
            </div>
            <div className="text-center p-3 rounded-lg bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200">
              <p className="text-xl font-bold text-blue-600">{facultyStats.qualificationStats.mtech}</p>
              <p className="text-sm text-gray-600">M.Tech</p>
              <p className="text-xs text-gray-500">
                {((facultyStats.qualificationStats.mtech / facultyStats.totalFaculty) * 100).toFixed(1)}%
              </p>
            </div>
            <div className="text-center p-3 rounded-lg bg-gradient-to-r from-cyan-50 to-teal-50 border border-cyan-200">
              <p className="text-xl font-bold text-cyan-600">{facultyStats.qualificationStats.me}</p>
              <p className="text-sm text-gray-600">M.E</p>
              <p className="text-xs text-gray-500">
                {((facultyStats.qualificationStats.me / facultyStats.totalFaculty) * 100).toFixed(1)}%
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Department-wise Faculty */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-blue-600" />
            <span>Department-wise Distribution</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {facultyStats.byDepartment.map((dept) => (
              <div key={dept.dept} className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center">
                    <span className="text-white font-bold text-sm">{dept.dept}</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{dept.dept} Department</p>
                    <p className="text-sm text-gray-600">{dept.active} active • {dept.avgExperience}y avg exp</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-blue-600">{dept.count}</p>
                  <p className="text-xs text-gray-500">Faculty</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

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
        {mockFaculty.map((faculty) => {
          const expLevel = getExperienceLevel(faculty.experience);
          return (
            <MobileDataCard
              key={faculty.id}
              title={faculty.name}
              subtitle={`${faculty.employeeId} • ${faculty.department} • ${faculty.designation}`}
              status={{
                label: expLevel.label,
                variant: 'outline'
              }}
              data={[
                {
                  label: 'Experience',
                  value: `${faculty.experience} years`,
                  icon: Calendar,
                  color: 'text-blue-600'
                },
                {
                  label: 'Qualification',
                  value: faculty.qualification,
                  icon: GraduationCap,
                  color: 'text-purple-600'
                },
                {
                  label: 'Attendance',
                  value: `${faculty.attendanceRate}%`,
                  icon: Clock,
                  color: faculty.attendanceRate >= 90 ? 'text-green-600' : 'text-orange-600'
                },
                {
                  label: 'Publications',
                  value: faculty.publications.toString(),
                  icon: BookOpen,
                  color: 'text-emerald-600'
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
          );
        })}
      </div>

      {/* Performance Insights */}
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
              <span className="text-sm font-medium text-gray-700">High Performers (>95% attendance)</span>
              <span className="text-lg font-bold text-green-600">23</span>
            </div>
            <div className="flex justify-between items-center p-3 rounded-lg bg-white/70">
              <span className="text-sm font-medium text-gray-700">Research Active (>5 publications)</span>
              <span className="text-lg font-bold text-purple-600">34</span>
            </div>
            <div className="flex justify-between items-center p-3 rounded-lg bg-white/70">
              <span className="text-sm font-medium text-gray-700">Senior Faculty (>10y exp)</span>
              <span className="text-lg font-bold text-blue-600">67</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Load More */}
      <div className="text-center">
        <Button variant="outline" className="w-full">
          Load More Faculty
        </Button>
      </div>
    </div>
  );
};

export default ChairmanFacultyManagement;
