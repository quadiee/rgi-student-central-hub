
import React, { useState, useEffect } from 'react';
import { TrendingUp, Users, Building, DollarSign, AlertTriangle, Calendar } from 'lucide-react';
import { Button } from '../ui/button';
import StatsCard from './StatsCard';
import { useAuth } from '../../contexts/SupabaseAuthContext';
import { useToast } from '../ui/use-toast';
import { RealFeeService } from '../../services/realFeeService';
import { useIsMobile } from '../../hooks/use-mobile';

interface DepartmentFeeData {
  name: string;
  students: number;
  totalFees: number;
  collected: number;
  outstanding: number;
  collectionRate: number;
}

const PrincipalDashboard: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [loading, setLoading] = useState(true);
  const [institutionStats, setInstitutionStats] = useState({
    totalStudents: 0,
    totalRevenue: 0,
    totalOutstanding: 0,
    avgCollectionRate: 0
  });

  const [departmentData, setDepartmentData] = useState<DepartmentFeeData[]>([]);
  const [topDefaulters, setTopDefaulters] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      fetchInstitutionData();
    }
  }, [user]);

  const fetchInstitutionData = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Mock institution-wide fee data
      const mockDepartmentData: DepartmentFeeData[] = [
        {
          name: 'Computer Science',
          students: 120,
          totalFees: 14400000,
          collected: 12240000,
          outstanding: 2160000,
          collectionRate: 85
        },
        {
          name: 'Electronics',
          students: 100,
          totalFees: 12000000,
          collected: 9600000,
          outstanding: 2400000,
          collectionRate: 80
        },
        {
          name: 'Mechanical',
          students: 90,
          totalFees: 10800000,
          collected: 9396000,
          outstanding: 1404000,
          collectionRate: 87
        },
        {
          name: 'Civil',
          students: 80,
          totalFees: 9600000,
          collected: 8352000,
          outstanding: 1248000,
          collectionRate: 87
        },
        {
          name: 'Electrical',
          students: 70,
          totalFees: 8400000,
          collected: 7308000,
          outstanding: 1092000,
          collectionRate: 87
        }
      ];

      setDepartmentData(mockDepartmentData);

      // Calculate institution statistics
      const totalStudents = mockDepartmentData.reduce((sum, dept) => sum + dept.students, 0);
      const totalRevenue = mockDepartmentData.reduce((sum, dept) => sum + dept.collected, 0);
      const totalOutstanding = mockDepartmentData.reduce((sum, dept) => sum + dept.outstanding, 0);
      const avgCollectionRate = Math.round(
        mockDepartmentData.reduce((sum, dept) => sum + dept.collectionRate, 0) / mockDepartmentData.length
      );

      setInstitutionStats({
        totalStudents,
        totalRevenue,
        totalOutstanding,
        avgCollectionRate
      });

      // Mock top defaulters across institution
      const mockDefaulters = [
        {
          name: 'Vikram Singh',
          rollNumber: 'CSE2021005',
          department: 'CSE',
          dueAmount: 120000,
          profilePhoto: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face'
        },
        {
          name: 'Rahul Gupta',
          rollNumber: 'ECE2021012',
          department: 'ECE',
          dueAmount: 115000,
          profilePhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face'
        },
        {
          name: 'Anita Verma',
          rollNumber: 'MECH2021008',
          department: 'MECH',
          dueAmount: 110000,
          profilePhoto: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face'
        }
      ];

      setTopDefaulters(mockDefaulters);

    } catch (error) {
      console.error('Error fetching institution data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch institution fee data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    {
      title: 'Total Students',
      value: institutionStats.totalStudents,
      icon: Users,
      color: 'blue' as const,
      trend: 'Across all departments'
    },
    {
      title: 'Total Revenue',
      value: `₹${Math.round(institutionStats.totalRevenue / 10000000)}Cr`,
      icon: TrendingUp,
      color: 'green' as const,
      trend: 'This academic year'
    },
    {
      title: 'Outstanding',
      value: `₹${Math.round(institutionStats.totalOutstanding / 100000)}L`,
      icon: AlertTriangle,
      color: 'red' as const,
      trend: 'Pending collection'
    },
    {
      title: 'Collection Rate',
      value: `${institutionStats.avgCollectionRate}%`,
      icon: DollarSign,
      color: 'purple' as const,
      trend: 'Institution average'
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading institution data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold text-gray-800`}>
          Principal Dashboard - RGCE
        </h1>
        <div className="flex space-x-2">
          <Button variant="outline" size={isMobile ? 'sm' : 'default'}>
            <Calendar className="w-4 h-4 mr-2" />
            Institution Report
          </Button>
          <Button size={isMobile ? 'sm' : 'default'}>
            Generate Analytics
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className={`grid ${isMobile ? 'grid-cols-2' : 'grid-cols-1 md:grid-cols-4'} gap-4`}>
        {stats.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      {/* Department Performance */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Department-wise Fee Performance</h3>
        <div className="space-y-4">
          {departmentData.map((dept, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-6'} gap-4 items-center`}>
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Building className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{dept.name}</h4>
                    <p className="text-sm text-gray-600">{dept.students} students</p>
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="text-lg font-semibold text-gray-900">
                    ₹{Math.round(dept.totalFees / 100000)}L
                  </div>
                  <p className="text-xs text-gray-600">Total Fees</p>
                </div>
                
                <div className="text-center">
                  <div className="text-lg font-semibold text-green-600">
                    ₹{Math.round(dept.collected / 100000)}L
                  </div>
                  <p className="text-xs text-gray-600">Collected</p>
                </div>
                
                <div className="text-center">
                  <div className="text-lg font-semibold text-red-600">
                    ₹{Math.round(dept.outstanding / 100000)}L
                  </div>
                  <p className="text-xs text-gray-600">Outstanding</p>
                </div>
                
                <div className="text-center">
                  <div className={`text-lg font-semibold ${
                    dept.collectionRate >= 85 ? 'text-green-600' : 
                    dept.collectionRate >= 75 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {dept.collectionRate}%
                  </div>
                  <p className="text-xs text-gray-600">Collection Rate</p>
                </div>
                
                <div className={`${isMobile ? 'mt-2' : ''}`}>
                  <Button size="sm" variant="outline" className={`${isMobile ? 'w-full' : ''}`}>
                    View Details
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Analytics Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Top Performing Departments</h3>
          <div className="space-y-3">
            {departmentData
              .sort((a, b) => b.collectionRate - a.collectionRate)
              .slice(0, 3)
              .map((dept, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                    <span className="font-medium text-gray-900">{dept.name}</span>
                  </div>
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                    {dept.collectionRate}%
                  </span>
                </div>
              ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Top Institution Defaulters</h3>
          <div className="space-y-3">
            {topDefaulters.map((student, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <img 
                    src={student.profilePhoto} 
                    alt={student.name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-medium text-gray-900">{student.name}</p>
                    <p className="text-sm text-gray-600">{student.rollNumber} • {student.department}</p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
                  ₹{Math.round(student.dueAmount / 1000)}K
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
        <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-4'} gap-4`}>
          <Button variant="outline" className="flex flex-col items-center p-4 h-auto">
            <Calendar className="w-6 h-6 mb-2" />
            <span>Monthly Report</span>
          </Button>
          <Button variant="outline" className="flex flex-col items-center p-4 h-auto">
            <AlertTriangle className="w-6 h-6 mb-2" />
            <span>Overdue Analysis</span>
          </Button>
          <Button variant="outline" className="flex flex-col items-center p-4 h-auto">
            <TrendingUp className="w-6 h-6 mb-2" />
            <span>Collection Trends</span>
          </Button>
          <Button variant="outline" className="flex flex-col items-center p-4 h-auto">
            <DollarSign className="w-6 h-6 mb-2" />
            <span>Revenue Analytics</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PrincipalDashboard;
