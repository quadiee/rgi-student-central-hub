
import React, { useState } from 'react';
import { Check, X, Clock, Users, Calendar, Save, AlertCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { mockStudents, mockCourses } from '../../data/mockData';
import { AttendanceRecord, Course } from '../../types';

interface BatchAttendanceMarkingProps {
  facultyEmail: string;
  onBatchSubmit: (records: AttendanceRecord[]) => void;
}

const BatchAttendanceMarking: React.FC<BatchAttendanceMarkingProps> = ({
  facultyEmail,
  onBatchSubmit
}) => {
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedHour, setSelectedHour] = useState<number>(1);
  const [attendanceData, setAttendanceData] = useState<{[key: string]: 'Present' | 'Absent' | 'Leave'}>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get courses assigned to this faculty
  const facultyCourses = mockCourses.filter(course => course.facultyEmail === facultyEmail);

  // Get students for selected course
  const courseStudents = selectedCourse 
    ? mockStudents.filter(student => 
        student.department === selectedCourse.department && 
        student.year === selectedCourse.year &&
        student.yearSection === selectedCourse.yearSection
      )
    : [];

  const handleCourseSelect = (courseId: string) => {
    const course = facultyCourses.find(c => c.id === courseId);
    setSelectedCourse(course || null);
    setAttendanceData({}); // Reset attendance data when course changes
  };

  const handleStatusChange = (studentId: string, status: 'Present' | 'Absent' | 'Leave') => {
    setAttendanceData(prev => ({
      ...prev,
      [studentId]: status
    }));
  };

  const markAllPresent = () => {
    const allPresentData: {[key: string]: 'Present' | 'Absent' | 'Leave'} = {};
    courseStudents.forEach(student => {
      allPresentData[student.id] = 'Present';
    });
    setAttendanceData(allPresentData);
  };

  const handleBatchSubmit = async () => {
    if (!selectedCourse) return;

    setIsSubmitting(true);
    
    try {
      const attendanceRecords: AttendanceRecord[] = courseStudents.map(student => ({
        id: `${student.id}-${selectedDate}-${selectedCourse.courseCode}-${selectedHour}`,
        studentId: student.id,
        courseCode: selectedCourse.courseCode,
        date: selectedDate,
        hourNumber: selectedHour,
        status: attendanceData[student.id] || 'Absent',
        facultyId: facultyEmail,
        markedAt: new Date().toISOString(),
        markedBy: facultyEmail,
        academicYear: '2024-25'
      }));

      onBatchSubmit(attendanceRecords);
      
      // Reset form
      setAttendanceData({});
      console.log('Batch attendance submitted successfully');
      
    } catch (error) {
      console.error('Error submitting batch attendance:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getAttendanceStats = () => {
    const total = courseStudents.length;
    const marked = Object.keys(attendanceData).length;
    const present = Object.values(attendanceData).filter(status => status === 'Present').length;
    const absent = Object.values(attendanceData).filter(status => status === 'Absent').length;
    const leave = Object.values(attendanceData).filter(status => status === 'Leave').length;
    const pending = total - marked;

    return { total, marked, present, absent, leave, pending };
  };

  const stats = getAttendanceStats();

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center space-x-2 mb-6">
        <Users className="w-5 h-5 text-blue-500" />
        <h3 className="text-lg font-semibold text-gray-800">Batch Attendance Marking</h3>
      </div>

      {/* Course and Date Selection */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Course</label>
          <select
            value={selectedCourse?.id || ''}
            onChange={(e) => handleCourseSelect(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select Course</option>
            {facultyCourses.map(course => (
              <option key={course.id} value={course.id}>
                {course.courseCode} - {course.courseName}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Hour</label>
          <select
            value={selectedHour}
            onChange={(e) => setSelectedHour(Number(e.target.value))}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {Array.from({ length: selectedCourse?.hoursPerWeek || 8 }, (_, i) => i + 1).map(hour => (
              <option key={hour} value={hour}>
                Hour {hour}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-end">
          <Button
            onClick={markAllPresent}
            disabled={!selectedCourse}
            variant="outline"
            className="w-full"
          >
            Mark All Present
          </Button>
        </div>
      </div>

      {selectedCourse && (
        <>
          {/* Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
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
          <div className="space-y-3 mb-6">
            <h4 className="font-medium text-gray-800">
              Students - {selectedCourse.courseName} ({selectedCourse.yearSection})
            </h4>
            
            {courseStudents.map(student => (
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

          {/* Submit Button */}
          <div className="flex justify-between items-center">
            {stats.pending > 0 && (
              <div className="flex items-center space-x-2 text-yellow-600">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">{stats.pending} students pending</span>
              </div>
            )}
            
            <Button
              onClick={handleBatchSubmit}
              disabled={isSubmitting || courseStudents.length === 0}
              className="bg-green-600 hover:bg-green-700 ml-auto"
            >
              <Save className="w-4 h-4 mr-2" />
              {isSubmitting ? 'Submitting...' : 'Submit Attendance'}
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default BatchAttendanceMarking;
