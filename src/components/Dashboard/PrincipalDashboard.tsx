
import React, { useState, useEffect } from 'react';
import { TrendingUp, Users, Building, DollarSign, AlertTriangle, Calendar } from 'lucide-react';
import { Button } from '../ui/button';
import StatsCard from './StatsCard';
import { useAuth } from '../../contexts/SupabaseAuthContext';
import { useToast } from '../ui/use-toast';
import { RealFeeService } from '../../services/realFeeService';
import { useIsMobile } from '../../hooks/use-mobile';
import { supabase } from '../../integrations/supabase/client';

interface DepartmentFeeData {
  department_id: string;
  department_name: string;
  department_code: string;
  total_students: number;
  total_fees: number;
  total_collected: number;
  total_pending: number;
  collection_percentage: number;
}

interface TopDefaulter {
  name: string;
  roll_number: string;
  department: string;
  due_amount: number;
  profile_photo_url?: string;
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
  const [topDefaulters, setTopDefaulters] = useState<TopDefaulter[]>([]);

  useEffect(() => {
    if (user) {
      fetchInstitutionData();
    }
  }, [user]);

  const fetchInstitutionData = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Fetch department analytics
      const departmentAnalytics = await RealFeeService.getDepartmentAnalytics();
      
      // Transform department data
      const transformedDepartmentData: DepartmentFeeData[] = departmentAnalytics.map(dept => ({
        department_id: dept.department_id,
        department_name: dept.department_name,
        department_code: dept.department_code,
        total_students: Number(dept.total_students) || 0,
        total_fees: Number(dept.total_fees) || 0,
        total_collected: Number(dept.total_collected) || 0,
        total_pending: Number(dept.total_pending) || 0,
        collection_percentage: Number(dept.collection_percentage) || 0
      }));

      setDepartmentData(transformedDepartmentData);

      // Calculate institution statistics
      const totalStudents = transformedDepartmentData.reduce((sum, dept) => sum + dept.total_students, 0);
      const totalRevenue = transformedDepartmentData.reduce((sum, dept) => sum + dept.total_collected, 0);
      const totalOutstanding = transformedDepartmentData.reduce((sum, dept) => sum + dept.total_pending, 0);
      const avgCollectionRate = transformedDepartmentData.length > 0
        ? Math.round(transformedDepartmentData.reduce((sum, dept) => sum + dept.collection_percentage, 0) / transformedDepartmentData.length)
        : 0;

      setInstitutionStats({
        totalStudents,
        totalRevenue,
        totalOutstanding,
        avgCollectionRate
      });

      // Fetch top defaulters
      await fetchTopDefaulters();

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

  const fetchTopDefaulters = async () => {
    try {
      // Get students with highest pending amounts
      const { data: defaultersData, error } = await supabase
        .from('profiles')
        .select(`
          id,
          name,
          roll_number,
          profile_photo_url,
          departments!inner (code),
          fee_records!inner (
            final_amount,
            paid_amount,
            status
          )
        `)
        .eq('role', 'student')
        .eq('is_active', true)
        .in('fee_records.status', ['Pending', 'Overdue'])
        .order('roll_number');

      if (error) throw error;

      // Calculate due amounts and get top defaulters
      const defaultersWithAmounts = (defaultersData || [])
        .map((student: any) => {
          const totalDue = student.fee_records.reduce((sum: number, record: any) => {
            const due = (record.final_amount || 0) - (record.paid_amount || 0);
            return sum + Math.max(0, due);
          }, 0);

          return {
            name: student.name || 'N/A',
            roll_number: student.roll_number || 'N/A',
            department: student.departments?.code || 'N/A',
            due_amount: totalDue,
            profile_photo_url: student.profile_photo_url
          };
        })
        .filter((student: any) => student.due_amount > 0)
        .sort((a: any, b: any) => b.due_amount - a.due_amount)
        .slice(0, 5);

      setTopDefaulters(defaultersWithAmounts);
    } catch (error) {
      console.error('Error fetching top defaulters:', error);
    }
  };

  const stats = [
    {
      title: 'Total Students',
      value: institutionStats.totalStudents.toString(),
      icon: Users,
      color: 'blue' as const,
      trend: 'Across all departments'
    },
    {
      title: 'Total Revenue',
      value: `₹${Math.round(institutionStats.totalRevenue / 100000)}L`,
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
          {departmentData.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No department data available
            </div>
          ) : (
            departmentData.map((dept, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-6'} gap-4 items-center`}>
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Building className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{dept.department_name}</h4>
                      <p className="text-sm text-gray-600">{dept.total_students} students</p>
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-lg font-semibold text-gray-900">
                      ₹{Math.round(dept.total_fees / 100000)}L
                    </div>
                    <p className="text-xs text-gray-600">Total Fees</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-lg font-semibold text-green-600">
                      ₹{Math.round(dept.total_collected / 100000)}L
                    </div>
                    <p className="text-xs text-gray-600">Collected</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-lg font-semibold text-red-600">
                      ₹{Math.round(dept.total_pending / 100000)}L
                    </div>
                    <p className="text-xs text-gray-600">Outstanding</p>
                  </div>
                  
                  <div className="text-center">
                    <div className={`text-lg font-semibold ${
                      dept.collection_percentage >= 85 ? 'text-green-600' : 
                      dept.collection_percentage >= 75 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {Math.round(dept.collection_percentage)}%
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
            ))
          )}
        </div>
      </div>

      {/* Analytics Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Top Performing Departments</h3>
          <div className="space-y-3">
            {departmentData
              .sort((a, b) => b.collection_percentage - a.collection_percentage)
              .slice(0, 3)
              .map((dept, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                    <span className="font-medium text-gray-900">{dept.department_name}</span>
                  </div>
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                    {Math.round(dept.collection_percentage)}%
                  </span>
                </div>
              ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Top Institution Defaulters</h3>
          <div className="space-y-3">
            {topDefaulters.length === 0 ? (
              <div className="text-center py-4 text-gray-500">
                No defaulters found
              </div>
            ) : (
              topDefaulters.map((student, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                      {student.profile_photo_url ? (
                        <img 
                          src={student.profile_photo_url} 
                          alt={student.name}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-xs font-medium text-gray-600">
                          {student.name.charAt(0)}
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{student.name}</p>
                      <p className="text-sm text-gray-600">{student.roll_number} • {student.department}</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
                    ₹{Math.round(student.due_amount / 1000)}K
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
        <div className={`grid ${isMobile ? 'grid-cols-2' : 'grid-cols-4'} gap-4`}>
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
