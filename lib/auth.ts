'use client'
import { createClient } from '@supabase/supabase-js'

function getClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

export async function signInWithGoogle() {
  const { error } = await getClient().auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: `${window.location.origin}/auth/callback` },
  })
  if (error) throw error
}

export async function signInWithApple() {
  const { error } = await getClient().auth.signInWithOAuth({
    provider: 'apple',
    options: { redirectTo: `${window.location.origin}/auth/callback` },
  })
  if (error) throw error
}

export async function signInAsGuest() {
  const { error } = await getClient().auth.signInAnonymously()
  if (error) throw error
}

export async function signOut() {
  const { error } = await getClient().auth.signOut()
  if (error) throw error
}
