
import React, { useState } from 'react';
import { AuthProvider } from '../contexts/AuthContext';
import MobileSidebar from '../components/Layout/MobileSidebar';
import Header from '../components/Layout/Header';
import Dashboard from '../components/Dashboard/Dashboard';
import StudentList from '../components/Students/StudentList';
import StudentProfile from '../components/Students/StudentProfile';
import AttendanceOverview from '../components/Attendance/AttendanceOverview';
import FeeManagement from '../components/Fees/FeeManagement';
import ExamManagement from '../components/Exams/ExamManagement';
import LeaveManagement from '../components/Leave/LeaveManagement';
import AdminPanel from '../components/Admin/AdminPanel';
import ReportGenerator from '../components/Reports/ReportGenerator';
import MobileQuickActions from '../components/Mobile/MobileQuickActions';
import { Student } from '../types';
import { useIsMobile } from '../hooks/use-mobile';

const Index = () => {
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
        return <FeeManagement />;
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

  return (
    <AuthProvider>
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
                {renderContent()}
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
                {renderContent()}
              </main>
            </div>
          </div>
        )}
      </div>
    </AuthProvider>
  );
};

export default Index;
