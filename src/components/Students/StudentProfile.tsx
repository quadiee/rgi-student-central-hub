import React, { useState, useEffect } from 'react';
import { ArrowLeft, User, Phone, Mail, MapPin, Calendar, GraduationCap, Users, CreditCard, AlertCircle, Award } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Student } from '../../types';
import { RealStudentFeeService } from '../../services/realStudentFeeService';
import { supabase } from '../../integrations/supabase/client';

export interface StudentProfileProps {
  student: Student;
  onBack: () => void;
}

interface FeeRecord {
  id: string;
  academic_year: string;
  semester: number;
  original_amount: number;
  discount_amount: number;
  penalty_amount: number;
  final_amount: number;
  paid_amount: number;
  status: 'Pending' | 'Paid' | 'Partial' | 'Overdue';
  due_date: string;
  last_payment_date?: string;
  created_at: string;
}

interface ScholarshipRecord {
  id: string;
  scholarship_type: 'PMSS' | 'FG';
  eligible_amount: number;
  applied_status: boolean;
  application_date?: string;
  received_by_institution: boolean;
  receipt_date?: string;
  academic_year: string;
  semester?: number;
  remarks?: string;
  created_at: string;
  updated_at: string;
}

const StudentProfile: React.FC<StudentProfileProps> = ({ student, onBack }) => {
  const [feeRecords, setFeeRecords] = useState<FeeRecord[]>([]);
  const [scholarshipRecords, setScholarshipRecords] = useState<ScholarshipRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [scholarshipLoading, setScholarshipLoading] = useState(true);

  useEffect(() => {
    const loadFeeData = async () => {
      try {
        setLoading(true);
        const fees = await RealStudentFeeService.getStudentFeeRecords(student.id);
        setFeeRecords(fees);
      } catch (error) {
        console.error('Error loading fee data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadFeeData();
  }, [student.id]);

  useEffect(() => {
    const loadScholarshipData = async () => {
      try {
        setScholarshipLoading(true);
        const { data: scholarships, error } = await supabase
          .from('scholarships')
          .select('*')
          .eq('student_id', student.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setScholarshipRecords(scholarships || []);
      } catch (error) {
        console.error('Error loading scholarship data:', error);
      } finally {
        setScholarshipLoading(false);
      }
    };

    loadScholarshipData();
  }, [student.id]);

  const totalFees = feeRecords.reduce((sum, record) => sum + record.final_amount, 0);
  const totalPaid = feeRecords.reduce((sum, record) => sum + record.paid_amount, 0);
  const totalDue = totalFees - totalPaid;

  const totalScholarshipAmount = scholarshipRecords.reduce((sum, record) => sum + record.eligible_amount, 0);
  const receivedScholarshipAmount = scholarshipRecords
    .filter(record => record.received_by_institution)
    .reduce((sum, record) => sum + record.eligible_amount, 0);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'partial': return 'bg-yellow-100 text-yellow-800';
      case 'pending': return 'bg-orange-100 text-orange-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getScholarshipTypeColor = (type: string) => {
    switch (type) {
      case 'PMSS': return 'bg-purple-100 text-purple-800';
      case 'FG': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getScholarshipStatusColor = (applied: boolean, received: boolean) => {
    if (received) return 'bg-green-100 text-green-800';
    if (applied) return 'bg-yellow-100 text-yellow-800';
    return 'bg-gray-100 text-gray-800';
  };

  const getScholarshipStatusText = (applied: boolean, received: boolean) => {
    if (received) return 'Received';
    if (applied) return 'Applied';
    return 'Eligible';
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
                              <p className="font-medium">{record.academic_year} - Semester {record.semester}</p>
                            </div>
                            <Badge className={getStatusColor(record.status)}>
                              {record.status}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                            <div>
                              <span className="text-gray-600">Amount:</span>
                              <span className="ml-1 font-medium">₹{record.final_amount.toLocaleString()}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">Paid:</span>
                              <span className="ml-1 font-medium text-green-600">₹{record.paid_amount.toLocaleString()}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">Due:</span>
                              <span className="ml-1 font-medium text-red-600">₹{(record.final_amount - record.paid_amount).toLocaleString()}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">Due Date:</span>
                              <span className="ml-1 font-medium">{new Date(record.due_date).toLocaleDateString()}</span>
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

          {/* Scholarship Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5" />
                Scholarship Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              {scholarshipLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600">Loading scholarship data...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Scholarship Summary */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-purple-50 rounded-lg">
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Total Scholarships</p>
                      <p className="text-lg font-bold text-purple-600">{scholarshipRecords.length}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Total Eligible Amount</p>
                      <p className="text-lg font-bold text-blue-600">₹{totalScholarshipAmount.toLocaleString()}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Amount Received</p>
                      <p className="text-lg font-bold text-green-600">₹{receivedScholarshipAmount.toLocaleString()}</p>
                    </div>
                  </div>

                  {/* Scholarship Records */}
                  {scholarshipRecords.length > 0 ? (
                    <div className="space-y-3">
                      <h4 className="font-semibold">Scholarship Records</h4>
                      {scholarshipRecords.map((scholarship) => (
                        <div key={scholarship.id} className="p-4 border border-gray-200 rounded-lg">
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex items-center gap-2">
                              <Badge className={getScholarshipTypeColor(scholarship.scholarship_type)}>
                                {scholarship.scholarship_type === 'PMSS' ? 'PM Scholarship' : 'First Generation'}
                              </Badge>
                              <Badge className={getScholarshipStatusColor(scholarship.applied_status, scholarship.received_by_institution)}>
                                {getScholarshipStatusText(scholarship.applied_status, scholarship.received_by_institution)}
                              </Badge>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-bold text-purple-600">₹{scholarship.eligible_amount.toLocaleString()}</p>
                              <p className="text-sm text-gray-500">{scholarship.academic_year}</p>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            {scholarship.application_date && (
                              <div>
                                <span className="text-gray-600">Application Date:</span>
                                <span className="ml-1 font-medium">{new Date(scholarship.application_date).toLocaleDateString()}</span>
                              </div>
                            )}
                            {scholarship.receipt_date && (
                              <div>
                                <span className="text-gray-600">Receipt Date:</span>
                                <span className="ml-1 font-medium">{new Date(scholarship.receipt_date).toLocaleDateString()}</span>
                              </div>
                            )}
                            {scholarship.semester && (
                              <div>
                                <span className="text-gray-600">Semester:</span>
                                <span className="ml-1 font-medium">{scholarship.semester}</span>
                              </div>
                            )}
                            <div>
                              <span className="text-gray-600">Created:</span>
                              <span className="ml-1 font-medium">{new Date(scholarship.created_at).toLocaleDateString()}</span>
                            </div>
                          </div>
                          
                          {scholarship.remarks && (
                            <div className="mt-3 p-2 bg-gray-50 rounded text-sm">
                              <span className="text-gray-600 font-medium">Remarks:</span>
                              <p className="mt-1">{scholarship.remarks}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Award className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>No scholarship records found</p>
                      {(student.community === 'SC' || student.community === 'ST' || student.first_generation) && (
                        <p className="text-sm mt-2">This student may be eligible for scholarships based on their profile.</p>
                      )}
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
