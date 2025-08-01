
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from './components/ui/sonner';
import { useAuth } from './contexts/SupabaseAuthContext';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import AuthFlowManager from './components/Auth/AuthFlowManager';
import ModernLayout from './components/Layout/ModernLayout';
import Dashboard from './components/Dashboard/Dashboard';
import FacultyDashboard from './pages/FacultyDashboard';
import StudentManagement from './components/Students/StudentManagement';
import StreamlinedFacultyManagement from './components/Faculty/StreamlinedFacultyManagement';
import FeeManagementHub from './components/Fees/FeeManagementHub';
import UserManagementHub from './components/UserManagement/UserManagementHub';
import ReportGenerator from './components/Reports/ReportGenerator';
import AttendanceManagement from './components/Attendance/AttendanceManagement';
import ExamManagement from './components/Exams/ExamManagement';
import AdminPanel from './components/Admin/AdminPanel';
import NotFound from './pages/NotFound';
import './App.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
    },
  },
});

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <AuthFlowManager />;
  }

  return (
    <Router>
      <Routes>
        {/* Faculty has dedicated dashboard route */}
        <Route
          path="/faculty-dashboard"
          element={
            <ProtectedRoute allowedRoles={['faculty']}>
              <FacultyDashboard />
            </ProtectedRoute>
          }
        />

        {/* All other routes use ModernLayout */}
        <Route path="/*" element={
          <ModernLayout>
            <Routes>
              {/* Dashboard routes */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />

              {/* Management routes */}
              <Route
                path="/students"
                element={
                  <ProtectedRoute allowedRoles={['hod', 'principal', 'admin', 'chairman']}>
                    <StudentManagement />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/faculty"
                element={
                  <ProtectedRoute allowedRoles={['hod', 'principal', 'admin', 'chairman']}>
                    <StreamlinedFacultyManagement />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/fees"
                element={
                  <ProtectedRoute>
                    <FeeManagementHub />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/user-management"
                element={
                  <ProtectedRoute allowedRoles={['principal', 'admin', 'chairman']}>
                    <UserManagementHub />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/reports"
                element={
                  <ProtectedRoute allowedRoles={['hod', 'principal', 'admin', 'chairman']}>
                    <ReportGenerator />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/attendance"
                element={
                  <ProtectedRoute allowedRoles={['hod', 'principal', 'admin']}>
                    <AttendanceManagement />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/exams"
                element={
                  <ProtectedRoute allowedRoles={['hod', 'principal', 'admin']}>
                    <ExamManagement />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/admin"
                element={
                  <ProtectedRoute allowedRoles={['principal', 'admin']}>
                    <AdminPanel />
                  </ProtectedRoute>
                }
              />

              {/* Catch all route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </ModernLayout>
        } />
      </Routes>
      <Toaster />
    </Router>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
}

export default App;
