
import React from 'react';
import { AlertTriangle, TrendingDown, Clock } from 'lucide-react';
import { Button } from '../ui/button';
import { mockStudents } from '../../data/mockData';

interface AtRiskAlertProps {
  department?: string;
  onViewDetails?: (studentId: string) => void;
}

const AtRiskAlert: React.FC<AtRiskAlertProps> = ({ department, onViewDetails }) => {
  const atRiskStudents = mockStudents.filter(student => {
    const meetsThreshold = (student.attendancePercentage || 0) < 75;
    const matchesDepartment = department ? student.department === department : true;
    return meetsThreshold && matchesDepartment;
  });

  if (atRiskStudents.length === 0) {
    return null;
  }

  const getCriticalityLevel = (percentage: number) => {
    if (percentage < 60) return 'critical';
    if (percentage < 70) return 'warning';
    return 'attention';
  };

  const getCriticalityColor = (level: string) => {
    switch (level) {
      case 'critical': return 'bg-red-50 border-red-200 text-red-800';
      case 'warning': return 'bg-orange-50 border-orange-200 text-orange-800';
      default: return 'bg-yellow-50 border-yellow-200 text-yellow-800';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-l-red-500">
      <div className="flex items-center space-x-2 mb-4">
        <AlertTriangle className="w-5 h-5 text-red-500" />
        <h3 className="text-lg font-semibold text-gray-800">At-Risk Students Alert</h3>
        <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-sm font-medium">
          {atRiskStudents.length} students
        </span>
      </div>

      <div className="space-y-3 mb-4">
        {atRiskStudents.slice(0, 5).map((student) => {
          const level = getCriticalityLevel(student.attendancePercentage || 0);
          return (
            <div
              key={student.id}
              className={`p-3 rounded-lg border ${getCriticalityColor(level)}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-gray-700">
                      {student.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-medium">{student.name}</h4>
                    <p className="text-sm opacity-75">{student.rollNumber} • {student.yearSection}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center space-x-1">
                    <TrendingDown className="w-4 h-4" />
                    <span className="font-bold">{student.attendancePercentage}%</span>
                  </div>
                  <p className="text-xs opacity-75">Attendance</p>
                </div>
              </div>
              
              <div className="mt-2 flex items-center justify-between">
                <div className="flex items-center space-x-1 text-xs opacity-75">
                  <Clock className="w-3 h-3" />
                  <span>Action needed within 48 hours</span>
                </div>
                {onViewDetails && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onViewDetails(student.id)}
                    className="text-xs"
                  >
                    View Details
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {atRiskStudents.length > 5 && (
        <div className="text-center">
          <Button variant="outline" size="sm">
            View All {atRiskStudents.length} At-Risk Students
          </Button>
        </div>
      )}

      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>Recommended Actions:</strong> Send alerts to parents, schedule counseling sessions, 
          or contact students directly to improve attendance.
        </p>
      </div>
    </div>
  );
};

export default AtRiskAlert;
