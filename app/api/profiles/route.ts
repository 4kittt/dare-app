import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '../../lib/supabase'
import { UserProfile } from '../../lib/types'

// GET /api/profiles/[fid] - Get user profile
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const fid = url.pathname.split('/').pop()

    if (!fid) {
      return NextResponse.json({ error: 'FID required' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('fid', fid)
      .single()

    if (error && error.code !== 'PGRST116') {
      throw error
    }

    if (!data) {
      return NextResponse.json({ exists: false })
    }

    // Convert database format to UserProfile format
    const profile: UserProfile = {
      fid: data.fid,
      username: data.username,
      displayName: data.display_name,
      pfpUrl: data.pfp_url,
      track: data.track,
      personalityScores: Object.entries(data.personality_scores).map(([category, score]) => ({
        category: category as UserProfile['personalityScores'][0]['category'],
        score: score as number
      })),
      minted: data.minted,
      mintedAt: data.minted_at || undefined,
      bio: data.bio || undefined,
      tags: data.tags || []
    }

    return NextResponse.json({ exists: true, profile })
  } catch (error) {
    console.error('Error fetching profile:', error)
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 })
  }
}

// POST /api/profiles - Create or update profile
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { fid, username, displayName, pfpUrl, track, personalityScores, bio, tags }: Omit<UserProfile, 'minted'> = body

    if (!fid || !username || !displayName || !pfpUrl || !track || !personalityScores) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Convert UserProfile format to database format
    const personalityScoresObj: Record<string, number> = {}
    personalityScores.forEach(score => {
      personalityScoresObj[score.category] = score.score
    })

    const profileData = {
      fid,
      username,
      display_name: displayName,
      pfp_url: pfpUrl,
      track,
      personality_scores: personalityScoresObj,
      minted: false,
      bio: bio || null,
      tags: tags || [],
      updated_at: new Date().toISOString()
    }

    // Upsert profile
    const { data, error } = await supabase
      .from('profiles')
      .upsert(profileData, {
        onConflict: 'fid',
        ignoreDuplicates: false
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json({ success: true, profile: data })
  } catch (error) {
    console.error('Error creating profile:', error)
    return NextResponse.json({ error: 'Failed to create profile' }, { status: 500 })
  }
}
