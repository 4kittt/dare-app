import { useWriteContract, useWaitForTransactionReceipt, useAccount } from 'wagmi';
import { PERSONALITY_BADGE_ABI, PERSONALITY_BADGE_CONTRACT_ADDRESS } from '../../contracts/PersonalityBadgeABI';
import { MintingResult, PersonalityBadge } from './types';

/**
 * Hook for minting personality badges
 * @param personalityType The personality type name
 * @param vision Vision score (-10 to +10)
 * @param risk Risk score (-10 to +10)
 * @param style Style score (-10 to +10)
 * @param action Action score (-10 to +10)
 * @param track User's track preference
 * @param fid Farcaster ID
 * @param username Farcaster username
 * @returns Minting result with transaction details
 */
export function useMintPersonalityBadge(
  personalityType: string,
  vision: number,
  risk: number,
  style: number,
  action: number,
  track: 'Build' | 'Connect' | 'Date',
  fid: string,
  username: string
) {
  const { address } = useAccount();

  const { writeContract, data: hash, error: writeError, isPending } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed, error: confirmError } = useWaitForTransactionReceipt({
    hash,
  });

  const mintBadge = () => {
    if (!address) {
      return {
        success: false,
        error: 'No wallet connected',
      } as MintingResult;
    }

    // Validate score ranges
    if (vision < -10 || vision > 10) return { success: false, error: 'Vision score out of range' } as MintingResult;
    if (risk < -10 || risk > 10) return { success: false, error: 'Risk score out of range' } as MintingResult;
    if (style < -10 || style > 10) return { success: false, error: 'Style score out of range' } as MintingResult;
    if (action < -10 || action > 10) return { success: false, error: 'Action score out of range' } as MintingResult;

    writeContract({
      address: PERSONALITY_BADGE_CONTRACT_ADDRESS,
      abi: PERSONALITY_BADGE_ABI,
      functionName: 'mintBadge',
      args: [
        address,
        personalityType,
        vision,
        risk,
        style,
        action,
        track,
        fid,
        username
      ],
    });
  };

  // Return the current state
  const result: MintingResult = {
    success: isConfirmed,
    transactionHash: hash || undefined,
    error: (writeError || confirmError)?.message,
  };

  return {
    mintBadge,
    result,
    isPending,
    isConfirming,
    isConfirmed,
  };
}

/**
 * Get personality badge data from the blockchain
 * @param tokenId The token ID to query
 * @returns Promise resolving to personality badge data
 */
export async function getPersonalityBadgeData(tokenId: bigint): Promise<PersonalityBadge> {
  const response = await fetch('/api/badge-data', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ tokenId: tokenId.toString() }),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch badge data');
  }

  const data = await response.json();
  return data;
}

/**
 * Check if a user has already minted a badge
 * @param fid Farcaster ID to check
 * @returns Promise resolving to boolean
 */
export async function userHasMintedBadge(fid: string): Promise<boolean> {
  const response = await fetch('/api/user-has-minted', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ fid }),
  });

  if (!response.ok) {
    throw new Error('Failed to check minting status');
  }

  const data = await response.json();
  return data.hasMinted;
}

/**
 * Generate NFT metadata for a personality badge
 * @param personalityData The personality vector data
 * @param baseUri Base URI for metadata hosting
 * @returns Complete NFT metadata object
 */
export function generateNFTMetadata(
  personalityData: {
    personalityType: string;
    visionScore: number;
    riskScore: number;
    styleScore: number;
    actionScore: number;
    track: 'Build' | 'Connect' | 'Date';
    username: string;
    fid: string;
  },
  baseUri: string = 'https://dareup.vercel.app/api/metadata'
) {
  const scores = [
    {
      trait_type: "Vision Score",
      value: personalityData.visionScore,
      max_value: 10,
      min_value: -10
    },
    {
      trait_type: "Risk Tolerance",
      value: personalityData.riskScore,
      max_value: 10,
      min_value: -10
    },
    {
      trait_type: "Work Style",
      value: personalityData.styleScore,
      max_value: 10,
      min_value: -10
    },
    {
      trait_type: "Action Orientation",
      value: personalityData.actionScore,
      max_value: 10,
      min_value: -10
    },
    {
      trait_type: "Track",
      value: personalityData.track
    },
    {
      trait_type: "Personality Type",
      value: personalityData.personalityType
    }
  ];

  return {
    name: `${personalityData.personalityType} Badge`,
    description: `DareUp personality badge for @${personalityData.username} - FID: ${personalityData.fid}. Join the Web3 dating and matching platform where personality meets blockchain.`,
    image: `${baseUri}/image/${encodeURIComponent(personalityData.personalityType)}`,
    external_url: `https://dareup.vercel.app/profile/${personalityData.fid}`,
    attributes: scores,
    background_color: "#8B5CF6", // Purple theme
    properties: {
      personalityVector: {
        vision: personalityData.visionScore,
        risk: personalityData.riskScore,
        style: personalityData.styleScore,
        action: personalityData.actionScore
      },
      track: personalityData.track,
      mintedOn: "DareUp",
      category: "Personality"
    }
  };
}

/**
 * Get the personality type description based on dominant traits
 * @param scores Personality scores object
 * @returns Detailed personality description
 */
export function getPersonalityDescription(scores: {
  vision: number;
  risk: number;
  style: number;
  action: number;
}): string {
  let description = "";

  // Vision & Values analysis
  if (scores.vision > 6) {
    description += "You see the big picture and prioritize long-term impact over short-term gains. ";
  } else if (scores.vision < -6) {
    description += "You focus on practical results and immediate value creation. ";
  } else {
    description += "You balance idealism with pragmatism in your Web3 journey. ";
  }

  // Risk tolerance analysis
  if (scores.risk > 6) {
    description += "You're comfortable with high-risk, high-reward opportunities. ";
  } else if (scores.risk < -6) {
    description += "You prefer stable, calculated approaches to growth. ";
  } else {
    description += "You maintain a balanced approach to risk and opportunity. ";
  }

  // Social style analysis
  if (scores.style > 6) {
    description += "You're energized by collaboration and thrive in community settings. ";
  } else if (scores.style < -6) {
    description += "You excel in independent work and deep focus sessions. ";
  } else {
    description += "You adapt between solo work and team collaboration as needed. ";
  }

  // Action orientation analysis
  if (scores.action > 6) {
    description += "You prefer to start building and learn through iteration. ";
  } else if (scores.action < -6) {
    description += "You research thoroughly before committing to action. ";
  } else {
    description += "You balance research with practical experimentation. ";
  }

  return description;
}
