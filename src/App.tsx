
import React from 'react';
import { Toaster } from "./components/ui/toaster";
import { SupabaseAuthProvider } from './contexts/SupabaseAuthContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ErrorBoundary } from './components/Auth/ErrorBoundary';
import Index from './pages/Index';
import InvitationSignup from './components/Auth/InvitationSignup';
import ResetPassword from './pages/ResetPassword';
import AuthCallback from './pages/AuthCallback';

const queryClient = new QueryClient();

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <SupabaseAuthProvider>
          <Router>
            <Routes>
              <Route path="/invite/:token" element={<InvitationSignup />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/auth/callback" element={<AuthCallback />} />
              <Route path="/dashboard" element={<Index />} />
              <Route path="/fees" element={<Index />} />
              <Route path="/admin" element={<Index />} />
              <Route path="/students" element={<Index />} />
              <Route path="/attendance" element={<Index />} />
              <Route path="/exams" element={<Index />} />
              <Route path="/reports" element={<Index />} />
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
