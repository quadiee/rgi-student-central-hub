
import React, { useState, useRef } from 'react';
import { ChevronLeft, ChevronRight, Edit, Trash2, Eye } from 'lucide-react';
import { cn } from '../../lib/utils';

interface SwipeAction {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  action: () => void;
}

interface SwipeableCardProps {
  children: React.ReactNode;
  leftActions?: SwipeAction[];
  rightActions?: SwipeAction[];
  onSwipe?: (direction: 'left' | 'right', actionId?: string) => void;
  className?: string;
}

const SwipeableCard: React.FC<SwipeableCardProps> = ({
  children,
  leftActions = [],
  rightActions = [],
  onSwipe,
  className
}) => {
  const [translateX, setTranslateX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const startX = useRef(0);
  const currentX = useRef(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    
    currentX.current = e.touches[0].clientX - startX.current;
    setTranslateX(currentX.current);
    setShowActions(Math.abs(currentX.current) > 60);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    
    if (Math.abs(currentX.current) > 120) {
      // Execute action
      const direction = currentX.current > 0 ? 'right' : 'left';
      const actions = direction === 'right' ? leftActions : rightActions;
      
      if (actions.length > 0) {
        actions[0].action();
        onSwipe?.(direction, actions[0].id);
      }
    }
    
    // Reset position
    setTranslateX(0);
    setShowActions(false);
    currentX.current = 0;
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    startX.current = e.clientX;
    setIsDragging(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    
    currentX.current = e.clientX - startX.current;
    setTranslateX(currentX.current);
    setShowActions(Math.abs(currentX.current) > 60);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    
    if (Math.abs(currentX.current) > 120) {
      const direction = currentX.current > 0 ? 'right' : 'left';
      const actions = direction === 'right' ? leftActions : rightActions;
      
      if (actions.length > 0) {
        actions[0].action();
        onSwipe?.(direction, actions[0].id);
      }
    }
    
    setTranslateX(0);
    setShowActions(false);
    currentX.current = 0;
  };

  return (
    <div className="relative overflow-hidden rounded-lg">
      {/* Left Actions */}
      {leftActions.length > 0 && (
        <div className={cn(
          "absolute left-0 top-0 h-full flex items-center transition-transform duration-200",
          showActions && translateX > 0 ? "translate-x-0" : "-translate-x-full"
        )}>
          {leftActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <div
                key={action.id}
                className={cn(
                  "h-full flex items-center justify-center px-4 text-white font-medium text-sm",
                  action.color
                )}
                onClick={action.action}
              >
                <Icon className="w-5 h-5 mr-2" />
                {action.label}
              </div>
            );
          })}
        </div>
      )}

      {/* Right Actions */}
      {rightActions.length > 0 && (
        <div className={cn(
          "absolute right-0 top-0 h-full flex items-center transition-transform duration-200",
          showActions && translateX < 0 ? "translate-x-0" : "translate-x-full"
        )}>
          {rightActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <div
                key={action.id}
                className={cn(
                  "h-full flex items-center justify-center px-4 text-white font-medium text-sm",
                  action.color
                )}
                onClick={action.action}
              >
                <Icon className="w-5 h-5 mr-2" />
                {action.label}
              </div>
            );
          })}
        </div>
      )}

      {/* Main Card Content */}
      <div
        className={cn(
          "transition-transform duration-200 ease-out touch-pan-y select-none",
          className
        )}
        style={{ 
          transform: `translateX(${Math.max(-150, Math.min(150, translateX))}px)`,
          transition: isDragging ? 'none' : 'transform 0.2s ease-out'
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {children}
      </div>

      {/* Swipe Indicators */}
      {showActions && (
        <div className="absolute top-1/2 transform -translate-y-1/2 pointer-events-none">
          {translateX > 60 && leftActions.length > 0 && (
            <div className="flex items-center space-x-2 text-green-600 bg-green-100 px-3 py-1 rounded-r-lg">
              <ChevronRight className="w-4 h-4" />
              <span className="text-sm font-medium">{leftActions[0].label}</span>
            </div>
          )}
          {translateX < -60 && rightActions.length > 0 && (
            <div className="flex items-center space-x-2 text-red-600 bg-red-100 px-3 py-1 rounded-l-lg right-0 absolute">
              <span className="text-sm font-medium">{rightActions[0].label}</span>
              <ChevronLeft className="w-4 h-4" />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SwipeableCard;
