
import React from 'react';
import { useAuth } from '../../contexts/SupabaseAuthContext';
import { useIsMobile } from '../../hooks/use-mobile';
import MobileFacultyManagement from './MobileFacultyManagement';
import DesktopFacultyManagement from './DesktopFacultyManagement';
import { Card, CardContent } from '../ui/card';
import { Users } from 'lucide-react';

const FlexibleFacultyManagement: React.FC = () => {
  const { user } = useAuth();
  const isMobile = useIsMobile();

  if (!user || !['admin', 'principal', 'chairman', 'hod'].includes(user.role)) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold">Access Denied</h3>
              <p className="text-muted-foreground">
                You don't have permission to access faculty management.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return isMobile ? <MobileFacultyManagement /> : <DesktopFacultyManagement />;
};

export default FlexibleFacultyManagement;
