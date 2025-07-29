
import React from 'react';
import { Card, CardContent } from '../ui/card';
import { cn } from '../../lib/utils';

interface QuickStat {
  title: string;
  value: string;
  change: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
}

interface QuickStatsCardsProps {
  stats: QuickStat[];
}

const QuickStatsCards: React.FC<QuickStatsCardsProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      {stats.map((stat, index) => (
        <Card 
          key={stat.title} 
          className={cn(
            "border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1",
            stat.bgColor,
            `animate-fade-in delay-${index * 100}`
          )}
          style={{
            animationDelay: `${index * 100}ms`
          }}
        >
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-xs font-medium text-gray-600 mb-1 truncate">
                  {stat.title}
                </p>
                <p className={cn(
                  "text-xl font-bold mb-1",
                  stat.color
                )}>
                  {stat.value}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {stat.change}
                </p>
              </div>
              <div className={cn(
                "p-2 rounded-lg ml-2 flex-shrink-0",
                stat.bgColor === 'bg-red-50' ? 'bg-red-100' :
                stat.bgColor === 'bg-green-50' ? 'bg-green-100' :
                stat.bgColor === 'bg-blue-50' ? 'bg-blue-100' :
                stat.bgColor === 'bg-purple-50' ? 'bg-purple-100' :
                'bg-gray-100'
              )}>
                <stat.icon className={cn("w-5 h-5", stat.color)} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default QuickStatsCards;
