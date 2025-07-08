
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

export interface FeeFilterOptions {
  searchTerm: string;
  selectedDepartment: string;
  selectedYear: string;
  selectedFeeType: string;
  selectedStatus: string;
  fromDate: string;
  toDate: string;
  dateFilterType: string;
  minAmount: string;
  maxAmount: string;
}

interface EnhancedFeeFiltersProps {
  filters: FeeFilterOptions;
  onFiltersChange: (filters: FeeFilterOptions) => void;
  departments: Array<{ id: string; name: string }>;
  feeTypes: Array<{ id: string; name: string }>;
  totalRecords: number;
  filteredRecords: number;
  loading?: boolean;
}

const EnhancedFeeFilters: React.FC<EnhancedFeeFiltersProps> = ({
  filters,
  onFiltersChange,
  departments,
  feeTypes,
  totalRecords,
  filteredRecords,
  loading = false
}) => {
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

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

  const updateFilter = (key: keyof FeeFilterOptions, value: string) => {
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
      searchTerm: '',
      selectedDepartment: 'all',
      selectedYear: 'all',
      selectedFeeType: 'all',
      selectedStatus: 'all',
      fromDate: thirtyDaysAgo.toISOString().split('T')[0],
      toDate: today.toISOString().split('T')[0],
      dateFilterType: 'created_at',
      minAmount: '',
      maxAmount: ''
    });
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.searchTerm) count++;
    if (filters.selectedDepartment !== 'all') count++;
    if (filters.selectedYear !== 'all') count++;
    if (filters.selectedFeeType !== 'all') count++;
    if (filters.selectedStatus !== 'all') count++;
    if (filters.minAmount || filters.maxAmount) count++;
    if (filters.dateFilterType !== 'created_at') count++;
    return count;
  };

  return (
    <Card className="mb-6">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CardTitle className="text-lg">Fee Records Filters</CardTitle>
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
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Basic Filters */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <div className="relative">
            <Input
              placeholder="Search students..."
              value={filters.searchTerm}
              onChange={(e) => updateFilter('searchTerm', e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={filters.selectedDepartment} onValueChange={(value) => updateFilter('selectedDepartment', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              {departments.map(dept => (
                <SelectItem key={dept.id} value={dept.name}>{dept.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filters.selectedYear} onValueChange={(value) => updateFilter('selectedYear', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Years</SelectItem>
              {[1, 2, 3, 4].map(year => (
                <SelectItem key={year} value={year.toString()}>Year {year}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filters.selectedFeeType} onValueChange={(value) => updateFilter('selectedFeeType', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Fee Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Fee Types</SelectItem>
              {feeTypes.map(type => (
                <SelectItem key={type.id} value={type.id}>{type.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filters.selectedStatus} onValueChange={(value) => updateFilter('selectedStatus', value)}>
            <SelectTrigger>
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

          <div className="flex gap-2">
            <Collapsible open={isAdvancedOpen} onOpenChange={setIsAdvancedOpen}>
              <CollapsibleTrigger asChild>
                <Button variant="outline" size="sm" className="flex-1">
                  <Filter className="w-4 h-4 mr-1" />
                  Advanced
                  <ChevronDown className={`w-4 h-4 ml-1 transition-transform ${isAdvancedOpen ? 'rotate-180' : ''}`} />
                </Button>
              </CollapsibleTrigger>
            </Collapsible>
            <Button
              variant="outline"
              size="sm"
              onClick={resetFilters}
            >
              <RotateCcw className="w-4 h-4 mr-1" />
              Reset
            </Button>
          </div>
        </div>

        {/* Advanced Filters */}
        <Collapsible open={isAdvancedOpen} onOpenChange={setIsAdvancedOpen}>
          <CollapsibleContent>
            <div className="mt-4 p-4 bg-gray-50 rounded-lg space-y-4">
              {/* Date Range Filters */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
              </div>

              {/* Amount Range Filters */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              </div>

              {/* Active Filters Display */}
              {getActiveFiltersCount() > 0 && (
                <div className="flex flex-wrap gap-2 pt-2 border-t">
                  <span className="text-sm font-medium text-gray-600">Active Filters:</span>
                  {filters.searchTerm && (
                    <Badge variant="secondary" className="gap-1">
                      Search: {filters.searchTerm}
                      <X 
                        className="w-3 h-3 cursor-pointer" 
                        onClick={() => updateFilter('searchTerm', '')}
                      />
                    </Badge>
                  )}
                  {filters.selectedDepartment !== 'all' && (
                    <Badge variant="secondary" className="gap-1">
                      Dept: {filters.selectedDepartment}
                      <X 
                        className="w-3 h-3 cursor-pointer" 
                        onClick={() => updateFilter('selectedDepartment', 'all')}
                      />
                    </Badge>
                  )}
                  {filters.selectedStatus !== 'all' && (
                    <Badge variant="secondary" className="gap-1">
                      Status: {filters.selectedStatus}
                      <X 
                        className="w-3 h-3 cursor-pointer" 
                        onClick={() => updateFilter('selectedStatus', 'all')}
                      />
                    </Badge>
                  )}
                  {(filters.minAmount || filters.maxAmount) && (
                    <Badge variant="secondary" className="gap-1">
                      Amount: {filters.minAmount || '0'} - {filters.maxAmount || '∞'}
                      <X 
                        className="w-3 h-3 cursor-pointer" 
                        onClick={() => {
                          updateFilter('minAmount', '');
                          updateFilter('maxAmount', '');
                        }}
                      />
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
};

export default EnhancedFeeFilters;
