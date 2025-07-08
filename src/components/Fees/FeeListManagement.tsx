
import React, { useState, useEffect } from 'react';
import { Search, Filter, Download, Plus, Edit, Trash2, Eye, Users, Calendar, BarChart3 } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Checkbox } from '../ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { useAuth } from '../../contexts/SupabaseAuthContext';
import { useToast } from '../ui/use-toast';
import { supabase } from '../../integrations/supabase/client';
import { formatCurrency } from '../../utils/feeValidation';
import FeeRecordEditDialog from './FeeRecordEditDialog';
import BulkFeeActions from './BulkFeeActions';
import DepartmentAnalytics from './DepartmentAnalytics';
import UserActivityLogs from '../Admin/UserActivityLogs';
import EnhancedFeeFilters, { FeeFilterOptions } from './EnhancedFeeFilters';
import EnhancedCSVUploader from './EnhancedCSVUploader';

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
  const [selectedRecords, setSelectedRecords] = useState<string[]>([]);
  const [editingRecord, setEditingRecord] = useState<FeeRecord | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const recordsPerPage = 20;

  // Enhanced filter state
  const [filters, setFilters] = useState<FeeFilterOptions>({
    searchTerm: '',
    selectedDepartment: 'all',
    selectedYear: 'all',
    selectedFeeType: 'all',
    selectedStatus: 'all',
    fromDate: '',
    toDate: '',
    dateFilterType: 'created_at',
    minAmount: '',
    maxAmount: ''
  });

  useEffect(() => {
    if (user) {
      loadInitialData();
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadFeeRecords();
    }
  }, [user, currentPage, filters]);

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
        p_department: filters.selectedDepartment === 'all' ? null : filters.selectedDepartment,
        p_year: filters.selectedYear === 'all' ? null : parseInt(filters.selectedYear),
        p_fee_type: filters.selectedFeeType === 'all' ? null : filters.selectedFeeType,
        p_status: filters.selectedStatus === 'all' ? null : filters.selectedStatus,
        p_from_date: filters.fromDate || null,
        p_to_date: filters.toDate || null,
        p_date_filter_type: filters.dateFilterType,
        p_min_amount: filters.minAmount ? parseFloat(filters.minAmount) : null,
        p_max_amount: filters.maxAmount ? parseFloat(filters.maxAmount) : null,
        p_limit: recordsPerPage,
        p_offset: (currentPage - 1) * recordsPerPage
      });

      if (error) throw error;

      setFeeRecords(data || []);
      
      // Get total count with same filters
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
    if (!user || !['admin', 'principal', 'chairman'].includes(user.role)) {
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
    a.download = `filtered_fee_records_${new Date().getTime()}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Export Complete",
      description: "Filtered fee records exported successfully",
    });
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
              Enhanced Fee Management System
            </span>
            <div className="flex gap-2">
              <Button onClick={exportToCSV} variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export Filtered Data
              </Button>
            </div>
          </CardTitle>
        </CardHeader>

        <CardContent>
          <Tabs defaultValue="records" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="records" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Fee Records
              </TabsTrigger>
              <TabsTrigger value="upload" className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                CSV Upload
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Analytics
              </TabsTrigger>
              <TabsTrigger value="activity" className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Activity
              </TabsTrigger>
            </TabsList>

            <TabsContent value="records" className="space-y-4">
              {/* Enhanced Filters */}
              <EnhancedFeeFilters
                filters={filters}
                onFiltersChange={setFilters}
                departments={departments}
                feeTypes={feeTypes}
                totalRecords={totalRecords}
                filteredRecords={feeRecords.length}
                loading={loading}
              />

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
                          No fee records found with current filters
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
                              {user?.role && ['admin', 'principal', 'chairman'].includes(user.role) && (
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
            </TabsContent>

            <TabsContent value="upload">
              <EnhancedCSVUploader onUploadComplete={loadFeeRecords} />
            </TabsContent>

            <TabsContent value="analytics">
              <DepartmentAnalytics />
            </TabsContent>

            <TabsContent value="activity">
              <UserActivityLogs />
            </TabsContent>
          </Tabs>
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
