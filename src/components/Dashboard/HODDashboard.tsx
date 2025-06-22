
import React from 'react';
import { TrendingUp, Users, AlertTriangle, Award, Calendar, FileText } from 'lucide-react';
import { Button } from '../ui/button';
import StatsCard from './StatsCard';
import { mockStudents, mockAttendance } from '../../data/mockData';
import { useIsMobile } from '../../hooks/use-mobile';

const HODDashboard: React.FC = () => {
  const isMobile = useIsMobile();
  
  const departmentStudents = mockStudents.filter(s => s.department === 'CSE');
  const avgAttendance = 78; // Mock calculation
  const atRiskStudents = departmentStudents.filter(s => s.attendancePercentage < 75).length;
  const pendingLeaves = 5; // Mock data

  const stats = [
    {
      title: 'Department Students',
      value: departmentStudents.length,
      icon: Users,
      color: 'blue',
      trend: '+5 this semester'
    },
    {
      title: 'Avg Attendance',
      value: `${avgAttendance}%`,
      icon: TrendingUp,
      color: 'green',
      trend: '+2% from last month'
    },
    {
      title: 'At-Risk Students',
      value: atRiskStudents,
      icon: AlertTriangle,
      color: 'red',
      trend: 'Need attention'
    },
    {
      title: 'Pending Approvals',
      value: pendingLeaves,
      icon: FileText,
      color: 'yellow',
      trend: 'Leave requests'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold text-gray-800`}>
          HOD Dashboard - Computer Science
        </h1>
        <div className="flex space-x-2">
          <Button variant="outline" size={isMobile ? 'sm' : 'default'}>
            <Calendar className="w-4 h-4 mr-2" />
            Department Report
          </Button>
          <Button size={isMobile ? 'sm' : 'default'}>
            <FileText className="w-4 h-4 mr-2" />
            Review Leaves
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">At-Risk Students</h3>
          <div className="space-y-3">
            {departmentStudents.filter(s => s.attendancePercentage < 75).map(student => (
              <div key={student.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {student.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{student.name}</p>
                    <p className="text-sm text-gray-500">{student.rollNumber} • {student.yearSection}</p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
                  {student.attendancePercentage}%
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Pending Leave Approvals</h3>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">Student {i}</p>
                  <p className="text-sm text-gray-500">Medical Leave • 2 days</p>
                </div>
                <div className="flex space-x-2">
                  <Button size="sm" className="bg-green-600 hover:bg-green-700">
                    Approve
                  </Button>
                  <Button size="sm" variant="outline">
                    Deny
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HODDashboard;
