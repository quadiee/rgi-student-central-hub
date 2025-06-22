import React, { useState } from 'react';
import { AuthProvider } from '../contexts/AuthContext';
import Sidebar from '../components/Layout/Sidebar';
import Header from '../components/Layout/Header';
import Dashboard from '../components/Dashboard/Dashboard';
import StudentList from '../components/Students/StudentList';
import StudentProfile from '../components/Students/StudentProfile';
import AttendanceOverview from '../components/Attendance/AttendanceOverview';
import FeeManagement from '../components/Fees/FeeManagement';
import ExamManagement from '../components/Exams/ExamManagement';
import AdminPanel from '../components/Admin/AdminPanel';
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
        return <FeeManagement />;
      case 'exams':
        return <ExamManagement />;
      case 'reports':
        return (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Reports</h2>
            <p className="text-gray-600">Reports module coming soon...</p>
          </div>
        );
      case 'settings':
        return <AdminPanel />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <AuthProvider>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex w-full">
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
        <div className="flex-1 ml-64">
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
