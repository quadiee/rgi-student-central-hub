
import React, { useState } from 'react';
import { Calendar, FileText, BarChart3, Plus, Download, Users } from 'lucide-react';
import { Button } from '../ui/button';
import { mockStudents, mockExamRecords, mockSubjects } from '../../data/mockData';

const ExamManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A+': case 'A': return 'bg-green-100 text-green-800';
      case 'B+': case 'B': return 'bg-blue-100 text-blue-800';
      case 'B-': case 'C+': return 'bg-yellow-100 text-yellow-800';
      case 'C': case 'C-': return 'bg-orange-100 text-orange-800';
      default: return 'bg-red-100 text-red-800';
    }
  };

  const totalExams = mockExamRecords.length;
  const avgPercentage = Math.round(mockExamRecords.reduce((sum, exam) => sum + exam.percentage, 0) / totalExams);
  const passedStudents = mockExamRecords.filter(exam => exam.percentage >= 40).length;
  const failedStudents = totalExams - passedStudents;

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Exams</p>
              <p className="text-3xl font-bold text-blue-600">{totalExams}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Average Score</p>
              <p className="text-3xl font-bold text-green-600">{avgPercentage}%</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <BarChart3 className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Passed</p>
              <p className="text-3xl font-bold text-green-600">{passedStudents}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <Users className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Failed</p>
              <p className="text-3xl font-bold text-red-600">{failedStudents}</p>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <Users className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Exam Results */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Exam Results</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Exam Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Marks</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Grade</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {mockExamRecords.slice(0, 10).map((exam) => {
                const student = mockStudents.find(s => s.id === exam.studentId);
                return (
                  <tr key={exam.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{student?.name}</div>
                      <div className="text-sm text-gray-500">{student?.rollNumber}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {exam.subject}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {exam.examType}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {exam.marksObtained}/{exam.totalMarks}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getGradeColor(exam.grade)}`}>
                        {exam.grade}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(exam.examDate).toLocaleDateString()}
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

  const renderSchedule = () => (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-800">Exam Schedule</h3>
        <Button className="flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>Schedule Exam</span>
        </Button>
      </div>
      <div className="text-center py-8 text-gray-500">
        <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
        <p>No exams scheduled. Click "Schedule Exam" to add new exams.</p>
      </div>
    </div>
  );

  const renderResults = () => (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-800">Exam Results</h3>
        <div className="flex space-x-2">
          <Button variant="outline" className="flex items-center space-x-2">
            <Download className="w-4 h-4" />
            <span>Export Results</span>
          </Button>
          <Button className="flex items-center space-x-2">
            <Plus className="w-4 h-4" />
            <span>Add Result</span>
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Marks</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Percentage</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Grade</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {mockExamRecords.map((exam) => {
              const student = mockStudents.find(s => s.id === exam.studentId);
              return (
                <tr key={exam.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{student?.name}</div>
                    <div className="text-sm text-gray-500">{student?.rollNumber}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {exam.subject}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {exam.examType}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {exam.marksObtained}/{exam.totalMarks}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {exam.percentage}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getGradeColor(exam.grade)}`}>
                      {exam.grade}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">Edit</Button>
                      <Button variant="outline" size="sm">View</Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-800">Examination Management</h2>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" className="flex items-center space-x-2">
            <Download className="w-4 h-4" />
            <span>Export Report</span>
          </Button>
          <Button className="flex items-center space-x-2">
            <Plus className="w-4 h-4" />
            <span>New Exam</span>
          </Button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-xl shadow-lg p-1">
        <div className="flex flex-wrap gap-1">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'schedule', label: 'Schedule', icon: Calendar },
            { id: 'results', label: 'Results', icon: FileText },
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
      {activeTab === 'overview' && renderOverview()}
      {activeTab === 'schedule' && renderSchedule()}
      {activeTab === 'results' && renderResults()}
    </div>
  );
};

export default ExamManagement;
