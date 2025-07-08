
import React, { useState, useEffect } from 'react';
import { Calendar, Filter, X, RotateCcw, ChevronDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Checkbox } from '../ui/checkbox';
import { Badge } from '../ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible';

export interface FilterOptions {
  fromDate: string;
  toDate: string;
  dateFilterType: string;
  departmentIds: string[];
  statusFilter: string[];
  minAmount: string;
  maxAmount: string;
  sortBy: string;
  sortOrder: string;
}

interface DepartmentAnalyticsFiltersProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  departments: Array<{ id: string; name: string; code: string }>;
  totalRecords: number;
  filteredRecords: number;
  loading?: boolean;
}

const DepartmentAnalyticsFilters: React.FC<DepartmentAnalyticsFiltersProps> = ({
  filters,
  onFiltersChange,
  departments,
  totalRecords,
  filteredRecords,
  loading = false
}) => {
  const [isOpen, setIsOpen] = useState(false);

  // Set default date range (last 30 days) on first load
  useEffect(() => {
    if (!filters.fromDate && !filters.toDate) {
      const today = new Date();
      const thirtyDaysAgo = new Date(today);
      thirtyDaysAgo.setDate(today.getDate() - 30);
      
      onFiltersChange({
        ...filters,
        fromDate: thirtyDaysAgo.toISOString().split('T')[0],
        toDate: today.toISOString().split('T')[0]
      });
    }
  }, []);

  const updateFilter = (key: keyof FilterOptions, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const resetFilters = () => {
    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 30);
    
    onFiltersChange({
      fromDate: thirtyDaysAgo.toISOString().split('T')[0],
      toDate: today.toISOString().split('T')[0],
      dateFilterType: 'created_at',
      departmentIds: [],
      statusFilter: [],
      minAmount: '',
      maxAmount: '',
      sortBy: 'department_name',
      sortOrder: 'asc'
    });
  };

  const toggleDepartment = (deptId: string) => {
    const current = filters.departmentIds || [];
    const updated = current.includes(deptId)
      ? current.filter(id => id !== deptId)
      : [...current, deptId];
    updateFilter('departmentIds', updated);
  };

  const toggleStatus = (status: string) => {
    const current = filters.statusFilter || [];
    const updated = current.includes(status)
      ? current.filter(s => s !== status)
      : [...current, status];
    updateFilter('statusFilter', updated);
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.departmentIds?.length) count++;
    if (filters.statusFilter?.length) count++;
    if (filters.minAmount || filters.maxAmount) count++;
    if (filters.dateFilterType !== 'created_at') count++;
    return count;
  };

  const statusOptions = [
    { value: 'Paid', label: 'Paid', color: 'bg-green-100 text-green-800' },
    { value: 'Pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'Overdue', label: 'Overdue', color: 'bg-red-100 text-red-800' },
    { value: 'Partial', label: 'Partial', color: 'bg-blue-100 text-blue-800' }
  ];

  const sortOptions = [
    { value: 'department_name|asc', label: 'Department Name (A-Z)' },
    { value: 'department_name|desc', label: 'Department Name (Z-A)' },
    { value: 'collection_percentage|desc', label: 'Collection % (High to Low)' },
    { value: 'collection_percentage|asc', label: 'Collection % (Low to High)' },
    { value: 'total_fees|desc', label: 'Total Fees (High to Low)' },
    { value: 'total_fees|asc', label: 'Total Fees (Low to High)' },
    { value: 'total_students|desc', label: 'Students (High to Low)' },
    { value: 'total_students|asc', label: 'Students (Low to High)' },
    { value: 'overdue_records|desc', label: 'Overdue Records (High to Low)' },
    { value: 'overdue_records|asc', label: 'Overdue Records (Low to High)' }
  ];

  return (
    <Card className="mb-6">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CardTitle className="text-lg">Filters & Sort</CardTitle>
            {getActiveFiltersCount() > 0 && (
              <Badge variant="secondary">
                {getActiveFiltersCount()} active
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">
              Showing {filteredRecords} of {totalRecords} records
            </span>
            <Collapsible open={isOpen} onOpenChange={setIsOpen}>
              <CollapsibleTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="w-4 h-4 mr-1" />
                  {isOpen ? 'Hide' : 'Show'} Filters
                  <ChevronDown className={`w-4 h-4 ml-1 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="mt-4 space-y-4">
                  {/* Date Range Filters */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
                    <div>
                      <Label htmlFor="dateFilterType">Filter By Date</Label>
                      <Select value={filters.dateFilterType} onValueChange={(value) => updateFilter('dateFilterType', value)}>
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
                      <Label htmlFor="fromDate">From Date</Label>
                      <Input
                        id="fromDate"
                        type="date"
                        value={filters.fromDate}
                        onChange={(e) => updateFilter('fromDate', e.target.value)}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="toDate">To Date</Label>
                      <Input
                        id="toDate"
                        type="date"
                        value={filters.toDate}
                        onChange={(e) => updateFilter('toDate', e.target.value)}
                      />
                    </div>

                    <div className="flex items-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={resetFilters}
                        className="w-full"
                      >
                        <RotateCcw className="w-4 h-4 mr-1" />
                        Reset All
                      </Button>
                    </div>
                  </div>

                  {/* Department and Status Filters */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Department Filter */}
                    <div>
                      <Label className="text-sm font-medium mb-2 block">Departments</Label>
                      <div className="max-h-40 overflow-y-auto space-y-2 border rounded-lg p-3">
                        {departments.map((dept) => (
                          <div key={dept.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={`dept-${dept.id}`}
                              checked={filters.departmentIds?.includes(dept.id) || false}
                              onCheckedChange={() => toggleDepartment(dept.id)}
                            />
                            <Label htmlFor={`dept-${dept.id}`} className="text-sm font-normal">
                              {dept.name} ({dept.code})
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Status Filter */}
                    <div>
                      <Label className="text-sm font-medium mb-2 block">Fee Status</Label>
                      <div className="space-y-2 border rounded-lg p-3">
                        {statusOptions.map((status) => (
                          <div key={status.value} className="flex items-center space-x-2">
                            <Checkbox
                              id={`status-${status.value}`}
                              checked={filters.statusFilter?.includes(status.value) || false}
                              onCheckedChange={() => toggleStatus(status.value)}
                            />
                            <Label htmlFor={`status-${status.value}`} className="text-sm font-normal">
                              <span className={`px-2 py-1 rounded-full text-xs ${status.color}`}>
                                {status.label}
                              </span>
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Amount Range and Sort */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="minAmount">Min Amount (₹)</Label>
                      <Input
                        id="minAmount"
                        type="number"
                        placeholder="0"
                        value={filters.minAmount}
                        onChange={(e) => updateFilter('minAmount', e.target.value)}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="maxAmount">Max Amount (₹)</Label>
                      <Input
                        id="maxAmount"
                        type="number"
                        placeholder="100000"
                        value={filters.maxAmount}
                        onChange={(e) => updateFilter('maxAmount', e.target.value)}
                      />
                    </div>

                    <div>
                      <Label htmlFor="sortBy">Sort By</Label>
                      <Select 
                        value={`${filters.sortBy}|${filters.sortOrder}`} 
                        onValueChange={(value) => {
                          const [sortBy, sortOrder] = value.split('|');
                          updateFilter('sortBy', sortBy);
                          updateFilter('sortOrder', sortOrder);
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {sortOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Active Filters Display */}
                  {(filters.departmentIds?.length || filters.statusFilter?.length) && (
                    <div className="flex flex-wrap gap-2 pt-2 border-t">
                      <span className="text-sm font-medium text-gray-600">Active Filters:</span>
                      {filters.departmentIds?.map((deptId) => {
                        const dept = departments.find(d => d.id === deptId);
                        return dept ? (
                          <Badge key={deptId} variant="secondary" className="gap-1">
                            {dept.code}
                            <X 
                              className="w-3 h-3 cursor-pointer" 
                              onClick={() => toggleDepartment(deptId)}
                            />
                          </Badge>
                        ) : null;
                      })}
                      {filters.statusFilter?.map((status) => (
                        <Badge key={status} variant="secondary" className="gap-1">
                          {status}
                          <X 
                            className="w-3 h-3 cursor-pointer" 
                            onClick={() => toggleStatus(status)}
                          />
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>
        </div>
      </CardHeader>
    </Card>
  );
};

export default DepartmentAnalyticsFilters;
