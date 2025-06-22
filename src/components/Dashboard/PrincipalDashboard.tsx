
import React from 'react';
import { TrendingUp, Users, Building, Award, Calendar, FileText } from 'lucide-react';
import { Button } from '../ui/button';
import StatsCard from './StatsCard';
import { mockStudents } from '../../data/mockData';
import { useIsMobile } from '../../hooks/use-mobile';

const PrincipalDashboard: React.FC = () => {
  const isMobile = useIsMobile();
  
  const totalStudents = mockStudents.length;
  const collegeAvgAttendance = 82; // Mock calculation
  const departments = ['CSE', 'ECE', 'MECH', 'CIVIL'].length;
  const facultyCount = 45; // Mock data

  const stats = [
    {
      title: 'Total Students',
      value: totalStudents,
      icon: Users,
      color: 'blue',
      trend: '+50 this year'
    },
    {
      title: 'College Average',
      value: `${collegeAvgAttendance}%`,
      icon: TrendingUp,
      color: 'green',
      trend: '+3% from last semester'
    },
    {
      title: 'Departments',
      value: departments,
      icon: Building,
      color: 'purple',
      trend: 'All active'
    },
    {
      title: 'Faculty Members',
      value: facultyCount,
      icon: Award,
      color: 'indigo',
      trend: '5 new this year'
    }
  ];

  const departmentData = [
    { name: 'Computer Science', students: 120, attendance: 85 },
    { name: 'Electronics', students: 100, attendance: 80 },
    { name: 'Mechanical', students: 90, attendance: 78 },
    { name: 'Civil', students: 80, attendance: 82 }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold text-gray-800`}>
          Principal Dashboard - RGCE
        </h1>
        <div className="flex space-x-2">
          <Button variant="outline" size={isMobile ? 'sm' : 'default'}>
            <Calendar className="w-4 h-4 mr-2" />
            College Report
          </Button>
          <Button size={isMobile ? 'sm' : 'default'}>
            <FileText className="w-4 h-4 mr-2" />
            Analytics
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className={`grid ${isMobile ? 'grid-cols-2' : 'grid-cols-1 md:grid-cols-4'} gap-4`}>
        {stats.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      {/* Department Overview */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Department Performance</h3>
        <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-2 lg:grid-cols-4'} gap-4`}>
          {departmentData.map((dept, index) => (
            <div key={index} className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">{dept.name}</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Students:</span>
                  <span className="font-medium">{dept.students}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Attendance:</span>
                  <span className={`font-medium ${
                    dept.attendance >= 80 ? 'text-green-600' : 
                    dept.attendance >= 75 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {dept.attendance}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      dept.attendance >= 80 ? 'bg-green-500' : 
                      dept.attendance >= 75 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${dept.attendance}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Highlights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Top Performing Classes</h3>
          <div className="space-y-3">
            {[
              { class: 'CSE-4A', attendance: 92 },
              { class: 'ECE-3B', attendance: 88 },
              { class: 'MECH-2A', attendance: 85 }
            ].map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <span className="font-medium text-gray-900">{item.class}</span>
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                  {item.attendance}%
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Areas for Improvement</h3>
          <div className="space-y-3">
            {[
              { class: 'CIVIL-1B', attendance: 68 },
              { class: 'MECH-3C', attendance: 72 },
              { class: 'ECE-2A', attendance: 74 }
            ].map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <span className="font-medium text-gray-900">{item.class}</span>
                <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
                  {item.attendance}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrincipalDashboard;
