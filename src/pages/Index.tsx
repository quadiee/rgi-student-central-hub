import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/SupabaseAuthContext';
import { supabase } from '../integrations/supabase/client';
import MobileSidebar from '../components/Layout/MobileSidebar';
import Header from '../components/Layout/Header';
import Dashboard from '../components/Dashboard/Dashboard';
import EnhancedFeeManagement from '../components/Fees/EnhancedFeeManagement';
import AdminPanel from '../components/Admin/AdminPanel';
import ProtectedRoute from '../components/Auth/ProtectedRoute';
import SupabaseAuthPage from '../components/Auth/SupabaseAuthPage';
import { useIsMobile } from '../hooks/use-mobile';
import { GraduationCap } from 'lucide-react';
import { INSTITUTION } from '../constants/institutional';
import StudentList from '../components/StudentList';
import { Student } from '../user-models'; // <-- Import your Student interface

// Remove SimpleStudent interface completely!

const AppContent = () => {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null); // Use Student type!
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  // Redirect to dashboard route after login if on root path
  useEffect(() => {
    if (!loading && user && window.location.pathname === '/') {
      navigate('/dashboard', { replace: true });
    }
  }, [user, loading, navigate]);

  // Reset to dashboard when user changes
  useEffect(() => {
    if (user) {
      setActiveTab('dashboard');
    }
  }, [user?.id]);

  // Fetch real students from database
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
            role,
            course,
            year,
            semester,
            phone,
            profileImage,
            admissionDate,
            guardianName,
            guardianPhone,
            address,
            bloodGroup,
            emergencyContact,
            department:departments (
              code
            ),
            yearSection,
            section,
            totalFees,
            paidAmount,
            dueAmount,
            feeStatus
          `)
          .eq('role', 'student')
          .eq('is_active', true);

        if (error) {
          console.error('Error fetching students:', error);
          // Use mock data as fallback with ALL required Student fields!
          setStudents([
            {
              id: '1',
              name: 'John Doe',
              rollNumber: '1001',
              course: 'BTech',
              year: 4,
              semester: 8,
              email: 'john@example.com',
              phone: '9000000001',
              admissionDate: '2020-08-01',
              guardianName: 'Mr. Doe',
              guardianPhone: '9000001111',
              address: '123 Main St',
              emergencyContact: '9000002222',
              department: 'CSE',
              yearSection: 'IV-A',
              // Optional fields:
              profileImage: '',
              bloodGroup: '',
              section: '',
              totalFees: 0,
              paidAmount: 0,
              dueAmount: 0,
              feeStatus: 'Paid'
            },
            {
              id: '2',
              name: 'Jane Smith',
              rollNumber: '1002',
              course: 'BTech',
              year: 4,
              semester: 8,
              email: 'jane@example.com',
              phone: '9000000002',
              admissionDate: '2020-08-01',
              guardianName: 'Mrs. Smith',
              guardianPhone: '9000003333',
              address: '456 Main St',
              emergencyContact: '9000004444',
              department: 'ECE',
              yearSection: 'IV-B',
              profileImage: '',
              bloodGroup: '',
              section: '',
              totalFees: 0,
              paidAmount: 0,
              dueAmount: 0,
              feeStatus: 'Paid'
            },
            {
              id: '3',
              name: 'Bob Wilson',
              rollNumber: '1003',
              course: 'BTech',
              year: 4,
              semester: 8,
              email: 'bob@example.com',
              phone: '9000000003',
              admissionDate: '2020-08-01',
              guardianName: 'Mr. Wilson',
              guardianPhone: '9000005555',
              address: '789 Main St',
              emergencyContact: '9000006666',
              department: 'MECH',
              yearSection: 'IV-C',
              profileImage: '',
              bloodGroup: '',
              section: '',
              totalFees: 0,
              paidAmount: 0,
              dueAmount: 0,
              feeStatus: 'Paid'
            }
          ]);
        } else {
          // Build Student[] from data
          const studentsData: Student[] = (data || []).map((profile: any) => ({
            id: profile.id,
            name: profile.name || 'Unknown',
            rollNumber: profile.roll_number || '',
            course: profile.course || '',
            year: profile.year || 0,
            semester: profile.semester || 0,
            email: profile.email,
            phone: profile.phone || '',
            profileImage: profile.profileImage || '',
            admissionDate: profile.admissionDate || '',
            guardianName: profile.guardianName || '',
            guardianPhone: profile.guardianPhone || '',
            address: profile.address || '',
            bloodGroup: profile.bloodGroup || '',
            emergencyContact: profile.emergencyContact || '',
            department: profile.department?.code || '',
            yearSection: profile.yearSection || '',
            section: profile.section || '',
            totalFees: profile.totalFees || 0,
            paidAmount: profile.paidAmount || 0,
            dueAmount: profile.dueAmount || 0,
            feeStatus: profile.feeStatus || ''
          }));
          setStudents(studentsData);
        }
      } catch (error) {
        console.error('Error in fetchStudents:', error);
        // Use mock data as fallback with Student fields
        setStudents([
          {
            id: '1',
            name: 'John Doe',
            rollNumber: '1001',
            course: 'BTech',
            year: 4,
            semester: 8,
            email: 'john@example.com',
            phone: '9000000001',
            admissionDate: '2020-08-01',
            guardianName: 'Mr. Doe',
            guardianPhone: '9000001111',
            address: '123 Main St',
            emergencyContact: '9000002222',
            department: 'CSE',
            yearSection: 'IV-A',
            profileImage: '',
            bloodGroup: '',
            section: '',
            totalFees: 0,
            paidAmount: 0,
            dueAmount: 0,
            feeStatus: 'Paid'
          },
          // ...repeat for other mock students
        ]);
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
                      {/* Add more fields as needed */}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ProtectedRoute>
        );
      case 'attendance':
        return (
          <div className="text-center py-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Attendance Management</h2>
            <p className="text-gray-600">Attendance features coming soon...</p>
          </div>
        );
      case 'exams':
        return (
          <div className="text-center py-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Exam Management</h2>
            <p className="text-gray-600">Exam management features coming soon...</p>
          </div>
        );
      case 'reports':
        return (
          <ProtectedRoute allowedRoles={['admin', 'principal', 'hod']}>
            <div className="text-center py-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Reports</h2>
              <p className="text-gray-600">Reporting features coming soon...</p>
            </div>
          </ProtectedRoute>
        );
      default:
        return <Dashboard />;
    }
  };

  // Show loading screen while checking authentication
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

  // Show authentication page if user is not logged in
  if (!user) {
    return <SupabaseAuthPage />;
  }

  // Main application interface
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 w-full">
      {isMobile ? (
        <>
          <MobileSidebar 
            activeTab={activeTab} 
            onTabChange={setActiveTab}
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
            onTabChange={setActiveTab}
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