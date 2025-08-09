
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from './components/ui/toaster';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import SupabaseAuthPage from './components/Auth/SupabaseAuthPage';
import ModernLayout from './components/Layout/ModernLayout';
import Dashboard from './components/Dashboard/Dashboard';
import AttendanceHub from './pages/AttendanceHub';
import EnhancedFeeManagement from './components/Fees/EnhancedFeeManagement';
import Students from './pages/Students';
import Faculty from './pages/Faculty';
import FacultyDashboard from './pages/FacultyDashboard';
import UserManagement from './pages/UserManagement';
import './App.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/auth" element={<SupabaseAuthPage />} />
          
          {/* Protected routes with layout */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <ModernLayout>
                <Dashboard />
              </ModernLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/attendance" element={
            <ProtectedRoute>
              <ModernLayout>
                <AttendanceHub />
              </ModernLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/fees" element={
            <ProtectedRoute>
              <ModernLayout>
                <EnhancedFeeManagement />
              </ModernLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/students" element={
            <ProtectedRoute allowedRoles={['admin', 'principal', 'chairman', 'hod']}>
              <ModernLayout>
                <Students />
              </ModernLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/faculty" element={
            <ProtectedRoute allowedRoles={['admin', 'principal', 'chairman', 'hod']}>
              <ModernLayout>
                <Faculty />
              </ModernLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/faculty-dashboard" element={
            <ProtectedRoute allowedRoles={['faculty']}>
              <ModernLayout>
                <FacultyDashboard />
              </ModernLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/user-management" element={
            <ProtectedRoute allowedRoles={['admin', 'principal', 'chairman']}>
              <ModernLayout>
                <UserManagement />
              </ModernLayout>
            </ProtectedRoute>
          } />
          
          {/* Redirect root to dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          
          {/* Catch all - redirect to dashboard */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
        <Toaster />
      </Router>
    </QueryClientProvider>
  );
}

export default App;
