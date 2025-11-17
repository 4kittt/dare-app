import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface Database {
  public: {
    Tables: {
      dares: {
        Row: {
          id: string
          title: string
          description: string
          reward: string
          created_at: string
          created_by: string | null
        }
        Insert: {
          id?: string
          title: string
          description: string
          reward: string
          created_at?: string
          created_by?: string | null
        }
        Update: {
          id?: string
          title?: string
          description?: string
          reward?: string
          created_at?: string
          created_by?: string | null
        }
      }
      proofs: {
        Row: {
          id: string
          dare_id: string
          dare_title: string
          file_url: string | null
          status: 'pending' | 'approved' | 'rejected'
          submitted_at: string
          submitted_by: string | null
          votes: number
        }
        Insert: {
          id?: string
          dare_id: string
          dare_title: string
          file_url?: string | null
          status?: 'pending' | 'approved' | 'rejected'
          submitted_at?: string
          submitted_by?: string | null
          votes?: number
        }
        Update: {
          id?: string
          dare_id?: string
          dare_title?: string
          file_url?: string | null
          status?: 'pending' | 'approved' | 'rejected'
          submitted_at?: string
          submitted_by?: string | null
          votes?: number
        }
      }
      profiles: {
        Row: {
          fid: string
          username: string
          display_name: string
          pfp_url: string
          track: 'Build' | 'Connect' | 'Date'
          personality_scores: Record<string, number> // JSON object with categories as keys
          minted: boolean
          minted_at: string | null
          bio: string | null
          tags: string[] // JSON array
          created_at: string
          updated_at: string
        }
        Insert: {
          fid: string
          username: string
          display_name: string
          pfp_url: string
          track: 'Build' | 'Connect' | 'Date'
          personality_scores: Record<string, number>
          minted?: boolean
          minted_at?: string | null
          bio?: string | null
          tags?: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          fid?: string
          username?: string
          display_name?: string
          pfp_url?: string
          track?: 'Build' | 'Connect' | 'Date'
          personality_scores?: Record<string, number>
          minted?: boolean
          minted_at?: string | null
          bio?: string | null
          tags?: string[]
          created_at?: string
          updated_at?: string
        }
      }
      swipes: {
        Row: {
          id: string
          from_fid: string
          to_fid: string
          action: 'like' | 'pass' | 'superlike'
          timestamp: string
        }
        Insert: {
          id?: string
          from_fid: string
          to_fid: string
          action: 'like' | 'pass' | 'superlike'
          timestamp?: string
        }
        Update: {
          id?: string
          from_fid?: string
          to_fid?: string
          action?: 'like' | 'pass' | 'superlike'
          timestamp?: string
        }
      }
      matches: {
        Row: {
          id: string
          participant1: string // FID
          participant2: string // FID
          track: 'Build' | 'Connect' | 'Date'
          created_at: string
          last_message_at: string | null
        }
        Insert: {
          id?: string
          participant1: string
          participant2: string
          track: 'Build' | 'Connect' | 'Date'
          created_at?: string
          last_message_at?: string | null
        }
        Update: {
          id?: string
          participant1?: string
          participant2?: string
          track?: 'Build' | 'Connect' | 'Date'
          created_at?: string
          last_message_at?: string | null
        }
      }
    }
  }
}
