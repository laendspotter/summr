import { createClient, SupabaseClient } from '@supabase/supabase-js'

let _client: SupabaseClient | null = null

export function getSupabase() {
  if (!_client) {
    _client = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  }
  return _client
}

// convenience export für client components
export const supabase = typeof window !== 'undefined'
  ? createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder'
    )
  : null as any

export type Activity = {
  id: string
  title: string
  description: string
  location: string
  location_lat?: number
  location_lng?: number
  datetime: string
  max_people: number
  creator_id: string
  creator_name: string
  creator_avatar?: string
  category: string
  created_at: string
  participant_count?: number
}

export type Profile = {
  id: string
  name: string
  avatar_url?: string
  bio?: string
  location_radius: number
  avg_rating: number
  rating_count: number
  created_at: string
}

export type Message = {
  id: string
  activity_id: string
  user_id: string
  user_name: string
  user_avatar?: string
  content: string
  created_at: string
}

export type Rating = {
  id: string
  activity_id: string
  from_user_id: string
  to_user_id: string
  stars: number
  comment: string
  created_at: string
  from_user_name?: string
}

export const CATEGORIES = [
  { id: 'sport', label: 'Sport', emoji: '⚽' },
  { id: 'schwimmen', label: 'Schwimmen', emoji: '🏊' },
  { id: 'wandern', label: 'Wandern', emoji: '🥾' },
  { id: 'gaming', label: 'Gaming', emoji: '🎮' },
  { id: 'musik', label: 'Musik', emoji: '🎵' },
  { id: 'essen', label: 'Essen', emoji: '🍕' },
  { id: 'kino', label: 'Kino', emoji: '🎬' },
  { id: 'sonstiges', label: 'Sonstiges', emoji: '✨' },
]
