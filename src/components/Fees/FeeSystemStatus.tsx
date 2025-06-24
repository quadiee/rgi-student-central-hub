
import React, { useState, useEffect } from 'react';
import { Database, Users, CreditCard, AlertCircle, CheckCircle } from 'lucide-react';
import { supabase } from '../../integrations/supabase/client';

interface SystemStatus {
  totalUsers: number;
  activeStudents: number;
  feeStructures: number;
  feeRecords: number;
  paymentTransactions: number;
  pendingPayments: number;
  overduePayments: number;
  systemHealth: 'healthy' | 'warning' | 'error';
}

const FeeSystemStatus: React.FC = () => {
  const [status, setStatus] = useState<SystemStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSystemStatus();
    
    // Refresh status every 30 seconds
    const interval = setInterval(loadSystemStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadSystemStatus = async () => {
    try {
      // Get user counts
      const { data: invitations } = await supabase
        .from('user_invitations')
        .select('role')
        .eq('is_active', true);

      const { data: students } = await supabase
        .from('profiles')
        .select('id')
        .eq('role', 'student')
        .eq('is_active', true);

      // Get fee structure count
      const { data: feeStructures } = await supabase
        .from('fee_structures')
        .select('id')
        .eq('is_active', true);

      // Get fee records count
      const { data: feeRecords } = await supabase
        .from('fee_records')
        .select('id, status');

      // Get payment transactions count
      const { data: payments } = await supabase
        .from('payment_transactions')
        .select('id, status');

      // Calculate metrics
      const totalUsers = invitations?.length || 0;
      const activeStudents = students?.length || 0;
      const totalFeeStructures = feeStructures?.length || 0;
      const totalFeeRecords = feeRecords?.length || 0;
      const totalPayments = payments?.length || 0;
      
      const pendingPayments = feeRecords?.filter(fr => fr.status === 'Pending').length || 0;
      const overduePayments = feeRecords?.filter(fr => fr.status === 'Overdue').length || 0;

      // Determine system health
      let systemHealth: 'healthy' | 'warning' | 'error' = 'healthy';
      if (totalFeeStructures === 0 || activeStudents === 0) {
        systemHealth = 'warning';
      }
      if (totalUsers === 0) {
        systemHealth = 'error';
      }

      setStatus({
        totalUsers,
        activeStudents,
        feeStructures: totalFeeStructures,
        feeRecords: totalFeeRecords,
        paymentTransactions: totalPayments,
        pendingPayments,
        overduePayments,
        systemHealth
      });

    } catch (error) {
      console.error('Error loading system status:', error);
      setStatus({
        totalUsers: 0,
        activeStudents: 0,
        feeStructures: 0,
        feeRecords: 0,
        paymentTransactions: 0,
        pendingPayments: 0,
        overduePayments: 0,
        systemHealth: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-2">
            <div className="h-3 bg-gray-200 rounded"></div>
            <div className="h-3 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  const getHealthIcon = () => {
    switch (status?.systemHealth) {
      case 'healthy':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-600" />;
    }
  };

  const getHealthColor = () => {
    switch (status?.systemHealth) {
      case 'healthy':
        return 'text-green-800 bg-green-50 border-green-200';
      case 'warning':
        return 'text-yellow-800 bg-yellow-50 border-yellow-200';
      case 'error':
        return 'text-red-800 bg-red-50 border-red-200';
      default:
        return 'text-gray-800 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Database className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-800">Fee System Status</h3>
        </div>
        <div className={`flex items-center space-x-2 px-3 py-1 rounded-lg border ${getHealthColor()}`}>
          {getHealthIcon()}
          <span className="text-sm font-medium capitalize">{status?.systemHealth}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-center space-x-2 mb-1">
            <Users className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-800">Total Users</span>
          </div>
          <div className="text-2xl font-bold text-blue-900">{status?.totalUsers}</div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="flex items-center space-x-2 mb-1">
            <Users className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium text-green-800">Active Students</span>
          </div>
          <div className="text-2xl font-bold text-green-900">{status?.activeStudents}</div>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
          <div className="flex items-center space-x-2 mb-1">
            <Database className="w-4 h-4 text-purple-600" />
            <span className="text-sm font-medium text-purple-800">Fee Records</span>
          </div>
          <div className="text-2xl font-bold text-purple-900">{status?.feeRecords}</div>
        </div>

        <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
          <div className="flex items-center space-x-2 mb-1">
            <CreditCard className="w-4 h-4 text-orange-600" />
            <span className="text-sm font-medium text-orange-800">Transactions</span>
          </div>
          <div className="text-2xl font-bold text-orange-900">{status?.paymentTransactions}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
          <div className="text-sm font-medium text-gray-600 mb-1">Fee Structures</div>
          <div className="text-xl font-bold text-gray-800">{status?.feeStructures}</div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <div className="text-sm font-medium text-yellow-600 mb-1">Pending Payments</div>
          <div className="text-xl font-bold text-yellow-800">{status?.pendingPayments}</div>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <div className="text-sm font-medium text-red-600 mb-1">Overdue Payments</div>
          <div className="text-xl font-bold text-red-800">{status?.overduePayments}</div>
        </div>
      </div>

      <div className="mt-4 text-xs text-gray-500">
        Last updated: {new Date().toLocaleTimeString()} • Refreshes every 30 seconds
      </div>
    </div>
  );
};

export default FeeSystemStatus;
