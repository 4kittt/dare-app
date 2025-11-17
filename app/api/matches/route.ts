import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '../../lib/supabase'
import { CompatibilityCard, UserProfile, DatabaseProfile } from '../../lib/types'

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
  let totalCompatibility = 0
  let totalCategories = 0

  const scores1 = profile1.personality_scores
  const scores2 = profile2.personality_scores

  const categories: (keyof typeof scores1)[] = ['Mood', 'Dev Skills', 'Food Taste', 'Fun']

  categories.forEach(category => {
    const score1 = scores1[category] || 50
    const score2 = scores2[category] || 50

    // Compatibility is higher when scores are close, but also when complementary traits
    const difference = Math.abs(score1 - score2)
    let compatibility = 100 - difference

    // Bonus for complementary traits in certain categories
    if (category === 'Mood' && ((score1 < 30 && score2 > 70) || (score1 > 70 && score2 < 30))) {
      compatibility += 10 // Complementary social preferences
    }

    totalCompatibility += compatibility
    totalCategories++
  })

  return Math.round(totalCompatibility / totalCategories)
}

function generatePoPProfileName(profile: DatabaseProfile): string {
  const scores = profile.personality_scores
  const devScore = scores['Dev Skills'] || 50
  const moodScore = scores['Mood'] || 50

  if (devScore > 70 && moodScore > 70) return "Visionary Builder"
  if (devScore > 70 && moodScore < 30) return "Focused Creator"
  if (devScore < 30 && moodScore > 70) return "Social Connector"
  return "Balanced Explorer"
}

function generateAlignmentTags(profile1: DatabaseProfile, profile2: DatabaseProfile): string[] {
  const tags: string[] = []
  const scores1 = profile1.personality_scores
  const scores2 = profile2.personality_scores

  if (Math.abs((scores1['Dev Skills'] || 50) - (scores2['Dev Skills'] || 50)) < 20) {
    tags.push("Matching Tech Level")
  }

  if (Math.abs((scores1['Mood'] || 50) - (scores2['Mood'] || 50)) < 20) {
    tags.push("Similar Social Style")
  }

  if (Math.abs((scores1['Fun'] || 50) - (scores2['Fun'] || 50)) > 50) {
    tags.push("Contrasting Energies") // Complementary
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
