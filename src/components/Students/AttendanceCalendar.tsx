
import React, { useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { mockAttendance } from '../../data/mockData';
import { AttendanceRecord } from '../../types';

interface AttendanceCalendarProps {
  studentId: string;
}

const AttendanceCalendar: React.FC<AttendanceCalendarProps> = ({ studentId }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const studentAttendance = mockAttendance.filter(record => record.studentId === studentId);
  
  // Get attendance for current month
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  
  const monthAttendance = studentAttendance.filter(record => {
    const recordDate = new Date(record.date);
    return recordDate.getMonth() === currentMonth && recordDate.getFullYear() === currentYear;
  });

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const getAttendanceForDate = (day: number): AttendanceRecord[] => {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return monthAttendance.filter(record => record.date === dateStr);
  };

  const getDateColor = (day: number) => {
    const attendance = getAttendanceForDate(day);
    if (attendance.length === 0) return 'bg-gray-100 text-gray-400';
    
    const presentCount = attendance.filter(a => a.status === 'Present').length;
    const leaveCount = attendance.filter(a => a.status === 'Leave').length;
    const absentCount = attendance.filter(a => a.status === 'Absent').length;
    
    if (absentCount > 0) return 'bg-red-100 text-red-800 border-red-200';
    if (leaveCount > 0) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    if (presentCount > 0) return 'bg-green-100 text-green-800 border-green-200';
    
    return 'bg-gray-100 text-gray-400';
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const monthName = currentDate.toLocaleString('default', { month: 'long' });
  const year = currentDate.getFullYear();

  // Create calendar grid
  const calendarDays = [];
  
  // Empty cells for days before month starts
  for (let i = 0; i < firstDay; i++) {
    calendarDays.push(<div key={`empty-${i}`} className="p-2"></div>);
  }
  
  // Days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const attendance = getAttendanceForDate(day);
    const colorClass = getDateColor(day);
    
    calendarDays.push(
      <div
        key={day}
        className={`p-2 text-center rounded-lg border transition-colors hover:shadow-sm ${colorClass}`}
      >
        <div className="font-medium">{day}</div>
        {attendance.length > 0 && (
          <div className="text-xs mt-1">
            {attendance.length} {attendance.length === 1 ? 'class' : 'classes'}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Calendar className="w-5 h-5 text-blue-500" />
          <h3 className="text-lg font-semibold text-gray-800">Attendance Calendar</h3>
        </div>
        
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigateMonth('prev')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          <h4 className="text-lg font-medium text-gray-800">
            {monthName} {year}
          </h4>
          
          <button
            onClick={() => navigateMonth('next')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Days of week header */}
      <div className="grid grid-cols-7 gap-2 mb-4">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-2 mb-6">
        {calendarDays}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center space-x-6 text-sm">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-green-100 border border-green-200 rounded"></div>
          <span className="text-gray-600">Present</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-yellow-100 border border-yellow-200 rounded"></div>
          <span className="text-gray-600">Leave</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-red-100 border border-red-200 rounded"></div>
          <span className="text-gray-600">Absent</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-gray-100 rounded"></div>
          <span className="text-gray-600">No Class</span>
        </div>
      </div>
    </div>
  );
};

export default AttendanceCalendar;
