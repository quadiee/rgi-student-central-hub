
import React from 'react';
import { CheckCircle, XCircle, Clock, Calendar } from 'lucide-react';

interface MobileAttendanceCardProps {
  subject: string;
  date: string;
  status: 'Present' | 'Absent' | 'Leave';
  hour: number;
  totalHours: number;
  percentage: number;
}

const MobileAttendanceCard: React.FC<MobileAttendanceCardProps> = ({
  subject,
  date,
  status,
  hour,
  totalHours,
  percentage
}) => {
  const getStatusIcon = () => {
    switch (status) {
      case 'Present':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'Absent':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'Leave':
        return <Clock className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'Present':
        return 'border-green-200 bg-green-50';
      case 'Absent':
        return 'border-red-200 bg-red-50';
      case 'Leave':
        return 'border-yellow-200 bg-yellow-50';
    }
  };

  return (
    <div className={`p-4 rounded-xl border-2 ${getStatusColor()} shadow-sm`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-800 text-lg">{subject}</h3>
          <div className="flex items-center space-x-2 text-sm text-gray-600 mt-1">
            <Calendar className="w-4 h-4" />
            <span>{date}</span>
            <span>•</span>
            <span>Hour {hour}</span>
          </div>
        </div>
        {getStatusIcon()}
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-16 bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full ${
                percentage >= 75 ? 'bg-green-500' : 
                percentage >= 50 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ width: `${percentage}%` }}
            />
          </div>
          <span className="text-sm font-medium text-gray-700">{percentage}%</span>
        </div>
        
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
          status === 'Present' ? 'bg-green-100 text-green-800' :
          status === 'Leave' ? 'bg-yellow-100 text-yellow-800' :
          'bg-red-100 text-red-800'
        }`}>
          {status}
        </span>
      </div>
    </div>
  );
};

export default MobileAttendanceCard;
