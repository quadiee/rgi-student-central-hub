
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { TrendingUp, TrendingDown, Users, DollarSign, AlertCircle } from 'lucide-react';

interface MobileFeeAnalyticsCardProps {
  title: string;
  description?: string;
  isMandatory?: boolean;
  collectionPercentage: number;
  totalStudents: number;
  totalCollected: number;
  totalPending: number;
  overdueRecords: number;
  avgPerStudent: number;
  rank?: number;
}

const MobileFeeAnalyticsCard: React.FC<MobileFeeAnalyticsCardProps> = ({
  title,
  description,
  isMandatory,
  collectionPercentage,
  totalStudents,
  totalCollected,
  totalPending,
  overdueRecords,
  avgPerStudent,
  rank
}) => {
  const getStatusColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-green-500';
    if (percentage >= 70) return 'bg-yellow-500';
    if (percentage >= 50) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getTrendIcon = () => {
    if (collectionPercentage >= 90) return <TrendingUp className="w-4 h-4 text-green-600" />;
    if (collectionPercentage < 50) return <TrendingDown className="w-4 h-4 text-red-600" />;
    return <TrendingUp className="w-4 h-4 text-yellow-600" />;
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base font-semibold leading-tight line-clamp-2">
              {title}
            </CardTitle>
            {description && (
              <p className="text-xs text-gray-600 mt-1 line-clamp-1">{description}</p>
            )}
          </div>
          <div className="flex items-center gap-2 ml-2">
            {isMandatory && (
              <Badge variant="destructive" className="text-xs px-1 py-0">
                Req'd
              </Badge>
            )}
            {rank && (
              <div className="text-xs text-gray-500">
                #{rank}
              </div>
            )}
            {getTrendIcon()}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {/* Progress Bar */}
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span>Collection</span>
            <span className="font-medium">{collectionPercentage.toFixed(1)}%</span>
          </div>
          <div className="relative">
            <Progress value={collectionPercentage} className="h-2" />
            <div 
              className={`absolute top-0 left-0 h-2 rounded-full ${getStatusColor(collectionPercentage)} opacity-75`}
              style={{ width: `${collectionPercentage}%` }}
            />
          </div>
        </div>

        {/* Stats Grid - Mobile Optimized */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="flex items-center gap-1">
            <Users className="w-3 h-3 text-blue-600 flex-shrink-0" />
            <div className="min-w-0">
              <div className="font-medium truncate">{totalStudents}</div>
              <div className="text-gray-500">Students</div>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <DollarSign className="w-3 h-3 text-green-600 flex-shrink-0" />
            <div className="min-w-0">
              <div className="font-medium truncate">₹{totalCollected.toLocaleString()}</div>
              <div className="text-gray-500">Collected</div>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <AlertCircle className="w-3 h-3 text-red-600 flex-shrink-0" />
            <div className="min-w-0">
              <div className="font-medium truncate">₹{totalPending.toLocaleString()}</div>
              <div className="text-gray-500">Pending</div>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <DollarSign className="w-3 h-3 text-purple-600 flex-shrink-0" />
            <div className="min-w-0">
              <div className="font-medium truncate">₹{avgPerStudent.toLocaleString()}</div>
              <div className="text-gray-500">Avg/Student</div>
            </div>
          </div>
        </div>

        {/* Overdue Alert */}
        {overdueRecords > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-md p-2">
            <div className="flex items-center gap-1 text-red-700">
              <AlertCircle className="w-3 h-3 flex-shrink-0" />
              <span className="text-xs font-medium">
                {overdueRecords} overdue
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MobileFeeAnalyticsCard;
