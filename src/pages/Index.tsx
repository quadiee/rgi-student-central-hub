
import React, { useState } from 'react';
import { AuthProvider } from '../contexts/AuthContext';
import Sidebar from '../components/Layout/Sidebar';
import Header from '../components/Layout/Header';
import Dashboard from '../components/Dashboard/Dashboard';
import StudentList from '../components/Students/StudentList';
import StudentProfile from '../components/Students/StudentProfile';
import AttendanceOverview from '../components/Attendance/AttendanceOverview';
import { Student } from '../types';

const Index = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  const handleViewStudent = (student: Student) => {
    setSelectedStudent(student);
    setActiveTab('student-profile');
  };

  const handleBackToStudents = () => {
    setSelectedStudent(null);
    setActiveTab('students');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'students':
        return <StudentList onViewStudent={handleViewStudent} />;
      case 'student-profile':
        return selectedStudent ? (
          <StudentProfile student={selectedStudent} onBack={handleBackToStudents} />
        ) : null;
      case 'attendance':
        return <AttendanceOverview />;
      case 'fees':
        return (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Fee Management</h2>
            <p className="text-gray-600">Fee management module coming soon...</p>
          </div>
        );
      case 'exams':
        return (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Exam Management</h2>
            <p className="text-gray-600">Exam management module coming soon...</p>
          </div>
        );
      case 'reports':
        return (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Reports</h2>
            <p className="text-gray-600">Reports module coming soon...</p>
          </div>
        );
      case 'settings':
        return (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Settings</h2>
            <p className="text-gray-600">Settings module coming soon...</p>
          </div>
        );
      default:
        return <Dashboard />;
    }
  };

  return (
    <AuthProvider>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
        <div className="ml-64">
          <Header />
          <main className="p-6 pt-8">
            {renderContent()}
          </main>
        </div>
      </div>
    </AuthProvider>
  );
};

export default Index;
