
import React from 'react';
import { useAuth } from '../contexts/SupabaseAuthContext';
import AttendanceManagement from '../components/Attendance/AttendanceManagement';
import { Card, CardContent } from '../components/ui/card';
import { Users } from 'lucide-react';

const Attendance: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold">Authentication Required</h3>
              <p className="text-muted-foreground">
                Please log in to access attendance management.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <AttendanceManagement />;
};

export default Attendance;
