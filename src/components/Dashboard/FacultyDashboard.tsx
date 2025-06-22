
import React, { useState } from 'react';
import { Users, UserCheck, FileText, AlertTriangle, Calendar, Clock } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { mockStudents, mockCourses, mockAttendance, mockLeaves } from '../../data/mockData';
import BatchAttendanceMarking from '../Attendance/BatchAttendanceMarking';
import LeaveApprovalQueue from '../Leave/LeaveApprovalQueue';
import { Button } from '../ui/button';

const FacultyDashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeView, setActiveView] = useState<'overview' | 'attendance' | 'reports' | 'leaves'>('overview');

  if (!user?.facultyId) return null;

  // Get faculty's courses and students
  const facultyCourses = mockCourses.filter(course => 
    course.facultyEmail === user.email
  );
  
  const facultyStudents = mockStudents.filter(student =>
    facultyCourses.some(course => 
      course.department === student.department && 
      course.year === student.year
    )
  );

  const pendingLeaves = mockLeaves.filter(leave => 
    leave.facultyApproval === 'Pending'
  );

  const atRiskStudents = facultyStudents.filter(student => 
    (student.attendancePercentage || 0) < 75
  );

  const todayAttendance = mockAttendance.filter(record => 
    record.date === new Date().toISOString().split('T')[0] &&
    record.facultyId === user.facultyId
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Faculty Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage attendance and monitor student progress</p>
        </div>
        <div className="text-right">
          <p className="text-gray-600">My Courses</p>
          <p className="text-xl font-semibold text-gray-800">{facultyCourses.length}</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100">My Students</p>
              <p className="text-3xl font-bold">{facultyStudents.length}</p>
            </div>
            <Users className="w-8 h-8 text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100">Today's Attendance</p>
              <p className="text-3xl font-bold">{todayAttendance.length}</p>
            </div>
            <UserCheck className="w-8 h-8 text-green-200" />
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
              <p className="text-3xl font-bold">{atRiskStudents.length}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-200" />
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        {[
          { id: 'overview', label: 'Overview', icon: Calendar },
          { id: 'attendance', label: 'Mark Attendance', icon: UserCheck },
          { id: 'reports', label: 'Course Reports', icon: FileText },
          { id: 'leaves', label: 'Leave Approvals', icon: Clock }
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
            <h3 className="text-lg font-semibold text-gray-800 mb-4">My Courses</h3>
            <div className="space-y-3">
              {facultyCourses.map((course, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium text-gray-800">{course.courseName}</h4>
                      <p className="text-sm text-gray-600">{course.courseCode} • {course.yearSection}</p>
                    </div>
                    <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      {course.avgAttendance}% avg
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">At-Risk Students</h3>
            <div className="space-y-3">
              {atRiskStudents.slice(0, 5).map((student, index) => (
                <div key={index} className="flex items-center justify-between border-b pb-2">
                  <div>
                    <p className="font-medium text-gray-800">{student.name}</p>
                    <p className="text-sm text-gray-600">{student.rollNumber} • {student.yearSection}</p>
                  </div>
                  <span className="text-red-600 font-medium">
                    {student.attendancePercentage}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeView === 'attendance' && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <BatchAttendanceMarking />
        </div>
      )}

      {activeView === 'reports' && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Course Reports</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {facultyCourses.map((course, index) => (
              <div key={index} className="border rounded-lg p-4">
                <h4 className="font-medium text-gray-800 mb-2">{course.courseName}</h4>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Total Students:</span>
                    <span className="font-medium">
                      {facultyStudents.filter(s => 
                        s.department === course.department && s.year === course.year
                      ).length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Average Attendance:</span>
                    <span className="font-medium">{course.avgAttendance}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Classes This Week:</span>
                    <span className="font-medium">{course.hoursPerWeek}</span>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="w-full mt-3">
                  View Detailed Report
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeView === 'leaves' && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <LeaveApprovalQueue />
        </div>
      )}
    </div>
  );
};

export default FacultyDashboard;
