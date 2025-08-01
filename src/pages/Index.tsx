
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/SupabaseAuthContext';
import { GraduationCap } from 'lucide-react';
import { INSTITUTION } from '../constants/institutional';
import SupabaseAuthPage from '../components/Auth/SupabaseAuthPage';

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, loading, navigate]);

  // Show loading only during initial auth check
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

  // Show auth page if no user
  if (!user) {
    return <SupabaseAuthPage />;
  }

  return null; // User will be redirected to dashboard
};

export default Index;
