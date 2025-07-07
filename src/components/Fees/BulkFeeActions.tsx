
import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Input } from '../ui/input';
import { Card, CardContent } from '../ui/card';
import { useAuth } from '../../contexts/SupabaseAuthContext';
import { useToast } from '../ui/use-toast';
import { supabase } from '../../integrations/supabase/client';
import { Users, Calendar, CheckCircle } from 'lucide-react';
import { Database } from '../../integrations/supabase/types';

type FeeStatus = Database['public']['Enums']['fee_status'];

interface BulkFeeActionsProps {
  selectedRecords: string[];
  onBulkUpdate: () => void;
  onClear: () => void;
}

const BulkFeeActions: React.FC<BulkFeeActionsProps> = ({
  selectedRecords,
  onBulkUpdate,
  onClear
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [bulkStatus, setBulkStatus] = useState<FeeStatus | 'no_change'>('no_change');
  const [bulkDueDate, setBulkDueDate] = useState('');

  const handleBulkUpdate = async () => {
    if (!user || !['admin', 'principal'].includes(user.role)) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to perform bulk updates",
        variant: "destructive"
      });
      return;
    }

    if (bulkStatus === 'no_change' && !bulkDueDate) {
      toast({
        title: "No Changes",
        description: "Please select a status or due date to update",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('bulk_update_fee_records', {
        p_user_id: user.id,
        p_record_ids: selectedRecords,
        p_status: bulkStatus === 'no_change' ? null : bulkStatus,
        p_due_date: bulkDueDate || null
      });

      if (error) throw error;

      const result = data as { success: boolean; updated_count: number; error?: string };

      if (result.success) {
        toast({
          title: "Success",
          description: `Updated ${result.updated_count} fee records`,
        });
        onBulkUpdate();
        onClear();
        setBulkStatus('no_change');
        setBulkDueDate('');
      } else {
        throw new Error(result.error || 'Bulk update failed');
      }
    } catch (error) {
      console.error('Error performing bulk update:', error);
      toast({
        title: "Error",
        description: "Failed to perform bulk update",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const canPerformBulkActions = user?.role && ['admin', 'principal'].includes(user.role);

  if (!canPerformBulkActions) {
    return (
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="py-3">
          <div className="flex items-center gap-2 text-blue-700">
            <Users className="w-4 h-4" />
            <span>{selectedRecords.length} records selected</span>
            <Button variant="outline" size="sm" onClick={onClear}>Clear Selection</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardContent className="py-4">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2 text-blue-700">
            <Users className="w-4 h-4" />
            <span className="font-medium">{selectedRecords.length} records selected</span>
          </div>

          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-blue-600" />
            <Select value={bulkStatus} onValueChange={(value: FeeStatus | 'no_change') => setBulkStatus(value)}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Update Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="no_change">No Change</SelectItem>
                <SelectItem value="Paid">Paid</SelectItem>
                <SelectItem value="Partial">Partial</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Overdue">Overdue</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-600" />
            <Input
              type="date"
              value={bulkDueDate}
              onChange={(e) => setBulkDueDate(e.target.value)}
              className="w-40"
              placeholder="Update Due Date"
            />
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleBulkUpdate}
              disabled={loading || (bulkStatus === 'no_change' && !bulkDueDate)}
              size="sm"
            >
              {loading ? 'Updating...' : 'Apply Changes'}
            </Button>
            <Button variant="outline" size="sm" onClick={onClear}>
              Clear Selection
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BulkFeeActions;
