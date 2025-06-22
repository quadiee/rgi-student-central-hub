
import React, { useState } from 'react';
import { ArrowLeft, Calendar, Mail, Phone, MapPin, TrendingUp, Clock, FileText, Edit } from 'lucide-react';
import { Button } from '../ui/button';
import { Student } from '../../types';
import { mockAttendance, mockSubjects } from '../../data/mockData';
import { useIsMobile } from '../../hooks/use-mobile';
import MobileAttendanceCard from '../Mobile/MobileAttendanceCard';

interface StudentProfileProps {
  student: Student;
  onBack: () => void;
}

const StudentProfile: React.FC<StudentProfileProps> = ({ student, onBack }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const isMobile = useIsMobile();

  const studentAttendance = mockAttendance.filter(a => a.studentId === student.id);
  const attendanceBySubject = mockSubjects.map(subject => {
    const subjectAttendance = studentAttendance.filter(a => a.courseCode === subject.code);
    const present = subjectAttendance.filter(a => a.status === 'Present').length;
    const total = subjectAttendance.length;
    const percentage = total > 0 ? Math.round((present / total) * 100) : 0;

    return {
      subject: subject.name,
      code: subject.code,
      present,
      total,
      percentage
    };
  });

  const recentAttendance = studentAttendance
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={onBack}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </Button>
          <h2 className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold text-gray-800`}>
            Student Profile
          </h2>
        </div>
        <Button className="flex items-center space-x-2" size={isMobile ? 'sm' : 'default'}>
          <Edit className="w-4 h-4" />
          <span>Edit Profile</span>
        </Button>
      </div>

      {/* Student Info Card */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className={`flex ${isMobile ? 'flex-col' : 'flex-row'} items-start space-x-0 ${!isMobile && 'space-x-6'} ${isMobile && 'space-y-4'}`}>
          <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
            <span className="text-white text-2xl font-bold">
              {student.name.split(' ').map(n => n[0]).join('')}
            </span>
          </div>
          
          <div className="flex-1">
            <h3 className="text-2xl font-bold text-gray-800 mb-2">{student.name}</h3>
            <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-2'} gap-4 text-sm`}>
              <div className="flex items-center space-x-2">
                <span className="text-gray-500">Roll Number:</span>
                <span className="font-medium">{student.rollNumber}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-gray-400" />
                <span className="font-medium">{student.email}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-gray-500">Department:</span>
                <span className="font-medium">{student.department}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-gray-500">Year & Section:</span>
                <span className="font-medium">{student.yearSection}</span>
              </div>
            </div>
          </div>

          <div className="text-center">
            <div className={`text-3xl font-bold ${
              student.attendancePercentage >= 75 ? 'text-green-600' : 'text-red-600'
            }`}>
              {student.attendancePercentage}%
            </div>
            <div className="text-sm text-gray-500">Overall Attendance</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-lg p-1">
        <div className={`flex ${isMobile ? 'overflow-x-auto' : 'flex-wrap'} gap-1`}>
          {[
            { id: 'overview', label: 'Overview', icon: TrendingUp },
            { id: 'attendance', label: 'Attendance Log', icon: Calendar },
            { id: 'subjects', label: 'Subject Wise', icon: FileText },
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className={`font-medium ${isMobile ? 'text-sm' : ''}`}>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h4 className="text-lg font-semibold text-gray-800 mb-4">Attendance Summary</h4>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Classes:</span>
                  <span className="font-medium">{studentAttendance.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Present:</span>
                  <span className="font-medium text-green-600">
                    {studentAttendance.filter(a => a.status === 'Present').length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Absent:</span>
                  <span className="font-medium text-red-600">
                    {studentAttendance.filter(a => a.status === 'Absent').length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">On Leave:</span>
                  <span className="font-medium text-yellow-600">
                    {studentAttendance.filter(a => a.status === 'Leave').length}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <h4 className="text-lg font-semibold text-gray-800 mb-4">Performance Status</h4>
              <div className="space-y-4">
                <div className={`p-4 rounded-lg ${
                  student.attendancePercentage >= 75 
                    ? 'bg-green-50 border border-green-200' 
                    : 'bg-red-50 border border-red-200'
                }`}>
                  <div className={`font-medium ${
                    student.attendancePercentage >= 75 ? 'text-green-800' : 'text-red-800'
                  }`}>
                    {student.attendancePercentage >= 75 ? 'Good Standing' : 'At Risk'}
                  </div>
                  <div className={`text-sm ${
                    student.attendancePercentage >= 75 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {student.attendancePercentage >= 75 
                      ? 'Meeting minimum attendance requirement'
                      : 'Below 75% minimum requirement'
                    }
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'attendance' && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">Recent Attendance</h4>
            {isMobile ? (
              <div className="space-y-3">
                {recentAttendance.map((record, index) => {
                  const subject = mockSubjects.find(s => s.code === record.courseCode);
                  return (
                    <MobileAttendanceCard
                      key={index}
                      subject={subject?.name || record.courseCode}
                      date={record.date}
                      status={record.status}
                      hour={record.hourNumber}
                      totalHours={8}
                      percentage={student.attendancePercentage}
                    />
                  );
                })}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Hour</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {recentAttendance.map((record, index) => {
                      const subject = mockSubjects.find(s => s.code === record.courseCode);
                      return (
                        <tr key={index}>
                          <td className="px-4 py-2 text-sm text-gray-900">{record.date}</td>
                          <td className="px-4 py-2 text-sm text-gray-900">{subject?.name || record.courseCode}</td>
                          <td className="px-4 py-2 text-sm text-gray-900">Hour {record.hourNumber}</td>
                          <td className="px-4 py-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              record.status === 'Present' ? 'bg-green-100 text-green-800' :
                              record.status === 'Leave' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {record.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'subjects' && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">Subject-wise Attendance</h4>
            <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-2'} gap-4`}>
              {attendanceBySubject.map((subject, index) => (
                <div key={index} className="p-4 border border-gray-200 rounded-lg">
                  <h5 className="font-medium text-gray-900 mb-2">{subject.subject}</h5>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Classes Attended:</span>
                      <span>{subject.present} / {subject.total}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          subject.percentage >= 75 ? 'bg-green-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${subject.percentage}%` }}
                      />
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Percentage:</span>
                      <span className={`font-medium ${
                        subject.percentage >= 75 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {subject.percentage}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentProfile;
