
import React, { useState } from 'react';
import { Users, Clock, TrendingUp, AlertTriangle, Calendar, FileText } from 'lucide-react';
import { Button } from '../ui/button';
import StatsCard from './StatsCard';
import { mockStudents, mockAttendance, mockSubjects } from '../../data/mockData';
import { useIsMobile } from '../../hooks/use-mobile';

const FacultyDashboard: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('today');
  const isMobile = useIsMobile();

  const todayAttendance = mockAttendance.filter(a => a.date === '2024-06-20');
  const presentToday = todayAttendance.filter(a => a.status === 'Present').length;
  const absentToday = todayAttendance.filter(a => a.status === 'Absent').length;
  const totalClasses = mockSubjects.length;
  const pendingLeaves = 3; // Mock data

  const stats = [
    {
      title: 'Classes Today',
      value: totalClasses,
      icon: Calendar,
      color: 'blue',
      trend: '+2 from yesterday'
    },
    {
      title: 'Present Students',
      value: presentToday,
      icon: Users,
      color: 'green',
      trend: '85% attendance rate'
    },
    {
      title: 'Absent Students',
      value: absentToday,
      icon: AlertTriangle,
      color: 'red',
      trend: '15% absence rate'
    },
    {
      title: 'Pending Leaves',
      value: pendingLeaves,
      icon: FileText,
      color: 'yellow',
      trend: 'Need approval'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold text-gray-800`}>
          Faculty Dashboard
        </h1>
        <div className="flex space-x-2">
          <Button variant="outline" size={isMobile ? 'sm' : 'default'}>
            <Calendar className="w-4 h-4 mr-2" />
            Today's Schedule
          </Button>
          <Button size={isMobile ? 'sm' : 'default'}>
            <Clock className="w-4 h-4 mr-2" />
            Mark Attendance
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className={`grid ${isMobile ? 'grid-cols-2' : 'grid-cols-1 md:grid-cols-4'} gap-4`}>
        {stats.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
        <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-3'} gap-4`}>
          <Button className="flex items-center justify-center space-x-2 h-12">
            <Users className="w-5 h-5" />
            <span>Take Attendance</span>
          </Button>
          <Button variant="outline" className="flex items-center justify-center space-x-2 h-12">
            <FileText className="w-5 h-5" />
            <span>Review Leaves</span>
          </Button>
          <Button variant="outline" className="flex items-center justify-center space-x-2 h-12">
            <TrendingUp className="w-5 h-5" />
            <span>View Reports</span>
          </Button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {todayAttendance.slice(0, 5).map((record) => {
            const student = mockStudents.find(s => s.id === record.studentId);
            return (
              <div key={record.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {student?.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{student?.name}</p>
                    <p className="text-sm text-gray-500">{record.courseCode} • Hour {record.hourNumber}</p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  record.status === 'Present' ? 'bg-green-100 text-green-800' :
                  record.status === 'Leave' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {record.status}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default FacultyDashboard;
