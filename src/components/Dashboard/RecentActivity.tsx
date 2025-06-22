
import React from 'react';
import { Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface Activity {
  id: string;
  type: 'attendance' | 'fee' | 'exam';
  message: string;
  time: string;
  status: 'success' | 'warning' | 'error';
}

const RecentActivity: React.FC = () => {
  const activities: Activity[] = [
    {
      id: '1',
      type: 'attendance',
      message: 'Attendance marked for Data Structures class',
      time: '2 hours ago',
      status: 'success'
    },
    {
      id: '2',
      type: 'fee',
      message: 'Fee payment reminder sent to 5 students',
      time: '4 hours ago',
      status: 'warning'
    },
    {
      id: '3',
      type: 'exam',
      message: 'Mid-term results published for CS301',
      time: '1 day ago',
      status: 'success'
    },
    {
      id: '4',
      type: 'attendance',
      message: '3 students marked absent today',
      time: '1 day ago',
      status: 'error'
    }
  ];

  const getIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-6">Recent Activity</h3>
      <div className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
            {getIcon(activity.status)}
            <div className="flex-1">
              <p className="text-gray-800 font-medium">{activity.message}</p>
              <p className="text-gray-500 text-sm mt-1">{activity.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentActivity;
