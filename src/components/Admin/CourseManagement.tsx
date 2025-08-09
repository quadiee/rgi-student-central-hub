
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { AlertTriangle, Construction } from 'lucide-react';

const CourseManagement: React.FC = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Construction className="h-5 w-5 text-orange-500" />
            Course Management - Under Development
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-12">
          <AlertTriangle className="h-16 w-16 text-orange-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Feature Coming Soon
          </h3>
          <p className="text-gray-600 max-w-md mx-auto">
            Course Management functionality is currently being developed with proper database backend integration. 
            This feature will be available once the courses table and related backend infrastructure are implemented.
          </p>
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-700">
              <strong>Note:</strong> This screen has been temporarily disabled to maintain consistency with the real Supabase backend data approach.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CourseManagement;
