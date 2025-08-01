
import React, { useState, useEffect } from 'react';
import { Award, Users, DollarSign, Calendar, Search, Download, CheckCircle, Clock, AlertCircle, Edit, Trash2, MoreHorizontal, Settings } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { Checkbox } from '../ui/checkbox';
import { Dialog, DialogContent } from '../ui/dialog';
import { useToast } from '../ui/use-toast';
import { supabase } from '../../integrations/supabase/client';
import { useAuth } from '../../contexts/SupabaseAuthContext';
import { ScholarshipWithProfile, ScholarshipSummary } from '../../types/user-student-fees';
import ScholarshipCreateDialog from './ScholarshipCreateDialog';
import ScholarshipEditDialog from './ScholarshipEditDialog';
import ScholarshipDeleteDialog from './ScholarshipDeleteDialog';
import AdminDataEditor from './AdminDataEditor';
import AdminBulkEditor from './AdminBulkEditor';

const ScholarshipManagement: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [scholarships, setScholarships] = useState<ScholarshipWithProfile[]>([]);
  const [summary, setSummary] = useState<ScholarshipSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [academicYear] = useState('2024-25');
  const [selectedScholarships, setSelectedScholarships] = useState<string[]>([]);

  // Dialog states
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedScholarship, setSelectedScholarship] = useState<ScholarshipWithProfile | null>(null);
  const [adminEditingScholarship, setAdminEditingScholarship] = useState<ScholarshipWithProfile | null>(null);
  const [showBulkEditor, setShowBulkEditor] = useState(false);

  useEffect(() => {
    fetchScholarshipData();
  }, []);

  const fetchScholarshipData = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Fetch scholarships based on user role with explicit relationship specification
      let scholarshipQuery = supabase
        .from('scholarships')
        .select(`
          *,
          profiles!scholarships_student_id_fkey(
            name,
            roll_number,
            department_id,
            departments!profiles_department_id_fkey(name, code)
          )
        `)
        .eq('academic_year', academicYear);

      // Apply role-based filtering
      if (user.role === 'hod') {
        scholarshipQuery = scholarshipQuery.eq('profiles.department_id', user.department_id);
      }

      const { data: scholarshipData, error: scholarshipError } = await scholarshipQuery;
      if (scholarshipError) throw scholarshipError;

      // Cast the scholarship_type to the correct union type
      const typedScholarships = (scholarshipData || []).map(scholarship => ({
        ...scholarship,
        scholarship_type: scholarship.scholarship_type as 'PMSS' | 'FG'
      }));

      setScholarships(typedScholarships);

      // Fetch scholarship summary
      const { data: summaryData, error: summaryError } = await supabase
        .from('scholarship_summary')
        .select('*')
        .eq('academic_year', academicYear);

      if (summaryError) throw summaryError;
      setSummary(summaryData || []);

    } catch (error) {
      console.error('Error fetching scholarship data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch scholarship data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateScholarshipStatus = async (scholarshipId: string, field: string, value: boolean | string) => {
    try {
      const updateData: any = { [field]: value };
      
      if (field === 'applied_status' && value) {
        updateData.application_date = new Date().toISOString().split('T')[0];
      }
      
      if (field === 'received_by_institution' && value) {
        updateData.receipt_date = new Date().toISOString().split('T')[0];
      }

      const { error } = await supabase
        .from('scholarships')
        .update(updateData)
        .eq('id', scholarshipId);

      if (error) throw error;

      await fetchScholarshipData();
      
      toast({
        title: "Success",
        description: "Scholarship status updated successfully",
      });
    } catch (error) {
      console.error('Error updating scholarship:', error);
      toast({
        title: "Error",
        description: "Failed to update scholarship status",
        variant: "destructive"
      });
    }
  };

  const handleSelectScholarship = (scholarshipId: string, selected: boolean) => {
    if (selected) {
      setSelectedScholarships(prev => [...prev, scholarshipId]);
    } else {
      setSelectedScholarships(prev => prev.filter(id => id !== scholarshipId));
    }
  };

  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      setSelectedScholarships(filteredScholarships.map(s => s.id));
    } else {
      setSelectedScholarships([]);
    }
  };

  const handleEdit = (scholarship: ScholarshipWithProfile) => {
    setSelectedScholarship(scholarship);
    setEditDialogOpen(true);
  };

  const handleAdminEdit = (scholarship: ScholarshipWithProfile) => {
    setAdminEditingScholarship(scholarship);
  };

  const handleDelete = (scholarship: ScholarshipWithProfile) => {
    setSelectedScholarship(scholarship);
    setDeleteDialogOpen(true);
  };

  const handleDeleteSelected = async () => {
    if (!user || !['admin', 'principal', 'chairman'].includes(user.role)) {
      toast({
        title: "Access Denied",
        description: "Only admins can delete scholarships",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('scholarships')
        .delete()
        .in('id', selectedScholarships);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Deleted ${selectedScholarships.length} scholarships successfully`
      });

      setSelectedScholarships([]);
      fetchScholarshipData();
    } catch (error) {
      console.error('Error deleting scholarships:', error);
      toast({
        title: "Error",
        description: "Failed to delete scholarships",
        variant: "destructive"
      });
    }
  };

  const filteredScholarships = scholarships.filter(scholarship => {
    const matchesSearch = 
      scholarship.profiles?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      scholarship.profiles?.roll_number?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'applied' && scholarship.applied_status) ||
      (statusFilter === 'not_applied' && !scholarship.applied_status) ||
      (statusFilter === 'received' && scholarship.received_by_institution) ||
      (statusFilter === 'pending' && !scholarship.received_by_institution);
    
    const matchesType = typeFilter === 'all' || scholarship.scholarship_type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  const exportToCSV = () => {
    const csvContent = [
      ['Student Name', 'Roll Number', 'Department', 'Scholarship Type', 'Amount', 'Applied', 'Received', 'Application Date', 'Receipt Date'].join(','),
      ...filteredScholarships.map(s => [
        s.profiles?.name || '',
        s.profiles?.roll_number || '',
        s.profiles?.departments?.name || '',
        s.scholarship_type,
        s.eligible_amount,
        s.applied_status ? 'Yes' : 'No',
        s.received_by_institution ? 'Yes' : 'No',
        s.application_date || '',
        s.receipt_date || ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `scholarship_report_${academicYear}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const totalStats = summary.reduce((acc, dept) => ({
    totalStudents: acc.totalStudents + dept.total_scholarship_students,
    totalAmount: acc.totalAmount + dept.total_eligible_amount,
    totalReceived: acc.totalReceived + dept.total_received_amount,
    totalScholarships: acc.totalScholarships + dept.total_scholarships
  }), { totalStudents: 0, totalAmount: 0, totalReceived: 0, totalScholarships: 0 });

  const canManageScholarships = user?.role && ['admin', 'principal', 'hod'].includes(user.role);
  const canEdit = user?.role && ['admin', 'principal', 'chairman'].includes(user.role);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Scholarship Management</h2>
          <p className="text-gray-600">Manage student scholarships and government disbursements</p>
        </div>
        <div className="flex gap-2">
          {canEdit && selectedScholarships.length > 0 && (
            <>
              <Button
                variant="outline"
                onClick={() => setShowBulkEditor(true)}
              >
                <Settings className="w-4 h-4 mr-2" />
                Bulk Edit ({selectedScholarships.length})
              </Button>
              <Button
                variant="outline"
                onClick={handleDeleteSelected}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Selected
              </Button>
            </>
          )}
          {canManageScholarships && (
            <ScholarshipCreateDialog onScholarshipCreated={fetchScholarshipData} />
          )}
          <Button
            variant="outline"
            onClick={exportToCSV}
            disabled={filteredScholarships.length === 0}
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
                <p className="text-sm font-medium text-gray-600">Eligible Students</p>
                <p className="text-2xl font-bold">{totalStats.totalStudents}</p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Eligible</p>
                <p className="text-2xl font-bold">₹{totalStats.totalAmount.toLocaleString()}</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Amount Received</p>
                <p className="text-2xl font-bold">₹{totalStats.totalReceived.toLocaleString()}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Collection %</p>
                <p className="text-2xl font-bold">
                  {totalStats.totalAmount > 0 
                    ? Math.round((totalStats.totalReceived / totalStats.totalAmount) * 100)
                    : 0}%
                </p>
              </div>
              <Award className="w-8 h-8 text-purple-600" />
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
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="applied">Applied</SelectItem>
                <SelectItem value="not_applied">Not Applied</SelectItem>
                <SelectItem value="received">Received by Institution</SelectItem>
                <SelectItem value="pending">Pending Receipt</SelectItem>
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="PMSS">PMSS (SC/ST)</SelectItem>
                <SelectItem value="FG">First Generation</SelectItem>
              </SelectContent>
            </Select>

            {canEdit && (
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="select-all"
                  checked={selectedScholarships.length === filteredScholarships.length && filteredScholarships.length > 0}
                  onCheckedChange={handleSelectAll}
                />
                <label htmlFor="select-all" className="text-sm">Select All</label>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Scholarships List */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredScholarships.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Award className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Scholarships Found</h3>
                <p className="text-gray-600">
                  No scholarship records match your current filter criteria.
                </p>
                {canManageScholarships && (
                  <div className="mt-4">
                    <ScholarshipCreateDialog onScholarshipCreated={fetchScholarshipData} />
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            filteredScholarships.map((scholarship) => (
              <Card key={scholarship.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {canEdit && (
                        <Checkbox
                          checked={selectedScholarships.includes(scholarship.id)}
                          onCheckedChange={(checked) => handleSelectScholarship(scholarship.id, checked as boolean)}
                        />
                      )}
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-2">
                          <h3 className="text-lg font-semibold">{scholarship.profiles?.name}</h3>
                          <Badge variant="outline">{scholarship.profiles?.roll_number}</Badge>
                          <Badge variant={scholarship.scholarship_type === 'PMSS' ? 'default' : 'secondary'}>
                            {scholarship.scholarship_type === 'PMSS' ? 'PMSS (SC/ST)' : 'First Generation'}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Department:</span>
                            <div className="font-medium">{scholarship.profiles?.departments?.name}</div>
                          </div>
                          <div>
                            <span className="text-gray-600">Amount:</span>
                            <div className="font-medium text-green-600">₹{scholarship.eligible_amount.toLocaleString()}</div>
                          </div>
                          <div>
                            <span className="text-gray-600">Application:</span>
                            <div className={`flex items-center gap-1 ${scholarship.applied_status ? 'text-green-600' : 'text-orange-600'}`}>
                              {scholarship.applied_status ? <CheckCircle className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                              {scholarship.applied_status ? 'Applied' : 'Not Applied'}
                            </div>
                          </div>
                          <div>
                            <span className="text-gray-600">Institution Receipt:</span>
                            <div className={`flex items-center gap-1 ${scholarship.received_by_institution ? 'text-green-600' : 'text-red-600'}`}>
                              {scholarship.received_by_institution ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                              {scholarship.received_by_institution ? 'Received' : 'Pending'}
                            </div>
                          </div>
                        </div>

                        {(scholarship.application_date || scholarship.receipt_date) && (
                          <div className="flex gap-4 mt-3 text-sm text-gray-600">
                            {scholarship.application_date && (
                              <div className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                Applied: {new Date(scholarship.application_date).toLocaleDateString()}
                              </div>
                            )}
                            {scholarship.receipt_date && (
                              <div className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                Received: {new Date(scholarship.receipt_date).toLocaleDateString()}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 ml-4">
                      {/* Quick Status Update Buttons */}
                      {canManageScholarships && (
                        <>
                          {!scholarship.applied_status && (
                            <Button
                              size="sm"
                              onClick={() => updateScholarshipStatus(scholarship.id, 'applied_status', true)}
                            >
                              Mark Applied
                            </Button>
                          )}
                          {scholarship.applied_status && !scholarship.received_by_institution && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateScholarshipStatus(scholarship.id, 'received_by_institution', true)}
                            >
                              Mark Received
                            </Button>
                          )}
                        </>
                      )}

                      {/* More Actions Menu */}
                      {canManageScholarships && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEdit(scholarship)}>
                              <Edit className="w-4 h-4 mr-2" />
                              Basic Edit
                            </DropdownMenuItem>
                            {canEdit && (
                              <DropdownMenuItem onClick={() => handleAdminEdit(scholarship)}>
                                <Settings className="w-4 h-4 mr-2" />
                                Admin Edit
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem 
                              onClick={() => handleDelete(scholarship)}
                              className="text-red-600"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Edit Dialog */}
      <ScholarshipEditDialog
        scholarship={selectedScholarship}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onScholarshipUpdated={fetchScholarshipData}
      />

      {/* Delete Dialog */}
      <ScholarshipDeleteDialog
        scholarship={selectedScholarship}
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onScholarshipDeleted={fetchScholarshipData}
      />

      {/* Admin Edit Dialog */}
      <Dialog open={!!adminEditingScholarship} onOpenChange={() => setAdminEditingScholarship(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {adminEditingScholarship && (
            <AdminDataEditor
              type="scholarship"
              data={adminEditingScholarship}
              onSave={() => {
                setAdminEditingScholarship(null);
                fetchScholarshipData();
              }}
              onCancel={() => setAdminEditingScholarship(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Bulk Edit Dialog */}
      <Dialog open={showBulkEditor} onOpenChange={setShowBulkEditor}>
        <DialogContent className="max-w-2xl">
          <AdminBulkEditor
            selectedIds={selectedScholarships}
            type="scholarship"
            onComplete={() => {
              setShowBulkEditor(false);
              setSelectedScholarships([]);
              fetchScholarshipData();
            }}
            onCancel={() => setShowBulkEditor(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ScholarshipManagement;
