import React, { useState, useEffect } from 'react';
import { TrendingUp, Users, AlertTriangle, DollarSign, Search, Filter } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import StatsCard from './StatsCard';
import { useAuth } from '../../contexts/SupabaseAuthContext';
import { useToast } from '../ui/use-toast';
import { RealFeeService } from '../../services/realFeeService';
import { FeeRecord } from '../../types';
import { useIsMobile } from '../../hooks/use-mobile';

interface StudentFeeInfo {
  id: string;
  name: string;
  rollNumber: string;
  department: string;
  totalFee: number;
  paidAmount: number;
  dueAmount: number;
  dueDate: string;
  status: string;
  profilePhoto?: string;
}

const HODDashboard: React.FC = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [students, setStudents] = useState<StudentFeeInfo[]>([]);
  const [departmentStats, setDepartmentStats] = useState({
    totalStudents: 0,
    totalCollected: 0,
    totalOutstanding: 0,
    avgCollection: 0
  });

  useEffect(() => {
    if (profile) {
      fetchDepartmentData();
    }
  }, [profile]);

  const fetchDepartmentData = async () => {
    if (!profile) return;
    
    try {
      setLoading(true);
      const feeRecords = await RealFeeService.getFeeRecords({ 
        id: profile.id,
        name: profile.name,
        email: profile.email,
        role: profile.role as 'student' | 'hod' | 'principal' | 'admin',
        department_id: profile.department_id || '',
        department_name: profile.department_name,
        avatar: profile.profile_photo_url || '',
        rollNumber: profile.roll_number,
        employeeId: profile.employee_id,
        isActive: profile.is_active
      });
      
      // Mock student data with fee information for department
      const mockStudents: StudentFeeInfo[] = [
        {
          id: '1',
          name: 'Rajesh Kumar',
          rollNumber: 'CSE2021001',
          department: profile.department_name || 'CSE',
          totalFee: 120000,
          paidAmount: 120000,
          dueAmount: 0,
          dueDate: '2024-12-31',
          status: 'Paid',
          profilePhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face'
        },
        {
          id: '2',
          name: 'Priya Sharma',
          rollNumber: 'CSE2021002',
          department: profile.department_name || 'CSE',
          totalFee: 120000,
          paidAmount: 80000,
          dueAmount: 40000,
          dueDate: '2024-11-30',
          status: 'Partial',
          profilePhoto: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face'
        },
        {
          id: '3',
          name: 'Amit Patel',
          rollNumber: 'CSE2021003',
          department: profile.department_name || 'CSE',
          totalFee: 120000,
          paidAmount: 0,
          dueAmount: 120000,
          dueDate: '2024-10-15',
          status: 'Overdue',
          profilePhoto: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face'
        },
        {
          id: '4',
          name: 'Sneha Reddy',
          rollNumber: 'CSE2021004',
          department: profile.department_name || 'CSE',
          totalFee: 120000,
          paidAmount: 60000,
          dueAmount: 60000,
          dueDate: '2024-12-15',
          status: 'Pending',
          profilePhoto: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face'
        },
        {
          id: '5',
          name: 'Vikram Singh',
          rollNumber: 'CSE2021005',
          department: profile.department_name || 'CSE',
          totalFee: 120000,
          paidAmount: 0,
          dueAmount: 120000,
          dueDate: '2024-11-01',
          status: 'Overdue',
          profilePhoto: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face'
        }
      ];

      setStudents(mockStudents);

      // Calculate department statistics
      const totalStudents = mockStudents.length;
      const totalCollected = mockStudents.reduce((sum, student) => sum + student.paidAmount, 0);
      const totalOutstanding = mockStudents.reduce((sum, student) => sum + student.dueAmount, 0);
      const avgCollection = totalStudents > 0 ? Math.round((totalCollected / (totalCollected + totalOutstanding)) * 100) : 0;

      setDepartmentStats({
        totalStudents,
        totalCollected,
        totalOutstanding,
        avgCollection
      });

    } catch (error) {
      console.error('Error fetching department data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch department fee data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.rollNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || student.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const top10NonPaying = students
    .filter(student => student.dueAmount > 0)
    .sort((a, b) => b.dueAmount - a.dueAmount)
    .slice(0, 10);

  const stats = [
    {
      title: 'Department Students',
      value: departmentStats.totalStudents,
      icon: Users,
      color: 'blue' as const,
      trend: `${profile?.department_name || 'CSE'} Department`
    },
    {
      title: 'Total Collected',
      value: `₹${departmentStats.totalCollected.toLocaleString()}`,
      icon: TrendingUp,
      color: 'green' as const,
      trend: 'This academic year'
    },
    {
      title: 'Outstanding Amount',
      value: `₹${departmentStats.totalOutstanding.toLocaleString()}`,
      icon: AlertTriangle,
      color: 'red' as const,
      trend: 'Pending collection'
    },
    {
      title: 'Collection Rate',
      value: `${departmentStats.avgCollection}%`,
      icon: DollarSign,
      color: 'purple' as const,
      trend: 'Department average'
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading department data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold text-gray-800`}>
          HOD Dashboard - {profile?.department_name || 'Department'}
        </h1>
        <Button size={isMobile ? 'sm' : 'default'}>
          Generate Report
        </Button>
      </div>

      {/* Stats Grid */}
      <div className={`grid ${isMobile ? 'grid-cols-2' : 'grid-cols-1 md:grid-cols-4'} gap-4`}>
        {stats.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className={`flex ${isMobile ? 'flex-col space-y-4' : 'flex-row space-x-4'} items-center mb-6`}>
          <div className={`flex-1 ${isMobile ? 'w-full' : ''}`}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by name or roll number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className={`${isMobile ? 'w-full' : ''}`}>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 w-full"
            >
              <option value="all">All Status</option>
              <option value="paid">Paid</option>
              <option value="partial">Partial</option>
              <option value="pending">Pending</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>
        </div>

        {/* Students List */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">Department Students ({filteredStudents.length})</h3>
          {filteredStudents.map(student => (
            <div key={student.id} className="border border-gray-200 rounded-lg p-4">
              <div className={`flex ${isMobile ? 'flex-col space-y-3' : 'items-center justify-between'}`}>
                <div className="flex items-center space-x-4">
                  <img 
                    src={student.profilePhoto} 
                    alt={student.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <h4 className="font-medium text-gray-900">{student.name}</h4>
                    <p className="text-sm text-gray-600">{student.rollNumber}</p>
                  </div>
                </div>
                
                <div className={`grid ${isMobile ? 'grid-cols-2' : 'grid-cols-4'} gap-4 text-center`}>
                  <div>
                    <p className="text-sm text-gray-600">Total Fee</p>
                    <p className="font-medium">₹{student.totalFee.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Paid</p>
                    <p className="font-medium text-green-600">₹{student.paidAmount.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Due</p>
                    <p className="font-medium text-red-600">₹{student.dueAmount.toLocaleString()}</p>
                  </div>
                  <div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      student.status === 'Paid' ? 'bg-green-100 text-green-800' :
                      student.status === 'Partial' ? 'bg-yellow-100 text-yellow-800' :
                      student.status === 'Overdue' ? 'bg-red-100 text-red-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {student.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top 10 Non-Paying Students */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Top 10 Outstanding Fees</h3>
        <div className="space-y-3">
          {top10NonPaying.map((student, index) => (
            <div key={student.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                <img 
                  src={student.profilePhoto} 
                  alt={student.name}
                  className="w-8 h-8 rounded-full object-cover"
                />
                <div>
                  <p className="font-medium text-gray-900">{student.name}</p>
                  <p className="text-sm text-gray-600">{student.rollNumber}</p>
                </div>
              </div>
              <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
                ₹{student.dueAmount.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HODDashboard;
