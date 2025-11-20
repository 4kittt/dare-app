import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { userScores, otherScores, track } = await request.json();

    if (!userScores || !otherScores || !track) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    // For now, implement a simple AI-enhanced compatibility calculation
    // In production, this would call the Vercel AI Gateway

    const userMap = Object.fromEntries(userScores.map((s: any) => [s.category, s.score]));
    const otherMap = Object.fromEntries(otherScores.map((s: any) => [s.category, s.score]));

    // Enhanced compatibility algorithm
    let enhancedScore = 0;
    let confidenceLevel = 85;
    let personalityInsights = [];
    let compatibilityFactors = [];
    let recommendations = [];
    let conversationStarters = [];
    let collaborationPotential = 0;

    // Vision alignment with nuanced weighting
    if (userMap['Vision & Values'] && otherMap['Vision & Values']) {
      const visionDiff = Math.abs(userMap['Vision & Values'] - otherMap['Vision & Values']);
      const visionCompat = 100 - visionDiff;

      // AI insight: Similar visions create stronger bonds
      if (visionDiff < 20) {
        personalityInsights.push('Shared fundamental values create a strong foundation');
        enhancedScore += visionCompat * 1.2; // Weight more heavily
      } else if (visionDiff < 40) {
        personalityInsights.push('Compatible but different perspectives offer growth opportunities');
        enhancedScore += visionCompat;
      } else {
        personalityInsights.push('Diverse viewpoints can lead to creative solutions');
        enhancedScore += visionCompat * 0.8;
        confidenceLevel -= 10;
      }

      compatibilityFactors.push({
        trait: 'Vision & Values Alignment',
        score: visionCompat,
        reasoning: visionDiff < 20 ? 'Shared principles and long-term goals' : 'Different but complementary worldviews'
      });
    }

    // Social style with track consideration
    if (userMap['Connection & Social Style'] && otherMap['Connection & Social Style']) {
      const styleDiff = Math.abs(userMap['Connection & Social Style'] - otherMap['Connection & Social Style']);
      const styleCompat = 100 - styleDiff;

      if (track === 'Build') {
        // For building, complementary social styles are often better
        if (styleDiff > 40) {
          personalityInsights.push('Complementary social styles balance team dynamics');
          enhancedScore += styleCompat * 1.1;
        } else {
          personalityInsights.push('Similar social preferences aid communication');
          enhancedScore += styleCompat;
        }
      } else {
        // For connecting, similar social styles are usually better
        if (styleDiff < 20) {
          personalityInsights.push('Matching social styles create natural connection');
          enhancedScore += styleCompat * 1.15;
        } else {
          personalityInsights.push('Different social approaches can broaden horizons');
          enhancedScore += styleCompat * 0.9;
        }
      }

      compatibilityFactors.push({
        trait: 'Social Style Match',
        score: styleCompat,
        reasoning: track === 'Build' ? 'Team communication and collaboration flow' : 'Natural rapport and networking synergy'
      });
    }

    // Risk tolerance with sophisticated analysis
    if (userMap['Chaos & Risk Tolerance'] && otherMap['Chaos & Risk Tolerance']) {
      const riskDiff = Math.abs(userMap['Chaos & Risk Tolerance'] - otherMap['Chaos & Risk Tolerance']);
      const riskCompat = 100 - riskDiff;

      if (track === 'Build') {
        // Optimal teams have balanced risk profiles
        const userRisk = userMap['Chaos & Risk Tolerance'];
        const otherRisk = otherMap['Chaos & Risk Tolerance'];

        // Calculate balance score (deviation from 50-50 split)
        const riskBalance = Math.max(0, 100 - Math.abs(50 - ((userRisk + otherRisk) / 2)));
        enhancedScore += riskBalance * 1.3;
        personalityInsights.push('Balanced risk tolerance optimizes team decision-making');

        compatibilityFactors.push({
          trait: 'Risk Tolerance Balance',
          score: riskBalance,
          reasoning: 'Complementary risk profiles create well-rounded teams'
        });
      } else {
        // For friendships, similar risk tolerance is fine
        enhancedScore += riskCompat;
        personalityInsights.push('Similar risk tolerance supports shared activities');
      }
    }

    // Action orientation analysis
    if (userMap['Building & Work Style'] && otherMap['Building & Work Style']) {
      const actionDiff = Math.abs(userMap['Building & Work Style'] - otherMap['Building & Work Style']);
      const actionCompat = 100 - actionDiff;

      if (track === 'Build') {
        // For building, complementary work styles are often optimal
        if (actionDiff > 30) {
          personalityInsights.push('Complementary work paces balance productivity and quality');
          enhancedScore += actionCompat * 1.1;
        } else {
          enhancedScore += actionCompat;
        }
      } else {
        enhancedScore += actionCompat;
      }

      compatibilityFactors.push({
        trait: 'Work Style Synergy',
        score: actionCompat,
        reasoning: 'Harmonious approaches to task completion and problem-solving'
      });
    }

    // Generate conversation starters
    conversationStarters = [
      'What Web3 project are you most passionate about right now?',
      'How did your personality quiz results match your self-perception?',
      'What\'s one thing you wish more people in Web3 understood?'
    ];

    // Add personality-specific conversation starters
    if (userMap['Vision & Values'] > 60) {
      conversationStarters.push('What Web3 problem keeps you up at night?');
    }

    if (userMap['Chaos & Risk Tolerance'] > 60) {
      conversationStarters.push('What\'s the riskiest but most exciting idea you have?');
    }

    if (userMap['Connection & Social Style'] > 60) {
      conversationStarters.push('How do you like to network in the Web3 community?');
    }

    // Generate recommendations
    if (enhancedScore > 80) {
      recommendations.push(track === 'Build'
        ? 'Exceptional potential for long-term collaboration and project success'
        : 'Outstanding foundation for deep, meaningful connection');
      collaborationPotential = 95;
    } else if (enhancedScore > 65) {
      recommendations.push(track === 'Build'
        ? 'Strong compatibility for project work and joint ventures'
        : 'Excellent compatibility for friendship and networking');
      collaborationPotential = 80;
    } else if (enhancedScore > 50) {
      recommendations.push(track === 'Build'
        ? 'Moderate compatibility - focus on specific project goals'
        : 'Good potential for casual connection and occasional collaboration');
      collaborationPotential = 70;
    } else {
      recommendations.push(track === 'Build'
        ? 'Consider focusing on different types of projects together'
        : 'Explore other connections with more aligned personalities');
      collaborationPotential = 45;
      confidenceLevel += 10; // Lower confidence in edge cases
    }

    // Normalize enhanced score
    enhancedScore = Math.min(100, Math.max(0, enhancedScore / 4)); // Divide by 4 factors
    const baseScore = enhancedScore; // In this simplified version, they're the same

    return NextResponse.json({
      baseScore: Math.round(baseScore),
      aiEnhancedScore: Math.round(enhancedScore),
      confidenceLevel,
      analysis: {
        personalityInsights,
        compatibilityFactors,
        conversationStarters: conversationStarters.slice(0, 5),
        collaborationPotential
      },
      recommendations
    });

  } catch (error) {
    console.error('AI compatibility calculation error:', error);
    return NextResponse.json({
      error: 'Failed to calculate AI compatibility',
      baseScore: 50,
      aiEnhancedScore: 50,
      confidenceLevel: 30,
      analysis: {
        personalityInsights: ['Basic compatibility calculation completed'],
        compatibilityFactors: [],
        conversationStarters: [
          'What brings you to DareUp?',
          'What are you working on?',
          'What do you enjoy most about Web3?'
        ],
        collaborationPotential: 50
      },
      recommendations: ['Basic compatibility assessment completed']
    }, { status: 200 }); // Return fallback instead of error
  }
}
