
import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface SwipeableCardProps {
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  leftAction?: string;
  rightAction?: string;
}

const SwipeableCard: React.FC<SwipeableCardProps> = ({
  children,
  onSwipeLeft,
  onSwipeRight,
  leftAction = 'Previous',
  rightAction = 'Next'
}) => {
  const [startX, setStartX] = useState(0);
  const [currentX, setCurrentX] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    setStartX(e.touches[0].clientX);
    setIsSwiping(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isSwiping) return;
    setCurrentX(e.touches[0].clientX - startX);
  };

  const handleTouchEnd = () => {
    if (Math.abs(currentX) > 50) {
      if (currentX > 0 && onSwipeRight) {
        onSwipeRight();
      } else if (currentX < 0 && onSwipeLeft) {
        onSwipeLeft();
      }
    }
    setCurrentX(0);
    setIsSwiping(false);
  };

  return (
    <div className="relative overflow-hidden">
      <div
        className="transform transition-transform duration-200 ease-out"
        style={{ transform: `translateX(${currentX}px)` }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {children}
      </div>
      
      {/* Swipe indicators */}
      {Math.abs(currentX) > 20 && (
        <div className="absolute top-1/2 transform -translate-y-1/2 pointer-events-none">
          {currentX > 20 && onSwipeRight && (
            <div className="flex items-center space-x-2 text-blue-600 bg-blue-100 px-3 py-1 rounded-r-lg">
              <ChevronRight className="w-4 h-4" />
              <span className="text-sm font-medium">{rightAction}</span>
            </div>
          )}
          {currentX < -20 && onSwipeLeft && (
            <div className="flex items-center space-x-2 text-red-600 bg-red-100 px-3 py-1 rounded-l-lg right-0 absolute">
              <span className="text-sm font-medium">{leftAction}</span>
              <ChevronLeft className="w-4 h-4" />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SwipeableCard;
