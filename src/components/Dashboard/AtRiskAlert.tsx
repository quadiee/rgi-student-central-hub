
import React from 'react';
import { AlertTriangle, Users } from 'lucide-react';
import { mockStudents } from '../../data/mockData';

const AtRiskAlert: React.FC = () => {
  // Filter students with high due amounts (fee at risk)
  const atRiskStudents = mockStudents.filter(student => 
    student.dueAmount > 50000 // Students with more than 50k due
  );

  if (atRiskStudents.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Users className="w-5 h-5 text-green-500" />
          <h3 className="text-lg font-semibold text-gray-800">Fee Status</h3>
        </div>
        <div className="text-center py-8 text-green-600">
          <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>All students have manageable fee dues!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center space-x-2 mb-4">
        <AlertTriangle className="w-5 h-5 text-red-500" />
        <h3 className="text-lg font-semibold text-gray-800">Students at Risk</h3>
        <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
          {atRiskStudents.length}
        </span>
      </div>
      
      <div className="space-y-3">
        {atRiskStudents.slice(0, 5).map(student => (
          <div key={student.id} className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {student.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div>
                  <div className="font-medium text-red-800">{student.name}</div>
                  <div className="text-sm text-red-600">{student.rollNumber}</div>
                </div>
              </div>
              <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-sm font-medium">
                ₹{student.dueAmount.toLocaleString()} due
              </span>
            </div>
            <div className="text-sm text-red-600">
              Fee Status: {student.feeStatus} | Department: {student.department}
            </div>
            <div className="text-xs text-red-500 mt-1">
              Contact: {student.phone} | Guardian: {student.guardianPhone}
            </div>
          </div>
        ))}
      </div>
      
      {atRiskStudents.length > 5 && (
        <div className="mt-4 text-center">
          <button className="text-red-600 hover:text-red-800 text-sm font-medium">
            View all {atRiskStudents.length} at-risk students →
          </button>
        </div>
      )}
    </div>
  );
};

export default AtRiskAlert;
