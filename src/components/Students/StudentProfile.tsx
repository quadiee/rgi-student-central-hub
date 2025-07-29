
import React, { useState, useEffect } from 'react';
import { ArrowLeft, User, Phone, Mail, MapPin, Calendar, GraduationCap, Users, CreditCard, AlertCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Student } from '../../types';
import { realStudentFeeService } from '../../services/realStudentFeeService';

export interface StudentProfileProps {
  student: Student;
  onBack: () => void;
}

interface FeeRecord {
  id: string;
  feeType: string;
  amount: number;
  paidAmount: number;
  dueAmount: number;
  status: string;
  dueDate: string;
  semester?: number;
  academicYear?: string;
}

const StudentProfile: React.FC<StudentProfileProps> = ({ student, onBack }) => {
  const [feeRecords, setFeeRecords] = useState<FeeRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFeeData = async () => {
      try {
        setLoading(true);
        const fees = await realStudentFeeService.getStudentFeeRecords(student.id);
        setFeeRecords(fees);
      } catch (error) {
        console.error('Error loading fee data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadFeeData();
  }, [student.id]);

  const totalFees = feeRecords.reduce((sum, record) => sum + record.amount, 0);
  const totalPaid = feeRecords.reduce((sum, record) => sum + record.paidAmount, 0);
  const totalDue = feeRecords.reduce((sum, record) => sum + record.dueAmount, 0);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'partial': return 'bg-yellow-100 text-yellow-800';
      case 'pending': return 'bg-orange-100 text-orange-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="outline" onClick={onBack}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">{student.name}</h2>
                <p className="text-gray-600">{student.rollNumber}</p>
              </div>
            </div>
            {student.profileImage && (
              <img
                src={student.profileImage}
                alt={student.name}
                className="w-16 h-16 rounded-full object-cover"
              />
            )}
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">Email:</span>
                  <span className="font-medium">{student.email}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">Phone:</span>
                  <span className="font-medium">{student.phone || 'N/A'}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">Address:</span>
                  <span className="font-medium">{student.address || 'N/A'}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">Admission Date:</span>
                  <span className="font-medium">{student.admissionDate || 'N/A'}</span>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <GraduationCap className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">Course:</span>
                  <span className="font-medium">{student.course}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">Department:</span>
                  <span className="font-medium">{student.department}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">Year & Section:</span>
                  <span className="font-medium">{student.year}-{student.section}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">Community:</span>
                  <span className="font-medium">{student.community}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Guardian Information */}
          <Card>
            <CardHeader>
              <CardTitle>Guardian Information</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">Guardian Name:</span>
                <span className="font-medium">{student.guardianName || 'N/A'}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">Guardian Phone:</span>
                <span className="font-medium">{student.guardianPhone || 'N/A'}</span>
              </div>
            </CardContent>
          </Card>

          {/* Fee Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Fee Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600">Loading fee data...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Fee Summary */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Total Fees</p>
                      <p className="text-lg font-bold text-blue-600">₹{totalFees.toLocaleString()}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Amount Paid</p>
                      <p className="text-lg font-bold text-green-600">₹{totalPaid.toLocaleString()}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Amount Due</p>
                      <p className="text-lg font-bold text-red-600">₹{totalDue.toLocaleString()}</p>
                    </div>
                  </div>

                  {/* Fee Records */}
                  {feeRecords.length > 0 ? (
                    <div className="space-y-3">
                      <h4 className="font-semibold">Fee Records</h4>
                      {feeRecords.map((record) => (
                        <div key={record.id} className="p-4 border border-gray-200 rounded-lg">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <p className="font-medium">{record.feeType}</p>
                              {record.academicYear && (
                                <p className="text-sm text-gray-600">
                                  {record.academicYear} {record.semester && `- Semester ${record.semester}`}
                                </p>
                              )}
                            </div>
                            <Badge className={getStatusColor(record.status)}>
                              {record.status}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                            <div>
                              <span className="text-gray-600">Amount:</span>
                              <span className="ml-1 font-medium">₹{record.amount.toLocaleString()}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">Paid:</span>
                              <span className="ml-1 font-medium text-green-600">₹{record.paidAmount.toLocaleString()}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">Due:</span>
                              <span className="ml-1 font-medium text-red-600">₹{record.dueAmount.toLocaleString()}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">Due Date:</span>
                              <span className="ml-1 font-medium">{new Date(record.dueDate).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <AlertCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>No fee records found</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;
