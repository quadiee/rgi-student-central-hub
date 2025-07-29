
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { cn } from '../../lib/utils';
import { LucideIcon } from 'lucide-react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface ExecutiveStatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    direction: 'up' | 'down' | 'neutral';
    period: string;
  };
  status?: 'excellent' | 'good' | 'warning' | 'critical';
  className?: string;
}

const ExecutiveStatsCard: React.FC<ExecutiveStatsCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  status = 'good',
  className
}) => {
  const getStatusStyles = () => {
    switch (status) {
      case 'excellent':
        return 'bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-200 dark:from-emerald-900/20 dark:to-green-900/20';
      case 'good':
        return 'bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200 dark:from-blue-900/20 dark:to-cyan-900/20';
      case 'warning':
        return 'bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-200 dark:from-yellow-900/20 dark:to-amber-900/20';
      case 'critical':
        return 'bg-gradient-to-br from-red-50 to-rose-50 border-red-200 dark:from-red-900/20 dark:to-rose-900/20';
      default:
        return 'bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200 dark:from-purple-900/20 dark:to-blue-900/20';
    }
  };

  const getIconStyles = () => {
    switch (status) {
      case 'excellent':
        return 'text-emerald-600 bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-900/30';
      case 'good':
        return 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30';
      case 'warning':
        return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/30';
      case 'critical':
        return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30';
      default:
        return 'text-purple-600 bg-purple-100 dark:text-purple-400 dark:bg-purple-900/30';
    }
  };

  const getTrendIcon = () => {
    switch (trend?.direction) {
      case 'up':
        return TrendingUp;
      case 'down':
        return TrendingDown;
      default:
        return Minus;
    }
  };

  const getTrendColor = () => {
    switch (trend?.direction) {
      case 'up':
        return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30';
      case 'down':
        return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30';
      default:
        return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/30';
    }
  };

  const TrendIcon = getTrendIcon();

  return (
    <Card className={cn(
      'relative overflow-hidden transition-all duration-300 hover:shadow-lg',
      getStatusStyles(),
      className
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {title}
          </CardTitle>
          <div className={cn('p-3 rounded-xl shadow-sm', getIconStyles())}>
            <Icon className="w-5 h-5" />
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pb-6">
        <div className="space-y-3">
          <div className="flex items-baseline space-x-2">
            <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {value}
            </div>
            {trend && (
              <Badge
                variant="secondary"
                className={cn('text-xs px-2 py-1 rounded-full', getTrendColor())}
              >
                <TrendIcon className="w-3 h-3 mr-1" />
                {Math.abs(trend.value)}%
              </Badge>
            )}
          </div>
          
          {subtitle && (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {subtitle}
            </p>
          )}
          
          {trend && (
            <p className="text-xs text-gray-500 dark:text-gray-500">
              {trend.period}
            </p>
          )}
        </div>
      </CardContent>
      
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-24 h-24 -mr-12 -mt-12 bg-white/20 rounded-full" />
      <div className="absolute bottom-0 left-0 w-16 h-16 -ml-8 -mb-8 bg-white/10 rounded-full" />
    </Card>
  );
};

export default ExecutiveStatsCard;
