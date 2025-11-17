"use client";
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from 'recharts';

interface PersonalityRadarProps {
  scores: {
    category: string;
    score: number;
  }[];
}

export function PersonalityRadar({ scores }: PersonalityRadarProps) {
  // Prepare data for Recharts radar chart
  const data = scores.map(score => ({
    category: score.category,
    value: score.score,
  }));

  // Colors for different personality categories
  const colors = {
    'Mood': '#3b82f6', // Blue
    'Dev Skills': '#10b981', // Green
    'Food Taste': '#f59e0b', // Orange
    'Fun': '#8b5cf6', // Purple
  };

  return (
    <div className="w-full max-w-sm mx-auto">
      <ResponsiveContainer width="100%" height={300}>
        <RadarChart data={data}>
          <PolarGrid stroke="#374151" />
          <PolarAngleAxis
            dataKey="category"
            tick={{ fill: '#9ca3af', fontSize: 12, fontWeight: 500 }}
            className="text-xs"
          />
          <PolarRadiusAxis
            tick={{ fill: '#6b7280', fontSize: 10 }}
            tickCount={5}
            domain={[0, 100]}
          />
          <Radar
            name="Personality Score"
            dataKey="value"
            stroke={colors[data[0]?.category as keyof typeof colors] || '#3b82f6'}
            fill={colors[data[0]?.category as keyof typeof colors] || '#3b82f6'}
            fillOpacity={0.3}
            strokeWidth={2}
            dot={{ fill: colors[data[0]?.category as keyof typeof colors] || '#3b82f6', strokeWidth: 0, r: 4 }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
