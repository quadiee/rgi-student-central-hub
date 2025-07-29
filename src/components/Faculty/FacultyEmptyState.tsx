
import React from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Users, Plus, Upload } from 'lucide-react';

interface FacultyEmptyStateProps {
  onAddFaculty: () => void;
  onBulkImport?: () => void;
}

const FacultyEmptyState: React.FC<FacultyEmptyStateProps> = ({ onAddFaculty, onBulkImport }) => {
  return (
    <div className="flex items-center justify-center min-h-[400px] p-6">
      <Card className="w-full max-w-md text-center">
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center">
              <Users className="w-8 h-8 text-muted-foreground" />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-xl font-semibold">No Faculty Members</h3>
              <p className="text-muted-foreground text-sm">
                Get started by adding your first faculty member or importing from a spreadsheet.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 pt-4">
              <Button onClick={onAddFaculty} className="flex-1 gap-2">
                <Plus className="w-4 h-4" />
                Add Faculty
              </Button>
              
              {onBulkImport && (
                <Button variant="outline" onClick={onBulkImport} className="flex-1 gap-2">
                  <Upload className="w-4 h-4" />
                  Import CSV
                </Button>
              )}
            </div>

            <div className="text-xs text-muted-foreground pt-2">
              You can also create sample data for testing
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FacultyEmptyState;
