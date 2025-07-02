import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/SupabaseAuthContext';
import { supabase } from '../integrations/supabase/client';
import MobileSidebar from '../components/Layout/MobileSidebar';
import Header from '../components/Layout/Header';
import Dashboard from '../components/Dashboard/Dashboard';
import EnhancedFeeManagement from '../components/Fees/EnhancedFeeManagement';
import AdminPanel from '../components/Admin/AdminPanel';
import AttendanceManagement from '../components/Attendance/AttendanceManagement';
import ExamManagement from '../components/Exams/ExamManagement';
import ReportGenerator from '../components/Reports/ReportGenerator';
import ProtectedRoute from '../components/Auth/ProtectedRoute';
import SupabaseAuthPage from '../components/Auth/SupabaseAuthPage';
import { useIsMobile } from '../hooks/use-mobile';
import { GraduationCap } from 'lucide-react';
import { INSTITUTION } from '../constants/institutional';
import StudentList from '../components/StudentList';
import { Student } from '../types/user-student-fees';

const AppContent = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const isMobile = useIsMobile();

  // Get active tab from current route
  const activeTab = location.pathname.slice(1) || 'dashboard';

  const handleTabChange = (tab: string) => {
    navigate(`/${tab}`);
    setSidebarOpen(false); // Close mobile sidebar after navigation
  };

  useEffect(() => {
    const fetchStudents = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select(`
            id, 
            name, 
            email, 
            roll_number,
            course,
            year,
            semester,
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
          .eq('role', 'student')
          .eq('is_active', true);

        if (error) {
          setStudents([]);
        } else {
          const studentsData: Student[] = (data || []).map((profile: any) => ({
            id: profile.id,
            name: profile.name || 'Unknown',
            rollNumber: profile.roll_number || '',
            course: profile.course || '',
            year: profile.year || 0,
            semester: profile.semester || 0,
            email: profile.email,
            phone: profile.phone || '',
            profileImage: profile.profile_photo_url || '',
            admissionDate: profile.admission_date || '',
            guardianName: profile.guardian_name || '',
            guardianPhone: profile.guardian_phone || '',
            address: profile.address || '',
            bloodGroup: profile.blood_group || '',
            emergencyContact: profile.emergency_contact || '',
            department: profile.department_id || '',
            yearSection: profile.year_section || '',
            section: profile.section || '',
            totalFees: profile.total_fees || 0,
            paidAmount: profile.paid_amount || 0,
            dueAmount: profile.due_amount || 0,
            feeStatus: profile.fee_status || ''
          }));
          setStudents(studentsData);
        }
      } catch (error) {
        setStudents([]);
      }
    };

    fetchStudents();
  }, [user]);

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'fees':
        return <EnhancedFeeManagement />;
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
                <StudentList
                  students={students}
                  onViewStudent={(s) => setSelectedStudent(s)}
                />
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

  if (loading) {
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

  if (!user) {
    return <SupabaseAuthPage />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 w-full">
      {isMobile ? (
        <>
          <MobileSidebar 
            activeTab={activeTab} 
            onTabChange={handleTabChange}
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
          />
          <div className="flex flex-col min-h-screen">
            <Header onMenuClick={() => setSidebarOpen(true)} />
            <main className="flex-1 p-4 pb-20">
              {renderContent()}
            </main>
          </div>
        </>
      ) : (
        <div className="flex w-full">
          <MobileSidebar 
            activeTab={activeTab} 
            onTabChange={handleTabChange}
            isOpen={true}
            onClose={() => {}}
          />
          <div className="flex-1 ml-64">
            <Header />
            <main className="p-6 pt-8">
              <div className="mb-4">
                <nav className="text-sm breadcrumbs">
                  <div className="flex items-center space-x-2 text-gray-600">
                    <span>{INSTITUTION.shortName} Student Portal</span>
                    <span>/</span>
                    <span className="text-blue-600 font-medium capitalize">
                      {activeTab === 'fees' ? 'Fee Management' : activeTab}
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

const Index = () => {
  return <AppContent />;
};

export default Index;