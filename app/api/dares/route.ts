import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '../../lib/supabase'
import { Dare, DareCompletion, DareProof } from '../../lib/types'

// GET /api/dares/[fid] - Get pending dares for a user
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const fid = url.pathname.split('/').pop()

    if (!fid) {
      return NextResponse.json({ error: 'FID required' }, { status: 400 })
    }

    // Get pending dares for this user
    const { data: dares, error } = await supabase
      .from('dares')
      .select('*')
      .eq('to_fid', fid)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(10)

    if (error) throw error

    return NextResponse.json({ dares })
  } catch (error) {
    console.error('Error fetching dares:', error)
    return NextResponse.json({ error: 'Failed to fetch dares' }, { status: 500 })
  }
}

// POST /api/dares - Create a new dare
export async function POST(request: NextRequest) {
  try {
    const dareData: Omit<Dare, 'id' | 'createdAt' | 'status'> = await request.json()

    if (!dareData.fromFid || !dareData.toFid || !dareData.type || !dareData.title) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Create the dare
    const { data, error } = await supabase
      .from('dares')
      .insert([{
        from_fid: dareData.fromFid,
        to_fid: dareData.toFid,
        match_id: dareData.matchId,
        type: dareData.type,
        title: dareData.title,
        description: dareData.description,
        target_url: dareData.targetUrl,
        target_username: dareData.targetUsername,
        status: 'pending',
        reward_type: dareData.reward?.type,
        reward_title: dareData.reward?.title,
        reward_description: dareData.reward?.description,
        created_at: new Date().toISOString()
      }])
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      throw error
    }

    return NextResponse.json({
      dare: {
        id: data.id,
        fromFid: data.from_fid,
        toFid: data.to_fid,
        matchId: data.match_id,
        type: data.type,
        title: data.title,
        description: data.description,
        targetUrl: data.target_url,
        targetUsername: data.target_username,
        status: data.status,
        createdAt: data.created_at,
        reward: data.reward_type ? {
          type: data.reward_type,
          title: data.reward_title,
          description: data.reward_description
        } : undefined
      }
    })
  } catch (error) {
    console.error('Error creating dare:', error)
    return NextResponse.json({ error: 'Failed to create dare' }, { status: 500 })
  }
}

// PUT /api/dares/[dareId] - Complete a dare
export async function PUT(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const dareId = url.searchParams.get('dareId')

    if (!dareId) {
      return NextResponse.json({ error: 'Dare ID required' }, { status: 400 })
    }

    const completionData: DareCompletion = await request.json()

    // Verify this is the correct completer
    if (completionData.completedBy !== dareId.split('-')[0]) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Update dare status to completed
    const { error: updateError } = await supabase
      .from('dares')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString()
      })
      .eq('id', dareId)

    if (updateError) throw updateError

    // Insert completion proof
    const proof = completionData.proof as DareProof
    const { error: completionError } = await supabase
      .from('dare_completions')
      .insert([{
        dare_id: dareId,
        completed_by: completionData.completedBy,
        proof_data: proof,
        completed_at: new Date().toISOString(),
        verified: false // Will be verified later via Neynar
      }])

    if (completionError) throw completionError

    return NextResponse.json({
      success: true,
      message: 'Dare completed! Verification pending.'
    })
  } catch (error) {
    console.error('Error completing dare:', error)
    return NextResponse.json({ error: 'Failed to complete dare' }, { status: 500 })
  }
}

// Helper function to create default post-match dares
export async function createPostMatchDare(matchId: string, fromFid: string, toFid: string) {
  const inviteDare: Omit<Dare, 'id' | 'createdAt' | 'status'> = {
    fromFid,
    toFid,
    matchId,
    type: 'invite',
    title: `🎯 Match Unlocked! Dare accepted... Now dare you to:`,
    description: `Invite 1 friend to DareUp and share your personality match! You'll both get exclusive access to premium features.`,
    reward: {
      type: 'badge',
      title: 'Matchmaker Badge',
      description: `Celebrate your personality match and network growth!`
    }
  }

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/dares`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(inviteDare)
    })

    if (!response.ok) {
      console.error('Failed to create post-match dare')
    }
  } catch (error) {
    console.error('Error creating post-match dare:', error)
  }
}
