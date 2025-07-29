
import React from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '../ui/sheet';
import { Button } from '../ui/button';
import { Filter, X } from 'lucide-react';
import { cn } from '../../lib/utils';

interface MobileFilterDrawerProps {
  children: React.ReactNode;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onApplyFilters: () => void;
  onClearFilters: () => void;
  loading?: boolean;
  title?: string;
}

const MobileFilterDrawer: React.FC<MobileFilterDrawerProps> = ({
  children,
  isOpen,
  onOpenChange,
  onApplyFilters,
  onClearFilters,
  loading = false,
  title = "Filter & Sort"
}) => {
  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="min-h-[44px]">
          <Filter className="w-4 h-4 mr-2" />
          Filter
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="max-h-[80vh] overflow-y-auto">
        <SheetHeader>
          <div className="flex items-center justify-between">
            <SheetTitle>{title}</SheetTitle>
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
        
        <div className="py-6">
          {children}
        </div>

        <div className="flex gap-3 pt-4 border-t">
          <Button
            variant="outline"
            onClick={onClearFilters}
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
