
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { SupabaseAuthProvider } from "./contexts/SupabaseAuthContext";
import ProtectedRoute from "./components/Auth/ProtectedRoute";
import SupabaseAuthPage from "./components/Auth/SupabaseAuthPage";
import ModernLayout from "./components/Layout/ModernLayout";
import Dashboard from "./components/Dashboard/Dashboard";
import Students from "./pages/Students";
import Faculty from "./pages/Faculty";
import Attendance from "./pages/Attendance";
import UserManagement from "./pages/UserManagement";
import FeeManagementHub from "./components/Fees/FeeManagementHub";
import AdminReportGenerator from "./components/Fees/AdminReportGenerator";
import AdminPanel from "./components/Admin/AdminPanel";
import ExamManagement from "./components/Exams/ExamManagement";
import AuthCallback from "./pages/AuthCallback";
import ResetPassword from "./pages/ResetPassword";
import InvitationSignup from "./components/Auth/InvitationSignup";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <SupabaseAuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Auth Routes */}
            <Route path="/auth" element={<SupabaseAuthPage />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/invite/:token" element={<InvitationSignup />} />
            <Route path="/signup" element={<InvitationSignup />} />
            
            {/* Protected Routes with Modern Layout */}
            <Route path="/" element={
              <ProtectedRoute>
                <Navigate to="/dashboard" replace />
              </ProtectedRoute>
            } />
            
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <ModernLayout>
                  <Dashboard />
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
            
            <Route path="/attendance" element={
              <ProtectedRoute allowedRoles={['admin', 'principal', 'chairman', 'hod']}>
                <ModernLayout>
                  <Attendance />
                </ModernLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/exams" element={
              <ProtectedRoute allowedRoles={['admin', 'principal', 'chairman', 'hod']}>
                <ModernLayout>
                  <ExamManagement />
                </ModernLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/fees" element={
              <ProtectedRoute>
                <ModernLayout>
                  <FeeManagementHub />
                </ModernLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/reports" element={
              <ProtectedRoute allowedRoles={['admin', 'principal', 'chairman', 'hod']}>
                <ModernLayout>
                  <AdminReportGenerator />
                </ModernLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/admin" element={
              <ProtectedRoute allowedRoles={['admin', 'principal', 'chairman']}>
                <ModernLayout>
                  <AdminPanel />
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
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </SupabaseAuthProvider>
  </QueryClientProvider>
);

export default App;
