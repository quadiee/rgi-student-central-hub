
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { 
  Search, 
  Filter, 
  Users, 
  GraduationCap, 
  DollarSign, 
  Award,
  ChevronRight,
  Download,
  Eye
} from 'lucide-react';
import { cn } from '../../lib/utils';
import MobileDataCard from './MobileDataCard';

interface ChairmanStudentManagementProps {
  className?: string;
}

const ChairmanStudentManagement: React.FC<ChairmanStudentManagementProps> = ({ className }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  // Mock data - replace with real data from hooks
  const studentStats = {
    totalStudents: 2456,
    activeStudents: 2398,
    byDepartment: [
      { dept: 'CSE', count: 612, active: 608 },
      { dept: 'ECE', count: 487, active: 485 },
      { dept: 'EEE', count: 423, active: 420 },
      { dept: 'MECH', count: 398, active: 396 },
      { dept: 'CIVIL', count: 356, active: 354 },
      { dept: 'IT', count: 180, active: 178 }
    ],
    feeStatus: {
      fullyPaid: 1456,
      partiallyPaid: 542,
      unpaid: 458
    },
    scholarshipStudents: 342
  };

  const mockStudents = [
    {
      id: '1',
      name: 'Rajesh Kumar',
      rollNumber: '20CS001',
      department: 'CSE',
      year: 3,
      semester: 6,
      feeStatus: 'Fully Paid',
      totalFees: 85000,
      paidAmount: 85000,
      scholarshipAmount: 15000,
      hasScholarship: true
    },
    {
      id: '2',
      name: 'Priya Sharma',
      rollNumber: '20EC023',
      department: 'ECE',
      year: 2,
      semester: 4,
      feeStatus: 'Partially Paid',
      totalFees: 82000,
      paidAmount: 45000,
      scholarshipAmount: 0,
      hasScholarship: false
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Fully Paid':
        return 'text-green-600 bg-green-100';
      case 'Partially Paid':
        return 'text-yellow-600 bg-yellow-100';
      case 'Unpaid':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className={cn("p-4 space-y-6", className)}>
      {/* Header with View-Only indicator */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Student Overview
          </h2>
          <div className="flex items-center space-x-2 mt-1">
            <Eye className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-500">View-Only Access</span>
          </div>
        </div>
        <Button variant="outline" size="sm" className="text-purple-600 border-purple-200">
          <Download className="w-4 h-4 mr-2" />
          Export
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Students</p>
                <p className="text-2xl font-bold text-blue-600">{studentStats.totalStudents}</p>
                <p className="text-xs text-gray-500">{studentStats.activeStudents} active</p>
              </div>
              <Users className="w-8 h-8 text-blue-600 opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Scholarship Students</p>
                <p className="text-2xl font-bold text-emerald-600">{studentStats.scholarshipStudents}</p>
                <p className="text-xs text-gray-500">
                  {((studentStats.scholarshipStudents / studentStats.totalStudents) * 100).toFixed(1)}% of total
                </p>
              </div>
              <Award className="w-8 h-8 text-emerald-600 opacity-80" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Department Breakdown */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <GraduationCap className="w-5 h-5 text-purple-600" />
            <span>Department-wise Distribution</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {studentStats.byDepartment.map((dept) => (
              <div key={dept.dept} className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-100">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-600 flex items-center justify-center">
                    <span className="text-white font-bold text-sm">{dept.dept}</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{dept.dept} Department</p>
                    <p className="text-sm text-gray-600">{dept.active} active students</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-purple-600">{dept.count}</p>
                  <p className="text-xs text-gray-500">Total</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Fee Status Overview */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <DollarSign className="w-5 h-5 text-green-600" />
            <span>Fee Status Overview</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center p-3 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200">
                <p className="text-lg font-bold text-green-600">{studentStats.feeStatus.fullyPaid}</p>
                <p className="text-xs text-gray-600">Fully Paid</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200">
                <p className="text-lg font-bold text-yellow-600">{studentStats.feeStatus.partiallyPaid}</p>
                <p className="text-xs text-gray-600">Partial</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-gradient-to-r from-red-50 to-pink-50 border border-red-200">
                <p className="text-lg font-bold text-red-600">{studentStats.feeStatus.unpaid}</p>
                <p className="text-xs text-gray-600">Unpaid</p>
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-3 border border-gray-200">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">Collection Rate</span>
                <span className="text-lg font-bold text-purple-600">
                  {((studentStats.feeStatus.fullyPaid / studentStats.totalStudents) * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search and Filter */}
      <div className="space-y-3">
        <div className="flex space-x-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search students..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline" size="icon">
            <Filter className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Student List */}
      <div className="space-y-3">
        <h3 className="font-semibold text-gray-800">Recent Students</h3>
        {mockStudents.map((student) => (
          <MobileDataCard
            key={student.id}
            title={student.name}
            subtitle={`${student.rollNumber} • ${student.department} • Year ${student.year}`}
            status={{
              label: student.feeStatus,
              variant: student.feeStatus === 'Fully Paid' ? 'default' : 
                      student.feeStatus === 'Partially Paid' ? 'secondary' : 'destructive'
            }}
            data={[
              {
                label: 'Total Fees',
                value: `₹${student.totalFees.toLocaleString()}`,
                icon: DollarSign,
                color: 'text-blue-600'
              },
              {
                label: 'Paid Amount',
                value: `₹${student.paidAmount.toLocaleString()}`,
                icon: DollarSign,
                color: 'text-green-600'
              },
              {
                label: 'Semester',
                value: student.semester.toString(),
                icon: GraduationCap,
                color: 'text-purple-600'
              },
              {
                label: 'Scholarship',
                value: student.hasScholarship ? `₹${student.scholarshipAmount.toLocaleString()}` : 'None',
                icon: Award,
                color: student.hasScholarship ? 'text-emerald-600' : 'text-gray-400'
              }
            ]}
            actions={[
              {
                label: 'View Details',
                icon: Eye,
                onClick: () => console.log('View student:', student.id)
              }
            ]}
            onClick={() => console.log('Student clicked:', student.id)}
            className="hover:shadow-md transition-shadow"
          />
        ))}
      </div>

      {/* Load More */}
      <div className="text-center">
        <Button variant="outline" className="w-full">
          Load More Students
        </Button>
      </div>
    </div>
  );
};

export default ChairmanStudentManagement;
