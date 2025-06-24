
import React, { useState } from 'react';
import { Clock, Check, X, User, Calendar } from 'lucide-react';
import { Button } from '../ui/button';

interface LeaveRequest {
  id: string;
  studentId: string;
  studentName: string;
  rollNumber: string;
  fromDate: string;
  toDate: string;
  reason: string;
  status: 'Pending' | 'Approved' | 'Denied';
  requestedOn: string;
}

const LeaveApprovalQueue: React.FC = () => {
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([
    {
      id: '1',
      studentId: '1',
      studentName: 'Rajesh Kumar',
      rollNumber: 'CSE2021001',
      fromDate: '2024-06-25',
      toDate: '2024-06-27',
      reason: 'Family function',
      status: 'Pending',
      requestedOn: '2024-06-20'
    },
    {
      id: '2',
      studentId: '2',
      studentName: 'Priya Sharma',
      rollNumber: 'CSE2021002',
      fromDate: '2024-06-30',
      toDate: '2024-07-01',
      reason: 'Medical appointment',
      status: 'Pending',
      requestedOn: '2024-06-22'
    }
  ]);

  const handleApproval = (requestId: string, status: 'Approved' | 'Denied') => {
    setLeaveRequests(prev => 
      prev.map(request => 
        request.id === requestId ? { ...request, status } : request
      )
    );
  };

  const pendingRequests = leaveRequests.filter(req => req.status === 'Pending');
  const processedRequests = leaveRequests.filter(req => req.status !== 'Pending');

  return (
    <div className="space-y-6">
      {/* Pending Requests */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Pending Approvals ({pendingRequests.length})
        </h3>
        
        {pendingRequests.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Clock className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No pending leave requests</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingRequests.map(request => (
              <div key={request.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{request.studentName}</h4>
                      <p className="text-sm text-gray-600">{request.rollNumber}</p>
                    </div>
                  </div>
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                    Pending
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                  <div>
                    <span className="font-medium text-gray-700">From:</span>
                    <p>{new Date(request.fromDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">To:</span>
                    <p>{new Date(request.toDate).toLocaleDateString()}</p>
                  </div>
                </div>
                
                <div className="mb-4">
                  <span className="font-medium text-gray-700">Reason:</span>
                  <p className="text-gray-600">{request.reason}</p>
                </div>
                
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    onClick={() => handleApproval(request.id, 'Approved')}
                    className="bg-green-600 hover:bg-green-700 flex items-center space-x-1"
                  >
                    <Check className="w-4 h-4" />
                    <span>Approve</span>
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleApproval(request.id, 'Denied')}
                    className="text-red-600 border-red-600 hover:bg-red-50 flex items-center space-x-1"
                  >
                    <X className="w-4 h-4" />
                    <span>Deny</span>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Processed Requests */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Recent Decisions ({processedRequests.length})
        </h3>
        
        {processedRequests.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No processed requests</p>
          </div>
        ) : (
          <div className="space-y-3">
            {processedRequests.map(request => (
              <div key={request.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{request.studentName}</p>
                    <p className="text-sm text-gray-600">
                      {new Date(request.fromDate).toLocaleDateString()} - {new Date(request.toDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  request.status === 'Approved' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {request.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LeaveApprovalQueue;
