import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '../../lib/supabase'

// POST /api/swipes - Handle swipe action and check for matches
export async function POST(request: NextRequest) {
  try {
    const { fromFid, toFid, action }: { fromFid: string, toFid: string, action: 'like' | 'pass' | 'superlike' } = await request.json()

    if (!fromFid || !toFid || !action) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Record the swipe
    const { error: swipeError } = await supabase
      .from('swipes')
      .insert({
        from_fid: fromFid,
        to_fid: toFid,
        action: action,
        timestamp: new Date().toISOString()
      })

    if (swipeError) {
      throw swipeError
    }

    let isMatch = false
    let match = null

    // Check for mutual like
    if (action === 'like' || action === 'superlike') {
      const { data: reciprocalSwipe, error } = await supabase
        .from('swipes')
        .select('*')
        .eq('from_fid', toFid)
        .eq('to_fid', fromFid)
        .eq('action', action === 'superlike' ? 'like' : 'like') // Match if reciprocal action is at least 'like'
        .single()

      if (error && error.code !== 'PGRST116') {
        throw error
      }

      if (reciprocalSwipe) {
        // Get profiles to determine track
        const { data: fromProfile, error: fromError } = await supabase
          .from('profiles')
          .select('track')
          .eq('fid', fromFid)
          .single()

        if (fromError) throw fromError

        // Create match
        const participants = [fromFid, toFid].sort() as [string, string]

        const { data: newMatch, error: matchError } = await supabase
          .from('matches')
          .insert({
            participant1: participants[0],
            participant2: participants[1],
            track: fromProfile.track,
            created_at: new Date().toISOString()
          })
          .select()
          .single()

        if (matchError) throw matchError

        isMatch = true
        match = newMatch
      }
    }

    return NextResponse.json({
      success: true,
      isMatch,
      match: match ? {
        id: match.id,
        participants: [match.participant1, match.participant2],
        track: match.track,
        createdAt: match.created_at
      } : null
    })
  } catch (error) {
    console.error('Error processing swipe:', error)
    return NextResponse.json({ error: 'Failed to process swipe' }, { status: 500 })
  }
}

// GET /api/swipes/[fid] - Get swipes for user (to avoid duplicate processing)
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const fid = url.searchParams.get('fid')

    if (!fid) {
      return NextResponse.json({ error: 'FID required' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('swipes')
      .select('*')
      .or(`from_fid.eq.${fid},to_fid.eq.${fid}`)
      .order('timestamp', { ascending: false })

    if (error) {
      throw error
    }

    return NextResponse.json({ swipes: data })
  } catch (error) {
    console.error('Error fetching swipes:', error)
    return NextResponse.json({ error: 'Failed to fetch swipes' }, { status: 500 })
  }
}
