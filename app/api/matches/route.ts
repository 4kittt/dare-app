import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '../../lib/supabase'
import { CompatibilityCard, UserProfile, DatabaseProfile } from '../../lib/types'
import { createPostMatchDare } from '../dares/route'

// GET /api/matches/suggestions/[fid] - Get swipe suggestions
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const fid = url.pathname.split('/').pop()

    if (!fid) {
      return NextResponse.json({ error: 'FID required' }, { status: 400 })
    }

    // Get current user profile
    const { data: userProfile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('fid', fid)
      .single()

    if (profileError) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    if (!userProfile.minted) {
      return NextResponse.json({ error: 'User must mint NFT to access swipe' }, { status: 403 })
    }

    // Get user's existing swipes to exclude
    const { data: userSwipes, error: swipesError } = await supabase
      .from('swipes')
      .select('to_fid')
      .eq('from_fid', fid)

    if (swipesError) throw swipesError

    const swipedFids = new Set(userSwipes.map(s => s.to_fid))
    swipedFids.add(fid) // Exclude self

    // Get potential matches: same track, minted, not swiped
    const { data: candidates, error: candidatesError } = await supabase
      .from('profiles')
      .select('*')
      .eq('track', userProfile.track)
      .eq('minted', true)
      .not('fid', 'in', `(${Array.from(swipedFids).join(',')})`)
      .limit(50)

    if (candidatesError) throw candidatesError

    // Calculate compatibility for each candidate and create CompatibilityCard
    const compatibilityCards: CompatibilityCard[] = candidates.map(candidate => {
      const matchPercentage = calculateCompatibility(userProfile, candidate)

      // Generate personality profile name (simplified for now)
      const popNftProfile = generatePoPProfileName(candidate)

      // Generate key alignment tags
      const keyAlignmentTags = generateAlignmentTags(userProfile, candidate)

      return {
        profile: convertDbProfileToUserProfile(candidate),
        matchPercentage,
        keyAlignmentTags,
        popNftProfile
      }
    })

    // Sort by compatibility descending
    compatibilityCards.sort((a, b) => b.matchPercentage - a.matchPercentage)

    return NextResponse.json({ suggestions: compatibilityCards.slice(0, 20) })
  } catch (error) {
    console.error('Error fetching suggestions:', error)
    return NextResponse.json({ error: 'Failed to fetch suggestions' }, { status: 500 })
  }
}

// POST /api/matches - Update NFT mint status
export async function POST(request: NextRequest) {
  try {
    const { fid }: { fid: string } = await request.json()

    if (!fid) {
      return NextResponse.json({ error: 'FID required' }, { status: 400 })
    }

    // Mock NFT minting - in real implementation, this would verify on-chain transaction
    const { data, error } = await supabase
      .from('profiles')
      .update({
        minted: true,
        minted_at: new Date().toISOString()
      })
      .eq('fid', fid)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: 'Failed to update mint status' }, { status: 500 })
    }

    return NextResponse.json({ success: true, profile: data })
  } catch (error) {
    console.error('Error updating mint status:', error)
    return NextResponse.json({ error: 'Failed to update mint status' }, { status: 500 })
  }
}

// Helper functions

function calculateCompatibility(profile1: DatabaseProfile, profile2: DatabaseProfile): number {
  // OnchainKit Four Pillars Personality Matching Algorithm
  let totalCompatibility = 0
  let totalWeight = 0

  const scores1 = profile1.personality_scores
  const scores2 = profile2.personality_scores

  // Vision & Values (The "Why") - 30% weight, closer scores better
  const vision1 = scores1['Vision & Values'] || 50
  const vision2 = scores2['Vision & Values'] || 50
  const visionDiff = Math.abs(vision1 - vision2)
  const visionCompat = 100 - visionDiff
  totalCompatibility += visionCompat * 0.3
  totalWeight += 0.3

  // Building & Work Style (The "How") - 25% weight, complementary styles
  const building1 = scores1['Building & Work Style'] || 50
  const building2 = scores2['Building & Work Style'] || 50
  let buildingCompat = 100 - Math.abs(building1 - building2)
  // Bonus for complementary work styles (solo vs team, reflection vs action)
  if ((building1 < 40 && building2 > 60) || (building1 > 60 && building2 < 40)) {
    buildingCompat += 15 // Different but complementary styles work well
  }
  totalCompatibility += buildingCompat * 0.25
  totalWeight += 0.25

  // Chaos & Risk Tolerance (The "Risk") - 25% weight, balanced risk approaches
  const risk1 = scores1['Chaos & Risk Tolerance'] || 50
  const risk2 = scores2['Chaos & Risk Tolerance'] || 50
  let riskCompat = 100 - Math.abs(risk1 - risk2)
  // Small bonus for risk diversification (one degen + one conservative)
  if ((risk1 > 70 && risk2 < 40) || (risk1 < 40 && risk2 > 70)) {
    riskCompat += 10
  }
  totalCompatibility += riskCompat * 0.25
  totalWeight += 0.25

  // Connection & Social Style (The "Social") - 20% weight, similar social preferences
  const social1 = scores1['Connection & Social Style'] || 50
  const social2 = scores2['Connection & Social Style'] || 50
  const socialCompat = 100 - Math.abs(social1 - social2)
  // Bonus for social diversity (lurker + connector balance)
  if ((social1 < 30 && social2 > 70) || (social1 > 70 && social2 < 30)) {
    // This gets a smaller bonus since social compatibility is more about similarity
  }
  totalCompatibility += socialCompat * 0.2
  totalWeight += 0.2

  // Additional track-based compatibility bonus
  if (profile1.track === profile2.track) {
    totalCompatibility += 10 // Same track (Build/Connect) gets compatibility boost
  } else {
    // Different tracks can still be compatible, but slightly less
    totalCompatibility -= 5
  }

  return Math.max(0, Math.min(100, Math.round(totalCompatibility / totalWeight)))
}

