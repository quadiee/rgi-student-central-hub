import React, { useState } from 'react';
import { BookOpen, Calendar, Clock, FileText, Users, Trophy } from 'lucide-react';
import { Button } from '../ui/button';
import { useAuth } from '../../contexts/SupabaseAuthContext';

const ExamManagement: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('schedule');

  const renderSchedule = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Exam Schedule</h3>
        <Button>Create New Exam</Button>
      </div>
      
      <div className="grid gap-4">
        {[1, 2, 3].map((exam) => (
          <div key={exam} className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-semibold text-gray-800">Mathematics - Semester 5</h4>
                <p className="text-sm text-gray-600">Date: 15th July 2024</p>
                <p className="text-sm text-gray-600">Time: 10:00 AM - 1:00 PM</p>
                <p className="text-sm text-gray-600">Room: A-101</p>
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">Edit</Button>
                <Button variant="destructive" size="sm">Cancel</Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderResults = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Exam Results</h3>
        <Button>Upload Results</Button>
      </div>
      
      <div className="text-center py-8">
        <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">No exam results available yet.</p>
        <p className="text-sm text-gray-500 mt-2">Results will appear here once published.</p>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'schedule':
        return renderSchedule();
      case 'results':
        return renderResults();
      default:
        return renderSchedule();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Exam Management</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Upcoming Exams</p>
              <p className="text-2xl font-bold text-blue-600">5</p>
            </div>
            <Calendar className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Students</p>
              <p className="text-2xl font-bold text-green-600">120</p>
            </div>
            <Users className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completed Exams</p>
              <p className="text-2xl font-bold text-purple-600">12</p>
            </div>
            <BookOpen className="w-8 h-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Results</p>
              <p className="text-2xl font-bold text-orange-600">3</p>
            </div>
            <FileText className="w-8 h-8 text-orange-600" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex space-x-1 mb-6">
          {[
            { id: 'schedule', label: 'Schedule', icon: Calendar },
            { id: 'results', label: 'Results', icon: Trophy },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {renderContent()}
      </div>
    </div>
  );
};

export default ExamManagement;