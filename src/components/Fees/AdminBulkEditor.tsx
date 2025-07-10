
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Checkbox } from '../ui/checkbox';
import { useToast } from '../ui/use-toast';
import { supabase } from '../../integrations/supabase/client';
import { useAuth } from '../../contexts/SupabaseAuthContext';
import { Settings, Save } from 'lucide-react';

interface AdminBulkEditorProps {
  selectedIds: string[];
  type: 'fee_record' | 'scholarship';
  onComplete: () => void;
  onCancel: () => void;
}

const AdminBulkEditor: React.FC<AdminBulkEditorProps> = ({
  selectedIds,
  type,
  onComplete,
  onCancel
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [updateFields, setUpdateFields] = useState<Record<string, any>>({});
  const [enabledFields, setEnabledFields] = useState<Record<string, boolean>>({});

  const handleFieldToggle = (field: string, enabled: boolean) => {
    setEnabledFields(prev => ({ ...prev, [field]: enabled }));
    if (!enabled) {
      const newFields = { ...updateFields };
      delete newFields[field];
      setUpdateFields(newFields);
    }
  };

  const handleFieldChange = (field: string, value: any) => {
    setUpdateFields(prev => ({ ...prev, [field]: value }));
  };

  const handleBulkUpdate = async () => {
    if (!user || !['admin', 'principal', 'chairman'].includes(user.role)) {
      toast({
        title: "Access Denied",
        description: "Only admins can perform bulk updates",
        variant: "destructive"
      });
      return;
    }

    if (Object.keys(updateFields).length === 0) {
      toast({
        title: "No Changes",
        description: "Please select at least one field to update",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const table = type === 'fee_record' ? 'fee_records' : 'scholarships';
      const finalUpdateData = {
        ...updateFields,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from(table)
        .update(finalUpdateData)
        .in('id', selectedIds);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Updated ${selectedIds.length} records successfully`
      });

      onComplete();
    } catch (error) {
      console.error('Error performing bulk update:', error);
      toast({
        title: "Error",
        description: "Failed to update records",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const renderFeeRecordFields = () => (
    <>
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="status"
            checked={enabledFields.status || false}
            onCheckedChange={(checked) => handleFieldToggle('status', checked as boolean)}
          />
          <Label htmlFor="status">Update Status</Label>
          {enabledFields.status && (
            <Select onValueChange={(value) => handleFieldChange('status', value)}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Paid">Paid</SelectItem>
                <SelectItem value="Partial">Partial</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Overdue">Overdue</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="due_date"
            checked={enabledFields.due_date || false}
            onCheckedChange={(checked) => handleFieldToggle('due_date', checked as boolean)}
          />
          <Label htmlFor="due_date">Update Due Date</Label>
          {enabledFields.due_date && (
            <Input
              type="date"
              className="w-40"
              onChange={(e) => handleFieldChange('due_date', e.target.value)}
            />
          )}
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="academic_year"
            checked={enabledFields.academic_year || false}
            onCheckedChange={(checked) => handleFieldToggle('academic_year', checked as boolean)}
          />
          <Label htmlFor="academic_year">Update Academic Year</Label>
          {enabledFields.academic_year && (
            <Input
              className="w-40"
              placeholder="2024-25"
              onChange={(e) => handleFieldChange('academic_year', e.target.value)}
            />
          )}
        </div>
      </div>
    </>
  );

  const renderScholarshipFields = () => (
    <>
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="applied_status"
            checked={enabledFields.applied_status || false}
            onCheckedChange={(checked) => handleFieldToggle('applied_status', checked as boolean)}
          />
          <Label htmlFor="applied_status">Update Applied Status</Label>
          {enabledFields.applied_status && (
            <Select onValueChange={(value) => handleFieldChange('applied_status', value === 'true')}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Applied?" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="false">Not Applied</SelectItem>
                <SelectItem value="true">Applied</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="received_by_institution"
            checked={enabledFields.received_by_institution || false}
            onCheckedChange={(checked) => handleFieldToggle('received_by_institution', checked as boolean)}
          />
          <Label htmlFor="received_by_institution">Update Receipt Status</Label>
          {enabledFields.received_by_institution && (
            <Select onValueChange={(value) => handleFieldChange('received_by_institution', value === 'true')}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Received?" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="false">Not Received</SelectItem>
                <SelectItem value="true">Received</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="academic_year"
            checked={enabledFields.academic_year || false}
            onCheckedChange={(checked) => handleFieldToggle('academic_year', checked as boolean)}
          />
          <Label htmlFor="academic_year">Update Academic Year</Label>
          {enabledFields.academic_year && (
            <Input
              className="w-40"
              placeholder="2024-25"
              onChange={(e) => handleFieldChange('academic_year', e.target.value)}
            />
          )}
        </div>
      </div>
    </>
  );

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Bulk Edit {selectedIds.length} {type.replace('_', ' ')} Records
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-sm text-gray-600">
          Select the fields you want to update for all selected records:
        </div>
        
        {type === 'fee_record' && renderFeeRecordFields()}
        {type === 'scholarship' && renderScholarshipFields()}

        <div className="flex gap-2 pt-4">
          <Button onClick={handleBulkUpdate} disabled={loading}>
            <Save className="w-4 h-4 mr-2" />
            {loading ? 'Updating...' : 'Update All Selected'}
          </Button>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminBulkEditor;
