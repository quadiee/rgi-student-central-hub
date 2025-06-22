
import React, { useState } from 'react';
import { Check, X, Clock, Users, QrCode, Send } from 'lucide-react';
import { Button } from '../ui/button';
import { mockStudents, mockSubjects } from '../../data/mockData';
import { AttendanceRecord } from '../../types';
import SwipeableCard from '../Mobile/SwipeableCard';
import { useToast } from '../ui/use-toast';

interface MobileAttendanceMarkingProps {
  onAttendanceMarked?: (attendance: AttendanceRecord[]) => void;
}

const MobileAttendanceMarking: React.FC<MobileAttendanceMarkingProps> = ({ onAttendanceMarked }) => {
  const [selectedSubject, setSelectedSubject] = useState('');
  const [currentStudentIndex, setCurrentStudentIndex] = useState(0);
  const [attendanceData, setAttendanceData] = useState<{[key: string]: 'Present' | 'Absent' | 'Leave'}>({});
  const [isMarkingMode, setIsMarkingMode] = useState(false);
  const { toast } = useToast();

  const currentDate = new Date().toISOString().split('T')[0];
  const currentStudent = mockStudents[currentStudentIndex];

  const handleStatusChange = (studentId: string, status: 'Present' | 'Absent' | 'Leave') => {
    setAttendanceData(prev => ({
      ...prev,
      [studentId]: status
    }));
  };

  const handleNextStudent = () => {
    if (currentStudentIndex < mockStudents.length - 1) {
      setCurrentStudentIndex(prev => prev + 1);
    }
  };

  const handlePreviousStudent = () => {
    if (currentStudentIndex > 0) {
      setCurrentStudentIndex(prev => prev - 1);
    }
  };

  const handleSubmitAttendance = () => {
    const selectedSubjectData = mockSubjects.find(s => s.id === selectedSubject);
    
    const attendanceRecords: AttendanceRecord[] = mockStudents.map(student => ({
      id: `${student.id}-${currentDate}-1`,
      studentId: student.id,
      courseCode: selectedSubjectData?.code || '',
      date: currentDate,
      hourNumber: 1,
      status: attendanceData[student.id] || 'Absent',
      facultyId: 'FAC001',
      markedAt: new Date().toISOString(),
      markedBy: 'FAC001',
      academicYear: '2024-25'
    }));

    onAttendanceMarked?.(attendanceRecords);
    
    toast({
      title: "Success",
      description: "Attendance marked successfully",
    });

    // Reset form
    setAttendanceData({});
    setIsMarkingMode(false);
    setCurrentStudentIndex(0);
  };

  const getProgress = () => {
    const marked = Object.keys(attendanceData).length;
    const total = mockStudents.length;
    return Math.round((marked / total) * 100);
  };

  if (!isMarkingMode) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Attendance</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Subject</option>
              {mockSubjects.map(subject => (
                <option key={subject.id} value={subject.id}>
                  {subject.name} ({subject.code})
                </option>
              ))}
            </select>
          </div>

          <div className="flex space-x-3">
            <Button
              onClick={() => setIsMarkingMode(true)}
              disabled={!selectedSubject}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              <Users className="w-4 h-4 mr-2" />
              Start Marking
            </Button>
            
            <Button variant="outline" className="flex-1">
              <QrCode className="w-4 h-4 mr-2" />
              QR Mode
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Progress Header */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold">Mark Attendance</h3>
          <span className="text-sm opacity-90">
            {currentStudentIndex + 1} of {mockStudents.length}
          </span>
        </div>
        <div className="w-full bg-white bg-opacity-20 rounded-full h-2">
          <div 
            className="bg-white h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentStudentIndex + 1) / mockStudents.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Student Card */}
      <div className="p-6">
        <SwipeableCard
          onSwipeLeft={handleNextStudent}
          onSwipeRight={handlePreviousStudent}
          leftAction="Next"
          rightAction="Previous"
        >
          <div className="text-center mb-6">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-2xl font-bold">
                {currentStudent?.name.split(' ').map(n => n[0]).join('')}
              </span>
            </div>
            <h4 className="text-xl font-semibold text-gray-800">{currentStudent?.name}</h4>
            <p className="text-gray-600">{currentStudent?.rollNumber}</p>
            <p className="text-sm text-gray-500">{currentStudent?.yearSection}</p>
          </div>

          {/* Status Buttons */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <button
              onClick={() => handleStatusChange(currentStudent.id, 'Present')}
              className={`p-4 rounded-xl border-2 transition-all ${
                attendanceData[currentStudent.id] === 'Present'
                  ? 'border-green-500 bg-green-50 text-green-700'
                  : 'border-gray-200 hover:border-green-300'
              }`}
            >
              <Check className="w-6 h-6 mx-auto mb-1" />
              <span className="text-sm font-medium">Present</span>
            </button>

            <button
              onClick={() => handleStatusChange(currentStudent.id, 'Leave')}
              className={`p-4 rounded-xl border-2 transition-all ${
                attendanceData[currentStudent.id] === 'Leave'
                  ? 'border-yellow-500 bg-yellow-50 text-yellow-700'
                  : 'border-gray-200 hover:border-yellow-300'
              }`}
            >
              <Clock className="w-6 h-6 mx-auto mb-1" />
              <span className="text-sm font-medium">Leave</span>
            </button>

            <button
              onClick={() => handleStatusChange(currentStudent.id, 'Absent')}
              className={`p-4 rounded-xl border-2 transition-all ${
                attendanceData[currentStudent.id] === 'Absent'
                  ? 'border-red-500 bg-red-50 text-red-700'
                  : 'border-gray-200 hover:border-red-300'
              }`}
            >
              <X className="w-6 h-6 mx-auto mb-1" />
              <span className="text-sm font-medium">Absent</span>
            </button>
          </div>
        </SwipeableCard>

        {/* Navigation */}
        <div className="flex justify-between items-center mb-4">
          <Button
            variant="outline"
            onClick={handlePreviousStudent}
            disabled={currentStudentIndex === 0}
          >
            Previous
          </Button>
          
          <span className="text-sm text-gray-600">
            Progress: {getProgress()}%
          </span>
          
          <Button
            onClick={handleNextStudent}
            disabled={currentStudentIndex === mockStudents.length - 1}
          >
            Next
          </Button>
        </div>

        {/* Submit Button */}
        <Button
          onClick={handleSubmitAttendance}
          className="w-full bg-green-600 hover:bg-green-700"
          size="lg"
        >
          <Send className="w-4 h-4 mr-2" />
          Submit Attendance
        </Button>
      </div>
    </div>
  );
};

export default MobileAttendanceMarking;
