import React, { useEffect, useState } from 'react';
import { Toaster } from "./components/ui/toaster";
import { SupabaseAuthProvider } from './contexts/SupabaseAuthContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import SupabaseAuthPage from './components/Auth/SupabaseAuthPage';
import Sidebar from './components/Layout/Sidebar';
import Header from './components/Layout/Header';
import Dashboard from './components/Dashboard/Dashboard';
import FeeManagement from './components/Fees/FeeManagement';
import AdminPanel from './components/Admin/AdminPanel';
import StudentList from './components/StudentList';
import ReportGenerator from './components/Reports/ReportGenerator';
import AttendanceManagement from './components/Attendance/AttendanceManagement';
import ExamManagement from './components/Exams/ExamManagement';
import { useAuth } from './contexts/SupabaseAuthContext';
import InvitationSignup from './components/Auth/InvitationSignup';
import { ErrorBoundary } from './components/Auth/ErrorBoundary';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Student } from './types/user-student-fees';
import { supabase } from './integrations/supabase/client';

// --- ADD THIS IMPORT ---
import ResetPassword from './pages/ResetPassword';
// -----------------------

const queryClient = new QueryClient();

function MainAppContent() {
  const { user, session, loading } = useAuth();
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(true);

  // Get active tab from current route
  const location = window.location.pathname;
  const activeTab = location.slice(1) || 'dashboard';

  useEffect(() => {
    const fetchStudents = async () => {
      setLoadingStudents(true);
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select(`
            id,
            name,
            roll_number,
            course,
            year,
            semester,
            email,
            phone,
            profile_photo_url,
            admission_date,
            guardian_name,
            guardian_phone,
            address,
            blood_group,
            emergency_contact,
            department_id,
            year_section,
            section,
            total_fees,
            paid_amount,
            due_amount,
            fee_status
          `)
          .eq('role', 'student');

        if (error) {
          console.error('Error fetching students:', error);
          setStudents([]);
        } else {
          // Map the data to match Student interface
          const mappedStudents: Student[] = (data || []).map((profile: any) => ({
            id: profile.id,
            name: profile.name || 'Unknown',
            rollNumber: profile.roll_number || '',
            course: profile.course || 'Not specified',
            year: profile.year || 1,
            semester: profile.semester || 1,
            email: profile.email || '',
            phone: profile.phone || '',
            profileImage: profile.profile_photo_url,
            admissionDate: profile.admission_date || new Date().toISOString(),
            guardianName: profile.guardian_name || '',
            guardianPhone: profile.guardian_phone || '',
            address: profile.address || '',
            bloodGroup: profile.blood_group,
            emergencyContact: profile.emergency_contact || '',
            department: profile.department_id || 'Unknown',
            yearSection: profile.year_section || '',
            section: profile.section,
            totalFees: profile.total_fees,
            paidAmount: profile.paid_amount,
            dueAmount: profile.due_amount,
            feeStatus: profile.fee_status
          }));
          setStudents(mappedStudents);
        }
      } catch (err) {
        console.error('Error in fetchStudents:', err);
        setStudents([]);
      }
      setLoadingStudents(false);
    };
    
    if (session) {
      fetchStudents();
    }
  }, [session]);

  const handleViewStudent = (student: Student) => {
    setSelectedStudent(student);
  };

  if (loading || loadingStudents) {
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
        return <FeeManagement />;
      case 'admin':
        return <AdminPanel />;
      case 'students':
        return !selectedStudent ? (
          <StudentList students={students} onViewStudent={handleViewStudent} />
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
              {/* --- ADD THIS ROUTE FOR PASSWORD RESET --- */}
              <Route path="/reset-password" element={<ResetPassword />} />
              {/* ----------------------------------------- */}
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