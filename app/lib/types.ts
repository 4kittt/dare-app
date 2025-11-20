// Core types for DareUp personality matching - Updated for OnchainKit four pillars

export type PersonalityFeedbackType =
  | 'interest'        // Right: Let's chat 🤝
  | 'pass';           // Left: Pass ❌

export interface PersonalityScore {
  category: 'Vision & Values' | 'Building & Work Style' | 'Chaos & Risk Tolerance' | 'Connection & Social Style' | 'Builder Score'
  score: number // 0-100
}

export interface UserProfile {
  fid: string // Farcaster ID
  username: string
  displayName: string
  pfpUrl: string
  track: 'Build' | 'Connect' | 'Date'
  personalityScores: PersonalityScore[]
  minted: boolean
  mintedAt?: string
  bio?: string
  tags: string[] // extra personality tags
}

export interface CompatibilityCard {
  profile: UserProfile
  matchPercentage: number
  keyAlignmentTags: string[] // e.g. ["Loves Deep Work", "Risk Tolerance: Degen"]
  popNftProfile: string // e.g. "Visionary Builder"
}

export interface SwipeAction {
  fromFid: string
  toFid: string
  action: 'like' | 'pass' | 'superlike'
  timestamp: string
}

export interface Match {
  id: string
  participants: [string, string] // FIDs
  track: 'Build' | 'Connect' | 'Date'
  createdAt: string
  lastMessageAt?: string
}

export interface Dare {
  id: string
  fromFid: string // Qui crée le dare
  toFid: string // Qui reçoit le dare
  matchId?: string // Optionnel : lié à un match
  type: 'invite' | 'comment' | 'share' | 'custom' // Type d'action requise
  title: string // "Invite a friend to DareUp!"
  description?: string // Description détaillée du dare
  targetUrl?: string // URL vers un cast ou un lien spécifique
  targetUsername?: string // Nom d'utilisateur à inviter ou mentionner
  targetFid?: string // FID reference for Neynar verification
  status: 'pending' | 'completed' | 'expired' // Statut du dare
  createdAt: string
  completedAt?: string
  verificationHash?: string // Cast hash for Neynar verification
  reward?: {
    type: 'badge' | 'points' | 'nft'
    title: string
    description?: string
    value?: number // Points value if type is points
  }
}

export interface DareCompletion {
  dareId: string
  completedBy: string // FID du completer
  proof?: DareProof // Preuve de complétion spécifique au type du dare
  completedAt: string
  verified: boolean // Vérifié par Neynar ou autre
}

export interface DareProof {
  type: 'invite' | 'comment' | 'share'
  inviteeFid?: string // Pour les invites
  castUrl?: string // Pour les commentaires/shares
  castHash?: string // Hash du cast pour vérification Neynar
  screenshotUrl?: string // Screenshot si nécessaire
}

// Points system types
export interface UserPoints {
  fid: string
  totalPoints: number
  history: Array<{
    points: number
    reason: 'dare_complete' | 'referral_bonus' | 'badge_earned' | 'match_boost'
    timestamp: string
    referenceId?: string
  }>
}

export interface PointsTransaction {
  id: string
  fid: string
  points: number
  reason: string
  referenceId?: string // Dare ID, Match ID
  createdAt: string
}

// Smart contract types for personality NFT badges
export interface PersonalityBadge {
  tokenId: bigint
  owner: string
  personalityType: string
  visionScore: number
  riskScore: number
  styleScore: number
  actionScore: number
  track: 'Build' | 'Connect' | 'Date'
  mintedAt: number
  fid: string
  username: string
}

export interface MintingResult {
  success: boolean
  tokenId?: bigint
  transactionHash?: string
  error?: string
}

// Database profile record interface
export interface DatabaseProfile {
  fid: string
  username: string
  display_name: string
  pfp_url: string
  track: 'Build' | 'Connect' | 'Date'
  personality_scores: Record<string, number>
  minted: boolean
  minted_at: string | null
  bio: string | null
  tags: string[]
  created_at: string
  updated_at: string
}
