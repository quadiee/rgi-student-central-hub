
import React from 'react';
import { Calendar, Filter, DollarSign, Building2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Checkbox } from '../ui/checkbox';

interface Department {
  id: string;
  name: string;
  code: string;
}

interface FeeTypeAnalyticsFiltersProps {
  departments: Department[];
  filters: {
    fromDate: string;
    toDate: string;
    dateFilterType: string;
    selectedDepartments: string[];
    statusFilter: string[];
    minAmount: string;
    maxAmount: string;
  };
  onFiltersChange: (filters: any) => void;
  onApplyFilters: () => void;
  onClearFilters: () => void;
  loading?: boolean;
}

const FeeTypeAnalyticsFilters: React.FC<FeeTypeAnalyticsFiltersProps> = ({
  departments,
  filters,
  onFiltersChange,
  onApplyFilters,
  onClearFilters,
  loading = false
}) => {
  const statusOptions = ['Pending', 'Paid', 'Partial', 'Overdue'];

  const handleDepartmentToggle = (departmentId: string, checked: boolean) => {
    const updatedDepartments = checked
      ? [...filters.selectedDepartments, departmentId]
      : filters.selectedDepartments.filter(id => id !== departmentId);
    
    onFiltersChange({
      ...filters,
      selectedDepartments: updatedDepartments
    });
  };

  const handleStatusToggle = (status: string, checked: boolean) => {
    const updatedStatus = checked
      ? [...filters.statusFilter, status]
      : filters.statusFilter.filter(s => s !== status);
    
    onFiltersChange({
      ...filters,
      statusFilter: updatedStatus
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="w-5 h-5" />
          Fee Type Analytics Filters
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Date Range Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label>Date Filter Type</Label>
            <Select
              value={filters.dateFilterType}
              onValueChange={(value) => onFiltersChange({ ...filters, dateFilterType: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="created_at">Created Date</SelectItem>
                <SelectItem value="due_date">Due Date</SelectItem>
                <SelectItem value="payment_date">Payment Date</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              From Date
            </Label>
            <Input
              type="date"
              value={filters.fromDate}
              onChange={(e) => onFiltersChange({ ...filters, fromDate: e.target.value })}
            />
          </div>

          <div>
            <Label className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              To Date
            </Label>
            <Input
              type="date"
              value={filters.toDate}
              onChange={(e) => onFiltersChange({ ...filters, toDate: e.target.value })}
            />
          </div>
        </div>

        {/* Amount Range Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Minimum Amount
            </Label>
            <Input
              type="number"
              placeholder="0"
              value={filters.minAmount}
              onChange={(e) => onFiltersChange({ ...filters, minAmount: e.target.value })}
            />
          </div>

          <div>
            <Label className="flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Maximum Amount
            </Label>
            <Input
              type="number"
              placeholder="No limit"
              value={filters.maxAmount}
              onChange={(e) => onFiltersChange({ ...filters, maxAmount: e.target.value })}
            />
          </div>
        </div>

        {/* Department Filter */}
        <div>
          <Label className="flex items-center gap-2">
            <Building2 className="w-4 h-4" />
            Departments
          </Label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2 max-h-32 overflow-y-auto">
            {departments.map(department => (
              <div key={department.id} className="flex items-center space-x-2">
                <Checkbox
                  checked={filters.selectedDepartments.includes(department.id)}
                  onCheckedChange={(checked) => handleDepartmentToggle(department.id, checked as boolean)}
                />
                <Label className="text-sm">{department.code}</Label>
              </div>
            ))}
          </div>
        </div>

        {/* Status Filter */}
        <div>
          <Label>Fee Status</Label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
            {statusOptions.map(status => (
              <div key={status} className="flex items-center space-x-2">
                <Checkbox
                  checked={filters.statusFilter.includes(status)}
                  onCheckedChange={(checked) => handleStatusToggle(status, checked as boolean)}
                />
                <Label className="text-sm">{status}</Label>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <Button onClick={onApplyFilters} disabled={loading}>
            Apply Filters
          </Button>
          <Button variant="outline" onClick={onClearFilters} disabled={loading}>
            Clear All
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default FeeTypeAnalyticsFilters;
