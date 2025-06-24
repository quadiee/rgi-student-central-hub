
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/SupabaseAuthContext';
import LoginForm from './LoginForm';
import InvitationSignup from './InvitationSignup';
import SecureAdminButton from './SecureAdminButton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { GraduationCap, Users, BookOpen } from 'lucide-react';

const SupabaseAuthPage = () => {
  const { loading } = useAuth();
  const [activeTab, setActiveTab] = useState('login');

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <p className="text-gray-600">Loading RGCE Portal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
          RGCE Portal
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Rajalakshmi Government College of Engineering
        </p>
      </div>

      {/* Auth Form */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Welcome</CardTitle>
            <CardDescription className="text-center">
              Sign in to access your academic portal
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Join</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login" className="space-y-4">
                <LoginForm />
                
                {/* Admin Setup Section */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="space-y-3">
                    <p className="text-sm text-gray-600 text-center">
                      First time setup? Create admin account to get started.
                    </p>
                    <SecureAdminButton />
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="signup" className="space-y-4">
                <InvitationSignup />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Features */}
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="text-center p-4 bg-white/60 backdrop-blur-sm rounded-lg">
            <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <h3 className="font-semibold text-sm">Student Management</h3>
          </div>
          <div className="text-center p-4 bg-white/60 backdrop-blur-sm rounded-lg">
            <BookOpen className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <h3 className="font-semibold text-sm">Fee Management</h3>
          </div>
          <div className="text-center p-4 bg-white/60 backdrop-blur-sm rounded-lg">
            <GraduationCap className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <h3 className="font-semibold text-sm">Academic Portal</h3>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupabaseAuthPage;
