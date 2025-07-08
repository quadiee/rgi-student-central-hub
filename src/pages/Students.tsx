
import React from 'react';
import { Users } from 'lucide-react';
import StudentManagement from '../components/Students/StudentManagement';

const Students: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                Student Management
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Manage student profiles, academic information, and fee records
              </p>
            </div>
          </div>
        </div>
        
        <StudentManagement />
      </div>
    </div>
  );
};

export default Students;
