
import React from 'react';
import { Card, CardContent } from '../ui/card';
import { BarChart3, DollarSign, AlertCircle, TrendingUp } from 'lucide-react';

interface MobileAnalyticsSummaryProps {
  totalItems: number;
  totalCollection: number;
  totalPending: number;
  overallPercentage: number;
  title: string;
}

const MobileAnalyticsSummary: React.FC<MobileAnalyticsSummaryProps> = ({
  totalItems,
  totalCollection,
  totalPending,
  overallPercentage,
  title
}) => {
  const summaryCards = [
    {
      label: `Total ${title}`,
      value: totalItems,
      icon: BarChart3,
      color: 'text-blue-600'
    },
    {
      label: 'Collection',
      value: `₹${totalCollection.toLocaleString()}`,
      icon: DollarSign,
      color: 'text-green-600'
    },
    {
      label: 'Pending',
      value: `₹${totalPending.toLocaleString()}`,
      icon: AlertCircle,
      color: 'text-red-600'
    },
    {
      label: 'Success Rate',
      value: `${overallPercentage.toFixed(1)}%`,
      icon: TrendingUp,
      color: 'text-blue-600'
    }
  ];

  return (
    <div className="grid grid-cols-2 gap-3 mb-4">
      {summaryCards.map((card, index) => (
        <Card key={index} className="border-0 shadow-sm">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-gray-600 truncate">
                  {card.label}
                </p>
                <p className="text-sm font-bold mt-1 truncate">
                  {card.value}
                </p>
              </div>
              <card.icon className={`w-5 h-5 ${card.color} flex-shrink-0`} />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default MobileAnalyticsSummary;
