
import React from 'react';
import { Card, CardContent } from '../ui/card';
import { TrendingUp, TrendingDown, Users, DollarSign, GraduationCap, Award } from 'lucide-react';
import { cn } from '../../lib/utils';

interface StatCard {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ElementType;
  trend?: {
    value: number;
    direction: 'up' | 'down';
    period: string;
  };
  color: string;
  bgColor: string;
}

interface ChairmanMobileStatsGridProps {
  stats: StatCard[];
  columns?: 2 | 3;
  className?: string;
}

const ChairmanMobileStatsGrid: React.FC<ChairmanMobileStatsGridProps> = ({
  stats,
  columns = 2,
  className
}) => {
  return (
    <div className={cn(
      "grid gap-3 mb-6",
      columns === 2 ? "grid-cols-2" : "grid-cols-3",
      className
    )}>
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card
            key={index}
            className={cn(
              "border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 animate-fade-in",
              stat.bgColor,
              `delay-${index * 100}`
            )}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <p className="text-xs font-medium text-gray-600 mb-1">
                    {stat.title}
                  </p>
                  <p className={cn("text-lg font-bold", stat.color)}>
                    {stat.value}
                  </p>
                  {stat.subtitle && (
                    <p className="text-xs text-gray-500 mt-1">
                      {stat.subtitle}
                    </p>
                  )}
                </div>
                <div className={cn(
                  "p-2 rounded-lg",
                  stat.bgColor === 'bg-purple-50' ? 'bg-purple-100' :
                  stat.bgColor === 'bg-blue-50' ? 'bg-blue-100' :
                  stat.bgColor === 'bg-green-50' ? 'bg-green-100' :
                  stat.bgColor === 'bg-orange-50' ? 'bg-orange-100' : 'bg-gray-100'
                )}>
                  <Icon className={cn("w-4 h-4", stat.color)} />
                </div>
              </div>
              
              {stat.trend && (
                <div className="flex items-center space-x-1">
                  {stat.trend.direction === 'up' ? (
                    <TrendingUp className="w-3 h-3 text-green-500" />
                  ) : (
                    <TrendingDown className="w-3 h-3 text-red-500" />
                  )}
                  <span className={cn(
                    "text-xs font-medium",
                    stat.trend.direction === 'up' ? 'text-green-600' : 'text-red-600'
                  )}>
                    {stat.trend.value}%
                  </span>
                  <span className="text-xs text-gray-500">
                    {stat.trend.period}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default ChairmanMobileStatsGrid;
