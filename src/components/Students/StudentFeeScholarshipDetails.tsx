
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { ArrowLeft, DollarSign, GraduationCap, Calendar, Receipt, AlertCircle } from 'lucide-react';
import { supabase } from '../../integrations/supabase/client';
import { useAuth } from '../../contexts/SupabaseAuthContext';
import { Student } from '../../types/user-student-fees';

interface StudentFeeScholarshipDetailsProps {
  student: Student;
  onBack: () => void;
}

interface FeeRecord {
  id: string;
  academic_year: string;
  semester: number;
  original_amount: number;
  final_amount: number;
  paid_amount: number;
  status: string;
  due_date: string;
  last_payment_date?: string;
}

interface ScholarshipRecord {
  id: string;
  scholarship_type: string;
  eligible_amount: number;
  applied_status: boolean;
  received_by_institution: boolean;
  academic_year: string;
  semester: number;
  application_date?: string;
  receipt_date?: string;
}

const StudentFeeScholarshipDetails: React.FC<StudentFeeScholarshipDetailsProps> = ({
  student,
  onBack
}) => {
  const { user } = useAuth();
  const [feeRecords, setFeeRecords] = useState<FeeRecord[]>([]);
  const [scholarships, setScholarships] = useState<ScholarshipRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        
        // Fetch fee records
        const { data: fees, error: feeError } = await supabase
          .from('fee_records')
          .select('*')
          .eq('student_id', student.id)
          .order('created_at', { ascending: false });

        if (feeError) throw feeError;

        // Fetch scholarships
        const { data: scholarshipData, error: scholarshipError } = await supabase
          .from('scholarships')
          .select('*')
          .eq('student_id', student.id)
          .order('created_at', { ascending: false });

        if (scholarshipError) throw scholarshipError;

        setFeeRecords(fees || []);
        setScholarships(scholarshipData || []);
      } catch (error) {
        console.error('Error fetching student details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [user, student.id]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={onBack} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  const totalFees = feeRecords.reduce((sum, fee) => sum + fee.final_amount, 0);
  const totalPaid = feeRecords.reduce((sum, fee) => sum + (fee.paid_amount || 0), 0);
  const totalDue = totalFees - totalPaid;
  const totalScholarshipAmount = scholarships.reduce((sum, scholarship) => sum + scholarship.eligible_amount, 0);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
      </div>

      {/* Student Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <GraduationCap className="w-5 h-5 mr-2 text-blue-600" />
            {student.name}
          </CardTitle>
          <p className="text-sm text-gray-600">
            {student.rollNumber} • {student.course} • {student.department}
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-500">Total Fees</p>
              <p className="text-lg font-semibold text-blue-600">{formatCurrency(totalFees)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Amount Due</p>
              <p className="text-lg font-semibold text-red-600">{formatCurrency(totalDue)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Fee Records */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <DollarSign className="w-5 h-5 mr-2 text-green-600" />
            Fee Records ({feeRecords.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {feeRecords.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No fee records found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {feeRecords.slice(0, 5).map(fee => (
                <div key={fee.id} className="border border-gray-200 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-medium text-sm">
                        {fee.academic_year} - Semester {fee.semester}
                      </p>
                      <p className="text-xs text-gray-500 flex items-center mt-1">
                        <Calendar className="w-3 h-3 mr-1" />
                        Due: {new Date(fee.due_date).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge className={getStatusColor(fee.status)}>
                      {fee.status}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-gray-500">Amount: </span>
                      <span className="font-medium">{formatCurrency(fee.final_amount)}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Paid: </span>
                      <span className="font-medium">{formatCurrency(fee.paid_amount || 0)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Scholarship Records */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <Receipt className="w-5 h-5 mr-2 text-purple-600" />
            Scholarships ({scholarships.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {scholarships.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No scholarships found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {scholarships.map(scholarship => (
                <div key={scholarship.id} className="border border-gray-200 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-medium text-sm">{scholarship.scholarship_type}</p>
                      <p className="text-xs text-gray-500">
                        {scholarship.academic_year} - Semester {scholarship.semester}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-purple-600">
                        {formatCurrency(scholarship.eligible_amount)}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs">
                    <Badge variant={scholarship.applied_status ? "default" : "outline"}>
                      {scholarship.applied_status ? "Applied" : "Not Applied"}
                    </Badge>
                    <Badge variant={scholarship.received_by_institution ? "default" : "outline"}>
                      {scholarship.received_by_institution ? "Received" : "Pending"}
                    </Badge>
                  </div>
                  {scholarship.application_date && (
                    <p className="text-xs text-gray-500 mt-2">
                      Applied: {new Date(scholarship.application_date).toLocaleDateString()}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary Stats */}
      {(scholarships.length > 0 || totalScholarshipAmount > 0) && (
        <Card className="bg-gradient-to-r from-purple-50 to-blue-50">
          <CardContent className="p-4">
            <h3 className="font-semibold text-gray-800 mb-3">Financial Summary</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Total Fees</p>
                <p className="font-semibold">{formatCurrency(totalFees)}</p>
              </div>
              <div>
                <p className="text-gray-600">Scholarship Amount</p>
                <p className="font-semibold text-purple-600">{formatCurrency(totalScholarshipAmount)}</p>
              </div>
              <div>
                <p className="text-gray-600">Amount Paid</p>
                <p className="font-semibold text-green-600">{formatCurrency(totalPaid)}</p>
              </div>
              <div>
                <p className="text-gray-600">Net Due</p>
                <p className="font-semibold text-red-600">{formatCurrency(Math.max(0, totalDue - totalScholarshipAmount))}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default StudentFeeScholarshipDetails;
