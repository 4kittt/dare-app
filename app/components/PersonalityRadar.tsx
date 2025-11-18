"use client";

interface PersonalityRadarProps {
  scores: {
    category: string;
    score: number;
  }[];
}

export function PersonalityRadar({ scores }: PersonalityRadarProps) {
  // Four Pillars Personality Radar - OnchainKit Compatible
  return (
    <div className="w-full max-w-sm mx-auto space-y-4">
      {scores.map((score, index) => {
        // Colors for the four personality pillars (OnchainKit)
        const pillarColors = [
          'bg-purple-500', // Vision & Values (The "Why")
          'bg-blue-500',   // Building & Work Style (The "How")
          'bg-green-500',  // Chaos & Risk Tolerance (The "Risk")
          'bg-pink-500',   // Connection & Social Style (The "Social")
        ];

        const colorClass = pillarColors[index] || 'bg-gray-500';

        return (
          <div key={score.category} className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {score.category}
              </span>
              <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
                {score.score}%
              </span>
            </div>
            <div className="relative">
              {/* Background bar */}
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                {/* Progress bar */}
                <div
                  className={`h-full ${colorClass} transition-all duration-1000 ease-out rounded-full`}
                  style={{ width: `${score.score}%` }}
                />
              </div>
            </div>
          </div>
        );
      })}

      {/* Simple center dot for "radar" aesthetic */}
      <div className="relative flex items-center justify-center mt-6">
        <div className="absolute w-24 h-24 rounded-full bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-pink-500/20"></div>
        <div className="relative w-6 h-6 rounded-full bg-primary"></div>
      </div>
    </div>
  );
}
