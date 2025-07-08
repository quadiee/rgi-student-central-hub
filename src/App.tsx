
import React, { useEffect, useState } from 'react';
import { Toaster } from "./components/ui/toaster";
import { SupabaseAuthProvider } from './contexts/SupabaseAuthContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import SupabaseAuthPage from './components/Auth/SupabaseAuthPage';
import Sidebar from './components/Layout/Sidebar';
import Header from './components/Layout/Header';
import MobileLayout from './components/Layout/MobileLayout';
import Dashboard from './components/Dashboard/Dashboard';
import FeeManagementHub from './components/Fees/FeeManagementHub';
import AdminPanel from './components/Admin/AdminPanel';
import StudentManagement from './components/Students/StudentManagement';
import ReportGenerator from './components/Reports/ReportGenerator';
import AttendanceManagement from './components/Attendance/AttendanceManagement';
import ExamManagement from './components/Exams/ExamManagement';
import { useAuth } from './contexts/SupabaseAuthContext';
import InvitationSignup from './components/Auth/InvitationSignup';
import { ErrorBoundary } from './components/Auth/ErrorBoundary';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Student } from './types/user-student-fees';
import ResetPassword from './pages/ResetPassword';
import { useIsMobile } from './hooks/use-mobile';

const queryClient = new QueryClient();

function MainAppContent() {
  const { user, session, loading } = useAuth();
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const isMobile = useIsMobile();

  // Get active tab from current route
  const location = window.location.pathname;
  const activeTab = location.slice(1) || 'dashboard';

  const handleViewStudent = (student: Student) => {
    setSelectedStudent(student);
  };

  if (loading) {
    return <SupabaseAuthPage />;
  }

  if (!session) {
    return <SupabaseAuthPage />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'fees':
        return <FeeManagementHub />;
      case 'admin':
        return <AdminPanel />;
      case 'students':
        return !selectedStudent ? (
          <StudentManagement onViewStudent={handleViewStudent} />
        ) : (
          <div className="space-y-4">
            <button
              onClick={() => setSelectedStudent(null)}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              ← Back to student list
            </button>
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-xl font-bold mb-4">Student Details</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-sm font-medium text-gray-500">Name</span>
                  <p className="text-gray-900">{selectedStudent.name}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-sm font-medium text-gray-500">Email</span>
                  <p className="text-gray-900">{selectedStudent.email}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-sm font-medium text-gray-500">Department</span>
                  <p className="text-gray-900">{selectedStudent.department}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-sm font-medium text-gray-500">Roll Number</span>
                  <p className="text-gray-900">{selectedStudent.rollNumber}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-sm font-medium text-gray-500">Year</span>
                  <p className="text-gray-900">{selectedStudent.year}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-sm font-medium text-gray-500">Section</span>
                  <p className="text-gray-900">{selectedStudent.section}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-sm font-medium text-gray-500">Fee Status</span>
                  <p className="text-gray-900">{selectedStudent.feeStatus}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-sm font-medium text-gray-500">Total Fees</span>
                  <p className="text-gray-900">₹{selectedStudent.totalFees?.toLocaleString() || 0}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-sm font-medium text-gray-500">Paid Amount</span>
                  <p className="text-gray-900">₹{selectedStudent.paidAmount?.toLocaleString() || 0}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-sm font-medium text-gray-500">Due Amount</span>
                  <p className="text-gray-900">₹{selectedStudent.dueAmount?.toLocaleString() || 0}</p>
                </div>
              </div>
            </div>
          </div>
        );
      case 'reports':
        return <ReportGenerator />;
      case 'attendance':
        return <AttendanceManagement />;
      case 'exams':
        return <ExamManagement />;
      default:
        return <Dashboard />;
    }
  };

  // Mobile-first layout
  if (isMobile) {
    return (
      <MobileLayout 
        activeTab={activeTab} 
        onTabChange={(tab) => window.location.href = `/${tab}`}
      >
        {renderContent()}
      </MobileLayout>
    );
  }

  // Desktop layout (kept for larger screens)
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar activeTab={activeTab} onTabChange={(tab) => window.location.href = `/${tab}`} />
      <div className="flex-1 ml-64">
        <Header />
        <main className="p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <SupabaseAuthProvider>
          <Router>
            <Routes>
              <Route path="/invite/:token" element={<InvitationSignup />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/dashboard" element={<MainAppContent />} />
              <Route path="/fees" element={<MainAppContent />} />
              <Route path="/admin" element={<MainAppContent />} />
              <Route path="/students" element={<MainAppContent />} />
              <Route path="/attendance" element={<MainAppContent />} />
              <Route path="/exams" element={<MainAppContent />} />
              <Route path="/reports" element={<MainAppContent />} />
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </Router>
          <Toaster />
        </SupabaseAuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
