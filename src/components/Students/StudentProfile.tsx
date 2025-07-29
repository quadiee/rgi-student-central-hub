
import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  User, 
  GraduationCap, 
  Phone, 
  MapPin, 
  Calendar,
  CreditCard,
  Receipt,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { useIsMobile } from '../../hooks/use-mobile';
import { RealStudentFeeService, StudentFeeWithPayments } from '../../services/realStudentFeeService';
import { Student } from '../../types';

interface StudentProfileProps {
  student: Student;
  onClose: () => void;
}

const StudentProfile: React.FC<StudentProfileProps> = ({ student, onClose }) => {
  const isMobile = useIsMobile();
  const [feeData, setFeeData] = useState<{
    totalFees: number;
    totalPaid: number;
    totalDue: number;
    overdueFees: number;
    feeRecords: StudentFeeWithPayments[];
  }>({
    totalFees: 0,
    totalPaid: 0,
    totalDue: 0,
    overdueFees: 0,
    feeRecords: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeeData = async () => {
      try {
        setLoading(true);
        const data = await RealStudentFeeService.getStudentFeeSummary(student.id);
        setFeeData(data);
      } catch (error) {
        console.error('Error fetching fee data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeeData();
  }, [student.id]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Paid':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'Partial':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'Overdue':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className={`bg-white rounded-xl shadow-xl ${isMobile ? 'w-full h-full' : 'w-full max-w-4xl max-h-[90vh]'} overflow-hidden`}>
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-800">Student Profile</h2>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
        
        <div className="overflow-y-auto" style={{ maxHeight: isMobile ? 'calc(100vh - 80px)' : 'calc(90vh - 80px)' }}>
          <div className="p-6">
            <Tabs defaultValue="personal" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="personal">Personal Info</TabsTrigger>
                <TabsTrigger value="academic">Academic Info</TabsTrigger>
                <TabsTrigger value="fees">Fee Details</TabsTrigger>
              </TabsList>
              
              <TabsContent value="personal" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="w-5 h-5" />
                      Personal Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500">Full Name</label>
                        <p className="text-lg font-semibold">{student.name}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Email</label>
                        <p className="text-lg">{student.email}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Phone</label>
                        <p className="text-lg flex items-center gap-2">
                          <Phone className="w-4 h-4" />
                          {student.phone || 'Not provided'}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Guardian Name</label>
                        <p className="text-lg">{student.guardianName || 'Not provided'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Guardian Phone</label>
                        <p className="text-lg">{student.guardianPhone || 'Not provided'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Emergency Contact</label>
                        <p className="text-lg">{student.emergencyContact || 'Not provided'}</p>
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-500">Address</label>
                      <p className="text-lg flex items-start gap-2">
                        <MapPin className="w-4 h-4 mt-1" />
                        {student.address || 'Not provided'}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="academic" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <GraduationCap className="w-5 h-5" />
                      Academic Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500">Roll Number</label>
                        <p className="text-lg font-semibold">{student.rollNumber}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Course</label>
                        <p className="text-lg">{student.course}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Year</label>
                        <p className="text-lg">{student.year}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Semester</label>
                        <p className="text-lg">{student.semester}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Section</label>
                        <p className="text-lg">{student.section}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Department</label>
                        <p className="text-lg">{student.department}</p>
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-500">Admission Date</label>
                      <p className="text-lg flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {student.admissionDate ? new Date(student.admissionDate).toLocaleDateString() : 'Not provided'}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="fees" className="space-y-4">
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : (
                  <>
                    {/* Fee Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-gray-500">Total Fees</p>
                              <p className="text-2xl font-bold text-blue-600">
                                {RealStudentFeeService.formatCurrency(feeData.totalFees)}
                              </p>
                            </div>
                            <DollarSign className="w-8 h-8 text-blue-600" />
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-gray-500">Amount Paid</p>
                              <p className="text-2xl font-bold text-green-600">
                                {RealStudentFeeService.formatCurrency(feeData.totalPaid)}
                              </p>
                            </div>
                            <CheckCircle className="w-8 h-8 text-green-600" />
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-gray-500">Amount Due</p>
                              <p className="text-2xl font-bold text-red-600">
                                {RealStudentFeeService.formatCurrency(feeData.totalDue)}
                              </p>
                            </div>
                            <AlertTriangle className="w-8 h-8 text-red-600" />
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-gray-500">Overdue</p>
                              <p className="text-2xl font-bold text-orange-600">
                                {RealStudentFeeService.formatCurrency(feeData.overdueFees)}
                              </p>
                            </div>
                            <Clock className="w-8 h-8 text-orange-600" />
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                    
                    {/* Fee Records */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Receipt className="w-5 h-5" />
                          Fee Records
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {feeData.feeRecords.length === 0 ? (
                          <p className="text-center text-gray-500 py-8">No fee records found</p>
                        ) : (
                          <div className="space-y-4">
                            {feeData.feeRecords.map((record) => (
                              <div key={record.id} className="border rounded-lg p-4">
                                <div className="flex justify-between items-start mb-2">
                                  <div>
                                    <h4 className="font-medium">
                                      {record.academic_year} - Semester {record.semester}
                                    </h4>
                                    <p className="text-sm text-gray-500">
                                      Due: {new Date(record.due_date).toLocaleDateString()}
                                    </p>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    {getStatusIcon(record.status)}
                                    <Badge className={RealStudentFeeService.getPaymentStatusBadge(record.status)}>
                                      {record.status}
                                    </Badge>
                                  </div>
                                </div>
                                
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                  <div>
                                    <span className="font-medium">Final Amount:</span>
                                    <p>{RealStudentFeeService.formatCurrency(record.final_amount)}</p>
                                  </div>
                                  <div>
                                    <span className="font-medium">Paid Amount:</span>
                                    <p className="text-green-600">{RealStudentFeeService.formatCurrency(record.paid_amount)}</p>
                                  </div>
                                  <div>
                                    <span className="font-medium">Pending:</span>
                                    <p className="text-red-600">{RealStudentFeeService.formatCurrency(record.final_amount - record.paid_amount)}</p>
                                  </div>
                                  <div>
                                    <span className="font-medium">Last Payment:</span>
                                    <p>{record.last_payment_date ? new Date(record.last_payment_date).toLocaleDateString() : 'N/A'}</p>
                                  </div>
                                </div>
                                
                                {record.payment_transactions.length > 0 && (
                                  <div className="mt-4">
                                    <h5 className="font-medium mb-2">Payment History</h5>
                                    <div className="space-y-2">
                                      {record.payment_transactions.map((payment) => (
                                        <div key={payment.id} className="flex justify-between items-center text-sm bg-gray-50 p-2 rounded">
                                          <span>{RealStudentFeeService.formatCurrency(payment.amount)} - {payment.payment_method}</span>
                                          <span className="text-gray-500">{new Date(payment.processed_at).toLocaleDateString()}</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;
