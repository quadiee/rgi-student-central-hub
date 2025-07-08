
import React from 'react';
import { Toaster } from "./components/ui/toaster";
import { SupabaseAuthProvider } from './contexts/SupabaseAuthContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from './components/Auth/ErrorBoundary';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import SupabaseAuthPage from './components/Auth/SupabaseAuthPage';
import InvitationSignup from './components/Auth/InvitationSignup';
import ResetPassword from './pages/ResetPassword';
import Index from './pages/Index';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <SupabaseAuthProvider>
          <Router>
            <Routes>
              <Route path="/auth" element={<SupabaseAuthPage />} />
              <Route path="/invite/:token" element={<InvitationSignup />} />
              <Route path="/reset-password" element={<ResetPassword />} />
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
