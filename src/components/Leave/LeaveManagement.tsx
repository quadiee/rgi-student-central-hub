
import React, { useState } from 'react';
import { Calendar, Clock, CheckCircle, XCircle, FileText, User, Filter, Search } from 'lucide-react';
import { Button } from '../ui/button';
import { mockStudents } from '../../data/mockData';
import { useIsMobile } from '../../hooks/use-mobile';
import MobileLeaveForm from '../Mobile/MobileLeaveForm';

interface LeaveRequest {
  id: string;
  studentId: string;
  fromDate: string;
  toDate: string;
  reason: string;
  courseCode?: string;
  facultyApproval: 'Pending' | 'Approved' | 'Denied';
  hodApproval: 'Pending' | 'Approved' | 'Denied';
  finalStatus: 'Pending' | 'Approved' | 'Denied';
  requestedOn: string;
  approvedBy?: string;
}

const LeaveManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState('requests');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const isMobile = useIsMobile();

  // Mock leave data
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([
    {
      id: '1',
      studentId: 'S2023001',
      fromDate: '2024-06-25',
      toDate: '2024-06-27',
      reason: 'Medical appointment and recovery',
      courseCode: 'CSE301',
      facultyApproval: 'Pending',
      hodApproval: 'Pending',
      finalStatus: 'Pending',
      requestedOn: '2024-06-20T10:30:00Z'
    },
    {
      id: '2',
      studentId: 'S2023002',
      fromDate: '2024-06-28',
      toDate: '2024-06-28',
      reason: 'Family emergency',
      facultyApproval: 'Approved',
      hodApproval: 'Pending',
      finalStatus: 'Pending',
      requestedOn: '2024-06-21T14:15:00Z'
    },
    {
      id: '3',
      studentId: 'S2023003',
      fromDate: '2024-06-22',
      toDate: '2024-06-24',
      reason: 'Personal work',
      facultyApproval: 'Approved',
      hodApproval: 'Approved',
      finalStatus: 'Approved',
      requestedOn: '2024-06-18T09:00:00Z',
      approvedBy: 'Dr. Smith'
    }
  ]);

  const handleApproval = (requestId: string, type: 'faculty' | 'hod', status: 'Approved' | 'Denied') => {
    setLeaveRequests(prev => prev.map(request => {
      if (request.id === requestId) {
        const updated = { ...request };
        if (type === 'faculty') {
          updated.facultyApproval = status;
        } else {
          updated.hodApproval = status;
        }
        
        // Update final status
        if (updated.facultyApproval === 'Approved' && updated.hodApproval === 'Approved') {
          updated.finalStatus = 'Approved';
        } else if (updated.facultyApproval === 'Denied' || updated.hodApproval === 'Denied') {
          updated.finalStatus = 'Denied';
        } else {
          updated.finalStatus = 'Pending';
        }
        
        return updated;
      }
      return request;
    }));
  };

  const filteredRequests = leaveRequests.filter(request => {
    const student = mockStudents.find(s => s.id === request.studentId);
    const matchesSearch = student?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student?.rollNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !filterStatus || request.finalStatus === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const pendingRequests = leaveRequests.filter(r => r.finalStatus === 'Pending').length;
  const approvedRequests = leaveRequests.filter(r => r.finalStatus === 'Approved').length;
  const deniedRequests = leaveRequests.filter(r => r.finalStatus === 'Denied').length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold text-gray-800`}>
          Leave Management
        </h2>
        <Button size={isMobile ? 'sm' : 'default'}>
          <FileText className="w-4 h-4 mr-2" />
          Generate Report
        </Button>
      </div>

      {/* Stats Cards */}
      <div className={`grid ${isMobile ? 'grid-cols-3' : 'grid-cols-1 md:grid-cols-4'} gap-4`}>
        <div className="bg-white rounded-xl shadow-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Pending</p>
              <p className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold text-yellow-600`}>{pendingRequests}</p>
            </div>
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className={`${isMobile ? 'w-4 h-4' : 'w-6 h-6'} text-yellow-600`} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Approved</p>
              <p className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold text-green-600`}>{approvedRequests}</p>
            </div>
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className={`${isMobile ? 'w-4 h-4' : 'w-6 h-6'} text-green-600`} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Denied</p>
              <p className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold text-red-600`}>{deniedRequests}</p>
            </div>
            <div className="p-2 bg-red-100 rounded-lg">
              <XCircle className={`${isMobile ? 'w-4 h-4' : 'w-6 h-6'} text-red-600`} />
            </div>
          </div>
        </div>

        {!isMobile && (
          <div className="bg-white rounded-xl shadow-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">This Month</p>
                <p className="text-2xl font-bold text-blue-600">{leaveRequests.length}</p>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-xl shadow-lg p-1">
        <div className={`flex ${isMobile ? 'overflow-x-auto' : 'flex-wrap'} gap-1`}>
          {[
            { id: 'requests', label: 'All Requests', icon: FileText },
            { id: 'new', label: 'New Request', icon: Calendar },
            { id: 'pending', label: 'Pending Approval', icon: Clock },
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className={`font-medium ${isMobile ? 'text-sm' : ''}`}>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'new' && (
        <MobileLeaveForm />
      )}

      {(activeTab === 'requests' || activeTab === 'pending') && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">
              {activeTab === 'pending' ? 'Pending Approvals' : 'Leave Requests'}
            </h3>
            <div className="flex space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search requests..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Status</option>
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Denied">Denied</option>
              </select>
            </div>
          </div>

          {isMobile ? (
            <div className="space-y-4">
              {filteredRequests
                .filter(request => activeTab === 'pending' ? request.finalStatus === 'Pending' : true)
                .map(request => {
                  const student = mockStudents.find(s => s.id === request.studentId);
                  return (
                    <div key={request.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-medium text-gray-900">{student?.name}</h4>
                          <p className="text-sm text-gray-500">{student?.rollNumber}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          request.finalStatus === 'Approved' ? 'bg-green-100 text-green-800' :
                          request.finalStatus === 'Denied' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {request.finalStatus}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                        <div>
                          <span className="text-gray-500">From:</span>
                          <p className="font-medium">{request.fromDate}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">To:</span>
                          <p className="font-medium">{request.toDate}</p>
                        </div>
                      </div>
                      
                      <div className="mb-3">
                        <span className="text-gray-500 text-sm">Reason:</span>
                        <p className="text-sm text-gray-900">{request.reason}</p>
                      </div>

                      {request.finalStatus === 'Pending' && (
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            onClick={() => handleApproval(request.id, 'faculty', 'Approved')}
                            className="flex-1 bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleApproval(request.id, 'faculty', 'Denied')}
                            className="flex-1 text-red-600 border-red-300 hover:bg-red-50"
                          >
                            <XCircle className="w-3 h-3 mr-1" />
                            Deny
                          </Button>
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Duration</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reason</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Faculty</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">HOD</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredRequests
                    .filter(request => activeTab === 'pending' ? request.finalStatus === 'Pending' : true)
                    .map(request => {
                      const student = mockStudents.find(s => s.id === request.studentId);
                      return (
                        <tr key={request.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                                <span className="text-white text-sm font-medium">
                                  {student?.name.split(' ').map(n => n[0]).join('')}
                                </span>
                              </div>
                              <div className="ml-3">
                                <div className="text-sm font-medium text-gray-900">{student?.name}</div>
                                <div className="text-sm text-gray-500">{student?.rollNumber}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {request.fromDate} to {request.toDate}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                            {request.reason}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              request.facultyApproval === 'Approved' ? 'bg-green-100 text-green-800' :
                              request.facultyApproval === 'Denied' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {request.facultyApproval}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              request.hodApproval === 'Approved' ? 'bg-green-100 text-green-800' :
                              request.hodApproval === 'Denied' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {request.hodApproval}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              request.finalStatus === 'Approved' ? 'bg-green-100 text-green-800' :
                              request.finalStatus === 'Denied' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {request.finalStatus}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            {request.finalStatus === 'Pending' && (
                              <div className="flex space-x-2">
                                <Button
                                  size="sm"
                                  onClick={() => handleApproval(request.id, 'faculty', 'Approved')}
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleApproval(request.id, 'faculty', 'Denied')}
                                  className="text-red-600 border-red-300 hover:bg-red-50"
                                >
                                  Deny
                                </Button>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LeaveManagement;
