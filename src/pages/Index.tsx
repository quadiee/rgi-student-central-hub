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

interface SimpleStudent {
  id: string;
  name: string;
  email: string;
  department: string;
  role: string;
}

const AppContent = () => {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [students, setStudents] = useState<SimpleStudent[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<SimpleStudent | null>(null);
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
            departments:department_id (
              name,
              code
            )
          `)
          .eq('role', 'student')
          .eq('is_active', true);

        if (error) {
          console.error('Error fetching students:', error);
          // Use mock data as fallback
          setStudents([
            { id: '1', name: 'John Doe', email: 'john@example.com', department: 'CSE', role: 'student' },
            { id: '2', name: 'Jane Smith', email: 'jane@example.com', department: 'ECE', role: 'student' },
            { id: '3', name: 'Bob Wilson', email: 'bob@example.com', department: 'MECH', role: 'student' },
          ]);
        } else {
          const simpleStudents: SimpleStudent[] = (data || []).map((profile: any) => ({
            id: profile.id,
            name: profile.name || 'Unknown',
            email: profile.email,
            department: profile.departments?.code || 'Unknown',
            role: profile.role
          }));
          setStudents(simpleStudents);
        }
      } catch (error) {
        console.error('Error in fetchStudents:', error);
        // Use mock data as fallback
        setStudents([
          { id: '1', name: 'John Doe', email: 'john@example.com', department: 'CSE', role: 'student' },
          { id: '2', name: 'Jane Smith', email: 'jane@example.com', department: 'ECE', role: 'student' },
          { id: '3', name: 'Bob Wilson', email: 'bob@example.com', department: 'MECH', role: 'student' },
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
                      <div><strong>Role:</strong> {selectedStudent.role}</div>
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
