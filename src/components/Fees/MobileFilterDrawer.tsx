
import React from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '../ui/sheet';
import { Button } from '../ui/button';
import { Filter, X } from 'lucide-react';

interface MobileFilterDrawerProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
  onApplyFilters: () => void;
  onClearFilters: () => void;
  loading?: boolean;
}

const MobileFilterDrawer: React.FC<MobileFilterDrawerProps> = ({
  isOpen,
  onOpenChange,
  children,
  onApplyFilters,
  onClearFilters,
  loading = false
}) => {
  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="min-h-[44px]">
          <Filter className="w-4 h-4 mr-2" />
          Filters
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto">
        <SheetHeader className="pb-4">
          <div className="flex items-center justify-between">
            <SheetTitle>Filter Options</SheetTitle>
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
        
        <div className="space-y-4">
          {children}
        </div>
        
        <div className="flex gap-3 pt-6 border-t">
          <Button 
            onClick={() => {
              onApplyFilters();
              onOpenChange(false);
            }}
            disabled={loading}
            className="flex-1 min-h-[44px]"
          >
            Apply Filters
          </Button>
          <Button 
            variant="outline" 
            onClick={onClearFilters}
            disabled={loading}
            className="flex-1 min-h-[44px]"
          >
            Clear All
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileFilterDrawer;
