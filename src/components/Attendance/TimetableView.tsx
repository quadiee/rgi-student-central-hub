
import React from 'react';
import { Clock, MapPin, User } from 'lucide-react';
import { mockTimetable, mockSubjects, mockFaculty, mockClassrooms, timeSlots } from '../../data/mockData';

const TimetableView: React.FC = () => {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  
  const getTimetableForDay = (dayIndex: number) => {
    return mockTimetable
      .filter(entry => entry.dayOfWeek === dayIndex + 1)
      .sort((a, b) => a.timeSlot.period - b.timeSlot.period);
  };

  const getSubjectName = (subjectId: string) => {
    return mockSubjects.find(s => s.id === subjectId)?.name || 'Unknown Subject';
  };

  const getFacultyName = (facultyId: string) => {
    return mockFaculty.find(f => f.id === facultyId)?.name || 'Unknown Faculty';
  };

  const getClassroomName = (classroomId: string) => {
    return mockClassrooms.find(c => c.id === classroomId)?.name || 'Unknown Room';
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-800">Weekly Timetable</h3>
        <div className="flex space-x-2">
          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">CS 5th Semester</span>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-4">
        <div className="font-semibold text-gray-700 text-center py-2">Time</div>
        {days.map(day => (
          <div key={day} className="font-semibold text-gray-700 text-center py-2">
            {day}
          </div>
        ))}

        {timeSlots.map(slot => (
          <div key={slot.id} className="contents">
            <div className="text-center py-4 bg-gray-50 rounded-lg">
              <div className="text-sm font-medium text-gray-800">
                {slot.startTime} - {slot.endTime}
              </div>
              <div className="text-xs text-gray-500">Period {slot.period}</div>
            </div>
            
            {days.map((_, dayIndex) => {
              const dayTimetable = getTimetableForDay(dayIndex);
              const classForSlot = dayTimetable.find(entry => entry.timeSlot.period === slot.period);
              
              return (
                <div key={`${dayIndex}-${slot.period}`} className="p-2">
                  {classForSlot ? (
                    <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white p-3 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                      <div className="font-medium text-sm mb-2">
                        {getSubjectName(classForSlot.subjectId)}
                      </div>
                      <div className="flex items-center space-x-1 text-xs opacity-90 mb-1">
                        <User className="w-3 h-3" />
                        <span>{getFacultyName(classForSlot.facultyId)}</span>
                      </div>
                      <div className="flex items-center space-x-1 text-xs opacity-90">
                        <MapPin className="w-3 h-3" />
                        <span>{getClassroomName(classForSlot.classroomId)}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="h-16 bg-gray-100 rounded-lg"></div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TimetableView;
