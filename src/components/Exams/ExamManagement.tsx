
import React, { useState } from 'react';
import { Calendar, Clock, FileText, Award, Plus, Search, Filter, BookOpen } from 'lucide-react';
import { Button } from '../ui/button';
import { mockStudents, mockSubjects } from '../../data/mockData';
import { useIsMobile } from '../../hooks/use-mobile';

const ExamManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState('schedule');
  const [searchTerm, setSearchTerm] = useState('');
  const isMobile = useIsMobile();

  // Mock exam data
  const examSchedule = [
    {
      id: 1,
      subject: 'Data Structures',
      code: 'CSE301',
      date: '2024-07-15',
      time: '09:00 AM - 12:00 PM',
      room: 'Room A-101',
      type: 'Mid-term',
      duration: '3 hours'
    },
    {
      id: 2,
      subject: 'Database Management',
      code: 'CSE302',
      date: '2024-07-17',
      time: '02:00 PM - 05:00 PM',
      room: 'Room A-102',
      type: 'Mid-term',
      duration: '3 hours'
    },
    {
      id: 3,
      subject: 'Operating Systems',
      code: 'CSE303',
      date: '2024-07-19',
      time: '09:00 AM - 12:00 PM',
      room: 'Room A-103',
      type: 'Final',
      duration: '3 hours'
    }
  ];

  const examResults = mockStudents.map(student => ({
    ...student,
    results: mockSubjects.map(subject => ({
      subjectCode: subject.code,
      subjectName: subject.name,
      marks: Math.floor(Math.random() * 100),
      grade: ['A+', 'A', 'B+', 'B', 'C+', 'C', 'D'][Math.floor(Math.random() * 7)],
      status: Math.random() > 0.1 ? 'Pass' : 'Fail'
    }))
  }));

  const filteredExams = examSchedule.filter(exam =>
    exam.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    exam.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const upcomingExams = examSchedule.filter(exam => new Date(exam.date) > new Date()).length;
  const completedExams = examSchedule.length - upcomingExams;
  const totalStudents = mockStudents.length;
  const avgMarks = 78; // Mock calculation

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold text-gray-800`}>
          Exam Management
        </h2>
        <div className="flex space-x-2">
          <Button variant="outline" size={isMobile ? 'sm' : 'default'}>
            <Calendar className="w-4 h-4 mr-2" />
            View Calendar
          </Button>
          <Button size={isMobile ? 'sm' : 'default'}>
            <Plus className="w-4 h-4 mr-2" />
            Schedule Exam
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className={`grid ${isMobile ? 'grid-cols-2' : 'grid-cols-1 md:grid-cols-4'} gap-4`}>
        <div className="bg-white rounded-xl shadow-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Upcoming Exams</p>
              <p className={`${isMobile ? 'text-lg' : 'text-2xl'} font-bold text-blue-600`}>{upcomingExams}</p>
            </div>
            <div className="p-2 bg-blue-100 rounded-lg">
              <Calendar className={`${isMobile ? 'w-4 h-4' : 'w-6 h-6'} text-blue-600`} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Completed</p>
              <p className={`${isMobile ? 'text-lg' : 'text-2xl'} font-bold text-green-600`}>{completedExams}</p>
            </div>
            <div className="p-2 bg-green-100 rounded-lg">
              <FileText className={`${isMobile ? 'w-4 h-4' : 'w-6 h-6'} text-green-600`} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Students</p>
              <p className={`${isMobile ? 'text-lg' : 'text-2xl'} font-bold text-purple-600`}>{totalStudents}</p>
            </div>
            <div className="p-2 bg-purple-100 rounded-lg">
              <BookOpen className={`${isMobile ? 'w-4 h-4' : 'w-6 h-6'} text-purple-600`} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Average Marks</p>
              <p className={`${isMobile ? 'text-lg' : 'text-2xl'} font-bold text-orange-600`}>{avgMarks}%</p>
            </div>
            <div className="p-2 bg-orange-100 rounded-lg">
              <Award className={`${isMobile ? 'w-4 h-4' : 'w-6 h-6'} text-orange-600`} />
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-xl shadow-lg p-1">
        <div className={`flex ${isMobile ? 'overflow-x-auto' : 'flex-wrap'} gap-1`}>
          {[
            { id: 'schedule', label: 'Exam Schedule', icon: Calendar },
            { id: 'results', label: 'Results', icon: Award },
            { id: 'analytics', label: 'Analytics', icon: FileText },
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
      {activeTab === 'schedule' && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Exam Schedule</h3>
            <div className="flex space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search exams..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {isMobile ? (
            <div className="space-y-4">
              {filteredExams.map(exam => (
                <div key={exam.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-medium text-gray-900">{exam.subject}</h4>
                      <p className="text-sm text-gray-500">{exam.code}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      exam.type === 'Final' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {exam.type}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Date:</span>
                      <p className="font-medium">{exam.date}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Time:</span>
                      <p className="font-medium">{exam.time}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Room:</span>
                      <p className="font-medium">{exam.room}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Duration:</span>
                      <p className="font-medium">{exam.duration}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Room</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredExams.map(exam => (
                    <tr key={exam.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{exam.subject}</div>
                          <div className="text-sm text-gray-500">{exam.code}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{exam.date}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{exam.time}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{exam.room}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          exam.type === 'Final' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {exam.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Button size="sm" variant="outline">
                          Edit
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'results' && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Exam Results</h3>
          {isMobile ? (
            <div className="space-y-4">
              {examResults.slice(0, 5).map(student => (
                <div key={student.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-medium text-gray-900">{student.name}</h4>
                      <p className="text-sm text-gray-500">{student.rollNumber}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-blue-600">
                        {Math.round(student.results.reduce((sum, r) => sum + r.marks, 0) / student.results.length)}%
                      </div>
                      <div className="text-sm text-gray-500">Average</div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {student.results.slice(0, 3).map((result, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">{result.subjectCode}</span>
                        <span className={`text-sm font-medium ${
                          result.status === 'Pass' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {result.marks}% ({result.grade})
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Average</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Grade</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {examResults.slice(0, 10).map(student => {
                    const avgMarks = Math.round(student.results.reduce((sum, r) => sum + r.marks, 0) / student.results.length);
                    const avgGrade = avgMarks >= 90 ? 'A+' : avgMarks >= 80 ? 'A' : avgMarks >= 70 ? 'B+' : avgMarks >= 60 ? 'B' : 'C';
                    const status = avgMarks >= 50 ? 'Pass' : 'Fail';
                    
                    return (
                      <tr key={student.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{student.name}</div>
                            <div className="text-sm text-gray-500">{student.rollNumber}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {avgMarks}%
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                          {avgGrade}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            status === 'Pass' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <Button size="sm" variant="outline">
                            View Details
                          </Button>
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

      {activeTab === 'analytics' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Grade Distribution</h3>
            <div className="space-y-4">
              {['A+', 'A', 'B+', 'B', 'C+', 'C', 'D', 'F'].map(grade => {
                const count = Math.floor(Math.random() * 20) + 1;
                const percentage = Math.round((count / totalStudents) * 100);
                return (
                  <div key={grade} className="flex items-center justify-between">
                    <span className="font-medium text-gray-900">Grade {grade}</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-600 w-8">{count}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Subject Performance</h3>
            <div className="space-y-4">
              {mockSubjects.map(subject => {
                const avgScore = Math.floor(Math.random() * 30) + 70;
                return (
                  <div key={subject.id} className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900">{subject.name}</div>
                      <div className="text-sm text-gray-500">{subject.code}</div>
                    </div>
                    <div className="text-right">
                      <div className={`text-lg font-bold ${
                        avgScore >= 80 ? 'text-green-600' : avgScore >= 70 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {avgScore}%
                      </div>
                      <div className="text-sm text-gray-500">Average</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExamManagement;
