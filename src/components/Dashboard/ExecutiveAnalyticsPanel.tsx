
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { 
  TrendingUp, 
  TrendingDown, 
  Award, 
  Users, 
  DollarSign,
  Target,
  BarChart3,
  Activity
} from 'lucide-react';
import { formatCurrency } from '../../utils/feeValidation';
import { useFeeTypeAnalytics } from '../../hooks/useFeeTypeAnalytics';
import { useInstitutionalStats } from '../../hooks/useInstitutionalStats';
import { useScholarshipStats } from '../../hooks/useScholarshipStats';

const ExecutiveAnalyticsPanel: React.FC = () => {
  const { analytics, getTotalStats } = useFeeTypeAnalytics();
  const { stats: institutionalStats } = useInstitutionalStats();
  const { stats: scholarshipStats } = useScholarshipStats();
  
  const totalStats = getTotalStats();

  // Performance metrics calculations
  const collectionRate = totalStats.totalFees > 0 ? 
    ((totalStats.totalCollected / totalStats.totalFees) * 100) : 0;
  
  const scholarshipSuccessRate = scholarshipStats.appliedScholarships > 0 ?
    ((scholarshipStats.receivedScholarships / scholarshipStats.appliedScholarships) * 100) : 0;

  const performanceMetrics = [
    {
      title: 'Fee Collection Rate',
      value: `${collectionRate.toFixed(1)}%`,
      progress: collectionRate,
      target: 95,
      icon: DollarSign,
      trend: { value: 5.2, direction: 'up' as const },
      status: collectionRate >= 90 ? 'excellent' : collectionRate >= 80 ? 'good' : 'warning'
    },
    {
      title: 'Student Retention',
      value: '94.2%',
      progress: 94.2,
      target: 95,
      icon: Users,
      trend: { value: 2.1, direction: 'up' as const },
      status: 'excellent'
    },
    {
      title: 'Scholarship Success',
      value: `${scholarshipSuccessRate.toFixed(1)}%`,
      progress: scholarshipSuccessRate,
      target: 85,
      icon: Award,
      trend: { value: 8.5, direction: 'up' as const },
      status: scholarshipSuccessRate >= 85 ? 'excellent' : 'good'
    },
    {
      title: 'Faculty Performance',
      value: '87.5%',
      progress: 87.5,
      target: 90,
      icon: Target,
      trend: { value: 1.2, direction: 'up' as const },
      status: 'good'
    }
  ];

  const departmentPerformance = analytics
    .slice(0, 5)
    .map(dept => ({
      name: dept.fee_type_name,
      collection: dept.collection_percentage,
      amount: dept.total_collected
    }));

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'good':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'warning':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Key Performance Indicators */}
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="w-5 h-5 text-purple-600" />
            <span>Institutional Performance Metrics</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {performanceMetrics.map((metric, index) => (
              <div
                key={index}
                className="p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-all"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <metric.icon className="w-4 h-4 text-gray-600" />
                    <span className="font-medium text-gray-800">{metric.title}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className={getStatusColor(metric.status)}>
                      {metric.trend.direction === 'up' ? (
                        <TrendingUp className="w-3 h-3 mr-1" />
                      ) : (
                        <TrendingDown className="w-3 h-3 mr-1" />
                      )}
                      {metric.trend.value}%
                    </Badge>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-baseline justify-between">
                    <span className="text-2xl font-bold text-gray-900">{metric.value}</span>
                    <span className="text-sm text-gray-500">Target: {metric.target}%</span>
                  </div>
                  
                  <Progress 
                    value={metric.progress} 
                    className="h-2"
                  />
                  
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Current</span>
                    <span>{Math.abs(metric.progress - metric.target).toFixed(1)}% to target</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Top Performing Areas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="w-5 h-5 text-green-600" />
              <span>Top Performing Fee Types</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {departmentPerformance.map((dept, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      index === 0 ? 'bg-yellow-500 text-white' : 
                      index === 1 ? 'bg-gray-400 text-white' : 
                      'bg-orange-500 text-white'
                    }`}>
                      {index + 1}
                    </div>
                    <span className="font-medium text-gray-800">{dept.name}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-green-600">
                      {dept.collection.toFixed(1)}%
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatCurrency(dept.amount)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Financial Summary */}
        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <DollarSign className="w-5 h-5 text-blue-600" />
              <span>Financial Overview</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="text-sm font-medium text-green-700">Total Collected</div>
                  <div className="text-lg font-bold text-green-600">
                    {formatCurrency(totalStats.totalCollected)}
                  </div>
                </div>
                <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                  <div className="text-sm font-medium text-orange-700">Total Pending</div>
                  <div className="text-lg font-bold text-orange-600">
                    {formatCurrency(totalStats.totalPending)}
                  </div>
                </div>
              </div>
              
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="text-sm font-medium text-blue-700">Scholarship Impact</div>
                <div className="text-lg font-bold text-blue-600">
                  {formatCurrency(scholarshipStats.totalReceivedAmount)}
                </div>
                <div className="text-xs text-blue-600 mt-1">
                  Supporting {scholarshipStats.scholarshipStudents} students
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ExecutiveAnalyticsPanel;
