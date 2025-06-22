
import React, { useState } from 'react';
import { DollarSign, CreditCard, AlertTriangle, CheckCircle, Calendar, Search, Filter } from 'lucide-react';
import { Button } from '../ui/button';
import { mockStudents } from '../../data/mockData';
import { useIsMobile } from '../../hooks/use-mobile';

const FeeManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const isMobile = useIsMobile();

  // Mock fee data
  const feeStructure = [
    { category: 'Tuition Fee', amount: 50000, dueDate: '2024-07-15' },
    { category: 'Lab Fee', amount: 5000, dueDate: '2024-07-15' },
    { category: 'Library Fee', amount: 2000, dueDate: '2024-07-15' },
    { category: 'Development Fee', amount: 3000, dueDate: '2024-07-15' }
  ];

  const totalFees = feeStructure.reduce((sum, fee) => sum + fee.amount, 0);
  const paidStudents = Math.floor(mockStudents.length * 0.7);
  const pendingStudents = mockStudents.length - paidStudents;
  const overdueStudents = Math.floor(mockStudents.length * 0.1);

  const studentFeeStatus = mockStudents.map(student => ({
    ...student,
    totalDue: totalFees,
    paid: Math.random() > 0.3 ? totalFees : Math.floor(totalFees * Math.random()),
    status: Math.random() > 0.3 ? 'Paid' : Math.random() > 0.5 ? 'Partial' : 'Overdue',
    lastPayment: '2024-06-15'
  }));

  const filteredStudents = studentFeeStatus.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.rollNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold text-gray-800`}>
          Fee Management
        </h2>
        <div className="flex space-x-2">
          <Button variant="outline" size={isMobile ? 'sm' : 'default'}>
            <Calendar className="w-4 h-4 mr-2" />
            Generate Report
          </Button>
          <Button size={isMobile ? 'sm' : 'default'}>
            <CreditCard className="w-4 h-4 mr-2" />
            Process Payment
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className={`grid ${isMobile ? 'grid-cols-2' : 'grid-cols-1 md:grid-cols-4'} gap-4`}>
        <div className="bg-white rounded-xl shadow-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Collection</p>
              <p className={`${isMobile ? 'text-lg' : 'text-2xl'} font-bold text-green-600`}>
                ₹{(paidStudents * totalFees).toLocaleString()}
              </p>
            </div>
            <div className="p-2 bg-green-100 rounded-lg">
              <CreditCard className={`${isMobile ? 'w-4 h-4' : 'w-6 h-6'} text-green-600`} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Paid Students</p>
              <p className={`${isMobile ? 'text-lg' : 'text-2xl'} font-bold text-blue-600`}>{paidStudents}</p>
            </div>
            <div className="p-2 bg-blue-100 rounded-lg">
              <CheckCircle className={`${isMobile ? 'w-4 h-4' : 'w-6 h-6'} text-blue-600`} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Pending</p>
              <p className={`${isMobile ? 'text-lg' : 'text-2xl'} font-bold text-yellow-600`}>{pendingStudents}</p>
            </div>
            <div className="p-2 bg-yellow-100 rounded-lg">
              <DollarSign className={`${isMobile ? 'w-4 h-4' : 'w-6 h-6'} text-yellow-600`} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Overdue</p>
              <p className={`${isMobile ? 'text-lg' : 'text-2xl'} font-bold text-red-600`}>{overdueStudents}</p>
            </div>
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className={`${isMobile ? 'w-4 h-4' : 'w-6 h-6'} text-red-600`} />
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-xl shadow-lg p-1">
        <div className={`flex ${isMobile ? 'overflow-x-auto' : 'flex-wrap'} gap-1`}>
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'students', label: 'Student Fees' },
            { id: 'structure', label: 'Fee Structure' },
            { id: 'reports', label: 'Reports' },
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
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Payment Status Distribution</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span>Paid</span>
                </span>
                <span className="font-medium">{paidStudents} students</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span>Pending</span>
                </span>
                <span className="font-medium">{pendingStudents} students</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span>Overdue</span>
                </span>
                <span className="font-medium">{overdueStudents} students</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Transactions</h3>
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Student {i}</p>
                    <p className="text-sm text-gray-500">Payment received</p>
                  </div>
                  <span className="text-green-600 font-medium">₹{totalFees.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'students' && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Student Fee Status</h3>
            <div className="flex space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search students..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {isMobile ? (
            <div className="space-y-4">
              {filteredStudents.slice(0, 10).map(student => (
                <div key={student.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-medium text-gray-900">{student.name}</h4>
                      <p className="text-sm text-gray-500">{student.rollNumber}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      student.status === 'Paid' ? 'bg-green-100 text-green-800' :
                      student.status === 'Partial' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {student.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Total Due:</span>
                      <p className="font-medium">₹{student.totalDue.toLocaleString()}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Paid:</span>
                      <p className="font-medium text-green-600">₹{student.paid.toLocaleString()}</p>
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Due</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Paid</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Balance</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredStudents.slice(0, 10).map(student => (
                    <tr key={student.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{student.name}</div>
                          <div className="text-sm text-gray-500">{student.rollNumber}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ₹{student.totalDue.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">
                        ₹{student.paid.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ₹{(student.totalDue - student.paid).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          student.status === 'Paid' ? 'bg-green-100 text-green-800' :
                          student.status === 'Partial' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {student.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
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

      {activeTab === 'structure' && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Fee Structure</h3>
          <div className="space-y-4">
            {feeStructure.map((fee, index) => (
              <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900">{fee.category}</h4>
                  <p className="text-sm text-gray-500">Due Date: {fee.dueDate}</p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-gray-900">₹{fee.amount.toLocaleString()}</div>
                </div>
              </div>
            ))}
            <div className="border-t pt-4">
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold text-gray-900">Total</span>
                <span className="text-xl font-bold text-blue-600">₹{totalFees.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeeManagement;
