import React, { useState, useEffect } from 'react';
import { Users, TrendingUp, AlertTriangle, FileText, Filter } from 'lucide-react';
import { Button } from '../ui/button';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../ui/use-toast';
import { FeeService } from '../../services/feeService';
import { useIsMobile } from '../../hooks/use-mobile';

const HODFeeDashboard: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedClass, setSelectedClass] = useState('all');

  // Mock data for HOD dashboard
  const departmentStats = {
    totalStudents: 240,
    totalCollected: 8500000,
    totalPending: 1200000,
    overdue: 85000,
    collectionRate: 87.6
  };

  const classWiseData = [
    { class: '1st Year - A', students: 40, collected: 1800000, pending: 200000, rate: 90 },
    { class: '1st Year - B', students: 38, collected: 1710000, pending: 190000, rate: 90 },
    { class: '2nd Year - A', students: 42, collected: 1890000, pending: 210000, rate: 90 },
    { class: '2nd Year - B', students: 40, collected: 1800000, pending: 200000, rate: 90 },
    { class: '3rd Year - A', students: 38, collected: 1710000, pending: 190000, rate: 90 },
    { class: '4th Year - A', students: 42, collected: 1890000, pending: 210000, rate: 90 }
  ];

  const recentTransactions = [
    { id: 1, student: 'John Doe', rollNo: '21CSE001', amount: 50000, type: 'Tuition Fee', status: 'Success' },
    { id: 2, student: 'Jane Smith', rollNo: '21CSE002', amount: 5000, type: 'Lab Fee', status: 'Success' },
    { id: 3, student: 'Bob Wilson', rollNo: '21CSE003', amount: 2000, type: 'Library Fee', status: 'Pending' },
    { id: 4, student: 'Alice Brown', rollNo: '21CSE004', amount: 50000, type: 'Tuition Fee', status: 'Success' },
    { id: 5, student: 'Charlie Davis', rollNo: '21CSE005', amount: 3000, type: 'Development Fee', status: 'Failed' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold text-gray-800`}>
          {user?.department_id} Department Fee Management
        </h2>
        <Button variant="outline" size={isMobile ? 'sm' : 'default'}>
          <FileText className="w-4 h-4 mr-2" />
          Generate Report
        </Button>
      </div>

      {/* Department Stats */}
      <div className={`grid ${isMobile ? 'grid-cols-2' : 'grid-cols-1 md:grid-cols-4'} gap-4`}>
        <div className="bg-white rounded-xl shadow-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Students</p>
              <p className={`${isMobile ? 'text-lg' : 'text-2xl'} font-bold text-blue-600`}>
                {departmentStats.totalStudents}
              </p>
            </div>
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className={`${isMobile ? 'w-4 h-4' : 'w-6 h-6'} text-blue-600`} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Collected</p>
              <p className={`${isMobile ? 'text-lg' : 'text-2xl'} font-bold text-green-600`}>
                ₹{(departmentStats.totalCollected / 1000000).toFixed(1)}M
              </p>
            </div>
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className={`${isMobile ? 'w-4 h-4' : 'w-6 h-6'} text-green-600`} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Pending</p>
              <p className={`${isMobile ? 'text-lg' : 'text-2xl'} font-bold text-yellow-600`}>
                ₹{(departmentStats.totalPending / 1000000).toFixed(1)}M
              </p>
            </div>
            <div className="p-2 bg-yellow-100 rounded-lg">
              <AlertTriangle className={`${isMobile ? 'w-4 h-4' : 'w-6 h-6'} text-yellow-600`} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Collection Rate</p>
              <p className={`${isMobile ? 'text-lg' : 'text-2xl'} font-bold text-purple-600`}>
                {departmentStats.collectionRate}%
              </p>
            </div>
            <div className="p-2 bg-purple-100 rounded-lg">
              <TrendingUp className={`${isMobile ? 'w-4 h-4' : 'w-6 h-6'} text-purple-600`} />
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-xl shadow-lg p-1">
        <div className={`flex ${isMobile ? 'overflow-x-auto' : 'flex-wrap'} gap-1`}>
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'classwise', label: 'Class-wise' },
            { id: 'students', label: 'Students' },
            { id: 'transactions', label: 'Transactions' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <span className={`font-medium ${isMobile ? 'text-sm' : ''}`}>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'classwise' && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Class-wise Fee Collection</h3>
            <select 
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="all">All Classes</option>
              {classWiseData.map(cls => (
                <option key={cls.class} value={cls.class}>{cls.class}</option>
              ))}
            </select>
          </div>

          {isMobile ? (
            <div className="space-y-4">
              {classWiseData.map(cls => (
                <div key={cls.class} className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3">{cls.class}</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Students:</span>
                      <p className="font-medium">{cls.students}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Collection Rate:</span>
                      <p className="font-medium text-green-600">{cls.rate}%</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Collected:</span>
                      <p className="font-medium">₹{(cls.collected / 100000).toFixed(1)}L</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Pending:</span>
                      <p className="font-medium text-yellow-600">₹{(cls.pending / 100000).toFixed(1)}L</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Class</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Students</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Collected</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pending</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rate</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {classWiseData.map(cls => (
                    <tr key={cls.class} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {cls.class}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {cls.students}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">
                        ₹{(cls.collected / 100000).toFixed(1)}L
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-yellow-600 font-medium">
                        ₹{(cls.pending / 100000).toFixed(1)}L
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          cls.rate >= 90 ? 'bg-green-100 text-green-800' :
                          cls.rate >= 75 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {cls.rate}%
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <Button size="sm" variant="outline">
                          View Details
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'transactions' && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Transactions</h3>
          
          {isMobile ? (
            <div className="space-y-4">
              {recentTransactions.map(txn => (
                <div key={txn.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">{txn.student}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      txn.status === 'Success' ? 'bg-green-100 text-green-800' :
                      txn.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {txn.status}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    <p>Roll No: {txn.rollNo}</p>
                    <p>Amount: ₹{txn.amount.toLocaleString()}</p>
                    <p>Type: {txn.type}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fee Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentTransactions.map(txn => (
                    <tr key={txn.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{txn.student}</div>
                        <div className="text-sm text-gray-500">{txn.rollNo}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ₹{txn.amount.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {txn.type}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          txn.status === 'Success' ? 'bg-green-100 text-green-800' :
                          txn.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {txn.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default HODFeeDashboard;