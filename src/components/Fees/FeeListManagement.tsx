
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Checkbox } from '../ui/checkbox';
import { useToast } from '../ui/use-toast';
import { Search, Filter, Download, FileText, DollarSign, Users, TrendingUp, Edit, Settings, Trash2 } from 'lucide-react';
import { supabase } from '../../integrations/supabase/client';
import { useAuth } from '../../contexts/SupabaseAuthContext';
import AdminDataEditor from './AdminDataEditor';
import AdminBulkEditor from './AdminBulkEditor';
import { Dialog, DialogContent } from '../ui/dialog';

interface FeeRecord {
  id: string;
  student_name: string;
  roll_number: string;
  department_name: string;
  academic_year: string;
  semester: number;
  original_amount: number;
  final_amount: number;
  paid_amount: number;
  status: string;
  due_date: string;
  created_at: string;
  student_id: string;
}

const FeeListManagement: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [feeRecords, setFeeRecords] = useState<FeeRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [selectedRecords, setSelectedRecords] = useState<string[]>([]);
  const [editingRecord, setEditingRecord] = useState<FeeRecord | null>(null);
  const [showBulkEditor, setShowBulkEditor] = useState(false);
  
  // Summary stats
  const [stats, setStats] = useState({
    totalRecords: 0,
    totalAmount: 0,
    collectedAmount: 0,
    pendingAmount: 0
  });

  useEffect(() => {
    loadFeeRecords();
  }, [user]);

  const loadFeeRecords = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Use direct query with proper joins
      const { data, error } = await supabase
        .from('fee_records')
        .select(`
          id,
          student_id,
          academic_year,
          semester,
          original_amount,
          final_amount,
          paid_amount,
          status,
          due_date,
          created_at,
          profiles!fee_records_student_id_fkey(
            name,
            roll_number,
            departments!profiles_department_id_fkey(name)
          )
        `)
        .limit(100);

      if (error) {
        console.error('Error loading fee records:', error);
        throw error;
      }

      // Transform the data to match expected format
      const transformedData = data?.map(record => ({
        id: record.id,
        student_id: record.student_id,
        student_name: record.profiles?.name || 'Unknown',
        roll_number: record.profiles?.roll_number || '',
        department_name: record.profiles?.departments?.name || '',
        academic_year: record.academic_year,
        semester: record.semester,
        original_amount: record.original_amount,
        final_amount: record.final_amount,
        paid_amount: record.paid_amount || 0,
        status: record.status || 'Pending',
        due_date: record.due_date,
        created_at: record.created_at
      })) || [];

      setFeeRecords(transformedData);
      
      // Calculate summary stats
      const totalAmount = transformedData.reduce((sum, record) => sum + record.final_amount, 0);
      const collectedAmount = transformedData.reduce((sum, record) => sum + (record.paid_amount || 0), 0);
      
      setStats({
        totalRecords: transformedData.length,
        totalAmount,
        collectedAmount,
        pendingAmount: totalAmount - collectedAmount
      });

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

  const handleSelectRecord = (recordId: string, selected: boolean) => {
    if (selected) {
      setSelectedRecords(prev => [...prev, recordId]);
    } else {
      setSelectedRecords(prev => prev.filter(id => id !== recordId));
    }
  };

  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      setSelectedRecords(filteredRecords.map(record => record.id));
    } else {
      setSelectedRecords([]);
    }
  };

  const handleDeleteRecord = async (recordId: string) => {
    if (!user || !['admin', 'principal', 'chairman'].includes(user.role)) {
      toast({
        title: "Access Denied",
        description: "Only admins can delete records",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('fee_records')
        .delete()
        .eq('id', recordId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Fee record deleted successfully"
      });

      loadFeeRecords();
    } catch (error) {
      console.error('Error deleting record:', error);
      toast({
        title: "Error",
        description: "Failed to delete record",
        variant: "destructive"
      });
    }
  };

  const filteredRecords = feeRecords.filter(record => {
    const matchesSearch = 
      record.student_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.roll_number?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || record.status === statusFilter;
    const matchesDepartment = departmentFilter === 'all' || record.department_name === departmentFilter;

    return matchesSearch && matchesStatus && matchesDepartment;
  });

  const exportToCSV = () => {
    const csvContent = [
      ['Student Name', 'Roll Number', 'Department', 'Academic Year', 'Semester', 'Original Amount', 'Final Amount', 'Paid Amount', 'Status', 'Due Date'].join(','),
      ...filteredRecords.map(record => [
        record.student_name || '',
        record.roll_number || '',
        record.department_name || '',
        record.academic_year || '',
        record.semester || '',
        record.original_amount || 0,
        record.final_amount || 0,
        record.paid_amount || 0,
        record.status || '',
        record.due_date || ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fee_records_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'partial': return 'bg-yellow-100 text-yellow-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const uniqueDepartments = [...new Set(feeRecords.map(record => record.department_name))].filter(Boolean);
  const canEdit = user?.role && ['admin', 'principal', 'chairman'].includes(user.role);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Fee Management</h2>
          <p className="text-gray-600">Manage and track student fee records</p>
        </div>
        <div className="flex gap-2">
          {canEdit && selectedRecords.length > 0 && (
            <Button
              variant="outline"
              onClick={() => setShowBulkEditor(true)}
            >
              <Settings className="w-4 h-4 mr-2" />
              Bulk Edit ({selectedRecords.length})
            </Button>
          )}
          <Button
            variant="outline"
            onClick={exportToCSV}
            disabled={filteredRecords.length === 0}
          >
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Records</p>
                <p className="text-2xl font-bold">{stats.totalRecords}</p>
              </div>
              <FileText className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Amount</p>
                <p className="text-2xl font-bold">₹{stats.totalAmount.toLocaleString()}</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Collected</p>
                <p className="text-2xl font-bold">₹{stats.collectedAmount.toLocaleString()}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold">₹{stats.pendingAmount.toLocaleString()}</p>
              </div>
              <Users className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search by student name or roll number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Paid">Paid</SelectItem>
                <SelectItem value="Partial">Partial</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Overdue">Overdue</SelectItem>
              </SelectContent>
            </Select>

            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {uniqueDepartments.map(dept => (
                  <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {canEdit && (
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="select-all"
                  checked={selectedRecords.length === filteredRecords.length && filteredRecords.length > 0}
                  onCheckedChange={handleSelectAll}
                />
                <label htmlFor="select-all" className="text-sm">Select All</label>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Fee Records List */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRecords.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Fee Records Found</h3>
                <p className="text-gray-600">
                  No fee records match your current filter criteria.
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredRecords.map((record) => (
              <Card key={record.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {canEdit && (
                        <Checkbox
                          checked={selectedRecords.includes(record.id)}
                          onCheckedChange={(checked) => handleSelectRecord(record.id, checked as boolean)}
                        />
                      )}
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-2">
                          <h3 className="text-lg font-semibold">{record.student_name}</h3>
                          <Badge variant="outline">{record.roll_number}</Badge>
                          <Badge className={getStatusColor(record.status)}>
                            {record.status}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Department:</span>
                            <div className="font-medium">{record.department_name}</div>
                          </div>
                          <div>
                            <span className="text-gray-600">Academic Year:</span>
                            <div className="font-medium">{record.academic_year}</div>
                          </div>
                          <div>
                            <span className="text-gray-600">Semester:</span>
                            <div className="font-medium">{record.semester}</div>
                          </div>
                          <div>
                            <span className="text-gray-600">Final Amount:</span>
                            <div className="font-medium text-blue-600">₹{record.final_amount?.toLocaleString()}</div>
                          </div>
                          <div>
                            <span className="text-gray-600">Paid Amount:</span>
                            <div className="font-medium text-green-600">₹{(record.paid_amount || 0).toLocaleString()}</div>
                          </div>
                        </div>

                        <div className="flex gap-4 mt-3 text-sm text-gray-600">
                          <div>
                            <span>Due Date: </span>
                            <span className="font-medium">
                              {record.due_date ? new Date(record.due_date).toLocaleDateString() : 'N/A'}
                            </span>
                          </div>
                          {record.original_amount !== record.final_amount && (
                            <div>
                              <span>Original: </span>
                              <span className="font-medium">₹{record.original_amount?.toLocaleString()}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {canEdit && (
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingRecord(record)}
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteRecord(record.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={!!editingRecord} onOpenChange={() => setEditingRecord(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {editingRecord && (
            <AdminDataEditor
              type="fee_record"
              data={editingRecord}
              onSave={() => {
                setEditingRecord(null);
                loadFeeRecords();
              }}
              onCancel={() => setEditingRecord(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Bulk Edit Dialog */}
      <Dialog open={showBulkEditor} onOpenChange={setShowBulkEditor}>
        <DialogContent className="max-w-2xl">
          <AdminBulkEditor
            selectedIds={selectedRecords}
            type="fee_record"
            onComplete={() => {
              setShowBulkEditor(false);
              setSelectedRecords([]);
              loadFeeRecords();
            }}
            onCancel={() => setShowBulkEditor(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FeeListManagement;
