
import React, { useState } from 'react';
import { Check, X, Clock, Users, Calendar, QrCode } from 'lucide-react';
import { Button } from '../ui/button';
import { mockStudents, mockSubjects, mockTimetable, timeSlots } from '../../data/mockData';
import { AttendanceRecord } from '../../types';

interface AttendanceMarkingProps {
  onAttendanceMarked?: (attendance: AttendanceRecord[]) => void;
}

const AttendanceMarking: React.FC<AttendanceMarkingProps> = ({ onAttendanceMarked }) => {
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('');
  const [attendanceData, setAttendanceData] = useState<{[key: string]: 'Present' | 'Absent' | 'Leave'}>({});
  const [isMarkingMode, setIsMarkingMode] = useState(false);

  const currentDate = new Date().toISOString().split('T')[0];
  const currentTime = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });

  const handleStatusChange = (studentId: string, status: 'Present' | 'Absent' | 'Leave') => {
    setAttendanceData(prev => ({
      ...prev,
      [studentId]: status
    }));
  };

  const handleSubmitAttendance = () => {
    if (!selectedSubject || !selectedPeriod) return;

    const selectedSubjectData = mockSubjects.find(s => s.id === selectedSubject);
    const selectedTimeSlot = timeSlots.find(t => t.id === selectedPeriod);

    const attendanceRecords: AttendanceRecord[] = mockStudents.map(student => ({
      id: `${student.id}-${currentDate}-${selectedPeriod}`,
      studentId: student.id,
      courseCode: selectedSubjectData?.code || '',
      date: currentDate,
      hourNumber: selectedTimeSlot?.period || 1,
      status: attendanceData[student.id] || 'Absent',
      facultyId: 'FAC001',
      markedAt: new Date().toISOString(),
      markedBy: 'FAC001',
      academicYear: '2024-25'
    }));

    onAttendanceMarked?.(attendanceRecords);
    
    // Reset form
    setAttendanceData({});
    setIsMarkingMode(false);
    
    console.log('Attendance marked:', attendanceRecords);
  };

  const getAttendanceStats = () => {
    const total = mockStudents.length;
    const present = Object.values(attendanceData).filter(status => status === 'Present').length;
    const absent = Object.values(attendanceData).filter(status => status === 'Absent').length;
    const leave = Object.values(attendanceData).filter(status => status === 'Leave').length;
    const pending = total - present - absent - leave;

    return { total, present, absent, leave, pending };
  };

  const stats = getAttendanceStats();

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-800">Mark Attendance</h3>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Calendar className="w-4 h-4" />
          <span>{new Date().toLocaleDateString()}</span>
          <Clock className="w-4 h-4 ml-2" />
          <span>{currentTime}</span>
        </div>
      </div>

      {!isMarkingMode ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select Subject</option>
                {mockSubjects.map(subject => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name} ({subject.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Time Slot</label>
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select Time Slot</option>
                {timeSlots.map(slot => (
                  <option key={slot.id} value={slot.id}>
                    Period {slot.period} ({slot.startTime} - {slot.endTime})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex space-x-4">
            <Button
              onClick={() => setIsMarkingMode(true)}
              disabled={!selectedSubject || !selectedPeriod}
              className="flex items-center space-x-2"
            >
              <Users className="w-4 h-4" />
              <span>Start Marking</span>
            </Button>

            <Button variant="outline" className="flex items-center space-x-2">
              <QrCode className="w-4 h-4" />
              <span>QR Code Mode</span>
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Attendance Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-blue-50 p-3 rounded-lg text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
              <div className="text-sm text-blue-800">Total</div>
            </div>
            <div className="bg-green-50 p-3 rounded-lg text-center">
              <div className="text-2xl font-bold text-green-600">{stats.present}</div>
              <div className="text-sm text-green-800">Present</div>
            </div>
            <div className="bg-red-50 p-3 rounded-lg text-center">
              <div className="text-2xl font-bold text-red-600">{stats.absent}</div>
              <div className="text-sm text-red-800">Absent</div>
            </div>
            <div className="bg-yellow-50 p-3 rounded-lg text-center">
              <div className="text-2xl font-bold text-yellow-600">{stats.leave}</div>
              <div className="text-sm text-yellow-800">Leave</div>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg text-center">
              <div className="text-2xl font-bold text-gray-600">{stats.pending}</div>
              <div className="text-sm text-gray-800">Pending</div>
            </div>
          </div>

          {/* Student List */}
          <div className="space-y-3">
            <h4 className="font-medium text-gray-800">Students - {mockSubjects.find(s => s.id === selectedSubject)?.name}</h4>
            {mockStudents.map(student => (
              <div key={student.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {student.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{student.name}</div>
                    <div className="text-sm text-gray-500">{student.rollNumber}</div>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={() => handleStatusChange(student.id, 'Present')}
                    className={`p-2 rounded-lg transition-colors ${
                      attendanceData[student.id] === 'Present'
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-green-100'
                    }`}
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleStatusChange(student.id, 'Leave')}
                    className={`p-2 rounded-lg transition-colors ${
                      attendanceData[student.id] === 'Leave'
                        ? 'bg-yellow-500 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-yellow-100'
                    }`}
                  >
                    <Clock className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleStatusChange(student.id, 'Absent')}
                    className={`p-2 rounded-lg transition-colors ${
                      attendanceData[student.id] === 'Absent'
                        ? 'bg-red-500 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-red-100'
                    }`}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => setIsMarkingMode(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitAttendance}
              className="bg-green-600 hover:bg-green-700"
            >
              Submit Attendance
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceMarking;
