'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { CompatCardStack } from './CompatCard';
import { CompatibilityCard, Match } from '../lib/types';
import { toast } from 'sonner';

interface SwipeContainerProps {
  userFid: string;
  initialCards?: CompatibilityCard[];
  onCardsExhausted?: () => void;
}

export function SwipeContainer({ userFid, initialCards = [], onCardsExhausted }: SwipeContainerProps) {
  const [cards, setCards] = useState<CompatibilityCard[]>(initialCards);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState<'none' | 'like' | 'pass'>('none');
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  const [touchCurrent, setTouchCurrent] = useState<{ x: number; y: number } | null>(null);

  // Load initial cards from API
  const loadSuggestions = useCallback(async () => {
    if (isLoading) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/matches/suggestions/${userFid}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load suggestions');
      }

      setCards(data.suggestions || []);
      setCurrentIndex(0);
    } catch (error) {
      console.error('Error loading suggestions:', error);
      toast.error('Failed to load profile suggestions');
    } finally {
      setIsLoading(false);
    }
  }, [userFid, isLoading]);

  // Load cards on mount if none provided
  useEffect(() => {
    if (cards.length === 0 && !isLoading) {
      loadSuggestions();
    }
  }, [cards.length, isLoading, loadSuggestions]);

  // Handle swipe action
  const handleSwipe = async (action: 'like' | 'pass') => {
    if (currentIndex >= cards.length) return;

    const currentCard = cards[currentIndex];

    try {
      // Record the swipe
      const response = await fetch('/api/swipes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fromFid: userFid,
          toFid: currentCard.profile.fid,
          action
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Swipe failed');
      }

      // Check if it's a match
      if (data.isMatch) {
        handleMatch(data.match);
      }

      // Move to next card
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);

      // Show feedback
      toast.success(action === 'like' ? 'Connected! 💫' : 'Passed');

      // Load more cards if running low
      if (nextIndex >= cards.length - 3) {
        loadSuggestions();
      }

      // Check if we exhausted all cards
      if (nextIndex >= cards.length) {
        onCardsExhausted?.();
      }

    } catch (error) {
      console.error('Swipe error:', error);
      toast.error('Connection failed, please try again');
    }
  };

  // Handle match modal
  const handleMatch = (match: Match) => {
    // This will be handled by the parent component
    console.log('Match found:', match);
  };

  // Touch event handlers for swipe gestures
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setTouchStart({ x: touch.clientX, y: touch.clientY });
    setTouchCurrent({ x: touch.clientX, y: touch.clientY });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStart) return;

    const touch = e.touches[0];
    setTouchCurrent({ x: touch.clientX, y: touch.clientY });

    const deltaX = touch.clientX - touchStart.x;
    const deltaY = Math.abs(touch.clientY - touchStart.y);

    // Determine swipe direction (horizontal swipe with minimal vertical movement)
    if (Math.abs(deltaX) > 50 && deltaY < 100) {
      setSwipeDirection(deltaX > 0 ? 'like' : 'pass');
    } else {
      setSwipeDirection('none');
    }
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchCurrent) return;

    const deltaX = touchCurrent.x - touchStart.x;
    const deltaY = Math.abs(touchCurrent.y - touchStart.y);

    // Detect swipe gesture
    if (Math.abs(deltaX) > 100 && deltaY < 100) {
      const action = deltaX > 0 ? 'like' : 'pass';
      handleSwipe(action);
    }

    // Reset touch state
    setTouchStart(null);
    setTouchCurrent(null);
    setSwipeDirection('none');
  };

  if (isLoading && cards.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="text-center">
          <div className=" animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Finding matches...</p>
        </div>
      </div>
    );
  }

  if (cards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center px-6">
        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          No matches found yet
        </h3>
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
          Complete your personality profile to get better matches
        </p>
        <button
          onClick={() => loadSuggestions()}
          className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors"
        >
          Refresh Matches
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm mx-auto px-4">
      {/* Swipe instruction */}
      <div className="text-center mb-4">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Swipe right to connect 💫, left to pass ❌
        </p>
      </div>

      {/* Card stack with touch handling */}
      <div
        className="relative h-[600px] flex items-center justify-center"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <CompatCardStack
          cards={cards}
          onSwipe={(_, direction) => handleSwipe(direction)}
          currentIndex={currentIndex}
        />

        {/* Swipe overlay indicators */}
        {swipeDirection !== 'none' && (
          <div className={`absolute inset-0 pointer-events-none flex items-center justify-center transition-opacity duration-200 ${
            swipeDirection === 'like' ? 'text-green-500' : 'text-red-500'
          }`}>
            <div className="text-6xl font-bold opacity-50">
              {swipeDirection === 'like' ? '💫 CONNECT' : '❌ PASS'}
            </div>
          </div>
        )}
      </div>

      {/* Card counter */}
      <div className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
        {currentIndex + 1} of {cards.length} profiles
      </div>
    </div>
  );
}
