
import React from 'react';
import { TrendingUp, TrendingDown, Users, Calendar, AlertTriangle } from 'lucide-react';
import { mockStudents, calculateAttendanceStats } from '../../data/mockData';

const AttendanceAnalytics: React.FC = () => {
  // Calculate overall statistics
  const allStudentStats = mockStudents.map(student => ({
    student,
    stats: calculateAttendanceStats(student.id)
  }));

  const overallStats = {
    totalStudents: mockStudents.length,
    averageAttendance: Math.round(allStudentStats.reduce((sum, s) => sum + s.stats.attendancePercentage, 0) / allStudentStats.length),
    excellentPerformers: allStudentStats.filter(s => s.stats.attendancePercentage >= 90).length,
    needsAttention: allStudentStats.filter(s => s.stats.attendancePercentage < 75).length
  };

  const lowAttendanceStudents = allStudentStats.filter(s => s.stats.attendancePercentage < 75);

  return (
    <div className="space-y-6">
      {/* Overall Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Students</p>
              <p className="text-3xl font-bold text-gray-800">{overallStats.totalStudents}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Average Attendance</p>
              <p className="text-3xl font-bold text-green-600">{overallStats.averageAttendance}%</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Excellent (≥90%)</p>
              <p className="text-3xl font-bold text-blue-600">{overallStats.excellentPerformers}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Needs Attention</p>
              <p className="text-3xl font-bold text-red-600">{overallStats.needsAttention}</p>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Student Performance Overview */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Student Performance Overview</h3>
          <div className="space-y-3">
            {allStudentStats.map(({ student, stats }) => (
              <div key={student.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {student.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{student.name}</div>
                    <div className="text-sm text-gray-500">{student.rollNumber}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                    stats.attendancePercentage >= 90 ? 'bg-green-100 text-green-800' :
                    stats.attendancePercentage >= 75 ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {stats.attendancePercentage}%
                  </div>
                  {stats.attendancePercentage >= 85 ? (
                    <TrendingUp className="w-4 h-4 text-green-500" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-500" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Low Attendance Alert */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center space-x-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <h3 className="text-lg font-semibold text-gray-800">Attendance Alerts</h3>
          </div>
          
          {lowAttendanceStudents.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>All students have good attendance!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {lowAttendanceStudents.map(({ student, stats }) => (
                <div key={student.id} className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-medium text-red-800">{student.name}</div>
                    <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-sm">
                      {stats.attendancePercentage}%
                    </span>
                  </div>
                  <div className="text-sm text-red-600">
                    {stats.absentClasses} absent out of {stats.totalClasses} classes
                  </div>
                  <div className="text-xs text-red-500 mt-1">
                    Contact: {student.phone} | Guardian: {student.guardianPhone}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Course-wise Performance */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Course-wise Attendance</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data Structures</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Database Management</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Overall</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {allStudentStats.map(({ student, stats }) => (
                <tr key={student.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{student.name}</div>
                    <div className="text-sm text-gray-500">{student.rollNumber}</div>
                  </td>
                  {stats.courseWiseAttendance.map((course, index) => (
                    <td key={index} className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        course.percentage >= 90 ? 'bg-green-100 text-green-800' :
                        course.percentage >= 75 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {course.percentage}%
                      </span>
                    </td>
                  ))}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      stats.attendancePercentage >= 90 ? 'bg-green-100 text-green-800' :
                      stats.attendancePercentage >= 75 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {stats.attendancePercentage}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AttendanceAnalytics;
