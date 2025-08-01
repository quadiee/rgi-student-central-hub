
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { SupabaseAuthProvider } from './contexts/SupabaseAuthContext';
import AuthFlowManager from './components/Auth/AuthFlowManager';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import Index from './pages/Index';
import Students from './pages/Students';
import Faculty from './pages/Faculty';
import Fees from './pages/Fees';
import Attendance from './pages/Attendance';
import UserManagement from './pages/UserManagement';
import FacultyDashboard from './pages/FacultyDashboard';
import ResetPassword from './pages/ResetPassword';
import AuthCallback from './pages/AuthCallback';
import NotFound from './pages/NotFound';
import './App.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <SupabaseAuthProvider>
          <div className="min-h-screen bg-background">
            <Routes>
              {/* Auth Routes */}
              <Route path="/auth/callback" element={<AuthCallback />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              
              {/* Protected Routes */}
              <Route path="/" element={
                <ProtectedRoute>
                  <Index />
                </ProtectedRoute>
              } />
              
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Index />
                </ProtectedRoute>
              } />
              
              <Route path="/students" element={
                <ProtectedRoute allowedRoles={['admin', 'principal', 'hod', 'faculty', 'chairman']}>
                  <Students />
                </ProtectedRoute>
              } />
              
              <Route path="/faculty" element={
                <ProtectedRoute allowedRoles={['admin', 'principal', 'hod', 'chairman']}>
                  <Faculty />
                </ProtectedRoute>
              } />
              
              <Route path="/fees" element={
                <ProtectedRoute>
                  <Fees />
                </ProtectedRoute>
              } />
              
              <Route path="/attendance" element={
                <ProtectedRoute>
                  <Attendance />
                </ProtectedRoute>
              } />
              
              <Route path="/user-management" element={
                <ProtectedRoute allowedRoles={['admin', 'principal']}>
                  <UserManagement />
                </ProtectedRoute>
              } />
              
              <Route path="/faculty-dashboard" element={
                <ProtectedRoute allowedRoles={['faculty']}>
                  <FacultyDashboard />
                </ProtectedRoute>
              } />
              
              {/* Auth Flow */}
              <Route path="/auth" element={<AuthFlowManager />} />
              
              {/* Catch all */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            
            <Toaster 
              position="top-center"
              toastOptions={{
                duration: 3000,
                style: {
                  background: 'hsl(var(--background))',
                  color: 'hsl(var(--foreground))',
                  border: '1px solid hsl(var(--border))',
                },
              }}
            />
          </div>
        </SupabaseAuthProvider>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
