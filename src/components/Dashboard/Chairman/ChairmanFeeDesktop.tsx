
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { Button } from '../../ui/button';
import { Progress } from '../../ui/progress';
import { 
  DollarSign, 
  TrendingUp, 
  BarChart3, 
  Award,
  CreditCard,
  Target,
  Activity,
  Eye,
  FileText,
  AlertTriangle
} from 'lucide-react';
import { useFeeTypeAnalytics } from '../../../hooks/useFeeTypeAnalytics';
import { useScholarshipStats } from '../../../hooks/useScholarshipStats';
import { formatCurrency } from '../../../utils/feeValidation';

const ChairmanFeeDesktop: React.FC = () => {
  const { analytics, getTotalStats, loading } = useFeeTypeAnalytics();
  const { stats: scholarshipStats, loading: scholarshipLoading } = useScholarshipStats();
  
  const totalStats = getTotalStats();
  const collectionRate = totalStats.totalFees > 0 ? 
    ((totalStats.totalCollected / totalStats.totalFees) * 100) : 0;

  const feeOverviewCards = [
    {
      title: 'Total Revenue',
      value: formatCurrency(totalStats.totalFees),
      subtitle: 'Academic year target',
      icon: DollarSign,
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
      trend: '+12.5% from last year'
    },
    {
      title: 'Collections',
      value: formatCurrency(totalStats.totalCollected),
      subtitle: `${collectionRate.toFixed(1)}% collection rate`,
      icon: TrendingUp,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      trend: `${formatCurrency(totalStats.totalPending)} pending`
    },
    {
      title: 'Scholarship Impact',
      value: formatCurrency(scholarshipStats.totalReceivedAmount),
      subtitle: `${scholarshipStats.scholarshipStudents} beneficiaries`,
      icon: Award,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50',
      trend: `${scholarshipStats.receivedScholarships} active`
    },
    {
      title: 'Fee Records',
      value: totalStats.totalRecords.toLocaleString(),
      subtitle: 'Total transactions',
      icon: FileText,
      color: 'bg-orange-500',
      bgColor: 'bg-orange-50',
      trend: 'All departments'
    }
  ];

  const topPerformingFees = analytics
    .sort((a, b) => b.collection_percentage - a.collection_percentage)
    .slice(0, 5);

  const feeActions = [
    { label: 'Revenue Analytics', icon: BarChart3, urgent: false },
    { label: 'Collection Reports', icon: FileText, urgent: false },
    { label: 'Outstanding Review', icon: AlertTriangle, urgent: true },
    { label: 'Payment Trends', icon: Activity, urgent: false }
  ];

  if (loading || scholarshipLoading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 bg-gradient-to-r from-green-100 to-purple-100 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-green-600 to-purple-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">Financial Management Overview</h2>
            <p className="text-green-100">Strategic oversight of institutional finances</p>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
              Chairman View
            </Badge>
            <DollarSign className="w-8 h-8" />
          </div>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {feeOverviewCards.map((card, index) => (
          <Card key={index} className={`${card.bgColor} border-2 hover:shadow-lg transition-all`}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-700">
                  {card.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${card.color} text-white`}>
                  <card.icon className="w-4 h-4" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-2xl font-bold text-gray-900">{card.value}</div>
                <p className="text-sm text-gray-600">{card.subtitle}</p>
                <p className="text-xs text-green-600 font-medium">{card.trend}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Financial Performance Analysis */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Fee Type Performance */}
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="w-5 h-5 text-green-600" />
              <span>Fee Collection Performance</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topPerformingFees.map((fee, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                      index === 0 ? 'bg-yellow-500 text-white' : 
                      index === 1 ? 'bg-gray-400 text-white' : 
                      'bg-orange-500 text-white'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{fee.fee_type_name}</p>
                      <p className="text-sm text-gray-600">{formatCurrency(fee.total_collected)} collected</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-center">
                      <div className="text-lg font-bold text-green-600">
                        {fee.collection_percentage.toFixed(1)}%
                      </div>
                      <Progress value={fee.collection_percentage} className="w-16 h-2 mt-1" />
                    </div>
                    <div className="text-center">
                      <div className="text-sm font-bold text-blue-600">
                        {fee.total_students}
                      </div>
                      <div className="text-xs text-gray-500">students</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Strategic Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-gray-800">Financial Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {feeActions.map((action, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className={`w-full h-14 flex items-center justify-start space-x-3 transition-all ${
                    action.urgent 
                      ? 'hover:bg-red-50 hover:border-red-200 border-red-100' 
                      : 'hover:bg-green-50 hover:border-green-200'
                  }`}
                >
                  <action.icon className={`w-5 h-5 ${action.urgent ? 'text-red-600' : 'text-green-600'}`} />
                  <span className="font-medium">{action.label}</span>
                  {action.urgent && (
                    <Badge variant="destructive" className="ml-auto text-xs">
                      Urgent
                    </Badge>
                  )}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Financial Summary */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="w-5 h-5 text-blue-600" />
            <span>Financial Health Summary</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-white/70 rounded-lg">
              <DollarSign className="w-8 h-8 mx-auto text-green-600 mb-2" />
              <div className="text-2xl font-bold text-green-600">
                {collectionRate.toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600">Overall Collection Rate</div>
            </div>
            <div className="text-center p-4 bg-white/70 rounded-lg">
              <Award className="w-8 h-8 mx-auto text-purple-600 mb-2" />
              <div className="text-2xl font-bold text-purple-600">
                {((scholarshipStats.totalReceivedAmount / totalStats.totalCollected) * 100).toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600">Scholarship Coverage</div>
            </div>
            <div className="text-center p-4 bg-white/70 rounded-lg">
              <TrendingUp className="w-8 h-8 mx-auto text-blue-600 mb-2" />
              <div className="text-2xl font-bold text-blue-600">
                {analytics.length}
              </div>
              <div className="text-sm text-gray-600">Active Fee Types</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ChairmanFeeDesktop;
