
import React, { useState } from 'react';
import { Calendar, Users, TrendingUp, AlertTriangle, Clock, BarChart3, QrCode } from 'lucide-react';
import { Button } from '../ui/button';
import { mockAttendance, mockStudents } from '../../data/mockData';
import TimetableView from './TimetableView';
import AttendanceMarking from './AttendanceMarking';
import AttendanceAnalytics from './AttendanceAnalytics';

const AttendanceOverview: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const totalStudents = mockStudents.length;
  const todayAttendance = mockAttendance.filter(a => a.date === '2024-06-20');
  const presentToday = todayAttendance.filter(a => a.status === 'Present').length;
  const absentToday = todayAttendance.filter(a => a.status === 'Absent').length;
  const lateToday = todayAttendance.filter(a => a.status === 'Late').length;

  const attendanceRate = totalStudents > 0 ? Math.round((presentToday / totalStudents) * 100) : 0;

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Present Today</p>
                    <p className="text-3xl font-bold text-green-600">{presentToday}</p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-lg">
                    <Users className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Absent Today</p>
                    <p className="text-3xl font-bold text-red-600">{absentToday}</p>
                  </div>
                  <div className="p-3 bg-red-100 rounded-lg">
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Late Today</p>
                    <p className="text-3xl font-bold text-yellow-600">{lateToday}</p>
                  </div>
                  <div className="p-3 bg-yellow-100 rounded-lg">
                    <Clock className="w-6 h-6 text-yellow-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Attendance Rate</p>
                    <p className="text-3xl font-bold text-blue-600">{attendanceRate}%</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Today's Attendance Table */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Today's Attendance</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Student
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Subject
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Faculty
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Time
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {todayAttendance.map((record) => {
                      const student = mockStudents.find(s => s.id === record.studentId);
                      return (
                        <tr key={record.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                                <span className="text-white text-sm font-medium">
                                  {student?.name.split(' ').map(n => n[0]).join('')}
                                </span>
                              </div>
                              <div className="ml-3">
                                <div className="text-sm font-medium text-gray-900">{student?.name}</div>
                                <div className="text-sm text-gray-500">{student?.rollNumber}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {record.subject}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {record.faculty}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                              record.status === 'Present' ? 'bg-green-100 text-green-800' :
                              record.status === 'Late' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {record.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {record.timeSlot}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      case 'timetable':
        return <TimetableView />;
      case 'marking':
        return <AttendanceMarking />;
      case 'analytics':
        return <AttendanceAnalytics />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-800">Attendance Management</h2>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" className="flex items-center space-x-2">
            <QrCode className="w-4 h-4" />
            <span>QR Scanner</span>
          </Button>
          <Button className="flex items-center space-x-2">
            <Calendar className="w-4 h-4" />
            <span>Export Report</span>
          </Button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-xl shadow-lg p-1">
        <div className="flex flex-wrap gap-1">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'timetable', label: 'Timetable', icon: Calendar },
            { id: 'marking', label: 'Mark Attendance', icon: Users },
            { id: 'analytics', label: 'Analytics', icon: TrendingUp },
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      {renderTabContent()}
    </div>
  );
};

export default AttendanceOverview;
