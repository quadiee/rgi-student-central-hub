
import React, { useState } from 'react';
import { BarChart3, Users, TrendingUp, AlertTriangle, Clock, CheckCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { mockStudents, mockCourses, mockFaculty, mockLeaves, AttendanceCalculator } from '../../data/mockData';
import { mockAttendance, mockSystemSettings } from '../../data/mockData';
import LeaveApprovalQueue from '../Leave/LeaveApprovalQueue';

const HODDashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeView, setActiveView] = useState<'overview' | 'analytics' | 'leaves' | 'monitoring'>('overview');

  if (!user?.department) return null;

  // Initialize attendance calculator
  const attendanceCalculator = new AttendanceCalculator(
    mockAttendance,
    mockStudents,
    mockCourses,
    mockLeaves,
    mockSystemSettings
  );

  // Get department data
  const deptStudents = mockStudents.filter(s => s.department === user.department);
  const deptFaculty = mockFaculty.filter(f => f.department === user.department);
  const deptCourses = mockCourses.filter(c => c.department === user.department);
  
  const deptStats = attendanceCalculator.calculateDepartmentStats(user.department);
  const atRiskStudents = attendanceCalculator.getAtRiskStudents(user.department);
  
  const pendingLeaves = mockLeaves.filter(leave => 
    leave.hodApproval === 'Pending' &&
    deptStudents.some(s => s.id === leave.studentId)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">HOD Dashboard</h1>
          <p className="text-gray-600 mt-2">Department of {user.department} Overview</p>
        </div>
        <div className="text-right">
          <p className="text-gray-600">Academic Year</p>
          <p className="text-xl font-semibold text-gray-800">2024-25</p>
        </div>
      </div>

      {/* Department KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100">Total Students</p>
              <p className="text-3xl font-bold">{deptStats.totalStudents}</p>
            </div>
            <Users className="w-8 h-8 text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100">Avg Attendance</p>
              <p className="text-3xl font-bold">{deptStats.avgAttendance}%</p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100">Pending Leaves</p>
              <p className="text-3xl font-bold">{pendingLeaves.length}</p>
            </div>
            <Clock className="w-8 h-8 text-yellow-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100">At Risk Students</p>
              <p className="text-3xl font-bold">{deptStats.atRiskStudents}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-200" />
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        {[
          { id: 'overview', label: 'Overview', icon: BarChart3 },
          { id: 'analytics', label: 'Analytics', icon: TrendingUp },
          { id: 'leaves', label: 'Leave Approvals', icon: Clock },
          { id: 'monitoring', label: 'Student Monitoring', icon: AlertTriangle }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveView(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                activeView === tab.id
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
              {tab.id === 'leaves' && pendingLeaves.length > 0 && (
                <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {pendingLeaves.length}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Content based on active view */}
      {activeView === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Faculty & Courses</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-700">Total Faculty</span>
                <span className="font-semibold text-gray-800">{deptStats.activeFaculty}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-700">Active Courses</span>
                <span className="font-semibold text-gray-800">{deptStats.totalCourses}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-700">Student-Faculty Ratio</span>
                <span className="font-semibold text-gray-800">
                  {Math.round(deptStats.totalStudents / deptStats.activeFaculty)}:1
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Year-wise Distribution</h3>
            <div className="space-y-3">
              {[1, 2, 3, 4].map(year => {
                const yearStudents = deptStudents.filter(s => s.year === year).length;
                const percentage = Math.round((yearStudents / deptStats.totalStudents) * 100);
                return (
                  <div key={year} className="flex items-center justify-between">
                    <span className="text-gray-700">Year {year}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div 
                          className="h-2 bg-blue-500 rounded-full"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">{yearStudents}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {activeView === 'analytics' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Monthly Attendance Trend</h3>
            <div className="h-64 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <BarChart3 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>Monthly trend chart</p>
                <p className="text-sm mt-2">Chart integration coming soon</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Course Performance</h3>
            <div className="space-y-3">
              {deptCourses.slice(0, 5).map((course, index) => (
                <div key={index} className="flex items-center justify-between border-b pb-2">
                  <div>
                    <p className="font-medium text-gray-800">{course.courseName}</p>
                    <p className="text-sm text-gray-600">{course.courseCode}</p>
                  </div>
                  <span className={`font-medium ${
                    (course.avgAttendance || 0) >= 75 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {course.avgAttendance}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeView === 'leaves' && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <LeaveApprovalQueue showHODApprovals={true} />
        </div>
      )}

      {activeView === 'monitoring' && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">At-Risk Student Monitoring</h3>
          <div className="space-y-4">
            {atRiskStudents.map((student, index) => {
              const stats = attendanceCalculator.calculateStudentAttendance(student.id);
              return (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-medium text-gray-800">{student.name}</h4>
                      <p className="text-sm text-gray-600">{student.rollNumber} • {student.yearSection}</p>
                    </div>
                    <span className="text-red-600 font-bold text-lg">
                      {stats.attendancePercentage}%
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="text-center p-2 bg-green-50 rounded">
                      <div className="font-medium text-green-600">{stats.presentClasses}</div>
                      <div className="text-gray-600">Present</div>
                    </div>
                    <div className="text-center p-2 bg-red-50 rounded">
                      <div className="font-medium text-red-600">{stats.absentClasses}</div>
                      <div className="text-gray-600">Absent</div>
                    </div>
                    <div className="text-center p-2 bg-blue-50 rounded">
                      <div className="font-medium text-blue-600">{stats.leaveClasses}</div>
                      <div className="text-gray-600">On Leave</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default HODDashboard;
