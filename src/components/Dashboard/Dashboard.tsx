
import React from 'react';
import { Users, UserCheck, CreditCard, FileText, TrendingUp, Calendar } from 'lucide-react';
import StatsCard from './StatsCard';
import RecentActivity from './RecentActivity';
import { useAuth } from '../../contexts/AuthContext';
import { mockStudents, mockAttendance, mockFees, mockExams } from '../../data/mockData';

const Dashboard: React.FC = () => {
  const { user } = useAuth();

  const totalStudents = mockStudents.length;
  const totalAttendanceRecords = mockAttendance.length;
  const presentToday = mockAttendance.filter(a => a.status === 'Present' && a.date === '2024-06-20').length;
  const pendingFees = mockFees.filter(f => f.status === 'Pending' || f.status === 'Overdue').length;
  const recentExams = mockExams.length;

  const attendanceRate = totalAttendanceRecords > 0 
    ? Math.round((mockAttendance.filter(a => a.status === 'Present').length / totalAttendanceRecords) * 100)
    : 0;

  const getStatsForRole = () => {
    if (user?.role === 'admin') {
      return [
        {
          title: 'Total Students',
          value: totalStudents,
          change: '+12% from last month',
          changeType: 'positive' as const,
          icon: Users,
          gradient: 'from-blue-500 to-blue-600'
        },
        {
          title: 'Present Today',
          value: presentToday,
          change: `${attendanceRate}% attendance rate`,
          changeType: 'positive' as const,
          icon: UserCheck,
          gradient: 'from-green-500 to-green-600'
        },
        {
          title: 'Pending Fees',
          value: pendingFees,
          change: '-5% from last week',
          changeType: 'positive' as const,
          icon: CreditCard,
          gradient: 'from-yellow-500 to-orange-500'
        },
        {
          title: 'Recent Exams',
          value: recentExams,
          change: '3 scheduled this week',
          changeType: 'neutral' as const,
          icon: FileText,
          gradient: 'from-purple-500 to-purple-600'
        }
      ];
    } else if (user?.role === 'faculty') {
      return [
        {
          title: 'My Classes',
          value: 8,
          change: '2 classes today',
          changeType: 'neutral' as const,
          icon: Calendar,
          gradient: 'from-blue-500 to-blue-600'
        },
        {
          title: 'Students Present',
          value: presentToday,
          change: `${attendanceRate}% attendance`,
          changeType: 'positive' as const,
          icon: UserCheck,
          gradient: 'from-green-500 to-green-600'
        },
        {
          title: 'Assignments',
          value: 12,
          change: '5 pending review',
          changeType: 'neutral' as const,
          icon: FileText,
          gradient: 'from-purple-500 to-purple-600'
        },
        {
          title: 'Performance',
          value: '85%',
          change: '+3% improvement',
          changeType: 'positive' as const,
          icon: TrendingUp,
          gradient: 'from-indigo-500 to-indigo-600'
        }
      ];
    } else {
      // Student view
      const studentId = user?.studentId;
      const myAttendance = mockAttendance.filter(a => a.studentId === studentId);
      const myAttendanceRate = myAttendance.length > 0 
        ? Math.round((myAttendance.filter(a => a.status === 'Present').length / myAttendance.length) * 100)
        : 0;
      
      const myFees = mockFees.filter(f => f.studentId === studentId);
      const myPendingFees = myFees.filter(f => f.status !== 'Paid').reduce((sum, f) => sum + f.amount, 0);
      
      const myExams = mockExams.filter(e => e.studentId === studentId);
      const myAverage = myExams.length > 0 
        ? Math.round(myExams.reduce((sum, e) => sum + (e.marksObtained / e.totalMarks * 100), 0) / myExams.length)
        : 0;

      return [
        {
          title: 'My Attendance',
          value: `${myAttendanceRate}%`,
          change: myAttendanceRate > 75 ? 'Good attendance' : 'Needs improvement',
          changeType: myAttendanceRate > 75 ? 'positive' as const : 'negative' as const,
          icon: UserCheck,
          gradient: 'from-green-500 to-green-600'
        },
        {
          title: 'Average Marks',
          value: `${myAverage}%`,
          change: myAverage > 75 ? 'Excellent performance' : 'Keep improving',
          changeType: myAverage > 75 ? 'positive' as const : 'neutral' as const,
          icon: TrendingUp,
          gradient: 'from-blue-500 to-blue-600'
        },
        {
          title: 'Pending Fees',
          value: `₹${myPendingFees.toLocaleString()}`,
          change: myPendingFees === 0 ? 'All fees paid' : 'Payment required',
          changeType: myPendingFees === 0 ? 'positive' as const : 'negative' as const,
          icon: CreditCard,
          gradient: 'from-yellow-500 to-orange-500'
        },
        {
          title: 'Upcoming Exams',
          value: 3,
          change: 'Next exam in 5 days',
          changeType: 'neutral' as const,
          icon: FileText,
          gradient: 'from-purple-500 to-purple-600'
        }
      ];
    }
  };

  const stats = getStatsForRole();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            {user?.role === 'student' ? 'My Dashboard' : 
             user?.role === 'faculty' ? 'Faculty Dashboard' : 
             'Admin Dashboard'}
          </h1>
          <p className="text-gray-600 mt-2">
            {user?.role === 'student' ? 'Track your academic progress and activities' :
             user?.role === 'faculty' ? 'Manage your classes and student performance' :
             'Manage students, attendance, fees, and exams'}
          </p>
        </div>
        <div className="text-right">
          <p className="text-gray-600">Today</p>
          <p className="text-xl font-semibold text-gray-800">
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      {/* Charts and Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-lg p-6 h-96">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              {user?.role === 'student' ? 'My Performance Trend' : 'Attendance Trends'}
            </h3>
            <div className="flex items-center justify-center h-full text-gray-500">
              <div className="text-center">
                <TrendingUp className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>Performance charts will be displayed here</p>
                <p className="text-sm mt-2">Integration with chart library coming soon</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="lg:col-span-1">
          <RecentActivity />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {user?.role === 'admin' && (
            <>
              <button className="p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors text-center">
                <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-800">Add Student</p>
              </button>
              <button className="p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors text-center">
                <UserCheck className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-800">Mark Attendance</p>
              </button>
              <button className="p-4 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors text-center">
                <CreditCard className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-800">Fee Collection</p>
              </button>
              <button className="p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors text-center">
                <FileText className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-800">Create Exam</p>
              </button>
            </>
          )}
          
          {user?.role === 'faculty' && (
            <>
              <button className="p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors text-center">
                <UserCheck className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-800">Mark Attendance</p>
              </button>
              <button className="p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors text-center">
                <FileText className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-800">Grade Assignments</p>
              </button>
              <button className="p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors text-center">
                <Calendar className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-800">Schedule Class</p>
              </button>
              <button className="p-4 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors text-center">
                <TrendingUp className="w-8 h-8 text-indigo-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-800">View Reports</p>
              </button>
            </>
          )}
          
          {user?.role === 'student' && (
            <>
              <button className="p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors text-center">
                <Calendar className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-800">View Schedule</p>
              </button>
              <button className="p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors text-center">
                <UserCheck className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-800">Check Attendance</p>
              </button>
              <button className="p-4 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors text-center">
                <CreditCard className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-800">Pay Fees</p>
              </button>
              <button className="p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors text-center">
                <FileText className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-800">View Results</p>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
