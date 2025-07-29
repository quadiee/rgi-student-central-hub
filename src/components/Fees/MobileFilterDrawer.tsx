
import React, { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '../ui/sheet';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Checkbox } from '../ui/checkbox';
import { X, Calendar } from 'lucide-react';

interface MobileFilterDrawerProps {
  children: React.ReactNode;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onApplyFilters: () => void;
  onClearFilters: () => void;
  loading?: boolean;
}

const MobileFilterDrawer: React.FC<MobileFilterDrawerProps> = ({
  children,
  isOpen,
  onOpenChange,
  onApplyFilters,
  onClearFilters,
  loading = false
}) => {
  const [filters, setFilters] = useState({
    dateRange: '',
    status: [] as string[],
    amountRange: { min: '', max: '' },
    departments: [] as string[]
  });

  const statusOptions = [
    { value: 'Paid', label: 'Paid' },
    { value: 'Pending', label: 'Pending' },
    { value: 'Overdue', label: 'Overdue' },
    { value: 'Partially Paid', label: 'Partially Paid' }
  ];

  const departmentOptions = [
    { value: 'CSE', label: 'Computer Science' },
    { value: 'ECE', label: 'Electronics' },
    { value: 'MECH', label: 'Mechanical' },
    { value: 'CIVIL', label: 'Civil Engineering' }
  ];

  const handleStatusChange = (status: string, checked: boolean) => {
    setFilters(prev => ({
      ...prev,
      status: checked 
        ? [...prev.status, status]
        : prev.status.filter(s => s !== status)
    }));
  };

  const handleDepartmentChange = (dept: string, checked: boolean) => {
    setFilters(prev => ({
      ...prev,
      departments: checked 
        ? [...prev.departments, dept]
        : prev.departments.filter(d => d !== dept)
    }));
  };

  const clearAllFilters = () => {
    setFilters({
      dateRange: '',
      status: [],
      amountRange: { min: '', max: '' },
      departments: []
    });
    onClearFilters();
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="max-h-[90vh] overflow-y-auto">
        <SheetHeader className="pb-4">
          <div className="flex items-center justify-between">
            <SheetTitle>Filter Fee Analytics</SheetTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="p-2"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </SheetHeader>

        <div className="space-y-6 py-4">
          {/* Date Range */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Date Range</Label>
            <Select value={filters.dateRange} onValueChange={(value) => 
              setFilters(prev => ({ ...prev, dateRange: value }))
            }>
              <SelectTrigger>
                <SelectValue placeholder="Select date range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="quarter">This Quarter</SelectItem>
                <SelectItem value="year">This Year</SelectItem>
                <SelectItem value="custom">Custom Range</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Status Filter */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Payment Status</Label>
            <div className="grid grid-cols-2 gap-3">
              {statusOptions.map((status) => (
                <div key={status.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`status-${status.value}`}
                    checked={filters.status.includes(status.value)}
                    onCheckedChange={(checked) => 
                      handleStatusChange(status.value, !!checked)
                    }
                  />
                  <Label 
                    htmlFor={`status-${status.value}`}
                    className="text-sm"
                  >
                    {status.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Amount Range */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Amount Range</Label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Input
                  type="number"
                  placeholder="Min amount"
                  value={filters.amountRange.min}
                  onChange={(e) => setFilters(prev => ({
                    ...prev,
                    amountRange: { ...prev.amountRange, min: e.target.value }
                  }))}
                />
              </div>
              <div>
                <Input
                  type="number"
                  placeholder="Max amount"
                  value={filters.amountRange.max}
                  onChange={(e) => setFilters(prev => ({
                    ...prev,
                    amountRange: { ...prev.amountRange, max: e.target.value }
                  }))}
                />
              </div>
            </div>
          </div>

          {/* Department Filter */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Departments</Label>
            <div className="grid grid-cols-2 gap-3">
              {departmentOptions.map((dept) => (
                <div key={dept.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`dept-${dept.value}`}
                    checked={filters.departments.includes(dept.value)}
                    onCheckedChange={(checked) => 
                      handleDepartmentChange(dept.value, !!checked)
                    }
                  />
                  <Label 
                    htmlFor={`dept-${dept.value}`}
                    className="text-sm"
                  >
                    {dept.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Custom Content */}
          {children}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4 border-t bg-white sticky bottom-0">
          <Button
            variant="outline"
            onClick={clearAllFilters}
            disabled={loading}
            className="flex-1"
          >
            Clear All
          </Button>
          <Button
            onClick={() => {
              onApplyFilters();
              onOpenChange(false);
            }}
            disabled={loading}
            className="flex-1"
          >
            {loading ? "Applying..." : "Apply Filters"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileFilterDrawer;
