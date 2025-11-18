import React from 'react';
import { CompatibilityCard as CompatCardType } from '../lib/types';

interface CompatCardProps {
  card: CompatCardType;
  onSwipe: (direction: 'like' | 'pass') => void;
  isVisible: boolean;
}

export function CompatCard({ card, onSwipe, isVisible }: CompatCardProps) {
  if (!isVisible) return null;

  const { profile, matchPercentage, keyAlignmentTags, popNftProfile } = card;

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-xl overflow-hidden max-w-sm mx-auto">
      {/* Header with compatibility score - BIGGEST element */}
      <div className="bg-linear-to-r from-purple-500 to-pink-500 p-6 relative">
        <div className="text-center">
          <div className="text-5xl font-bold text-white mb-1">
            {matchPercentage}%
          </div>
          <div className="text-white/80 text-sm font-medium">
            Match
          </div>
        </div>
        {/* Decorative sparkles */}
        <div className="absolute top-2 right-2 text-yellow-300 text-xl">✨</div>
        <div className="absolute bottom-2 left-2 text-purple-200 text-lg">💫</div>
      </div>

      {/* Profile content */}
      <div className="p-6">
        {/* Profile image and basic info */}
        <div className="flex items-center gap-4 mb-4">
          <img
            src={profile.pfpUrl}
            alt={profile.username}
            className="w-16 h-16 rounded-full border-2 border-white shadow-lg"
          />
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              @{profile.username}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              {profile.displayName}
            </p>
          </div>
        </div>

        {/* PoP NFT Profile - Second most prominent */}
        <div className="mb-4">
          <div className="bg-linear-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-3 border border-blue-200 dark:border-blue-700">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-linear-to-r from-blue-400 to-indigo-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">PoP</span>
              </div>
              <span className="font-semibold text-blue-900 dark:text-blue-100">
                {popNftProfile}
              </span>
            </div>
          </div>
        </div>

        {/* Alignment tags - Small, max 2 */}
        {keyAlignmentTags.length > 0 && (
          <div className="mb-6">
            <div className="flex gap-2 flex-wrap">
              {keyAlignmentTags.map((tag, index) => (
                <span
                  key={index}
                  className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-1 rounded-full text-xs font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-3">
          <button
            onClick={() => onSwipe('pass')}
            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300 rounded-xl min-h-12 font-semibold text-sm transition-colors"
          >
            Pass ❌
          </button>
          <button
            onClick={() => onSwipe('like')}
            className="flex-1 bg-linear-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0 rounded-xl min-h-12 font-semibold text-sm shadow-lg transition-all"
          >
            Connect 💫
          </button>
        </div>
      </div>

      {/* Swipe indicators */}
      <div className="absolute inset-0 pointer-events-none rounded-2xl border-4 border-transparent">
        {/* Like indicator (right) */}
        <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-bold transform rotate-12 opacity-0 transition-opacity">
          LIKE
        </div>
        {/* Pass indicator (left) */}
        <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold transform -rotate-12 opacity-0 transition-opacity">
          PASS
        </div>
      </div>
    </div>
  );
}

// Props for the card stack
interface CompatCardStackProps {
  cards: CompatCardType[];
  onSwipe: (cardIndex: number, direction: 'like' | 'pass') => void;
  currentIndex: number;
}

export function CompatCardStack({ cards, onSwipe, currentIndex }: CompatCardStackProps) {
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {cards.map((card, index) => {
        const isVisible = index >= currentIndex && index < currentIndex + 3; // Show 3 cards max
        const cardOffset = index - currentIndex;

        return (
          <div
            key={`${card.profile.fid}-${index}`}
            className={`absolute transition-all duration-300 ${
              cardOffset === 0 ? 'z-10 scale-100' :
              cardOffset === 1 ? 'z-0 scale-95 translate-y-4' :
              cardOffset === 2 ? 'z-0 scale-90 translate-y-8' : 'hidden'
            }`}
            style={{
              transform: `translateY(${cardOffset * 16}px) scale(${1 - cardOffset * 0.05})`,
            }}
          >
            <CompatCard
              card={card}
              onSwipe={(direction) => onSwipe(index, direction)}
              isVisible={isVisible}
            />
          </div>
        );
      })}
    </div>
  );
}
