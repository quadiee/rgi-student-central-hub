
import React from 'react';
import { X, User, Phone, Mail, MapPin, Calendar, Heart, Users, GraduationCap, CreditCard } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { useIsMobile } from '../../hooks/use-mobile';
import { Student } from '../../types/user-student-fees';
import ProfilePhotoUpload from './ProfilePhotoUpload';
import { useAuth } from '../../contexts/SupabaseAuthContext';

interface StudentDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student | null;
}

const StudentDetailsModal: React.FC<StudentDetailsModalProps> = ({ isOpen, onClose, student }) => {
  const { user } = useAuth();
  const isMobile = useIsMobile();

  if (!isOpen || !student) return null;

  const canEdit = user && (
    user.role === 'admin' || 
    user.role === 'principal' || 
    user.id === student.id ||
    (user.role === 'hod' && user.department_id === student.department)
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Paid': return 'bg-green-100 text-green-800';
      case 'Partial': return 'bg-yellow-100 text-yellow-800';
      case 'Pending': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handlePhotoUpdate = (photoUrl: string) => {
    // Update local state or refetch data
    console.log('Photo updated:', photoUrl);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className={`bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full ${isMobile ? 'max-w-md' : 'max-w-4xl'} max-h-[90vh] overflow-hidden`}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Student Details</h2>
            <p className="text-gray-600 dark:text-gray-400">{student.rollNumber}</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[70vh]">
          <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-3'} gap-6`}>
            {/* Profile Section */}
            <div className="space-y-6">
              <div className="text-center">
                <ProfilePhotoUpload
                  studentId={student.id}
                  currentPhotoUrl={student.profileImage}
                  onPhotoUpdate={handlePhotoUpdate}
                  canEdit={canEdit}
                />
                <div className="mt-4">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{student.name}</h3>
                  <p className="text-gray-600 dark:text-gray-400">{student.email}</p>
                  <Badge className={`mt-2 ${getStatusColor(student.feeStatus)}`}>
                    {student.feeStatus}
                  </Badge>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{student.year}</div>
                  <div className="text-sm text-blue-600">Year</div>
                </div>
                <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{student.semester}</div>
                  <div className="text-sm text-green-600">Semester</div>
                </div>
              </div>
            </div>

            {/* Details Section */}
            <div className={`${isMobile ? 'col-span-1' : 'col-span-2'} space-y-6`}>
              {/* Personal Information */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  Personal Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Full Name</label>
                    <p className="text-gray-900 dark:text-gray-100">{student.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Email</label>
                    <p className="text-gray-900 dark:text-gray-100">{student.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Phone</label>
                    <p className="text-gray-900 dark:text-gray-100">{student.phone || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Blood Group</label>
                    <p className="text-gray-900 dark:text-gray-100">{student.bloodGroup || 'Not provided'}</p>
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-gray-500">Address</label>
                    <p className="text-gray-900 dark:text-gray-100">{student.address || 'Not provided'}</p>
                  </div>
                </div>
              </div>

              {/* Academic Information */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                  <GraduationCap className="w-5 h-5 mr-2" />
                  Academic Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Roll Number</label>
                    <p className="text-gray-900 dark:text-gray-100">{student.rollNumber}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Department</label>
                    <p className="text-gray-900 dark:text-gray-100">{student.department}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Course</label>
                    <p className="text-gray-900 dark:text-gray-100">{student.course || 'Not specified'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Section</label>
                    <p className="text-gray-900 dark:text-gray-100">{student.section || 'Not assigned'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Admission Date</label>
                    <p className="text-gray-900 dark:text-gray-100">
                      {student.admissionDate ? new Date(student.admissionDate).toLocaleDateString() : 'Not provided'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                  <Phone className="w-5 h-5 mr-2" />
                  Emergency Contacts
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Guardian Name</label>
                    <p className="text-gray-900 dark:text-gray-100">{student.guardianName || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Guardian Phone</label>
                    <p className="text-gray-900 dark:text-gray-100">{student.guardianPhone || 'Not provided'}</p>
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-gray-500">Emergency Contact</label>
                    <p className="text-gray-900 dark:text-gray-100">{student.emergencyContact || 'Not provided'}</p>
                  </div>
                </div>
              </div>

              {/* Fee Information */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                  <CreditCard className="w-5 h-5 mr-2" />
                  Fee Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <label className="text-sm font-medium text-blue-600">Total Fees</label>
                    <p className="text-xl font-bold text-blue-600">₹{student.totalFees?.toLocaleString() || 0}</p>
                  </div>
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <label className="text-sm font-medium text-green-600">Paid Amount</label>
                    <p className="text-xl font-bold text-green-600">₹{student.paidAmount?.toLocaleString() || 0}</p>
                  </div>
                  <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <label className="text-sm font-medium text-red-600">Due Amount</label>
                    <p className="text-xl font-bold text-red-600">₹{student.dueAmount?.toLocaleString() || 0}</p>
                  </div>
                </div>
                <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-600">Payment Progress</span>
                    <span className="text-sm font-medium text-gray-600">
                      {student.totalFees ? Math.round((student.paidAmount || 0) / student.totalFees * 100) : 0}%
                    </span>
                  </div>
                  <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${student.totalFees ? Math.round((student.paidAmount || 0) / student.totalFees * 100) : 0}%` 
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end p-6 border-t border-gray-200 dark:border-gray-700 space-x-3">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

export default StudentDetailsModal;
