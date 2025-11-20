import { PersonalityScore } from './types';

/**
 * AI-powered compatibility scoring using Vercel AI Gateway
 * This provides enhanced matching beyond basic vector arithmetic
 */

export interface AIPersonalityAnalysis {
  personalityInsights: string[];
  compatibilityFactors: {
    trait: string;
    score: number; // 0-100
    reasoning: string;
  }[];
  conversationStarters: string[];
  collaborationPotential: number; // 0-100
}

export interface AICompatibilityResult {
  baseScore: number; // Original vector-based score
  aiEnhancedScore: number; // AI-enhanced score
  confidenceLevel: number; // 0-100 (how confident the AI is in its prediction)
  analysis: AIPersonalityAnalysis;
  recommendations: string[];
}

/**
 * Calculate AI-enhanced compatibility score using server-side processing
 * @param userScores Current user's personality scores
 * @param otherScores Other user's personality scores
 * @param track User's selected track (Build/Connect)
 * @returns Enhanced compatibility analysis
 */
export async function calculateAIEnhancedCompatibility(
  userScores: PersonalityScore[],
  otherScores: PersonalityScore[],
  track: 'Build' | 'Connect'
): Promise<AICompatibilityResult> {
  try {
    const response = await fetch('/api/ai-compatibility', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userScores,
        otherScores,
        track,
      }),
    });

    if (!response.ok) {
      throw new Error(`AI compatibility API failed: ${response.status}`);
    }

    const result: AICompatibilityResult = await response.json();
    return result;
  } catch (error) {
    console.error('Error fetching AI compatibility:', error);
    // Fallback to basic vector compatibility
    return getBasicVectorCompatibility(userScores, otherScores, track);
  }
}

/**
 * Get basic vector-based compatibility (fallback when AI is unavailable)
 * @param userScores Current user's personality scores
 * @param otherScores Other user's personality scores
 * @param track User's selected track
 * @returns Basic compatibility analysis
 */
export function getBasicVectorCompatibility(
  userScores: PersonalityScore[],
  otherScores: PersonalityScore[],
  track: 'Build' | 'Connect'
): AICompatibilityResult {
  // Simple vector compatibility calculation
  const userMap = Object.fromEntries(userScores.map(s => [s.category, s.score]));
  const otherMap = Object.fromEntries(otherScores.map(s => [s.category, s.score]));

  let totalScore = 0;
  let maxScore = 0;
  let complementaryScore = 0;
  let complementaryMax = 0;

  // Vision & Values alignment (important for all relationships)
  if (userMap['Vision & Values'] && otherMap['Vision & Values']) {
    const diff = Math.abs(userMap['Vision & Values'] - otherMap['Vision & Values']);
    totalScore += (100 - diff);
    maxScore += 100;
  }

  // Building & Work Style
  if (userMap['Building & Work Style'] && otherMap['Building & Work Style']) {
    const diff = Math.abs(userMap['Building & Work Style'] - otherMap['Building & Work Style']);
    totalScore += (100 - diff);
    maxScore += 100;
  }

  // Social Style alignment
  if (userMap['Connection & Social Style'] && otherMap['Connection & Social Style']) {
    const diff = Math.abs(userMap['Connection & Social Style'] - otherMap['Connection & Social Style']);
    totalScore += (100 - diff);
    maxScore += 100;
  }

  // Risk tolerance complementarity (important for Build track)
  if (track === 'Build' && userMap['Chaos & Risk Tolerance'] && otherMap['Chaos & Risk Tolerance']) {
    // Optimal team has balanced risk profiles
    const userRisk = userMap['Chaos & Risk Tolerance'];
    const otherRisk = otherMap['Chaos & Risk Tolerance'];
    const riskComplementarity = Math.max(0, 100 - Math.abs(userRisk - (50 - (userRisk - 50))));
    complementaryScore += riskComplementarity;
    complementaryMax += 100;

    totalScore += riskComplementarity;
    maxScore += 100;
  }

  // Calculate final percentage
  const baseScore = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;

  return {
    baseScore,
    aiEnhancedScore: baseScore,
    confidenceLevel: 70, // Basic vector calculation is moderately confident
    analysis: {
      personalityInsights: [
        track === 'Build'
          ? 'Compatible work styles will enhance collaboration'
          : 'Shared social preferences create natural connection'
      ],
      compatibilityFactors: [
        {
          trait: 'Vision Alignment',
          score: 100 - Math.abs(userMap['Vision & Values'] - otherMap['Vision & Values']),
          reasoning: 'Compatible fundamental values'
        },
        {
          trait: 'Work Style Synergy',
          score: 100 - Math.abs(userMap['Building & Work Style'] - otherMap['Building & Work Style']),
          reasoning: 'Complementary approaches to building'
        },
        {
          trait: 'Social Compatibility',
          score: 100 - Math.abs(userMap['Connection & Social Style'] - otherMap['Connection & Social Style']),
          reasoning: 'Similar social interaction preferences'
        }
      ],
      conversationStarters: [
        'What brought you to the Web3 space?',
        'What are you currently building?',
        'Who inspires you in the crypto community?'
      ],
      collaborationPotential: baseScore
    },
    recommendations: [
      track === 'Build'
        ? 'Great potential for co-founder relationship'
        : 'Excellent foundation for lasting friendship'
    ]
  };
}

