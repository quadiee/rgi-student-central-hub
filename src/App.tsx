
import React, { useEffect, useState } from 'react';
import { Toaster } from "./components/ui/toaster";
import { SupabaseAuthProvider } from './contexts/SupabaseAuthContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import SupabaseAuthPage from './components/Auth/SupabaseAuthPage';
import Sidebar from './components/Layout/Sidebar';
import Header from './components/Layout/Header';
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

const queryClient = new QueryClient();

function MainAppContent() {
  const { user, session, loading } = useAuth();
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

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
          <div className="p-6">
            <button
              onClick={() => setSelectedStudent(null)}
              className="mb-4 text-blue-600 hover:text-blue-800"
            >
              ← Back to student list
            </button>
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold mb-4">Student Details</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <strong>Name:</strong> {selectedStudent.name}
                </div>
                <div>
                  <strong>Email:</strong> {selectedStudent.email}
                </div>
                <div>
                  <strong>Department:</strong> {selectedStudent.department}
                </div>
                <div>
                  <strong>Roll Number:</strong> {selectedStudent.rollNumber}
                </div>
                <div>
                  <strong>Year:</strong> {selectedStudent.year}
                </div>
                <div>
                  <strong>Section:</strong> {selectedStudent.section}
                </div>
                <div>
                  <strong>Fee Status:</strong> {selectedStudent.feeStatus}
                </div>
                <div>
                  <strong>Total Fees:</strong> ₹{selectedStudent.totalFees?.toLocaleString() || 0}
                </div>
                <div>
                  <strong>Paid Amount:</strong> ₹{selectedStudent.paidAmount?.toLocaleString() || 0}
                </div>
                <div>
                  <strong>Due Amount:</strong> ₹{selectedStudent.dueAmount?.toLocaleString() || 0}
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
