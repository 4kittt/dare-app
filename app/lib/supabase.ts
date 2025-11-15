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
    }
  }
}
