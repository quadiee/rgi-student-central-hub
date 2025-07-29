
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { Badge } from '../ui/badge';
import { TrendingUp, TrendingDown, Eye, RefreshCw } from 'lucide-react';
import { useFeeTypeAnalytics } from '../../hooks/useFeeTypeAnalytics';
import { formatCurrency } from '../../utils/feeValidation';
import { useNavigate } from 'react-router-dom';

const DashboardFeeTypeWidget: React.FC = () => {
  const { analytics, loading, refresh, getTopPerformingFeeTypes, getWorstPerformingFeeTypes } = useFeeTypeAnalytics();
  const navigate = useNavigate();

  const topPerforming = getTopPerformingFeeTypes(3);
  const worstPerforming = getWorstPerformingFeeTypes(3);

  if (loading && analytics.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5" />
            <span>Fee Type Performance</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-12 bg-gray-200 rounded animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="flex items-center space-x-2">
          <TrendingUp className="w-5 h-5" />
          <span>Fee Type Performance</span>
        </CardTitle>
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={refresh}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/fee-management')}
          >
            <Eye className="w-4 h-4 mr-1" />
            View All
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {analytics.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-gray-600">No fee type data available</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Top Performing Fee Types */}
            <div>
              <div className="flex items-center space-x-2 mb-3">
                <TrendingUp className="w-4 h-4 text-green-600" />
                <h4 className="font-medium text-green-800">Top Performing</h4>
              </div>
              <div className="space-y-2">
                {topPerforming.map((item, index) => (
                  <div key={item.fee_type_id} className="flex items-center justify-between p-2 bg-green-50 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="text-xs">
                          #{index + 1}
                        </Badge>
                        <span className="font-medium text-sm">{item.fee_type_name}</span>
                        {item.is_mandatory && (
                          <Badge variant="secondary" className="text-xs">Mandatory</Badge>
                        )}
                      </div>
                      <div className="mt-1">
                        <Progress 
                          value={item.collection_percentage} 
                          className="h-2"
                        />
                        <div className="flex justify-between text-xs text-gray-600 mt-1">
                          <span>{formatCurrency(item.total_collected)} collected</span>
                          <span>{item.collection_percentage.toFixed(1)}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Worst Performing Fee Types */}
            {worstPerforming.length > 0 && (
              <div>
                <div className="flex items-center space-x-2 mb-3">
                  <TrendingDown className="w-4 h-4 text-red-600" />
                  <h4 className="font-medium text-red-800">Needs Attention</h4>
                </div>
                <div className="space-y-2">
                  {worstPerforming.map((item, index) => (
                    <div key={item.fee_type_id} className="flex items-center justify-between p-2 bg-red-50 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-sm">{item.fee_type_name}</span>
                          {item.is_mandatory && (
                            <Badge variant="secondary" className="text-xs">Mandatory</Badge>
                          )}
                        </div>
                        <div className="mt-1">
                          <Progress 
                            value={item.collection_percentage} 
                            className="h-2"
                          />
                          <div className="flex justify-between text-xs text-gray-600 mt-1">
                            <span>{formatCurrency(item.total_pending)} pending</span>
                            <span>{item.collection_percentage.toFixed(1)}%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DashboardFeeTypeWidget;
