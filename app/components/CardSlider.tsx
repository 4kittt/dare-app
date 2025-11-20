'use client';

import React, { useState, useRef, useCallback } from 'react';
import { CompatibilityCard } from '../lib/types';
import { toast } from 'sonner';

interface CardSliderProps {
  cards: CompatibilityCard[];
  currentIndex: number;
  onSwipe: (action: PersonalityFeedbackType) => void;
  onCardComplete: () => void;
}

export type PersonalityFeedbackType =
  | 'interest'        // Right: Let's chat 🤝
  | 'pass';           // Left: Pass ❌

interface Position {
  x: number;
  y: number;
}

export function CardSlider({ cards, currentIndex, onSwipe, onCardComplete }: CardSliderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragPosition, setDragPosition] = useState<Position>({ x: 0, y: 0 });
  const [startPosition, setStartPosition] = useState<Position>({ x: 0, y: 0 });
  const [currentFeedback, setCurrentFeedback] = useState<PersonalityFeedbackType | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  const cardRef = useRef<HTMLDivElement>(null);

  const getFeedbackFromPosition = (x: number, y: number): PersonalityFeedbackType | null => {
    const threshold = 50; // Minimum distance to trigger feedback

    if (Math.abs(x) < threshold) return null;

    // Simple left/right detection - no polar coordinates needed
    if (x > threshold) return 'interest';  // Right swipe = interest
    if (x < -threshold) return 'pass';     // Left swipe = pass

    return null;
  };

  const getFeedbackEmoji = (feedback: PersonalityFeedbackType): string => {
    switch (feedback) {
      case 'interest': return '🤝';
      case 'pass': return '❌';
      default: return '';
    }
  };

  const getFeedbackText = (feedback: PersonalityFeedbackType): string => {
    switch (feedback) {
      case 'interest': return "Let's Chat";
      case 'pass': return 'Pass';
      default: return '';
    }
  };

  // Mouse/touch event handlers
  const handleStart = useCallback((clientX: number, clientY: number) => {
    setIsDragging(true);
    setStartPosition({ x: clientX, y: clientY });
    setCurrentFeedback(null);
  }, []);

  const handleMove = useCallback((clientX: number, clientY: number) => {
    if (!isDragging) return;

    const deltaX = clientX - startPosition.x;
    const deltaY = clientY - startPosition.y;

    // Constrain to horizontal swipes only - minimize vertical movement
    const constrainedY = Math.max(-20, Math.min(20, deltaY * 0.3)); // Small vertical allowance for natural feel

    setDragPosition({ x: deltaX, y: constrainedY });
    setCurrentFeedback(getFeedbackFromPosition(deltaX, constrainedY));
  }, [isDragging, startPosition]);

  const handleEnd = useCallback(() => {
    if (!isDragging) return;

    setIsDragging(false);
    setIsAnimating(true);

    // Determine final feedback and animate card away
    const finalFeedback = currentFeedback || 'pass'; // Default to pass if no strong opinion

    // Animate card based on feedback type
    const animationClass = getAnimationClass(finalFeedback);

    if (cardRef.current) {
      cardRef.current.classList.add(animationClass);
    }

    // Call swipe handler after animation completes
    setTimeout(() => {
      onSwipe(finalFeedback);
      onCardComplete();
      setDragPosition({ x: 0, y: 0 });
      setCurrentFeedback(null);
      setIsAnimating(false);

      if (cardRef.current) {
        cardRef.current.className = cardRef.current.className.replace(animationClass, '').trim();
      }
    }, 500);
  }, [isDragging, currentFeedback, onSwipe, onCardComplete]);

  // Get animation class for feedback type
  const getAnimationClass = (feedback: PersonalityFeedbackType): string => {
    switch (feedback) {
      case 'interest': return 'animate-interest';
      case 'pass': return 'animate-pass';
      default: return '';
    }
  };

  // Mouse events
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    handleStart(e.clientX, e.clientY);
  };

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    handleMove(e.clientX, e.clientY);
  }, [handleMove]);

  const handleMouseUp = () => {
    handleEnd();
  };

  // Touch events
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    handleStart(touch.clientX, touch.clientY);
  };

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    handleMove(touch.clientX, touch.clientY);
  }, [handleMove]);

  const handleTouchEnd = () => {
    handleEnd();
  };

  // Global mouse events for drag beyond card bounds
  React.useEffect(() => {
    if (!isDragging) return;

    const handleGlobalMove = (e: MouseEvent) => {
      handleMove(e.clientX, e.clientY);
    };

    const handleGlobalUp = () => {
      handleEnd();
    };

    document.addEventListener('mousemove', handleGlobalMove);
    document.addEventListener('mouseup', handleGlobalUp);

    return () => {
      document.removeEventListener('mousemove', handleGlobalMove);
      document.removeEventListener('mouseup', handleGlobalUp);
    };
  }, [isDragging, handleMove, handleEnd]);

  const currentCard = cards[currentIndex];

  if (!currentCard) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-gray-500">No more cards</p>
      </div>
    );
  }

  const cardTransform = isDragging && !isAnimating
    ? `translate(${dragPosition.x}px, ${dragPosition.y}px) rotate(${(dragPosition.x / 20)}deg)`
    : 'translate(0px, 0px) rotate(0deg)';

  return (
    <div className="relative w-full h-96 flex items-center justify-center overflow-hidden">
      {/* Feedback overlay - shows during drag */}
      {isDragging && currentFeedback && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <div className="bg-black/80 text-white px-6 py-3 pixel-corner text-xl font-bold font-pixel flex items-center gap-2">
            <span className="text-2xl">{getFeedbackEmoji(currentFeedback)}</span>
            <span>{getFeedbackText(currentFeedback)}</span>
          </div>
        </div>
      )}



      {/* Card */}
      <div
        ref={cardRef}
        className={`
          absolute w-full max-w-sm h-80 bg-black pixel-corner shadow-xl
          border border-white transition-all duration-300
          ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}
          pixel-shadow pixel-filter
        `}
        style={{
          transform: cardTransform,
          transition: isAnimating ? 'transform 0.5s ease-out' : 'none'
        }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Card content */}
        <div className="p-6 h-full flex flex-col">
          {/* Profile image */}
          <div className="flex items-center mb-4">
            <img
              src={currentCard.profile.pfpUrl}
              alt={currentCard.profile.displayName}
              className="w-16 h-16 rounded-full mr-4"
            />
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white">{currentCard.profile.displayName}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">@{currentCard.profile.username}</p>
              <div className="flex items-center gap-1 mt-1">
                <span className="text-sm text-gray-500">{Math.round(currentCard.matchPercentage)}%</span>
                <div className="flex">
                  {Array.from({ length: 5 }, (_, i) => (
                    <span key={i} className={`text-xs ${i < Math.round(currentCard.matchPercentage / 20) ? 'text-yellow-400' : 'text-gray-300'}`}>
                      ⭐
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Traits */}
          <div className="flex-1">
            {currentCard.profile.bio && (
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">{currentCard.profile.bio}</p>
            )}

            {currentCard.profile.tags && currentCard.profile.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {currentCard.profile.tags.slice(0, 5).map(tag => (
                  <span key={tag} className="px-2 py-1 bg-primary/10 text-primary text-xs pixel-corner">
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Personality insights */}
            {currentCard.keyAlignmentTags && currentCard.keyAlignmentTags.length > 0 && (
              <div className="bg-primary/5 p-3 pixel-corner">
                <p className="text-xs text-primary font-medium mb-1 font-pixel">{currentCard.popNftProfile}</p>
                <div className="flex flex-wrap gap-1">
                  {currentCard.keyAlignmentTags.slice(0, 3).map(tag => (
                    <span key={tag} className="text-xs text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 pixel-corner">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Instructions */}
          <div className="text-center text-xs text-gray-500 dark:text-gray-400 mt-4 pixel-border">
            Swipe left to pass, right to connect! 🤝
          </div>
        </div>
      </div>
    </div>
  );
}
