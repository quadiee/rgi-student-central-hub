import React, { useState } from 'react';
import { Calendar, TrendingUp, Clock, AlertTriangle, Plus } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { mockAttendance, calculateAttendanceStats } from '../../data/mockData';
import AttendanceCalendar from '../Students/AttendanceCalendar';
import LeaveRequestForm from '../Leave/LeaveRequestForm';
import { Button } from '../ui/button';

const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const [showLeaveForm, setShowLeaveForm] = useState(false);
  const [activeView, setActiveView] = useState<'overview' | 'calendar' | 'courses'>('overview');

  if (!user?.studentId) return null;

  const attendanceStats = calculateAttendanceStats(user.studentId);

  const getAttendanceColor = (percentage: number) => {
    if (percentage >= 85) return 'text-green-600 bg-green-50';
    if (percentage >= 75) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const handleLeaveSubmit = (leave: any) => {
    console.log('Leave submitted:', leave);
    setShowLeaveForm(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">My Attendance</h1>
          <p className="text-gray-600 mt-2">Track your attendance and academic progress</p>
        </div>
        <Button onClick={() => setShowLeaveForm(true)} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Request Leave
        </Button>
      </div>

      {/* Overall KPI Card */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Overall Attendance</h2>
          {attendanceStats.isAtRisk && (
            <div className="flex items-center gap-2 text-red-600 bg-red-50 px-3 py-1 rounded-full">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-sm font-medium">At Risk</span>
            </div>
          )}
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className={`p-4 rounded-lg ${getAttendanceColor(attendanceStats.attendancePercentage)}`}>
            <div className="text-2xl font-bold">{attendanceStats.attendancePercentage}%</div>
            <div className="text-sm">Overall</div>
          </div>
          <div className="p-4 rounded-lg bg-blue-50 text-blue-600">
            <div className="text-2xl font-bold">{attendanceStats.totalClasses}</div>
            <div className="text-sm">Total Classes</div>
          </div>
          <div className="p-4 rounded-lg bg-green-50 text-green-600">
            <div className="text-2xl font-bold">{attendanceStats.presentClasses}</div>
            <div className="text-sm">Present</div>
          </div>
          <div className="p-4 rounded-lg bg-red-50 text-red-600">
            <div className="text-2xl font-bold">{attendanceStats.absentClasses}</div>
            <div className="text-sm">Absent</div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        {[
          { id: 'overview', label: 'Overview', icon: TrendingUp },
          { id: 'calendar', label: 'Calendar', icon: Calendar },
          { id: 'courses', label: 'Course-wise', icon: Clock }
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
            </button>
          );
        })}
      </div>

      {/* Content based on active view */}
      {activeView === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Monthly Trend</h3>
            <div className="h-64 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <TrendingUp className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>Attendance trend chart</p>
                <p className="text-sm mt-2">Chart integration coming soon</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Subject Performance</h3>
            <div className="space-y-3">
              {attendanceStats.subjectWiseAttendance.map((subject, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-gray-700">{subject.subject}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          subject.percentage >= 75 ? 'bg-green-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${subject.percentage}%` }}
                      />
                    </div>
                    <span className={`text-sm font-medium ${
                      subject.percentage >= 75 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {subject.percentage}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeView === 'calendar' && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <AttendanceCalendar studentId={user.studentId} />
        </div>
      )}

      {activeView === 'courses' && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Course-wise Breakdown</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {attendanceStats.courseWiseAttendance.map((course, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-medium text-gray-800">{course.courseName}</h4>
                    <p className="text-sm text-gray-600">{course.courseCode}</p>
                  </div>
                  <span className={`text-lg font-bold ${
                    course.percentage >= 75 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {course.percentage}%
                  </span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Present: {course.presentHours}</span>
                  <span>Total: {course.totalHours}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div 
                    className={`h-2 rounded-full ${
                      course.percentage >= 75 ? 'bg-green-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${course.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Leave Request Modal */}
      {showLeaveForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Request Leave</h3>
              <button
                onClick={() => setShowLeaveForm(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <LeaveRequestForm 
              studentId={user.studentId}
              onSubmit={handleLeaveSubmit}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;
