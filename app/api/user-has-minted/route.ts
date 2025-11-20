import { NextRequest, NextResponse } from 'next/server';
import { readContract } from '@wagmi/core';
import { PERSONALITY_BADGE_ABI, PERSONALITY_BADGE_CONTRACT_ADDRESS } from '../../../contracts/PersonalityBadgeABI';
import { wagmiConfig } from '../../../wagmiConfig';

export async function POST(request: NextRequest) {
  try {
    const { fid } = await request.json();

    if (!fid || typeof fid !== 'string') {
      return NextResponse.json({ error: 'Valid fid required' }, { status: 400 });
    }

    // Check if user has minted
    const hasMinted = await readContract(wagmiConfig, {
      address: PERSONALITY_BADGE_CONTRACT_ADDRESS,
      abi: PERSONALITY_BADGE_ABI,
      functionName: 'userHasMinted',
      args: [fid],
    });

    return NextResponse.json({ hasMinted });

  } catch (error) {
    console.error('Error checking minting status:', error);
    return NextResponse.json({ error: 'Failed to check minting status' }, { status: 500 });
  }
}
