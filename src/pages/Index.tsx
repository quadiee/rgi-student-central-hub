import React, { useState } from 'react';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import MobileSidebar from '../components/Layout/MobileSidebar';
import Header from '../components/Layout/Header';
import Dashboard from '../components/Dashboard/Dashboard';
import StudentList from '../components/Students/StudentList';
import StudentProfile from '../components/Students/StudentProfile';
import AttendanceOverview from '../components/Attendance/AttendanceOverview';
import EnhancedFeeManagement from '../components/Fees/EnhancedFeeManagement';
import ExamManagement from '../components/Exams/ExamManagement';
import LeaveManagement from '../components/Leave/LeaveManagement';
import AdminPanel from '../components/Admin/AdminPanel';
import ReportGenerator from '../components/Reports/ReportGenerator';
import MobileQuickActions from '../components/Mobile/MobileQuickActions';
import AuthPage from '../components/Auth/AuthPage';
import ProtectedRoute from '../components/Auth/ProtectedRoute';
import { Student } from '../types';
import { useIsMobile } from '../hooks/use-mobile';

const AppContent = () => {
  const { user, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isMobile = useIsMobile();

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
        return <EnhancedFeeManagement />;
      case 'exams':
        return <ExamManagement />;
      case 'leaves':
        return <LeaveManagement />;
      case 'reports':
        return <ReportGenerator />;
      case 'settings':
        return <AdminPanel />;
      default:
        return <Dashboard />;
    }
  };

  // Show loading screen while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <p className="text-gray-600">Loading RGCE Portal...</p>
        </div>
      </div>
    );
  }

  // Show authentication page if user is not logged in
  if (!user) {
    return <AuthPage />;
  }

  // Main application interface
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 w-full">
      {isMobile ? (
        <>
          <MobileSidebar 
            activeTab={activeTab} 
            onTabChange={setActiveTab}
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
          />
          <div className="flex flex-col min-h-screen">
            <Header onMenuClick={() => setSidebarOpen(true)} />
            <main className="flex-1 p-4 pb-20">
              <ProtectedRoute>
                {renderContent()}
              </ProtectedRoute>
            </main>
            <MobileQuickActions activeTab={activeTab} onTabChange={setActiveTab} />
          </div>
        </>
      ) : (
        <div className="flex w-full">
          <MobileSidebar 
            activeTab={activeTab} 
            onTabChange={setActiveTab}
            isOpen={true}
            onClose={() => {}}
          />
          <div className="flex-1 ml-64">
            <Header />
            <main className="p-6 pt-8">
              <ProtectedRoute>
                {renderContent()}
              </ProtectedRoute>
            </main>
          </div>
        </div>
      )}
    </div>
  );
};

const Index = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default Index;
