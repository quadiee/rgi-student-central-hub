
import React from 'react';
import { ArrowLeft, Mail, Phone, BookOpen, Calendar } from 'lucide-react';
import { Student, AttendanceRecord, FeeRecord, ExamRecord } from '../../types';
import { mockAttendance, mockFees, mockExams } from '../../data/mockData';

interface StudentProfileProps {
  student: Student;
  onBack: () => void;
}

const StudentProfile: React.FC<StudentProfileProps> = ({ student, onBack }) => {
  const studentAttendance = mockAttendance.filter(a => a.studentId === student.id);
  const studentFees = mockFees.filter(f => f.studentId === student.id);
  const studentExams = mockExams.filter(e => e.studentId === student.id);

  const attendancePercentage = studentAttendance.length > 0 
    ? Math.round((studentAttendance.filter(a => a.status === 'Present' || a.status === 'Leave').length / studentAttendance.length) * 100)
    : 0;

  const totalFeePaid = studentFees.filter(f => f.status === 'Paid').reduce((sum, f) => sum + f.amount, 0);
  const totalFeePending = studentFees.filter(f => f.status !== 'Paid').reduce((sum, f) => sum + f.amount, 0);

  const averageMarks = studentExams.length > 0
    ? Math.round(studentExams.reduce((sum, e) => sum + (e.marksObtained / e.totalMarks * 100), 0) / studentExams.length)
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4 mb-6">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-blue-600 hover:text-blue-800"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Students</span>
        </button>
      </div>

      {/* Student Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
        <div className="flex items-center space-x-6">
          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
            <span className="text-2xl font-bold">
              {student.name.split(' ').map(n => n[0]).join('')}
            </span>
          </div>
          <div>
            <h1 className="text-3xl font-bold">{student.name}</h1>
            <p className="text-blue-100 text-lg">{student.rollNumber}</p>
            <p className="text-blue-100">{student.course}</p>
            <p className="text-blue-100">Year {student.year}, Semester {student.semester}</p>
          </div>
        </div>
      </div>

      {/* Contact Info */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Contact Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center space-x-3">
            <Mail className="w-5 h-5 text-blue-500" />
            <div>
              <p className="text-gray-600 text-sm">Email</p>
              <p className="text-gray-800 font-medium">{student.email}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Phone className="w-5 h-5 text-green-500" />
            <div>
              <p className="text-gray-600 text-sm">Phone</p>
              <p className="text-gray-800 font-medium">{student.phone}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Attendance</p>
              <p className="text-3xl font-bold text-green-600">{attendancePercentage}%</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <Calendar className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Average Marks</p>
              <p className="text-3xl font-bold text-blue-600">{averageMarks}%</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <BookOpen className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Pending Fees</p>
              <p className="text-3xl font-bold text-red-600">₹{totalFeePending.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <Mail className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Attendance</h3>
          <div className="space-y-3">
            {studentAttendance.slice(0, 5).map((record) => (
              <div key={record.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-800">{record.courseCode}</p>
                  <p className="text-sm text-gray-600">{record.date} - Hour {record.hourNumber}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  record.status === 'Present' ? 'bg-green-100 text-green-800' :
                  record.status === 'Leave' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {record.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Exams</h3>
          <div className="space-y-3">
            {studentExams.slice(0, 5).map((exam) => (
              <div key={exam.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-800">{exam.subject}</p>
                  <p className="text-sm text-gray-600">{exam.examType} - {exam.examDate}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-blue-600">{exam.marksObtained}/{exam.totalMarks}</p>
                  <p className="text-sm text-gray-600">Grade: {exam.grade}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;
