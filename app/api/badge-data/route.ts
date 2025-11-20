import { NextRequest, NextResponse } from 'next/server';
import { readContract } from '@wagmi/core';
import { PERSONALITY_BADGE_ABI, PERSONALITY_BADGE_CONTRACT_ADDRESS } from '../../../contracts/PersonalityBadgeABI';
import { wagmiConfig } from '../../../wagmiConfig';

export async function POST(request: NextRequest) {
  try {
    const { tokenId } = await request.json();

    if (!tokenId || typeof tokenId !== 'string') {
      return NextResponse.json({ error: 'Valid tokenId required' }, { status: 400 });
    }

    const tokenIdBigInt = BigInt(tokenId);

    // Read contract data
    const personalityData = await readContract(wagmiConfig, {
      address: PERSONALITY_BADGE_CONTRACT_ADDRESS,
      abi: PERSONALITY_BADGE_ABI,
      functionName: 'getPersonalityData',
      args: [tokenIdBigInt],
    }) as any;

    // Transform the data (personalityData is already an object, not an array)
    return NextResponse.json({
      tokenId: tokenIdBigInt,
      owner: '', // Would need separate ownerOf call
      personalityType: personalityData.personalityType,
      visionScore: Number(personalityData.visionScore),
      riskScore: Number(personalityData.riskScore),
      styleScore: Number(personalityData.styleScore),
      actionScore: Number(personalityData.actionScore),
      track: personalityData.track,
      mintedAt: Number(personalityData.mintedAt),
      fid: personalityData.fid,
      username: personalityData.username,
    });

  } catch (error) {
    console.error('Error fetching badge data:', error);
    return NextResponse.json({ error: 'Failed to fetch badge data' }, { status: 500 });
  }
}
