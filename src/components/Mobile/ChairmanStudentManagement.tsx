import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/SupabaseAuthContext';
import { supabase } from '../../integrations/supabase/client';
import { Student } from '../../types/user-student-fees';
import { MobileDataCard } from '../Mobile/MobileDataCard';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Users, Building, CheckCircle, TrendingUp, Award, Search, RefreshCw, DollarSign, AlertTriangle, Calendar } from 'lucide-react';

interface DepartmentStats {
  id: string;
  name: string;
  code: string;
  studentCount: number;
}

interface StudentStats {
  totalStudents: number;
  totalDepartments: number;
  excellentAttendance: number;
  criticalAttendance: number;
  avgAttendance: number;
  topPerformers: number;
  departmentStats: DepartmentStats[];
}

const useStudentStats = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<StudentStats>({
    totalStudents: 0,
    totalDepartments: 0,
    excellentAttendance: 0,
    criticalAttendance: 0,
    avgAttendance: 0,
    topPerformers: 0,
    departmentStats: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      // Fetch total students
      const { count: totalStudents, error: totalStudentsError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact' })
        .eq('role', 'student');

      if (totalStudentsError) throw totalStudentsError;

      // Fetch total departments
      const { count: totalDepartments, error: totalDepartmentsError } = await supabase
        .from('departments')
        .select('*', { count: 'exact' });

      if (totalDepartmentsError) throw totalDepartmentsError;

      // Fetch department-wise student counts
      const { data: departmentStats, error: departmentStatsError } = await supabase
        .from('departments')
        .select('id, name, code')
        .order('name', { ascending: true });

      if (departmentStatsError) throw departmentStatsError;

      const departmentStatsWithCounts = await Promise.all(
        departmentStats.map(async (dept) => {
          const { count, error } = await supabase
            .from('profiles')
            .select('*', { count: 'exact' })
            .eq('department_id', dept.id)
            .eq('role', 'student');

          if (error) {
            console.error(`Error fetching student count for department ${dept.name}:`, error);
            return { ...dept, studentCount: 0 };
          }

          return { ...dept, studentCount: count || 0 };
        })
      );

      // Mock data for attendance and performance
      const excellentAttendance = Math.floor(Math.random() * 50) + 50;
      const criticalAttendance = Math.floor(Math.random() * 10);
      const avgAttendance = Math.floor(Math.random() * 20) + 70;
      const topPerformers = Math.floor(Math.random() * 20) + 5;

      setStats({
        totalStudents: totalStudents || 0,
        totalDepartments: totalDepartments || 0,
        excellentAttendance,
        criticalAttendance,
        avgAttendance,
        topPerformers,
        departmentStats: departmentStatsWithCounts
      });

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch stats');
      console.error('Error fetching student stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [user]);

  return { stats, loading, error, refetch: fetchStats };
};

import StudentFeeScholarshipDetails from './StudentFeeScholarshipDetails';

const ChairmanStudentManagement: React.FC = () => {
  const { user } = useAuth();
  const { stats, loading, error, refetch: fetchStats } = useStudentStats();
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'fees' | 'performance'>('name');

  const mockStudents: Student[] = [
    {
      id: '1',
      name: 'Alice Johnson',
      rollNumber: 'STU001',
      course: 'B.Tech',
      year: 3,
      semester: 6,
      email: 'alice.j@example.com',
      phone: '9876543210',
      department: 'Computer Science',
      totalFees: 50000,
      paidAmount: 30000,
      dueAmount: 20000,
      feeStatus: 'Partial'
    },
    {
      id: '2',
      name: 'Bob Williams',
      rollNumber: 'STU002',
      course: 'MBA',
      year: 2,
      semester: 4,
      email: 'bob.w@example.com',
      phone: '8765432109',
      department: 'Business Admin',
      totalFees: 75000,
      paidAmount: 75000,
      dueAmount: 0,
      feeStatus: 'Paid'
    },
    {
      id: '3',
      name: 'Charlie Brown',
      rollNumber: 'STU003',
      course: 'B.Arch',
      year: 4,
      semester: 8,
      email: 'charlie.b@example.com',
      phone: '7654321098',
      department: 'Architecture',
      totalFees: 60000,
      paidAmount: 40000,
      dueAmount: 20000,
      feeStatus: 'Partial'
    },
    {
      id: '4',
      name: 'Diana Miller',
      rollNumber: 'STU004',
      course: 'M.Sc',
      year: 1,
      semester: 2,
      email: 'diana.m@example.com',
      phone: '6543210987',
      department: 'Physics',
      totalFees: 45000,
      paidAmount: 0,
      dueAmount: 45000,
      feeStatus: 'Pending'
    },
    {
      id: '5',
      name: 'Ethan Davis',
      rollNumber: 'STU005',
      course: 'BBA',
      year: 2,
      semester: 4,
      email: 'ethan.d@example.com',
      phone: '5432109876',
      department: 'Business Admin',
      totalFees: 55000,
      paidAmount: 55000,
      dueAmount: 0,
      feeStatus: 'Paid'
    },
    {
      id: '6',
      name: 'Fiona White',
      rollNumber: 'STU006',
      course: 'M.Tech',
      year: 2,
      semester: 4,
      email: 'fiona.w@example.com',
      phone: '4321098765',
      department: 'Computer Science',
      totalFees: 80000,
      paidAmount: 60000,
      dueAmount: 20000,
      feeStatus: 'Partial'
    },
    {
      id: '7',
      name: 'George Black',
      rollNumber: 'STU007',
      course: 'B.Com',
      year: 3,
      semester: 6,
      email: 'george.b@example.com',
      phone: '3210987654',
      department: 'Commerce',
      totalFees: 40000,
      paidAmount: 40000,
      dueAmount: 0,
      feeStatus: 'Paid'
    },
    {
      id: '8',
      name: 'Hannah Green',
      rollNumber: 'STU008',
      course: 'M.A',
      year: 1,
      semester: 2,
      email: 'hannah.g@example.com',
      phone: '2109876543',
      department: 'English',
      totalFees: 35000,
      paidAmount: 15000,
      dueAmount: 20000,
      feeStatus: 'Partial'
    },
    {
      id: '9',
      name: 'Isaac Blue',
      rollNumber: 'STU009',
      course: 'B.Sc',
      year: 2,
      semester: 4,
      email: 'isaac.b@example.com',
      phone: '1098765432',
      department: 'Mathematics',
      totalFees: 42000,
      paidAmount: 42000,
      dueAmount: 0,
      feeStatus: 'Paid'
    },
    {
      id: '10',
      name: 'Julia Red',
      rollNumber: 'STU010',
      course: 'Ph.D',
      year: 3,
      semester: 6,
      email: 'julia.r@example.com',
      phone: '9988776655',
      department: 'Biology',
      totalFees: 90000,
      paidAmount: 70000,
      dueAmount: 20000,
      feeStatus: 'Partial'
    }
  ];

  const filterStudents = (students: Student[]) => {
    return students.filter(student =>
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (student.rollNumber && student.rollNumber.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (student.department && student.department.toLowerCase().includes(searchQuery.toLowerCase()))
    ).sort((a, b) => {
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      } else if (sortBy === 'fees') {
        const dueA = a.dueAmount || 0;
        const dueB = b.dueAmount || 0;
        return dueB - dueA;
      } else if (sortBy === 'performance') {
        return 0;
      }
      return 0;
    });
  };

  const handleStudentClick = (student: Student) => {
    setSelectedStudent(student);
    setShowDetails(true);
  };

  const handleBackToList = () => {
    setShowDetails(false);
    setSelectedStudent(null);
  };

  const filteredStudents = filterStudents(mockStudents);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading student records...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8">
        <p className="text-red-600">Error: {error}</p>
      </div>
    );
  }

  if (showDetails && selectedStudent) {
    return (
      <StudentFeeScholarshipDetails
        student={selectedStudent}
        onBack={handleBackToList}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Total Students</p>
              <p className="text-2xl font-bold">{stats.totalStudents.toLocaleString()}</p>
            </div>
            <Users className="w-8 h-8 text-blue-200" />
          </div>
          <div className="mt-2 flex items-center text-xs text-blue-100">
            <Building className="w-3 h-3 mr-1" />
            <span>{stats.totalDepartments} Departments</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Excellent Attendance</p>
              <p className="text-2xl font-bold">{stats.excellentAttendance}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-200" />
          </div>
          <div className="mt-2 text-xs text-green-100">
            <span>{stats.criticalAttendance} need attention</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100 text-sm">Avg Attendance</p>
              <p className="text-2xl font-bold">{stats.avgAttendance}%</p>
            </div>
            <TrendingUp className="w-8 h-8 text-yellow-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Top Performers</p>
              <p className="text-2xl font-bold">{stats.topPerformers}</p>
            </div>
            <Award className="w-8 h-8 text-purple-200" />
          </div>
        </div>
      </div>

      {/* Search and Sort Controls */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search students..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchStats}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm"
          >
            <option value="name">Name</option>
            <option value="fees">Fee Status</option>
            <option value="performance">Performance</option>
          </select>
        </div>
      </div>

      {/* Department Statistics */}
      {stats.departmentStats && stats.departmentStats.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Building className="w-5 h-5 mr-2 text-blue-600" />
              Department Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {stats.departmentStats.slice(0, 4).map((dept) => (
                <div key={dept.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-sm">{dept.name}</p>
                    <p className="text-xs text-gray-500">{dept.code}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-blue-600">{dept.studentCount}</p>
                    <p className="text-xs text-gray-500">students</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Student List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <Users className="w-5 h-5 mr-2 text-green-600" />
            Student Records
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredStudents.slice(0, 10).map((student) => (
              <MobileDataCard
                key={student.id}
                title={student.name}
                subtitle={`${student.rollNumber} • ${student.course}`}
                status={{
                  label: student.feeStatus || 'Pending',
                  variant: student.feeStatus === 'Paid' ? 'default' : 'destructive'
                }}
                data={[
                  {
                    label: 'Department',
                    value: student.department || 'N/A',
                    icon: Building,
                    color: 'text-blue-500'
                  },
                  {
                    label: 'Year/Sem',
                    value: `${student.year}/${student.semester}`,
                    icon: Calendar,
                    color: 'text-green-500'
                  },
                  {
                    label: 'Total Fees',
                    value: student.totalFees ? `₹${student.totalFees.toLocaleString()}` : 'N/A',
                    icon: DollarSign,
                    color: 'text-purple-500'
                  },
                  {
                    label: 'Due Amount',
                    value: student.dueAmount ? `₹${student.dueAmount.toLocaleString()}` : '₹0',
                    icon: AlertTriangle,
                    color: student.dueAmount && student.dueAmount > 0 ? 'text-red-500' : 'text-green-500'
                  }
                ]}
                onClick={() => handleStudentClick(student)}
                priority={student.dueAmount && student.dueAmount > 0 ? 'high' : 'medium'}
              />
            ))}
            
            {filteredStudents.length > 10 && (
              <div className="text-center py-4">
                <p className="text-sm text-gray-500">
                  Showing 10 of {filteredStudents.length} students
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ChairmanStudentManagement;
