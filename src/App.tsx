import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Index from './pages/Index';
import Auth from './pages/Auth';
import AuthCallback from './pages/AuthCallback';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './components/Dashboard/Dashboard';
import MobileDashboard from './pages/MobileDashboard';
import Students from './pages/Students';
import Faculty from './pages/Faculty';
import Attendance from './pages/Attendance';
import UserManagement from './pages/UserManagement';
import NotFound from './pages/NotFound';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import InvitationSignup from './components/Auth/InvitationSignup';
import FacultyDashboard from './pages/FacultyDashboard';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/invite/:token" element={<InvitationSignup />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/faculty-dashboard" 
          element={
            <ProtectedRoute>
              <FacultyDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/mobile-dashboard" 
          element={
            <ProtectedRoute>
              <MobileDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/students" 
          element={
            <ProtectedRoute>
              <Students />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/faculty" 
          element={
            <ProtectedRoute>
              <Faculty />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/attendance" 
          element={
            <ProtectedRoute>
              <Attendance />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/user-management" 
          element={
            <ProtectedRoute>
              <UserManagement />
            </ProtectedRoute>
          } 
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
