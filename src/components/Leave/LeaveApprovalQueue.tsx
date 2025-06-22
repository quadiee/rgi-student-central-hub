
import React, { useState } from 'react';
import { Check, X, Clock, User, Calendar } from 'lucide-react';
import { Button } from '../ui/button';
import { LeaveRequest, UserRole } from '../../types';
import { mockLeaves, mockStudents } from '../../data/mockData';

interface LeaveApprovalQueueProps {
  userRole: UserRole;
  userEmail: string;
  onApprove: (leaveId: string, approvalType: 'faculty' | 'hod') => void;
  onDeny: (leaveId: string, approvalType: 'faculty' | 'hod') => void;
}

const LeaveApprovalQueue: React.FC<LeaveApprovalQueueProps> = ({
  userRole,
  userEmail,
  onApprove,
  onDeny
}) => {
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());

  // Filter leaves based on user role
  const pendingLeaves = mockLeaves.filter(leave => {
    if (userRole === 'faculty') {
      return leave.facultyApproval === 'Pending';
    } else if (userRole === 'hod') {
      return leave.facultyApproval === 'Approved' && leave.hodApproval === 'Pending';
    }
    return false;
  });

  const handleAction = async (leaveId: string, action: 'approve' | 'deny') => {
    setProcessingIds(prev => new Set(prev).add(leaveId));
    
    try {
      const approvalType = userRole === 'faculty' ? 'faculty' : 'hod';
      
      if (action === 'approve') {
        onApprove(leaveId, approvalType);
      } else {
        onDeny(leaveId, approvalType);
      }
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(leaveId);
        return newSet;
      });
    }
  };

  const getStudentName = (studentId: string) => {
    const student = mockStudents.find(s => s.id === studentId);
    return student?.name || 'Unknown Student';
  };

  const getDaysCount = (fromDate: string, toDate: string) => {
    const from = new Date(fromDate);
    const to = new Date(toDate);
    const diffTime = Math.abs(to.getTime() - from.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  if (pendingLeaves.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Clock className="w-5 h-5 text-blue-500" />
          <h3 className="text-lg font-semibold text-gray-800">
            {userRole === 'faculty' ? 'Faculty Approvals' : 'HOD Approvals'}
          </h3>
        </div>
        <div className="text-center py-8 text-gray-500">
          <Clock className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>No pending leave requests</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center space-x-2 mb-6">
        <Clock className="w-5 h-5 text-blue-500" />
        <h3 className="text-lg font-semibold text-gray-800">
          {userRole === 'faculty' ? 'Faculty Approvals' : 'HOD Approvals'} ({pendingLeaves.length})
        </h3>
      </div>

      <div className="space-y-4">
        {pendingLeaves.map((leave) => (
          <div key={leave.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{getStudentName(leave.studentId)}</h4>
                    <p className="text-sm text-gray-500">Student ID: {leave.studentId}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>{leave.fromDate} to {leave.toDate}</span>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                      {getDaysCount(leave.fromDate, leave.toDate)} days
                    </span>
                  </div>
                  <div className="text-sm text-gray-500">
                    Requested: {new Date(leave.requestedOn).toLocaleDateString()}
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700 mb-1">Reason:</p>
                  <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">{leave.reason}</p>
                </div>

                <div className="flex items-center space-x-4 text-sm">
                  <div className={`flex items-center space-x-1 ${
                    leave.facultyApproval === 'Approved' ? 'text-green-600' : 
                    leave.facultyApproval === 'Denied' ? 'text-red-600' : 'text-yellow-600'
                  }`}>
                    <span>Faculty:</span>
                    <span className="font-medium">{leave.facultyApproval}</span>
                  </div>
                  <div className={`flex items-center space-x-1 ${
                    leave.hodApproval === 'Approved' ? 'text-green-600' : 
                    leave.hodApproval === 'Denied' ? 'text-red-600' : 'text-yellow-600'
                  }`}>
                    <span>HOD:</span>
                    <span className="font-medium">{leave.hodApproval}</span>
                  </div>
                </div>
              </div>

              <div className="flex space-x-2 ml-4">
                <Button
                  onClick={() => handleAction(leave.id, 'approve')}
                  disabled={processingIds.has(leave.id)}
                  className="bg-green-600 hover:bg-green-700 text-white px-3 py-2"
                  size="sm"
                >
                  <Check className="w-4 h-4" />
                </Button>
                <Button
                  onClick={() => handleAction(leave.id, 'deny')}
                  disabled={processingIds.has(leave.id)}
                  variant="destructive"
                  size="sm"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LeaveApprovalQueue;
