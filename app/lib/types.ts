// Core types for DareUp personality matching

export interface PersonalityScore {
  category: 'Mood' | 'Dev Skills' | 'Food Taste' | 'Fun'
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
