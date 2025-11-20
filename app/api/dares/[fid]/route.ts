import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '../../../lib/supabase'
import { Dare } from '../../../lib/types'

interface DatabaseDare {
  id: string
  from_fid: string
  to_fid: string
  match_id: string | null
  type: string
  title: string
  description: string
  target_url: string | null
  target_username: string | null
  status: string
  created_at: string
  completed_at: string | null
  reward_type: string | null
  reward_title: string | null
  reward_description: string | null
}

// GET /api/dares/[fid] - Get pending dares for a specific user
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ fid: string }> }
) {
  try {
    const { fid } = await params

    if (!fid) {
      return NextResponse.json({ error: 'FID required' }, { status: 400 })
    }

    // Get pending dares for this user where they are the recipient
    const { data: receivedDares, error: receivedError } = await supabase
      .from('dares')
      .select('*')
      .eq('to_fid', fid)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(5)

    if (receivedError) throw receivedError

    // Get dares created by this user
    const { data: sentDares, error: sentError } = await supabase
      .from('dares')
      .select('*')
      .eq('from_fid', fid)
      .order('created_at', { ascending: false })
      .limit(10)

    if (sentError) throw sentError

    // Transform data to match TypeScript interfaces
    const transformDare = (dare: DatabaseDare): Dare => ({
      id: dare.id,
      fromFid: dare.from_fid,
      toFid: dare.to_fid,
      matchId: dare.match_id || undefined,
      type: dare.type as Dare['type'],
      title: dare.title,
      description: dare.description,
      targetUrl: dare.target_url || undefined,
      targetUsername: dare.target_username || undefined,
      status: dare.status as Dare['status'],
      createdAt: dare.created_at,
      completedAt: dare.completed_at || undefined,
      reward: dare.reward_type && dare.reward_title && dare.reward_description ? {
        type: dare.reward_type as 'badge' | 'points' | 'nft',
        title: dare.reward_title,
        description: dare.reward_description
      } : undefined
    })

    return NextResponse.json({
      received: receivedDares.map(transformDare),
      sent: sentDares.map(transformDare)
    })
  } catch (error) {
    console.error('Error fetching dares:', error)
    return NextResponse.json({ error: 'Failed to fetch dares' }, { status: 500 })
  }
}
