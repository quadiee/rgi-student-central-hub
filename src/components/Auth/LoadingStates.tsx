
import React from 'react';
import { GraduationCap, User, Building2 } from 'lucide-react';
import { Skeleton } from '../ui/skeleton';

export const AuthLoadingSkeleton = () => (
  <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
    <div className="text-center space-y-4">
      <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto animate-pulse">
        <GraduationCap className="w-8 h-8 text-white" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-32 mx-auto" />
        <Skeleton className="h-3 w-24 mx-auto" />
      </div>
    </div>
  </div>
);

export const ProfileLoadingSkeleton = () => (
  <div className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg">
    <div className="w-8 h-8 bg-blue-200 rounded-full animate-pulse flex items-center justify-center">
      <User className="w-4 h-4 text-blue-600" />
    </div>
    <div className="space-y-1">
      <Skeleton className="h-3 w-24" />
      <Skeleton className="h-2 w-16" />
    </div>
  </div>
);

export const ProgressiveLoader = ({ 
  authLoaded, 
  profileLoaded 
}: { 
  authLoaded: boolean; 
  profileLoaded: boolean; 
}) => (
  <div className="fixed top-0 left-0 right-0 z-50">
    <div className="bg-white border-b shadow-sm">
      <div className="max-w-md mx-auto p-4">
        <div className="flex items-center space-x-3">
          <div className={`w-2 h-2 rounded-full ${authLoaded ? 'bg-green-500' : 'bg-gray-300 animate-pulse'}`} />
          <span className="text-sm text-gray-600">Authentication</span>
          
          <div className={`w-2 h-2 rounded-full ${profileLoaded ? 'bg-green-500' : authLoaded ? 'bg-yellow-500 animate-pulse' : 'bg-gray-300'}`} />
          <span className="text-sm text-gray-600">Profile</span>
        </div>
        
        <div className="mt-2 w-full bg-gray-200 rounded-full h-1">
          <div 
            className="bg-gradient-to-r from-blue-600 to-purple-600 h-1 rounded-full transition-all duration-500 ease-out"
            style={{ 
              width: profileLoaded ? '100%' : authLoaded ? '60%' : '20%' 
            }}
          />
        </div>
      </div>
    </div>
  </div>
);
