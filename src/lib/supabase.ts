import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          avatar_url?: string | null
          updated_at?: string
        }
      }
      meta_connections: {
        Row: {
          id: string
          user_id: string
          meta_user_id: string
          access_token: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          meta_user_id: string
          access_token: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          meta_user_id?: string
          access_token?: string
          updated_at?: string
        }
      }
      ad_accounts_cache: {
        Row: {
          id: string
          connection_id: string
          meta_ad_account_id: string
          name: string
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          connection_id: string
          meta_ad_account_id: string
          name: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          connection_id?: string
          meta_ad_account_id?: string
          name?: string
          is_active?: boolean
          updated_at?: string
        }
      }
    }
  }
}