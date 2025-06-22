
import React, { useState } from 'react';
import { CreditCard, Search, Filter, Plus, Download, Bell } from 'lucide-react';
import { Button } from '../ui/button';
import { mockStudents, mockFeeRecords } from '../../data/mockData';
import { FeeRecord, Student } from '../../types';

const FeeManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showAddFee, setShowAddFee] = useState(false);

  const filteredFees = mockFeeRecords.filter(fee => {
    const student = mockStudents.find(s => s.id === fee.studentId);
    const matchesSearch = student?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student?.rollNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || fee.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStudentName = (studentId: string) => {
    return mockStudents.find(s => s.id === studentId)?.name || 'Unknown';
  };

  const getStudentRoll = (studentId: string) => {
    return mockStudents.find(s => s.id === studentId)?.rollNumber || 'Unknown';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Paid': return 'bg-green-100 text-green-800';
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const totalAmount = filteredFees.reduce((sum, fee) => sum + fee.amount, 0);
  const paidAmount = filteredFees.filter(f => f.status === 'Paid').reduce((sum, fee) => sum + fee.amount, 0);
  const pendingAmount = filteredFees.filter(f => f.status === 'Pending').reduce((sum, fee) => sum + fee.amount, 0);
  const overdueAmount = filteredFees.filter(f => f.status === 'Overdue').reduce((sum, fee) => sum + fee.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-800">Fee Management</h2>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" className="flex items-center space-x-2">
            <Bell className="w-4 h-4" />
            <span>Send Reminders</span>
          </Button>
          <Button variant="outline" className="flex items-center space-x-2">
            <Download className="w-4 h-4" />
            <span>Export</span>
          </Button>
          <Button onClick={() => setShowAddFee(true)} className="flex items-center space-x-2">
            <Plus className="w-4 h-4" />
            <span>Add Fee</span>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Amount</p>
              <p className="text-2xl font-bold text-gray-800">₹{totalAmount.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <CreditCard className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Paid</p>
              <p className="text-2xl font-bold text-green-600">₹{paidAmount.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <CreditCard className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">₹{pendingAmount.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <CreditCard className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Overdue</p>
              <p className="text-2xl font-bold text-red-600">₹{overdueAmount.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <CreditCard className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search students..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="All">All Status</option>
              <option value="Paid">Paid</option>
              <option value="Pending">Pending</option>
              <option value="Overdue">Overdue</option>
            </select>
          </div>
        </div>

        {/* Fee Records Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fee Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredFees.map((fee) => (
                <tr key={fee.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="font-medium text-gray-900">{getStudentName(fee.studentId)}</div>
                      <div className="text-sm text-gray-500">{getStudentRoll(fee.studentId)}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {fee.feeType}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    ₹{fee.amount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(fee.dueDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(fee.status)}`}>
                      {fee.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">View</Button>
                      {fee.status !== 'Paid' && (
                        <Button size="sm">Mark Paid</Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default FeeManagement;