function generatePoPProfileName(profile: DatabaseProfile): string {
  // Generate personality profile names based on four pillars (OnchainKit style)
  const scores = profile.personality_scores
  const vision = scores['Vision & Values'] || 50
  const building = scores['Building & Work Style'] || 50
  const risk = scores['Chaos & Risk Tolerance'] || 50
  const social = scores['Connection & Social Style'] || 50

  // Primary classification based on vision
  if (vision > 70) {
    if (building > 60) return "Visionary Architect"
    if (risk > 70) return "Principled Degen"
    if (social > 60) return "Inclusive Leader"
    return "Purpose-Driven Creator"
  }

  if (vision < 30) {
    if (building > 70) return "Pragmatic Builder"
    if (risk > 60) return "Adaptive Speculator"
    return "Results-Focused Developer"
  }

  // Balanced vision - focus on building style
  if (building > 70) {
    if (social > 60) return "Collaborative Builder"
    return "Solo Architect"
  }

  if (building < 30) {
    if (risk > 60) return "Cautious Innovator"
    return "Thoughtful Analyst"
  }

  // Default balanced personality
  if (social > 60 && risk > 60) return "Dynamic Connector"
  if (social < 40 && risk < 40) return "Reserved Strategist"

  return "Balanced Explorer"
}

function generateAlignmentTags(profile1: DatabaseProfile, profile2: DatabaseProfile): string[] {
  // Generate meaningful alignment tags based on four pillars compatibility
  const tags: string[] = []
  const scores1 = profile1.personality_scores
  const scores2 = profile2.personality_scores

  // Vision & Values alignment
  const vision1 = scores1['Vision & Values'] || 50
  const vision2 = scores2['Vision & Values'] || 50
  const visionDiff = Math.abs(vision1 - vision2)
  if (visionDiff < 15) {
    tags.push("Shared Vision")
  } else if (visionDiff > 60) {
    tags.push("Visionary Diversity")
  }

  // Building & Work Style alignment
  const building1 = scores1['Building & Work Style'] || 50
  const building2 = scores2['Building & Work Style'] || 50
  if (Math.abs(building1 - building2) < 25) {
    if (building1 > 60 && building2 > 60) {
      tags.push("Collaborative Spirits")
    } else if (building1 < 40 && building2 < 40) {
      tags.push("Solo Architects")
    } else {
      tags.push("Balanced Workflow")
    }
  } else {
    tags.push("Complementary Styles")
  }

  // Risk tolerance alignment
  const risk1 = scores1['Chaos & Risk Tolerance'] || 50
  const risk2 = scores2['Chaos & Risk Tolerance'] || 50
  if (Math.abs(risk1 - risk2) < 20) {
    if (risk1 > 60) {
      tags.push("Risk-Taking Partners")
    } else if (risk1 < 40) {
      tags.push("Conservative Allies")
    }
  } else if (risk1 > 70 && risk2 < 40) {
    tags.push("Risk Diversification")
  }

  // Social style alignment
  const social1 = scores1['Connection & Social Style'] || 50
  const social2 = scores2['Connection & Social Style'] || 50
  if (Math.abs(social1 - social2) < 20) {
    if (social1 > 60) {
      tags.push("Social Connectors")
    } else if (social1 < 40) {
      tags.push("Reserved Builders")
    }
  }

  // Track-based tags
  if (profile1.track === profile2.track) {
    if (profile1.track === 'Build') {
      tags.push("Co-Builders")
    } else {
      tags.push("Connection Partners")
    }
  }

  return tags.slice(0, 2) // Max 2 tags
}

function convertDbProfileToUserProfile(dbProfile: DatabaseProfile): UserProfile {
  return {
    fid: dbProfile.fid,
    username: dbProfile.username,
    displayName: dbProfile.display_name,
    pfpUrl: dbProfile.pfp_url,
    track: dbProfile.track,
    personalityScores: Object.entries(dbProfile.personality_scores).map(([category, score]) => ({
      category: category as UserProfile['personalityScores'][0]['category'],
      score: score as number
    })),
    minted: dbProfile.minted,
    mintedAt: dbProfile.minted_at || undefined,
    bio: dbProfile.bio || undefined,
    tags: dbProfile.tags || []
  }
}
