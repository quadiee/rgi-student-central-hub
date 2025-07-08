
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/SupabaseAuthContext';
import MobileSidebar from '../components/Layout/MobileSidebar';
import Header from '../components/Layout/Header';
import Dashboard from '../components/Dashboard/Dashboard';
import FeeManagementHub from '../components/Fees/FeeManagementHub';
import AdminPanel from '../components/Admin/AdminPanel';
import AttendanceManagement from '../components/Attendance/AttendanceManagement';
import ExamManagement from '../components/Exams/ExamManagement';
import ReportGenerator from '../components/Reports/ReportGenerator';
import StudentManagement from '../components/Students/StudentManagement';
import ProtectedRoute from '../components/Auth/ProtectedRoute';
import SupabaseAuthPage from '../components/Auth/SupabaseAuthPage';
import { useIsMobile } from '../hooks/use-mobile';
import { GraduationCap } from 'lucide-react';
import { INSTITUTION } from '../constants/institutional';
import { Student } from '../types/user-student-fees';

const Index = () => {
  const { user, loading, profileLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [desktopSidebarOpen, setDesktopSidebarOpen] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const isMobile = useIsMobile();

  console.log('Index page - Auth state:', { 
    user: !!user, 
    loading, 
    profileLoading,
    userRole: user?.role,
    currentPath: location.pathname 
  });

  // Get active tab from current route
  const activeTab = location.pathname.slice(1) || 'dashboard';

  const handleTabChange = (tab: string) => {
    navigate(`/${tab}`);
    setSidebarOpen(false); // Close mobile sidebar after navigation
  };

  const toggleDesktopSidebar = () => {
    setDesktopSidebarOpen(!desktopSidebarOpen);
  };

  const handleViewStudent = (student: Student) => {
    setSelectedStudent(student);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'fees':
        return <FeeManagementHub />;
      case 'admin':
        return (
          <ProtectedRoute allowedRoles={['admin', 'principal']}>
            <AdminPanel />
          </ProtectedRoute>
        );
      case 'students':
        return (
          <ProtectedRoute allowedRoles={['admin', 'principal', 'hod']}>
            <div className="px-4">
              {!selectedStudent ? (
                <StudentManagement onViewStudent={handleViewStudent} />
              ) : (
                <div>
                  <button
                    onClick={() => setSelectedStudent(null)}
                    className="mb-4 text-blue-600"
                  >
                    ← Back to list
                  </button>
                  <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-2xl font-bold mb-4">Student Details</h2>
                    <div className="grid grid-cols-2 gap-4">
                      <div><strong>Name:</strong> {selectedStudent.name}</div>
                      <div><strong>Email:</strong> {selectedStudent.email}</div>
                      <div><strong>Department:</strong> {selectedStudent.department}</div>
                      <div><strong>Roll Number:</strong> {selectedStudent.rollNumber}</div>
                      <div><strong>Year & Section:</strong> {selectedStudent.yearSection}</div>
                      <div><strong>Course:</strong> {selectedStudent.course}</div>
                      <div><strong>Total Fees:</strong> ₹{selectedStudent.totalFees?.toLocaleString() || 0}</div>
                      <div><strong>Paid Amount:</strong> ₹{selectedStudent.paidAmount?.toLocaleString() || 0}</div>
                      <div><strong>Due Amount:</strong> ₹{selectedStudent.dueAmount?.toLocaleString() || 0}</div>
                      <div><strong>Fee Status:</strong> {selectedStudent.feeStatus}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ProtectedRoute>
        );
      case 'attendance':
        return (
          <ProtectedRoute allowedRoles={['admin', 'principal', 'hod']}>
            <AttendanceManagement />
          </ProtectedRoute>
        );
      case 'exams':
        return (
          <ProtectedRoute allowedRoles={['admin', 'principal', 'hod']}>
            <ExamManagement />
          </ProtectedRoute>
        );
      case 'reports':
        return (
          <ProtectedRoute allowedRoles={['admin', 'principal', 'hod']}>
            <ReportGenerator />
          </ProtectedRoute>
        );
      default:
        return <Dashboard />;
    }
  };

  // Show loading only during initial auth check
  if (loading) {
    console.log('Showing loading state');
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">{INSTITUTION.name}</h3>
          <p className="text-gray-600">Loading Student Portal...</p>
          <p className="text-sm text-gray-500 mt-2">{INSTITUTION.tagline}</p>
        </div>
      </div>
    );
  }

  // Show auth page if no user
  if (!user) {
    console.log('No user, showing auth page');
    return <SupabaseAuthPage />;
  }

  console.log('Showing main app content');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 w-full">
      {isMobile ? (
        <>
          <MobileSidebar 
            activeTab={activeTab} 
            onTabChange={handleTabChange}
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
            isDesktop={false}
          />
          <div className="flex flex-col min-h-screen">
            <Header onMenuClick={() => setSidebarOpen(true)} />
            <main className="flex-1 p-4 pb-20">
              {renderContent()}
            </main>
          </div>
        </>
      ) : (
        <div className="flex w-full min-h-screen">
          <MobileSidebar 
            activeTab={activeTab} 
            onTabChange={handleTabChange}
            isOpen={desktopSidebarOpen}
            onClose={toggleDesktopSidebar}
            isDesktop={true}
          />
          <div className={`flex-1 transition-all duration-300 ${desktopSidebarOpen ? 'ml-0' : 'ml-0'}`}>
            <Header onMenuClick={toggleDesktopSidebar} />
            <main className="p-6 pt-8">
              <div className="mb-4">
                <nav className="text-sm breadcrumbs">
                  <div className="flex items-center space-x-2 text-gray-600">
                    <span>{INSTITUTION.shortName} Student Portal</span>
                    <span>/</span>
                    <span className="text-blue-600 font-medium capitalize">
                      {activeTab === 'fees' ? 'Fee Management' : 
                       activeTab === 'students' ? 'Student Management' : activeTab}
                    </span>
                  </div>
                </nav>
              </div>
              {renderContent()}
            </main>
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;
