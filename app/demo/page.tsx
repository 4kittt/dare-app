'use client';

import { useState } from 'react';
import { CardSlider, PersonalityFeedbackType } from '../components/CardSlider';
import { CompatibilityCard } from '../lib/types';

// Mock personality data for testing the CardSlider
const mockCards: CompatibilityCard[] = [
  {
    profile: {
      fid: '1',
      username: 'alice_dev',
      displayName: 'Alice Chen',
      pfpUrl: 'https://picsum.photos/200/200?random=1',
      track: 'Build' as const,
      personalityScores: [],
      minted: true,
      bio: 'Full-stack dev building on Base. DeFi enthusiast who loves solving complex problems.',
      tags: ['React', 'TypeScript', 'DeFi', 'Base', 'Solana']
    },
    matchPercentage: 89,
    keyAlignmentTags: ['Both love solving complex problems', 'Strong technical alignment'],
    popNftProfile: 'Visionary Builder'
  },
  {
    profile: {
      fid: '2',
      username: 'maya_artist',
      displayName: 'Maya Rivera',
      pfpUrl: 'https://picsum.photos/200/200?random=2',
      track: 'Connect' as const,
      personalityScores: [],
      minted: true,
      bio: 'Digital artist specializing in Web3 creative communities. Love bringing people together.',
      tags: ['NFT Art', 'Community Building', 'Creative', 'Web3']
    },
    matchPercentage: 75,
    keyAlignmentTags: ['Creative synergy potential', 'Shared community values'],
    popNftProfile: 'Artistic Connector'
  },
  {
    profile: {
      fid: '3',
      username: 'carlos_defi',
      displayName: 'Carlos Mendoza',
      pfpUrl: 'https://picsum.photos/200/200?random=3',
      track: 'Build' as const,
      personalityScores: [],
      minted: true,
      bio: 'DeFi protocol engineer. Always researching new yield strategies and building DEXs.',
      tags: ['DeFi', 'Smart Contracts', 'DEX', 'Yield Farming', 'Economics']
    },
    matchPercentage: 82,
    keyAlignmentTags: ['DeFi expertise overlap', 'Complementary building styles'],
    popNftProfile: 'Strategic Architect'
  },
  {
    profile: {
      fid: '4',
      username: 'zara_creator',
      displayName: 'Zara Liu',
      pfpUrl: 'https://picsum.photos/200/200?random=4',
      track: 'Connect' as const,
      personalityScores: [],
      minted: true,
      bio: 'Content creator & community organizer. Help projects grow their communities and engagement.',
      tags: ['Content Creation', 'Community Mgmt', 'Growth', 'Education']
    },
    matchPercentage: 68,
    keyAlignmentTags: ['Community building approaches differ', 'Might need more discussion'],
    popNftProfile: 'Community Catalyst'
  },
  {
    profile: {
      fid: '5',
      username: 'dev_avin',
      displayName: 'Avin Patel',
      pfpUrl: 'https://picsum.photos/200/200?random=5',
      track: 'Build' as const,
      personalityScores: [],
      minted: true,
      bio: 'Rust developer transitioning to Web3. Love systems programming and cryptography.',
      tags: ['Rust', 'Cryptography', 'Systems', 'Security', 'ZKPs']
    },
    matchPercentage: 91,
    keyAlignmentTags: ['Technical excellence alignment', 'Shared interest in cryptography'],
    popNftProfile: 'Technical Innovator'
  }
];

export default function DemoPage() {
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [feedbackHistory, setFeedbackHistory] = useState<{ action: PersonalityFeedbackType; name: string }[]>([]);

  const handleSwipe = (action: PersonalityFeedbackType) => {
    const currentCard = mockCards[currentCardIndex];
    setFeedbackHistory(prev => [...prev, {
      action,
      name: currentCard.profile.displayName
    }]);
  };

  const handleCardComplete = () => {
    setCurrentCardIndex(prev => Math.min(prev + 1, mockCards.length - 1));
  };

  const getEmojiForAction = (action: PersonalityFeedbackType): string => {
    switch (action) {
      case 'interest': return '🤝';
      case 'pass': return '❌';
      default: return '';
    }
  };

  const getTextForAction = (action: PersonalityFeedbackType): string => {
    switch (action) {
      case 'interest': return "Let's Chat";
      case 'pass': return 'Pass';
      default: return '';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-6">
        <div className="max-w-md mx-auto text-center">
          <h1 className="text-3xl font-bold font-pixel text-gray-900 dark:text-white mb-2">
            🎮 CardSlider Demo
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm font-pixel">
            Experience DareUP's Premium Feedback System
          </p>
        </div>
      </div>

      {/* Main Card Area */}
      <div className="px-4 py-8">
        <div className="max-w-sm mx-auto">
          <CardSlider
            cards={mockCards}
            currentIndex={currentCardIndex}
            onSwipe={handleSwipe}
            onCardComplete={handleCardComplete}
          />

          {/* Instructions */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 font-pixel">
              👆 Drag the card in any direction!
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500">
              Each direction gives different nuanced feedback 💫
            </p>
          </div>

          {/* Card Counter */}
          <div className="mt-4 text-center">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Card {currentCardIndex + 1} of {mockCards.length}
            </span>
          </div>
        </div>
      </div>

      {/* Feedback History */}
      {feedbackHistory.length > 0 && (
        <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-4 py-6">
          <div className="max-w-md mx-auto">
            <h3 className="text-lg font-bold font-pixel text-gray-900 dark:text-white mb-4 text-center">
              💬 Your Feedback History
            </h3>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {feedbackHistory.map((feedback, index) => (
                <div key={index} className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                  <span className="text-sm text-gray-900 dark:text-gray-100">
                    {feedback.name}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{getEmojiForAction(feedback.action)}</span>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {getTextForAction(feedback.action)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={() => setFeedbackHistory([])}
              className="w-full mt-4 bg-primary text-white py-2 px-4 rounded-lg hover:bg-primary/90 transition-colors text-sm"
            >
              Clear History
            </button>
          </div>
        </div>
      )}

      {/* Reset Button */}
      <div className="fixed bottom-4 right-4">
        <button
          onClick={() => {
            setCurrentCardIndex(0);
            setFeedbackHistory([]);
          }}
          className="bg-primary text-white p-3 rounded-full shadow-lg hover:bg-primary/90 transition-colors font-pixel text-sm"
        >
          🔄 Reset
        </button>
      </div>
    </div>
  );
}
