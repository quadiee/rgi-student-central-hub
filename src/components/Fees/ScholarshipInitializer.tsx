
import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { useToast } from '../ui/use-toast';
import { Award, Users, DollarSign } from 'lucide-react';
import { createSampleScholarshipData, getScholarshipStats } from '../../utils/scholarshipUtils';

const ScholarshipInitializer: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<{
    eligibleStudents: number;
    scholarshipRecords: number;
  } | null>(null);
  const { toast } = useToast();

  const handleInitializeScholarships = async () => {
    setLoading(true);
    try {
      const result = await createSampleScholarshipData('2024-25');
      
      if (result.success) {
        toast({
          title: "Success",
          description: result.message,
        });
        
        // Refresh stats
        const newStats = await getScholarshipStats('2024-25');
        setStats(newStats);
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error initializing scholarships:', error);
      toast({
        title: "Error",
        description: "Failed to initialize scholarship data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshStats = async () => {
    try {
      const newStats = await getScholarshipStats('2024-25');
      setStats(newStats);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  React.useEffect(() => {
    handleRefreshStats();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="w-5 h-5 text-blue-600" />
          Scholarship Data Initializer
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-gray-600">
          Initialize scholarship records for students with existing fee records. This will create sample scholarship data for testing and development.
        </div>
        
        {stats && (
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
              <Users className="w-4 h-4 text-blue-600" />
              <div>
                <div className="text-sm font-medium">Eligible Students</div>
                <div className="text-lg font-bold text-blue-600">{stats.eligibleStudents}</div>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
              <DollarSign className="w-4 h-4 text-green-600" />
              <div>
                <div className="text-sm font-medium">Scholarship Records</div>
                <div className="text-lg font-bold text-green-600">{stats.scholarshipRecords}</div>
              </div>
            </div>
          </div>
        )}
        
        <div className="flex gap-2">
          <Button
            onClick={handleInitializeScholarships}
            disabled={loading}
            className="flex-1"
          >
            {loading ? 'Initializing...' : 'Initialize Scholarship Data'}
          </Button>
          <Button
            variant="outline"
            onClick={handleRefreshStats}
          >
            Refresh Stats
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ScholarshipInitializer;
