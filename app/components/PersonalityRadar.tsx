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
        // Soft pastel colors for the four personality pillars - friendly & approachable
        const pillarColors = [
          'bg-rose-400',   // Vision & Values (warm & thoughtful)
          'bg-violet-400', // Building & Work Style (creative & thoughtful)
          'bg-emerald-400', // Risk Tolerance (balanced & calm)
          'bg-sky-400',    // Connection & Social Style (open & friendly)
        ];

        const colorClass = pillarColors[index] || 'bg-slate-300';

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

      {/* Social center dot - soft and inclusive */}
      <div className="relative flex items-center justify-center mt-6">
        <div className="absolute w-24 h-24 rounded-full bg-gradient-to-br from-rose-200/40 via-violet-200/40 to-sky-200/40"></div>
        <div className="relative w-6 h-6 rounded-full bg-gradient-to-br from-primary-light to-accent"></div>
      </div>
    </div>
  );
}
