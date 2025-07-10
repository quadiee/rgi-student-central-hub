import React, { useState, useEffect } from 'react';
import { ArrowLeft, Mail, Phone, MapPin, TrendingUp, FileText, Edit, DollarSign, Award, Users, Calendar } from 'lucide-react';
import { Button } from '../ui/button';
import { Student, ScholarshipWithProfile } from '../../types/user-student-fees';
import { mockFeeRecords } from '../../data/mockData';
import { useIsMobile } from '../../hooks/use-mobile';
import { supabase } from '../../integrations/supabase/client';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

interface StudentProfileProps {
  student: Student;
  onBack: () => void;
}

const StudentProfile: React.FC<StudentProfileProps> = ({ student, onBack }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [scholarships, setScholarships] = useState<ScholarshipWithProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const isMobile = useIsMobile();

  const studentFeeRecords = mockFeeRecords.filter(record => record.studentId === student.id);
  const totalFees = studentFeeRecords.reduce((sum, record) => sum + record.amount, 0);
  const totalPaid = studentFeeRecords.reduce((sum, record) => sum + (record.paidAmount || 0), 0);
  const totalDue = totalFees - totalPaid;

  useEffect(() => {
    fetchScholarships();
  }, [student.id]);

  const fetchScholarships = async () => {
    if (!student.id) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('scholarships')
        .select('*')
        .eq('student_id', student.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Cast the scholarship_type to the correct union type
      const typedScholarships = (data || []).map(scholarship => ({
        ...scholarship,
        scholarship_type: scholarship.scholarship_type as 'PMSS' | 'FG'
      }));
      
      setScholarships(typedScholarships);
    } catch (error) {
      console.error('Error fetching scholarships:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalEligibleAmount = scholarships.reduce((sum, s) => sum + s.eligible_amount, 0);
  const totalReceivedAmount = scholarships
    .filter(s => s.received_by_institution)
    .reduce((sum, s) => sum + s.eligible_amount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={onBack}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </Button>
          <h2 className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold text-gray-800`}>
            Student Profile
          </h2>
        </div>
        <Button className="flex items-center space-x-2" size={isMobile ? 'sm' : 'default'}>
          <Edit className="w-4 h-4" />
          <span>Edit Profile</span>
        </Button>
      </div>

      {/* Student Info Card */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className={`flex ${isMobile ? 'flex-col' : 'flex-row'} items-start space-x-0 ${!isMobile && 'space-x-6'} ${isMobile && 'space-y-4'}`}>
          <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
            <span className="text-white text-2xl font-bold">
              {student.name?.split(' ').map(n => n[0]).join('') || '-'}
            </span>
          </div>
          
          <div className="flex-1">
            <h3 className="text-2xl font-bold text-gray-800 mb-2">{student.name || '-'}</h3>
            <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-2'} gap-4 text-sm`}>
              <div className="flex items-center space-x-2">
                <span className="text-gray-500">Roll Number:</span>
                <span className="font-medium">{student.rollNumber || '-'}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-gray-400" />
                <span className="font-medium">{student.email || '-'}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-gray-500">Department:</span>
                <span className="font-medium">{student.department || '-'}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-gray-500">Year & Section:</span>
                <span className="font-medium">{student.yearSection || '-'}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-gray-400" />
                <span className="font-medium">{student.community || 'Not specified'}</span>
                {student.first_generation && (
                  <Badge variant="secondary" className="text-xs">FG</Badge>
                )}
              </div>
            </div>
          </div>

          <div className="text-center">
            <div className={`text-3xl font-bold ${
              totalDue === 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              ₹{totalDue.toLocaleString()}
            </div>
            <div className="text-sm text-gray-500">Amount Due</div>
          </div>
        </div>
      </div>

      {/* Scholarship Summary Card */}
      {scholarships.length > 0 && (
        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl shadow-lg p-6 border border-green-200">
          <h3 className="text-lg font-semibold text-green-800 mb-4 flex items-center gap-2">
            <Award className="w-5 h-5" />
            Scholarship Summary
          </h3>
          <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-3'} gap-4`}>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                ₹{totalEligibleAmount.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Total Eligible</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                ₹{totalReceivedAmount.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Received by Institution</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {scholarships.filter(s => s.applied_status).length}
              </div>
              <div className="text-sm text-gray-600">Applications Submitted</div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-lg p-1">
        <div className={`flex ${isMobile ? 'overflow-x-auto' : 'flex-wrap'} gap-1`}>
          {[
            { id: 'overview', label: 'Overview', icon: TrendingUp },
            { id: 'fees', label: 'Fee Details', icon: DollarSign },
            { id: 'scholarships', label: 'Scholarships', icon: Award },
            { id: 'profile', label: 'Personal Info', icon: FileText },
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
      <div className="space-y-6">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h4 className="text-lg font-semibold text-gray-800 mb-4">Fee Summary</h4>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Fees:</span>
                  <span className="font-medium">₹{totalFees.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Amount Paid:</span>
                  <span className="font-medium text-green-600">₹{totalPaid.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Amount Due:</span>
                  <span className={`font-medium ${totalDue > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    ₹{totalDue.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <h4 className="text-lg font-semibold text-gray-800 mb-4">Payment Status</h4>
              <div className="space-y-4">
                <div className={`p-4 rounded-lg ${
                  totalDue === 0 
                    ? 'bg-green-50 border border-green-200' 
                    : 'bg-red-50 border border-red-200'
                }`}>
                  <div className={`font-medium ${
                    totalDue === 0 ? 'text-green-800' : 'text-red-800'
                  }`}>
                    {totalDue === 0 ? 'All Fees Paid' : 'Payment Pending'}
                  </div>
                  <div className={`text-sm ${
                    totalDue === 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {totalDue === 0 
                      ? 'All semester fees have been paid'
                      : `₹${totalDue.toLocaleString()} pending payment`
                    }
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'scholarships' && (
          <div className="space-y-6">
            {scholarships.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Award className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Scholarships Found</h3>
                  <p className="text-gray-600">
                    No scholarship records found for this student. Check eligibility criteria.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {scholarships.map((scholarship) => (
                  <Card key={scholarship.id} className="relative">
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Award className="w-5 h-5" />
                          {scholarship.scholarship_type === 'PMSS' ? 'Post Metric Scholarship (SC/ST)' : 'First Generation Scholarship'}
                        </CardTitle>
                        <Badge 
                          variant={scholarship.received_by_institution ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {scholarship.received_by_institution ? 'Received' : 'Pending'}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Eligible Amount:</span>
                          <div className="font-semibold text-lg text-green-600">
                            ₹{scholarship.eligible_amount.toLocaleString()}
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-600">Academic Year:</span>
                          <div className="font-medium">{scholarship.academic_year}</div>
                        </div>
                        <div>
                          <span className="text-gray-600">Application Status:</span>
                          <div className={`font-medium ${scholarship.applied_status ? 'text-green-600' : 'text-orange-600'}`}>
                            {scholarship.applied_status ? 'Applied' : 'Not Applied'}
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-600">Institution Receipt:</span>
                          <div className={`font-medium ${scholarship.received_by_institution ? 'text-green-600' : 'text-red-600'}`}>
                            {scholarship.received_by_institution ? 'Received' : 'Pending'}
                          </div>
                        </div>
                      </div>
                      
                      {scholarship.application_date && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="w-4 h-4" />
                          Applied on: {new Date(scholarship.application_date).toLocaleDateString()}
                        </div>
                      )}
                      
                      {scholarship.receipt_date && (
                        <div className="flex items-center gap-2 text-sm text-green-600">
                          <Calendar className="w-4 h-4" />
                          Received on: {new Date(scholarship.receipt_date).toLocaleDateString()}
                        </div>
                      )}
                      
                      {scholarship.remarks && (
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <span className="text-sm font-medium text-gray-700">Remarks:</span>
                          <p className="text-sm text-gray-600 mt-1">{scholarship.remarks}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'fees' && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">Fee Records</h4>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Academic Year</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Semester</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Fee Type</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {studentFeeRecords.map((record, index) => (
                    <tr key={index}>
                      <td className="px-4 py-2 text-sm text-gray-900">{record.academicYear || '-'}</td>
                      <td className="px-4 py-2 text-sm text-gray-900">{record.semester || '-'}</td>
                      <td className="px-4 py-2 text-sm text-gray-900">{record.feeType || '-'}</td>
                      <td className="px-4 py-2 text-sm text-gray-900">₹{record.amount?.toLocaleString() || '0'}</td>
                      <td className="px-4 py-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          record.status === 'Paid' ? 'bg-green-100 text-green-800' :
                          record.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {record.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">Personal Information</h4>
            <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-2'} gap-6`}>
              <div>
                <h5 className="font-medium text-gray-700 mb-2">Contact Information</h5>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">Phone:</span>
                    <span className="font-medium">{student.phone || '-'}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">Email:</span>
                    <span className="font-medium">{student.email || '-'}</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <MapPin className="w-4 h-4 text-gray-400 mt-1" />
                    <span className="text-gray-600">Address:</span>
                    <span className="font-medium">{student.address || '-'}</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h5 className="font-medium text-gray-700 mb-2">Guardian Information</h5>
                <div className="space-y-3">
                  <div>
                    <span className="text-gray-600">Name:</span>
                    <span className="font-medium ml-2">{student.guardianName || '-'}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Phone:</span>
                    <span className="font-medium ml-2">{student.guardianPhone || '-'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentProfile;
