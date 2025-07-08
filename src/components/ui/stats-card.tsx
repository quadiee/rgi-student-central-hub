
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Badge } from './badge';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: LucideIcon;
  trend?: {
    value: number;
    label: string;
    direction: 'up' | 'down' | 'neutral';
  };
  variant?: 'default' | 'chairman' | 'student' | 'admin' | 'success' | 'warning' | 'error';
  className?: string;
  interactive?: boolean;
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  description,
  icon: Icon,
  trend,
  variant = 'default',
  className,
  interactive = false,
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'chairman':
        return 'bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200 dark:from-purple-900/20 dark:to-blue-900/20 dark:border-purple-800';
      case 'student':
        return 'bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200 dark:from-blue-900/20 dark:to-cyan-900/20 dark:border-blue-800';
      case 'admin':
        return 'bg-gradient-to-br from-red-50 to-orange-50 border-red-200 dark:from-red-900/20 dark:to-orange-900/20 dark:border-red-800';
      case 'success':
        return 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 dark:from-green-900/20 dark:to-emerald-900/20 dark:border-green-800';
      case 'warning':
        return 'bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-200 dark:from-yellow-900/20 dark:to-amber-900/20 dark:border-yellow-800';
      case 'error':
        return 'bg-gradient-to-br from-red-50 to-rose-50 border-red-200 dark:from-red-900/20 dark:to-rose-900/20 dark:border-red-800';
      default:
        return 'bg-gradient-to-br from-gray-50 to-slate-50 border-gray-200 dark:from-gray-900/20 dark:to-slate-900/20 dark:border-gray-800';
    }
  };

  const getIconStyles = () => {
    switch (variant) {
      case 'chairman':
        return 'text-purple-600 bg-purple-100 dark:text-purple-400 dark:bg-purple-900/30';
      case 'student':
        return 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30';
      case 'admin':
        return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30';
      case 'success':
        return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30';
      case 'warning':
        return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/30';
      case 'error':
        return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30';
      default:
        return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/30';
    }
  };

  const getTrendStyles = () => {
    if (!trend) return '';
    switch (trend.direction) {
      case 'up':
        return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30';
      case 'down':
        return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30';
      default:
        return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/30';
    }
  };

  return (
    <Card
      className={cn(
        'relative overflow-hidden',
        getVariantStyles(),
        interactive && 'cursor-pointer hover:scale-105 transition-transform duration-300',
        className
      )}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {title}
          </CardTitle>
          {Icon && (
            <div className={cn('p-2 rounded-lg', getIconStyles())}>
              <Icon className="w-4 h-4" />
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="pb-4">
        <div className="flex items-baseline space-x-2">
          <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            {value}
          </div>
          {trend && (
            <Badge
              variant="secondary"
              className={cn('text-xs px-2 py-1 rounded-full', getTrendStyles())}
            >
              {trend.direction === 'up' ? '↗' : trend.direction === 'down' ? '↘' : '→'} {trend.value}%
            </Badge>
          )}
        </div>
        
        {description && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            {description}
          </p>
        )}
        
        {trend && (
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
            {trend.label}
          </p>
        )}
      </CardContent>
      
      {/* Decorative gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent pointer-events-none" />
    </Card>
  );
};

export default StatsCard;
