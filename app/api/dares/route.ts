import { NextRequest, NextResponse } from 'next/server'
import { getDares, createDare } from '../../lib/db'

export async function GET() {
  try {
    const dares = await getDares()
    return NextResponse.json(dares)
  } catch (error) {
    console.error('Error fetching dares:', error)
    return NextResponse.json({ error: 'Failed to fetch dares' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { title, description, reward } = await request.json()

    const dare = await createDare(title, description, reward)
    return NextResponse.json(dare)
  } catch (error) {
    console.error('Error creating dare:', error)
    return NextResponse.json({ error: 'Failed to create dare' }, { status: 500 })
  }
}
