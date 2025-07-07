
import React, { useState, useEffect } from 'react';
import { Search, Filter, Download, Plus, Edit, Trash2, Eye, Users, Calendar } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Checkbox } from '../ui/checkbox';
import { useAuth } from '../../contexts/SupabaseAuthContext';
import { useToast } from '../ui/use-toast';
import { supabase } from '../../integrations/supabase/client';
import { formatCurrency } from '../../utils/feeValidation';
import FeeRecordEditDialog from './FeeRecordEditDialog';
import BulkFeeActions from './BulkFeeActions';

interface FeeRecord {
  id: string;
  student_id: string;
  student_name: string;
  roll_number: string;
  department_name: string;
  year: number;
  semester: number;
  fee_type_name: string;
  academic_year: string;
  original_amount: number;
  final_amount: number;
  paid_amount: number;
  status: string;
  due_date: string;
  created_at: string;
}

interface Department {
  id: string;
  name: string;
}

interface FeeType {
  id: string;
  name: string;
}

const FeeListManagement: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [feeRecords, setFeeRecords] = useState<FeeRecord[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [feeTypes, setFeeTypes] = useState<FeeType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedFeeType, setSelectedFeeType] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedRecords, setSelectedRecords] = useState<string[]>([]);
  const [editingRecord, setEditingRecord] = useState<FeeRecord | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const recordsPerPage = 20;

  useEffect(() => {
    if (user) {
      loadInitialData();
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadFeeRecords();
    }
  }, [user, currentPage, searchTerm, selectedDepartment, selectedYear, selectedFeeType, selectedStatus]);

  const loadInitialData = async () => {
    try {
      // Load departments
      const { data: deptData, error: deptError } = await supabase
        .from('departments')
        .select('id, name')
        .eq('is_active', true);

      if (deptError) throw deptError;
      setDepartments(deptData || []);

      // Load fee types
      const { data: feeTypeData, error: feeTypeError } = await supabase
        .from('fee_types')
        .select('id, name')
        .eq('is_active', true);

      if (feeTypeError) throw feeTypeError;
      setFeeTypes(feeTypeData || []);

    } catch (error) {
      console.error('Error loading initial data:', error);
      toast({
        title: "Error",
        description: "Failed to load initial data",
        variant: "destructive"
      });
    }
  };

  const loadFeeRecords = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase.rpc('get_fee_records_with_filters', {
        p_user_id: user.id,
        p_department: selectedDepartment || null,
        p_year: selectedYear ? parseInt(selectedYear) : null,
        p_fee_type: selectedFeeType || null,
        p_status: selectedStatus || null,
        p_limit: recordsPerPage,
        p_offset: (currentPage - 1) * recordsPerPage
      });

      if (error) throw error;

      setFeeRecords(data || []);
      
      // Get total count
      const { count } = await supabase
        .from('fee_records')
        .select('*', { count: 'exact', head: true });
      
      setTotalRecords(count || 0);

    } catch (error) {
      console.error('Error loading fee records:', error);
      toast({
        title: "Error",
        description: "Failed to load fee records",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (record: FeeRecord) => {
    setEditingRecord(record);
  };

  const handleDelete = async (recordId: string) => {
    if (!user || !['admin', 'principal'].includes(user.role)) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to delete fee records",
        variant: "destructive"
      });
      return;
    }

    if (!confirm('Are you sure you want to delete this fee record?')) return;

    try {
      const { error } = await supabase
        .from('fee_records')
        .delete()
        .eq('id', recordId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Fee record deleted successfully",
      });

      loadFeeRecords();
    } catch (error) {
      console.error('Error deleting fee record:', error);
      toast({
        title: "Error",
        description: "Failed to delete fee record",
        variant: "destructive"
      });
    }
  };

  const handleSelectRecord = (recordId: string, selected: boolean) => {
    if (selected) {
      setSelectedRecords([...selectedRecords, recordId]);
    } else {
      setSelectedRecords(selectedRecords.filter(id => id !== recordId));
    }
  };

  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      setSelectedRecords(feeRecords.map(r => r.id));
    } else {
      setSelectedRecords([]);
    }
  };

  const exportToCSV = () => {
    const csvContent = [
      ['Student', 'Roll Number', 'Department', 'Year', 'Fee Type', 'Total Fee', 'Paid Amount', 'Status', 'Due Date'],
      ...feeRecords.map(record => [
        record.student_name,
        record.roll_number,
        record.department_name,
        record.year.toString(),
        record.fee_type_name,
        record.final_amount.toString(),
        record.paid_amount.toString(),
        record.status,
        record.due_date
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fee_records_${new Date().getTime()}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'Paid': { variant: 'default' as const, className: 'bg-green-100 text-green-800' },
      'Partial': { variant: 'secondary' as const, className: 'bg-yellow-100 text-yellow-800' },
      'Pending': { variant: 'outline' as const, className: 'bg-blue-100 text-blue-800' },
      'Overdue': { variant: 'destructive' as const, className: 'bg-red-100 text-red-800' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.Pending;
    
    return (
      <Badge variant={config.variant} className={config.className}>
        {status}
      </Badge>
    );
  };

  const totalPages = Math.ceil(totalRecords / recordsPerPage);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Fee Management System
            </span>
            <div className="flex gap-2">
              <Button onClick={exportToCSV} variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
              <SelectTrigger>
                <SelectValue placeholder="Department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Departments</SelectItem>
                {departments.map(dept => (
                  <SelectItem key={dept.id} value={dept.name}>{dept.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger>
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Years</SelectItem>
                {[1, 2, 3, 4].map(year => (
                  <SelectItem key={year} value={year.toString()}>Year {year}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedFeeType} onValueChange={setSelectedFeeType}>
              <SelectTrigger>
                <SelectValue placeholder="Fee Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Fee Types</SelectItem>
                {feeTypes.map(type => (
                  <SelectItem key={type.id} value={type.id}>{type.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Status</SelectItem>
                <SelectItem value="Paid">Paid</SelectItem>
                <SelectItem value="Partial">Partial</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Overdue">Overdue</SelectItem>
              </SelectContent>
            </Select>

            <Button 
              onClick={() => {
                setSearchTerm('');
                setSelectedDepartment('');
                setSelectedYear('');
                setSelectedFeeType('');
                setSelectedStatus('');
                setCurrentPage(1);
              }}
              variant="outline"
            >
              Clear Filters
            </Button>
          </div>

          {/* Bulk Actions */}
          {selectedRecords.length > 0 && (
            <BulkFeeActions
              selectedRecords={selectedRecords}
              onBulkUpdate={loadFeeRecords}
              onClear={() => setSelectedRecords([])}
            />
          )}

          {/* Records Table */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedRecords.length === feeRecords.length && feeRecords.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Year</TableHead>
                  <TableHead>Fee Type</TableHead>
                  <TableHead>Total Fee</TableHead>
                  <TableHead>Paid Amount</TableHead>
                  <TableHead>Fee Status</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    </TableCell>
                  </TableRow>
                ) : feeRecords.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8 text-gray-500">
                      No fee records found
                    </TableCell>
                  </TableRow>
                ) : (
                  feeRecords.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedRecords.includes(record.id)}
                          onCheckedChange={(checked) => handleSelectRecord(record.id, checked as boolean)}
                        />
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{record.student_name}</div>
                          <div className="text-sm text-gray-500">{record.roll_number}</div>
                        </div>
                      </TableCell>
                      <TableCell>{record.department_name}</TableCell>
                      <TableCell>{record.year}</TableCell>
                      <TableCell>{record.fee_type_name}</TableCell>
                      <TableCell className="font-medium">{formatCurrency(record.final_amount)}</TableCell>
                      <TableCell className="text-green-600">{formatCurrency(record.paid_amount)}</TableCell>
                      <TableCell>{getStatusBadge(record.status)}</TableCell>
                      <TableCell>{new Date(record.due_date).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEdit(record)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          {user?.role && ['admin', 'principal'].includes(user.role) && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDelete(record.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Showing {((currentPage - 1) * recordsPerPage) + 1} to {Math.min(currentPage * recordsPerPage, totalRecords)} of {totalRecords} records
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <span className="text-sm">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      {editingRecord && (
        <FeeRecordEditDialog
          record={editingRecord}
          feeTypes={feeTypes}
          onClose={() => setEditingRecord(null)}
          onSave={loadFeeRecords}
        />
      )}
    </div>
  );
};

export default FeeListManagement;
