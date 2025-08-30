
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import AuthPage from './components/Auth/AuthPage';
import InvitationSignup from './components/Auth/InvitationSignup';
import RoleDashboard from './components/Mobile/RoleDashboard';
import ModernLayout from './components/Layout/ModernLayout';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import UserProfile from './components/Auth/UserProfile';
import ChairmanStudentManagement from './components/Mobile/ChairmanStudentManagement';
import EnhancedFeeManagement from './components/Fees/EnhancedFeeManagement';
import SimplifiedFeeManagementRoute from './components/Fees/SimplifiedFeeManagementRoute';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/invitation-signup" element={<InvitationSignup />} />
        
        <Route path="/" element={
          <ProtectedRoute>
            <ModernLayout>
              <RoleDashboard />
            </ModernLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/profile" element={
          <ProtectedRoute>
            <ModernLayout>
              <UserProfile />
            </ModernLayout>
          </ProtectedRoute>
        } />

        {/* Add the simplified fee management route */}
        <Route path="/simplified-fees" element={
          <ProtectedRoute>
            <ModernLayout>
              <SimplifiedFeeManagementRoute />
            </ModernLayout>
          </ProtectedRoute>
        } />

        <Route path="/chairman-students" element={
          <ProtectedRoute>
            <ModernLayout>
              <ChairmanStudentManagement />
            </ModernLayout>
          </ProtectedRoute>
        } />

        <Route path="/enhanced-fees" element={
          <ProtectedRoute>
            <ModernLayout>
              <EnhancedFeeManagement />
            </ModernLayout>
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
}

export default App;
