
import React, { useState } from 'react';
import { BarChart3, Users, Building, TrendingUp, GraduationCap } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { mockStudents, mockCourses, mockFaculty, AttendanceCalculator } from '../../data/mockData';
import { mockAttendance, mockSystemSettings } from '../../data/mockData';
import { Department } from '../../types';

const PrincipalDashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeView, setActiveView] = useState<'overview' | 'departments' | 'trends'>('overview');

  // Initialize attendance calculator
  const attendanceCalculator = new AttendanceCalculator(
    mockAttendance,
    mockStudents,
    mockCourses,
    [],
    mockSystemSettings
  );

  const departments: Department[] = ['CSE', 'ECE', 'MECH', 'CIVIL', 'EEE'];
  
  // Calculate college-wide statistics
  const totalStudents = mockStudents.length;
  const totalFaculty = mockFaculty.length;
  const totalCourses = mockCourses.length;
  
  const overallAttendance = Math.round(
    mockStudents.reduce((sum, student) => 
      sum + (student.attendancePercentage || 0), 0
    ) / totalStudents
  );

  const departmentStats = departments.map(dept => 
    attendanceCalculator.calculateDepartmentStats(dept)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Principal Dashboard</h1>
          <p className="text-gray-600 mt-2">RGI College - Academic Overview</p>
        </div>
        <div className="text-right">
          <p className="text-gray-600">Academic Year</p>
          <p className="text-xl font-semibold text-gray-800">2024-25</p>
        </div>
      </div>

      {/* College-wide KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100">Total Students</p>
              <p className="text-3xl font-bold">{totalStudents}</p>
            </div>
            <Users className="w-8 h-8 text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100">Overall Attendance</p>
              <p className="text-3xl font-bold">{overallAttendance}%</p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100">Faculty Members</p>
              <p className="text-3xl font-bold">{totalFaculty}</p>
            </div>
            <GraduationCap className="w-8 h-8 text-purple-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-indigo-100">Active Courses</p>
              <p className="text-3xl font-bold">{totalCourses}</p>
            </div>
            <Building className="w-8 h-8 text-indigo-200" />
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        {[
          { id: 'overview', label: 'College Overview', icon: Building },
          { id: 'departments', label: 'Department Comparison', icon: BarChart3 },
          { id: 'trends', label: 'Semester Trends', icon: TrendingUp }
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
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Department Summary</h3>
            <div className="space-y-3">
              {departmentStats.map((dept, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-800">{dept.department}</h4>
                    <p className="text-sm text-gray-600">{dept.totalStudents} students</p>
                  </div>
                  <div className="text-right">
                    <div className={`text-lg font-bold ${
                      dept.avgAttendance >= 80 ? 'text-green-600' : 
                      dept.avgAttendance >= 75 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {dept.avgAttendance}%
                    </div>
                    <div className="text-xs text-gray-500">attendance</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">College Statistics</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                <span className="text-gray-700">Student-Faculty Ratio</span>
                <span className="font-semibold text-gray-800">
                  {Math.round(totalStudents / totalFaculty)}:1
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <span className="text-gray-700">Departments</span>
                <span className="font-semibold text-gray-800">{departments.length}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                <span className="text-gray-700">Total At-Risk Students</span>
                <span className="font-semibold text-red-600">
                  {departmentStats.reduce((sum, dept) => sum + dept.atRiskStudents, 0)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeView === 'departments' && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-6">Department Comparison</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {departmentStats.map((dept, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="text-center mb-4">
                  <h4 className="text-xl font-bold text-gray-800">{dept.department}</h4>
                  <div className={`text-3xl font-bold mt-2 ${
                    dept.avgAttendance >= 80 ? 'text-green-600' : 
                    dept.avgAttendance >= 75 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {dept.avgAttendance}%
                  </div>
                  <p className="text-sm text-gray-600">Average Attendance</p>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Students:</span>
                    <span className="font-medium">{dept.totalStudents}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Faculty:</span>
                    <span className="font-medium">{dept.activeFaculty}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Courses:</span>
                    <span className="font-medium">{dept.totalCourses}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">At Risk:</span>
                    <span className="font-medium text-red-600">{dept.atRiskStudents}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeView === 'trends' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Semester Attendance Trends</h3>
            <div className="h-64 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <TrendingUp className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>Semester trend analysis</p>
                <p className="text-sm mt-2">Chart integration coming soon</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Department Performance Trends</h3>
            <div className="h-64 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <BarChart3 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>Department comparison trends</p>
                <p className="text-sm mt-2">Chart integration coming soon</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PrincipalDashboard;
