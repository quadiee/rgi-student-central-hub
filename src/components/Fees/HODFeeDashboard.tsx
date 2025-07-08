
import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Users, IndianRupee, AlertTriangle, RefreshCw, FileText } from 'lucide-react';
import { useAuth } from '../../contexts/SupabaseAuthContext';
import { Button } from '../ui/button';
import { useToast } from '../ui/use-toast';
import { SupabaseFeeService } from '../../services/supabaseFeeService';

interface FeeStats {
  totalStudents: number;
  totalRevenue: number;
  totalOutstanding: number;
  collectionRate: number;
  departmentCollected: number;
  departmentOutstanding: number;
}

const HODFeeDashboard: React.FC = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [stats, setStats] = useState<FeeStats | null>(null);
  const [loading, setLoading] = useState(true);

  const loadStats = async () => {
    if (!profile) return;
    
    try {
      setLoading(true);
      
      // Convert profile to User type for fee service
      const convertedUser = {
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
      };
      
      // Use department_name instead of department
      const departmentName = profile.department_name || 'Unknown';
      
      // Get fee records for the HOD's department
      const feeRecords = await SupabaseFeeService.getFeeRecords(convertedUser, {
        department: departmentName
      });
      
      // Calculate statistics
      const totalStudents = feeRecords.length;
      const totalRevenue = feeRecords.reduce((sum, record) => sum + (record.paidAmount || 0), 0);
      const totalOutstanding = feeRecords.reduce((sum, record) => sum + (record.amount - (record.paidAmount || 0)), 0);
      const collectionRate = totalRevenue > 0 ? (totalRevenue / (totalRevenue + totalOutstanding)) * 100 : 0;
      
      setStats({
        totalStudents,
        totalRevenue,
        totalOutstanding,
        collectionRate,
        departmentCollected: totalRevenue,
        departmentOutstanding: totalOutstanding
      });
    } catch (error) {
      console.error('Error loading HOD fee stats:', error);
      toast({
        title: "Error",
        description: "Failed to load fee statistics",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, [profile]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Department Fee Dashboard</h2>
          <p className="text-gray-600">Overview of fee collection for {profile?.department_name}</p>
        </div>
        <Button onClick={loadStats} disabled={loading} variant="outline">
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Students</p>
              <p className="text-2xl font-bold text-blue-600">{stats.totalStudents}</p>
            </div>
            <Users className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Collected</p>
              <p className="text-2xl font-bold text-green-600">₹{stats.totalRevenue.toLocaleString()}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Outstanding</p>
              <p className="text-2xl font-bold text-orange-600">₹{stats.totalOutstanding.toLocaleString()}</p>
            </div>
            <IndianRupee className="w-8 h-8 text-orange-500" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Collection Rate</p>
              <p className="text-2xl font-bold text-purple-600">{stats.collectionRate.toFixed(1)}%</p>
            </div>
            <FileText className="w-8 h-8 text-purple-500" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HODFeeDashboard;
