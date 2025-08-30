
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { 
  Building2, 
  Users, 
  GraduationCap,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Search,
  Download,
  Filter,
  School
} from 'lucide-react';
import { useAuth } from '../../contexts/SupabaseAuthContext';
import { supabase } from '../../integrations/supabase/client';
import { useToast } from '../ui/use-toast';
import { cn } from '../../lib/utils';

interface StudentRecord {
  id: string;
  name: string;
  roll_number: string;
  department: string;
  department_id: string;
  tuition_fee: number;
  admission_fee: number;
  total_fees: number;
  total_paid: number;
  pending_amount: number;
  fee_status: 'Paid' | 'Pending' | 'Partial' | 'Overdue';
}

interface DepartmentSummary {
  department_id: string;
  department_name: string;
  department_code: string;
  total_students: number;
  total_fees: number;
  total_collected: number;
  pending_amount: number;
  collection_percentage: number;
}

interface InstitutionSummary {
  total_students: number;
  total_fees: number;
  total_collected: number;
  pending_amount: number;
  collection_percentage: number;
  tuition_fees: number;
  admission_fees: number;
  tuition_collected: number;
  admission_collected: number;
}

const SimplifiedFeeManagement: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [departments, setDepartments] = useState<DepartmentSummary[]>([]);
  const [institutionSummary, setInstitutionSummary] = useState<InstitutionSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedFeeStatus, setSelectedFeeStatus] = useState('all');
  const [activeView, setActiveView] = useState<'institution' | 'department' | 'student' | 'feetype'>('institution');

  useEffect(() => {
    fetchFeeData();
  }, []);

  const fetchFeeData = async () => {
    try {
      setLoading(true);

      // Fetch student records with fee information
      const { data: studentData, error: studentError } = await supabase
        .from('profiles')
        .select(`
          id,
          name,
          roll_number,
          department_id,
          departments!profiles_department_id_fkey (
            name,
            code
          )
        `)
        .eq('role', 'student')
        .eq('is_active', true);

      if (studentError) throw studentError;

      // Fetch fee records for these students
      const studentIds = (studentData || []).map(s => s.id);
      const { data: feeData } = await supabase
        .from('fee_records')
        .select('student_id, original_amount, final_amount, paid_amount, status, fee_types(name)')
        .in('student_id', studentIds);

      // Process student records with fee calculations
      const processedStudents: StudentRecord[] = (studentData || []).map((student: any) => {
        const studentFees = (feeData || []).filter((fee: any) => fee.student_id === student.id);
        
        const tuitionFees = studentFees.filter((fee: any) => 
          fee.fee_types?.name?.toLowerCase().includes('tuition') || 
          fee.fee_types?.name?.toLowerCase().includes('semester')
        );
        const admissionFees = studentFees.filter((fee: any) => 
          fee.fee_types?.name?.toLowerCase().includes('admission')
        );

        const tuitionAmount = tuitionFees.reduce((sum: number, fee: any) => sum + (Number(fee.final_amount) || 0), 0);
        const admissionAmount = admissionFees.reduce((sum: number, fee: any) => sum + (Number(fee.final_amount) || 0), 0);
        const totalFees = studentFees.reduce((sum: number, fee: any) => sum + (Number(fee.final_amount) || 0), 0);
        const totalPaid = studentFees.reduce((sum: number, fee: any) => sum + (Number(fee.paid_amount) || 0), 0);
        const pendingAmount = totalFees - totalPaid;

        let feeStatus: 'Paid' | 'Pending' | 'Partial' | 'Overdue' = 'Pending';
        if (totalPaid >= totalFees && totalFees > 0) {
          feeStatus = 'Paid';
        } else if (totalPaid > 0 && totalPaid < totalFees) {
          feeStatus = 'Partial';
        } else if (studentFees.some((fee: any) => fee.status === 'Overdue')) {
          feeStatus = 'Overdue';
        }

        return {
          id: student.id,
          name: student.name || 'N/A',
          roll_number: student.roll_number || 'N/A',
          department: student.departments?.code || 'N/A',
          department_id: student.department_id,
          tuition_fee: tuitionAmount,
          admission_fee: admissionAmount,
          total_fees: totalFees,
          total_paid: totalPaid,
          pending_amount: pendingAmount,
          fee_status: feeStatus
        };
      });

      setStudents(processedStudents);

      // Calculate department summaries
      const deptSummaries = processedStudents.reduce((acc, student) => {
        const deptKey = student.department_id || 'unknown';
        if (!acc[deptKey]) {
          acc[deptKey] = {
            department_id: student.department_id,
            department_name: student.department,
            department_code: student.department,
            total_students: 0,
            total_fees: 0,
            total_collected: 0,
            pending_amount: 0,
            collection_percentage: 0
          };
        }
        
        acc[deptKey].total_students += 1;
        acc[deptKey].total_fees += student.total_fees;
        acc[deptKey].total_collected += student.total_paid;
        acc[deptKey].pending_amount += student.pending_amount;
        
        return acc;
      }, {} as Record<string, DepartmentSummary>);

      // Calculate collection percentages
      Object.values(deptSummaries).forEach(dept => {
        dept.collection_percentage = dept.total_fees > 0 ? 
          Math.round((dept.total_collected / dept.total_fees) * 100) : 0;
      });

      setDepartments(Object.values(deptSummaries));

      // Calculate institution summary
      const institutionData: InstitutionSummary = {
        total_students: processedStudents.length,
        total_fees: processedStudents.reduce((sum, s) => sum + s.total_fees, 0),
        total_collected: processedStudents.reduce((sum, s) => sum + s.total_paid, 0),
        pending_amount: processedStudents.reduce((sum, s) => sum + s.pending_amount, 0),
        collection_percentage: 0,
        tuition_fees: processedStudents.reduce((sum, s) => sum + s.tuition_fee, 0),
        admission_fees: processedStudents.reduce((sum, s) => sum + s.admission_fee, 0),
        tuition_collected: 0, // Will be calculated from payment data
        admission_collected: 0 // Will be calculated from payment data
      };

      institutionData.collection_percentage = institutionData.total_fees > 0 ? 
        Math.round((institutionData.total_collected / institutionData.total_fees) * 100) : 0;

      setInstitutionSummary(institutionData);

    } catch (error) {
      console.error('Error fetching fee data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch fee data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Paid': return 'text-green-600 bg-green-50';
      case 'Partial': return 'text-yellow-600 bg-yellow-50';
      case 'Overdue': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.roll_number.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = selectedDepartment === 'all' || student.department === selectedDepartment;
    const matchesStatus = selectedFeeStatus === 'all' || student.fee_status.toLowerCase() === selectedFeeStatus;
    
    return matchesSearch && matchesDepartment && matchesStatus;
  });

  const exportData = () => {
    // Simple CSV export functionality
    const csvContent = [
      ['Roll Number', 'Name', 'Department', 'Total Fees', 'Collected', 'Pending', 'Status'],
      ...filteredStudents.map(student => [
        student.roll_number,
        student.name,
        student.department,
        student.total_fees.toString(),
        student.total_paid.toString(),
        student.pending_amount.toString(),
        student.fee_status
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fee_report_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center space-x-3 mb-4">
          <School className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">
            Rajiv Gandhi College of Arts and Sciences
          </h1>
        </div>
        <p className="text-gray-600">Fee Management System</p>
        <p className="text-sm text-gray-500">Sister concern of Rajiv Gandhi College of Engineering</p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 mb-6 border-b">
        {[
          { id: 'institution', label: 'Institution Level', icon: Building2 },
          { id: 'department', label: 'Department Level', icon: School },
          { id: 'student', label: 'Student Level', icon: Users },
          { id: 'feetype', label: 'Fee Type Level', icon: DollarSign }
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveView(id as any)}
            className={cn(
              "flex items-center space-x-2 px-4 py-2 rounded-t-lg border-b-2 transition-colors",
              activeView === id 
                ? "border-blue-600 text-blue-600 bg-blue-50" 
                : "border-transparent text-gray-600 hover:text-gray-800"
            )}
          >
            <Icon className="w-4 h-4" />
            <span className="font-medium">{label}</span>
          </button>
        ))}
      </div>

      {/* Institution Level View */}
      {activeView === 'institution' && institutionSummary && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">Institution Overview</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                <Users className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{institutionSummary.total_students}</div>
                <p className="text-xs text-muted-foreground">Active students</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Fees</CardTitle>
                <DollarSign className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(institutionSummary.total_fees)}</div>
                <p className="text-xs text-muted-foreground">Total fee amount</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Fee Collected</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(institutionSummary.total_collected)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {institutionSummary.collection_percentage}% collected
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Fee</CardTitle>
                <TrendingDown className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {formatCurrency(institutionSummary.pending_amount)}
                </div>
                <p className="text-xs text-muted-foreground">Outstanding amount</p>
              </CardContent>
            </Card>
          </div>

          {/* Department Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Department-wise Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {departments.map(dept => (
                  <div key={dept.department_id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <span className="font-bold text-blue-600">{dept.department_code}</span>
                      </div>
                      <div>
                        <h3 className="font-medium">{dept.department_name}</h3>
                        <p className="text-sm text-gray-600">{dept.total_students} students</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-green-600">
                        {dept.collection_percentage}%
                      </div>
                      <div className="text-sm text-gray-600">
                        {formatCurrency(dept.total_collected)} / {formatCurrency(dept.total_fees)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Department Level View */}
      {activeView === 'department' && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">Department Analysis</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {departments.map(dept => (
              <Card key={dept.department_id}>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <School className="w-5 h-5" />
                    <span>{dept.department_name}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Students</p>
                      <p className="text-xl font-bold">{dept.total_students}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Collection Rate</p>
                      <p className="text-xl font-bold text-green-600">{dept.collection_percentage}%</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Total Fees</span>
                      <span className="font-medium">{formatCurrency(dept.total_fees)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Collected</span>
                      <span className="font-medium text-green-600">{formatCurrency(dept.total_collected)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Pending</span>
                      <span className="font-medium text-red-600">{formatCurrency(dept.pending_amount)}</span>
                    </div>
                  </div>

                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${dept.collection_percentage}%` }}
                    ></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Student Level View */}
      {activeView === 'student' && (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
            <h2 className="text-2xl font-bold text-gray-900">Student Records</h2>
            <div className="flex flex-wrap gap-2">
              <Button onClick={exportData} variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by name or roll number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {[...new Set(students.map(s => s.department))].map(dept => (
                  <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedFeeStatus} onValueChange={setSelectedFeeStatus}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="partial">Partial</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Student Table */}
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Student Details
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Department
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total Fees
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Collected
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Pending
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredStudents.map(student => (
                      <tr key={student.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{student.name}</div>
                            <div className="text-sm text-gray-500">{student.roll_number}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {student.department}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(student.total_fees)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                          {formatCurrency(student.total_paid)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                          {formatCurrency(student.pending_amount)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge className={getStatusColor(student.fee_status)}>
                            {student.fee_status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Fee Type Level View */}
      {activeView === 'feetype' && institutionSummary && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">Fee Type Analysis</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <GraduationCap className="w-5 h-5" />
                  <span>Tuition Fees</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Total Amount</p>
                    <p className="text-xl font-bold">{formatCurrency(institutionSummary.tuition_fees)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Collected</p>
                    <p className="text-xl font-bold text-green-600">{formatCurrency(institutionSummary.tuition_collected)}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Pending</span>
                    <span className="font-medium text-red-600">
                      {formatCurrency(institutionSummary.tuition_fees - institutionSummary.tuition_collected)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${institutionSummary.tuition_fees > 0 ? 
                          (institutionSummary.tuition_collected / institutionSummary.tuition_fees) * 100 : 0}%` 
                      }}
                    ></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <School className="w-5 h-5" />
                  <span>Admission Fees</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Total Amount</p>
                    <p className="text-xl font-bold">{formatCurrency(institutionSummary.admission_fees)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Collected</p>
                    <p className="text-xl font-bold text-green-600">{formatCurrency(institutionSummary.admission_collected)}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Pending</span>
                    <span className="font-medium text-red-600">
                      {formatCurrency(institutionSummary.admission_fees - institutionSummary.admission_collected)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${institutionSummary.admission_fees > 0 ? 
                          (institutionSummary.admission_collected / institutionSummary.admission_fees) * 100 : 0}%` 
                      }}
                    ></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Fee Type Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Overall Fee Collection Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">{formatCurrency(institutionSummary.total_fees)}</div>
                  <div className="text-sm text-gray-600">Total Fees</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">{formatCurrency(institutionSummary.total_collected)}</div>
                  <div className="text-sm text-gray-600">Total Collected</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-red-600">{formatCurrency(institutionSummary.pending_amount)}</div>
                  <div className="text-sm text-gray-600">Total Pending</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default SimplifiedFeeManagement;
