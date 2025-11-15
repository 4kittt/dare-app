import { NextRequest, NextResponse } from 'next/server'
import { getProofs, createProof } from '../../lib/db'

export async function GET() {
  try {
    const proofs = await getProofs()
    return NextResponse.json(proofs)
  } catch (error) {
    console.error('Error fetching proofs:', error)
    return NextResponse.json({ error: 'Failed to fetch proofs' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const dareId = formData.get('dareId') as string
    const dareTitle = formData.get('dareTitle') as string
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const proof = await createProof(dareId, dareTitle, file)
    return NextResponse.json(proof)
  } catch (error) {
    console.error('Error creating proof:', error)
    return NextResponse.json({ error: 'Failed to create proof' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { id, status } = await request.json()

    // For now, just return success. In production, this would update cast reactions
    console.log('Would update proof status:', id, status)

    return NextResponse.json({ id, status })
  } catch (error) {
    console.error('Error updating proof:', error)
    return NextResponse.json({ error: 'Failed to update proof' }, { status: 500 })
  }
}
