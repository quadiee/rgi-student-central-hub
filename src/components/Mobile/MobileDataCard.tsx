
import React from 'react';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { MoreVertical, Eye, Edit, Trash2 } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { cn } from '../../lib/utils';

interface MobileDataCardProps {
  title: string;
  subtitle?: string;
  status?: {
    label: string;
    variant: 'default' | 'secondary' | 'destructive' | 'outline';
  };
  data: Array<{
    label: string;
    value: string | number;
    icon?: React.ComponentType<{ className?: string }>;
    color?: string;
  }>;
  actions?: Array<{
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    onClick: () => void;
    variant?: 'default' | 'destructive';
  }>;
  onClick?: () => void;
  className?: string;
  priority?: 'high' | 'medium' | 'low';
}

const MobileDataCard: React.FC<MobileDataCardProps> = ({
  title,
  subtitle,
  status,
  data,
  actions,
  onClick,
  className,
  priority = 'medium'
}) => {
  const getPriorityStyles = () => {
    switch (priority) {
      case 'high':
        return 'border-l-4 border-l-red-500 bg-red-50';
      case 'low':
        return 'border-l-4 border-l-gray-300 bg-gray-50';
      default:
        return 'border-l-4 border-l-blue-500 bg-blue-50';
    }
  };

  return (
    <Card 
      className={cn(
        "hover:shadow-md transition-all duration-200 cursor-pointer",
        getPriorityStyles(),
        className
      )}
      onClick={onClick}
    >
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 text-sm truncate">
              {title}
            </h3>
            {subtitle && (
              <p className="text-xs text-gray-600 mt-1 truncate">
                {subtitle}
              </p>
            )}
          </div>
          
          <div className="flex items-center space-x-2 ml-2 flex-shrink-0">
            {status && (
              <Badge variant={status.variant} className="text-xs">
                {status.label}
              </Badge>
            )}
            
            {actions && actions.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-1 h-8 w-8"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {actions.map((action, index) => {
                    const Icon = action.icon;
                    return (
                      <DropdownMenuItem
                        key={index}
                        onClick={(e) => {
                          e.stopPropagation();
                          action.onClick();
                        }}
                        className={cn(
                          "flex items-center space-x-2",
                          action.variant === 'destructive' ? "text-red-600 focus:text-red-600" : ""
                        )}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{action.label}</span>
                      </DropdownMenuItem>
                    );
                  })}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>

        {/* Data Grid */}
        <div className="grid grid-cols-2 gap-3">
          {data.map((item, index) => {
            const Icon = item.icon;
            return (
              <div key={index} className="flex items-center space-x-2">
                {Icon && (
                  <Icon className={cn("w-3 h-3 flex-shrink-0", item.color || "text-gray-500")} />
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-gray-500 truncate">{item.label}</p>
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {item.value}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default MobileDataCard;
