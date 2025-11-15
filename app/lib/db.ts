// Farcaster API utilities for DareUp
const NEYNAR_API_KEY = process.env.NEYNAR_API_KEY
const BASE_URL = 'https://api.neynar.com/v2/farcaster'

// Types for Farcaster data
export interface Cast {
  hash: string
  thread_hash: string
  parent_hash?: string
  author: {
    fid: number
    username: string
    display_name: string
    pfp_url: string
  }
  text: string
  timestamp: string
  embeds: Array<{
    url?: string
    cast_id?: {
      fid: number
      hash: string
    }
  }>
  reactions: {
    likes_count: number
    recasts_count: number
  }
  replies: {
    count: number
  }
}

// Dare parsing utilities
export const parseDareFromCast = (cast: Cast): {
  id: string
  title: string
  description: string
  reward: string
  createdAt: string
  createdBy: string
} | null => {
  const text = cast.text
  if (!text.startsWith('DARE:')) return null

  // Expected format: "DARE: [title] - [description] - Reward: [amount]"
  const parts = text.replace('DARE:', '').trim().split(' - ')
  if (parts.length < 3) return null

  const title = parts[0].trim()
  const description = parts.slice(1, -1).join(' - ').trim()
  const rewardPart = parts[parts.length - 1].trim()

  if (!rewardPart.startsWith('Reward:')) return null
  const reward = rewardPart.replace('Reward:', '').trim()

  return {
    id: cast.hash,
    title,
    description,
    reward,
    createdAt: cast.timestamp,
    createdBy: cast.author.fid.toString()
  }
}

export const parseProofFromCast = (cast: Cast): {
  id: string
  dareId: string
  dareTitle: string
  fileUrl?: string
  status: 'pending' | 'approved' | 'rejected'
  submittedAt: string
  submittedBy: string
  votes: number
} | null => {
  const text = cast.text
  if (!text.startsWith('PROOF:') || !cast.parent_hash) return null

  // Expected format: "PROOF: [dare_title]"
  const dareTitle = text.replace('PROOF:', '').trim()
  const fileUrl = cast.embeds.find(embed => embed.url)?.url

  return {
    id: cast.hash,
    dareId: cast.parent_hash,
    dareTitle,
    fileUrl,
    status: 'pending', // Could be determined by reactions/likes
    submittedAt: cast.timestamp,
    submittedBy: cast.author.fid.toString(),
    votes: cast.reactions.likes_count
  }
}

// API functions
export const getCastsByChannel = async (channelId: string): Promise<Cast[]> => {
  const response = await fetch(`${BASE_URL}/cast?type=channel&channel_id=${channelId}`, {
    headers: {
      'api_key': NEYNAR_API_KEY!
    }
  })

  if (!response.ok) throw new Error('Failed to fetch casts')

  const data = await response.json()
  return data.casts || []
}

export const getCastReplies = async (castHash: string): Promise<Cast[]> => {
  const response = await fetch(`${BASE_URL}/cast/conversation?identifier=${castHash}&type=hash`, {
    headers: {
      'api_key': NEYNAR_API_KEY!
    }
  })

  if (!response.ok) throw new Error('Failed to fetch replies')

  const data = await response.json()
  return data.conversation?.casts || []
}

export const publishCast = async (text: string, embeds?: Array<{ url: string }>, parent?: string) => {
  const response = await fetch(`${BASE_URL}/cast`, {
    method: 'POST',
    headers: {
      'api_key': NEYNAR_API_KEY!,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      text,
      embeds,
      parent
    })
  })

  if (!response.ok) throw new Error('Failed to publish cast')

  return response.json()
}

// DareUp specific functions
export const getDares = async (): Promise<Array<{
  id: string
  title: string
  description: string
  reward: string
  createdAt: string
  createdBy: string
}>> => {
  // For now, return mock data. In production, you'd query casts from a specific channel
  return [
    {
      id: '1',
      title: 'Dance on a public square',
      description: 'Do a crazy dance on the main square of your city and film yourself!',
      reward: '0.01 ETH',
      createdAt: new Date().toISOString(),
      createdBy: '123'
    },
    {
      id: '2',
      title: 'Learn a new word',
      description: 'Learn a word in a foreign language and use it in a conversation.',
      reward: '0.005 ETH',
      createdAt: new Date().toISOString(),
      createdBy: '456'
    }
  ]
}

export const getProofs = async (): Promise<Array<{
  id: string
  dareId: string
  dareTitle: string
  fileUrl?: string
  status: 'pending' | 'approved' | 'rejected'
  submittedAt: string
  submittedBy: string
  votes: number
}>> => {
  // For now, return mock data. In production, you'd query replies to dare casts
  return []
}

export const createDare = async (title: string, description: string, reward: string) => {
  const text = `DARE: ${title} - ${description} - Reward: ${reward}`

  // In production, this would publish a cast
  console.log('Would publish cast:', text)

  // Return mock data for now
  return {
    id: Date.now().toString(),
    title,
    description,
    reward,
    createdAt: new Date().toISOString(),
    createdBy: 'current_user'
  }
}

export const createProof = async (dareId: string, dareTitle: string, file: File) => {
  const text = `PROOF: ${dareTitle}`

  // In production, this would upload file to Farcaster and publish cast as reply
  console.log('Would publish proof cast:', text, 'with file:', file.name)

  // Return mock data for now
  return {
    id: Date.now().toString(),
    dareId,
    dareTitle,
    fileUrl: URL.createObjectURL(file), // Mock URL
    status: 'pending',
    submittedAt: new Date().toISOString(),
    submittedBy: 'current_user',
    votes: 0
  }
}
