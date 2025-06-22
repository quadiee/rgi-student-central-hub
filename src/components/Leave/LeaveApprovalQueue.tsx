
import React, { useState } from 'react';
import { Clock, CheckCircle, XCircle, User, Calendar, FileText } from 'lucide-react';
import { mockLeaves, mockStudents } from '../../data/mockData';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/button';
import { LeaveRequest } from '../../types';

interface LeaveApprovalQueueProps {
  showHODApprovals?: boolean;
}

const LeaveApprovalQueue: React.FC<LeaveApprovalQueueProps> = ({ showHODApprovals = false }) => {
  const { user } = useAuth();
  const [leaves, setLeaves] = useState<LeaveRequest[]>(mockLeaves);

  // Filter leaves based on role and approval level
  const getRelevantLeaves = () => {
    if (showHODApprovals) {
      // HOD sees leaves that need HOD approval (faculty already approved)
      return leaves.filter(leave => 
        leave.facultyApproval === 'Approved' && 
        leave.hodApproval === 'Pending'
      );
    } else {
      // Faculty sees leaves that need faculty approval
      return leaves.filter(leave => 
        leave.facultyApproval === 'Pending'
      );
    }
  };

  const handleApproval = (leaveId: string, approved: boolean, isHOD: boolean = false) => {
    setLeaves(prevLeaves => 
      prevLeaves.map(leave => {
        if (leave.id === leaveId) {
          const updatedLeave = { ...leave };
          
          if (isHOD) {
            updatedLeave.hodApproval = approved ? 'Approved' : 'Denied';
            updatedLeave.finalStatus = approved ? 'Approved' : 'Denied';
          } else {
            updatedLeave.facultyApproval = approved ? 'Approved' : 'Denied';
            if (!approved) {
              updatedLeave.finalStatus = 'Denied';
            }
          }
          
          updatedLeave.approvedBy = user?.email || '';
          
          return updatedLeave;
        }
        return leave;
      })
    );
  };

  const relevantLeaves = getRelevantLeaves();

  const getStudentName = (studentId: string) => {
    const student = mockStudents.find(s => s.id === studentId);
    return student ? student.name : 'Unknown Student';
  };

  const getStudentDetails = (studentId: string) => {
    const student = mockStudents.find(s => s.id === studentId);
    return student ? `${student.rollNumber} • ${student.yearSection}` : '';
  };

  const calculateLeaveDays = (fromDate: string, toDate: string) => {
    const from = new Date(fromDate);
    const to = new Date(toDate);
    const diffTime = Math.abs(to.getTime() - from.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  if (relevantLeaves.length === 0) {
    return (
      <div className="text-center py-8">
        <Clock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-800 mb-2">No Pending Approvals</h3>
        <p className="text-gray-600">
          {showHODApprovals ? 'All leave requests have been processed.' : 'No leave requests require your approval at this time.'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800">
          {showHODApprovals ? 'HOD Leave Approvals' : 'Faculty Leave Approvals'}
        </h3>
        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
          {relevantLeaves.length} pending
        </span>
      </div>

      <div className="space-y-4">
        {relevantLeaves.map((leave) => (
          <div key={leave.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-800">{getStudentName(leave.studentId)}</h4>
                  <p className="text-sm text-gray-600">{getStudentDetails(leave.studentId)}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">
                  Requested: {new Date(leave.requestedOn).toLocaleDateString()}
                </p>
                {leave.courseCode && (
                  <p className="text-xs text-gray-500">{leave.courseCode}</p>
                )}
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-3 mb-3">
              <div className="flex items-center gap-4 mb-2">
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>{leave.fromDate} to {leave.toDate}</span>
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                    {calculateLeaveDays(leave.fromDate, leave.toDate)} day{calculateLeaveDays(leave.fromDate, leave.toDate) > 1 ? 's' : ''}
                  </span>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <FileText className="w-4 h-4 text-gray-500 mt-0.5" />
                <p className="text-sm text-gray-700">{leave.reason}</p>
              </div>
            </div>

            {!showHODApprovals && leave.facultyApproval === 'Approved' && (
              <div className="mb-3 p-2 bg-green-50 rounded text-sm text-green-700">
                ✓ Faculty approved - Forwarding to HOD for final approval
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span className={`flex items-center gap-1 ${
                  leave.facultyApproval === 'Approved' ? 'text-green-600' :
                  leave.facultyApproval === 'Denied' ? 'text-red-600' : 'text-yellow-600'
                }`}>
                  Faculty: {leave.facultyApproval}
                </span>
                {showHODApprovals && (
                  <span className={`flex items-center gap-1 ${
                    leave.hodApproval === 'Approved' ? 'text-green-600' :
                    leave.hodApproval === 'Denied' ? 'text-red-600' : 'text-yellow-600'
                  }`}>
                    HOD: {leave.hodApproval}
                  </span>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleApproval(leave.id, false, showHODApprovals)}
                  className="text-red-600 border-red-300 hover:bg-red-50"
                >
                  <XCircle className="w-4 h-4 mr-1" />
                  Deny
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleApproval(leave.id, true, showHODApprovals)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Approve
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
