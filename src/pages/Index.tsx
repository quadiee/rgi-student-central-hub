import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/SupabaseAuthContext';
import MobileSidebar from '../components/Layout/MobileSidebar';
import Header from '../components/Layout/Header';
import Dashboard from '../components/Dashboard/Dashboard';
import EnhancedFeeManagement from '../components/Fees/EnhancedFeeManagement';
import AdminPanel from '../components/Admin/AdminPanel';
import ProtectedRoute from '../components/Auth/ProtectedRoute';
import SupabaseAuthPage from '../components/Auth/SupabaseAuthPage';
import { useIsMobile } from '../hooks/use-mobile';

const AppContent = () => {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isMobile = useIsMobile();

  // Role-based redirect after login
  useEffect(() => {
    if (user && activeTab === 'dashboard') {
      // Keep user on dashboard initially, they can navigate as needed
      return;
    }
  }, [user, activeTab]);

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
          <ProtectedRoute allowedRoles={['admin', 'principal', 'hod', 'faculty']}>
            <div className="text-center py-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Student Management</h2>
              <p className="text-gray-600">Student management features coming soon...</p>
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
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <p className="text-gray-600">Loading RGCE Portal...</p>
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