/**
 * Get personality-based matching recommendations
 * @param scores User's personality scores
 * @param track User's selected track
 * @returns Recommendations for better matches
 */
export function getPersonalityRecommendations(
  scores: PersonalityScore[],
  track: 'Build' | 'Connect'
): string[] {
  const scoreMap = Object.fromEntries(scores.map(s => [s.category, s.score]));
  const recommendations = [];

  const visionScore = scoreMap['Vision & Values'] || 50;
  const riskScore = scoreMap['Chaos & Risk Tolerance'] || 50;
  const styleScore = scoreMap['Connection & Social Style'] || 50;
  const actionScore = scoreMap['Building & Work Style'] || 50;

  // Risk tolerance recommendations
  if (track === 'Build') {
    if (riskScore > 70) {
      recommendations.push('Consider pairing with more risk-averse builders for balanced decision-making');
    } else if (riskScore < 30) {
      recommendations.push('Great foundation for steady, sustainable projects');
    }
    if (actionScore > 70) {
      recommendations.push('Your action-oriented style complements analytical thinkers well');
    }
  }

  // Social style recommendations for Connect track
  if (track === 'Connect') {
    if (styleScore > 70) {
      recommendations.push('Your outgoing nature will connect well with fellow social networkers');
    } else if (styleScore < 30) {
      recommendations.push('Consider connecting with more outgoing types to broaden your network');
    }
  }

  // Vision-based recommendations
  if (visionScore > 70) {
    recommendations.push('Seek connections who share your passion for Web3 impact');
  } else if (visionScore > 40) {
    recommendations.push('Your balanced approach suits both traditional and revolutionary thinkers');
  }

  return recommendations;
}

/**
 * Generate AI-powered conversation starters based on personality compatibility
 * @param userScores Current user's personality scores
 * @param otherScores Other user's personality scores
 * @returns Array of personalized conversation starters
 */
export function generateConversationStarters(
  userScores: PersonalityScore[],
  otherScores: PersonalityScore[]
): string[] {
  const userMap = Object.fromEntries(userScores.map(s => [s.category, s.score]));
  const otherMap = Object.fromEntries(otherScores.map(s => [s.category, s.score]));

  const starters = [
    'What\'s your favorite Web3 project and why do you love it?',
    'How did you first get into crypto?',
    'What are you working on right now?'
  ];

  // Personality-based conversation starters
  const visionDiff = Math.abs(userMap['Vision & Values'] - otherMap['Vision & Values']);
  const riskDiff = Math.abs(userMap['Chaos & Risk Tolerance'] - otherMap['Chaos & Risk Tolerance']);
  const styleDiff = Math.abs(userMap['Connection & Social Style'] - otherMap['Connection & Social Style']);

  // If similar vision, add deeper conversation
  if (visionDiff < 20) {
    starters.push('What Web3 problem keeps you up at night?');
    starters.push('If you could change one thing about Web3, what would it be?');
  }

  // If complementary risk tolerance, add planning conversation
  if (riskDiff > 40) {
    starters.push('How do you approach risk assessment in your projects?');
  }

  // If different social styles, add networking conversation
  if (styleDiff > 30) {
    starters.push('How do you like to network in the Web3 community?');
    starters.push('What\'s your favorite way to meet people in crypto?');
  }

  starters.push('What are you most excited about in Web3 right now?');

  return starters.slice(0, 5); // Return top 5 starters
}
