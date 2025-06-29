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
import { useAuth } from './contexts/SupabaseAuthContext';
import InvitationSignup from './components/Auth/InvitationSignup';
import { ErrorBoundary } from './components/Auth/ErrorBoundary';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Student } from './types/user-student-fees';
import { supabase } from './integrations/supabase/client';

const queryClient = new QueryClient();

function MainAppContent() {
  const { user, session, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(true);

  useEffect(() => {
    const fetchStudents = async () => {
      setLoadingStudents(true);
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select(`
            id,
            name,
            rollNumber,
            course,
            year,
            semester,
            email,
            phone,
            profileImage,
            admissionDate,
            guardianName,
            guardianPhone,
            address,
            bloodGroup,
            emergencyContact,
            department,
            yearSection,
            section,
            totalFees,
            paidAmount,
            dueAmount,
            feeStatus
          `)
          .eq('role', 'student');

        if (error) {
          setStudents([]);
        } else {
          setStudents((data ?? []) as Student[]);
        }
      } catch (err) {
        setStudents([]);
      }
      setLoadingStudents(false);
    };
    fetchStudents();
  }, []);

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
                {/* Add more fields as needed */}
              </div>
            </div>
          </div>
        );
      case 'reports':
        return <ReportGenerator />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
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
              <Route path="/*" element={<MainAppContent />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </Router>
          <Toaster />
        </SupabaseAuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;