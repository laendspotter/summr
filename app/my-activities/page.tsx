'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
import { User } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import ActivityCard from '@/components/ActivityCard'
import Link from 'next/link'

export default function MyActivities() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [joined, setJoined] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { router.push('/'); return }
      setUser(session.user)

      const { data: parts } = await supabase
        .from('participants')
        .select('activity_id, activities(*)')
        .eq('user_id', session.user.id)
        .neq('activities.creator_id', session.user.id)

      if (parts) {
        const acts = parts.map((p: any) => p.activities).filter(Boolean)
        setJoined(acts)
      }
      setLoading(false)
    })
  }, [])

  return (
    <>
      <Navbar user={user} />
      <div className="page-wrap">
        <h1 style={{ fontSize: '32px', fontWeight: 800, letterSpacing: '-1px', marginBottom: '8px' }}>
          beigetretene events
        </h1>
        <p style={{ color: 'var(--muted)', marginBottom: '32px' }}>
          events bei denen du dabei bist
        </p>

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
            {[1,2,3].map(i => <div key={i} className="loading-shimmer" style={{ height: '300px' }} />)}
          </div>
        ) : joined.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 24px' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🌞</div>
            <h3 style={{ fontWeight: 700, marginBottom: '8px' }}>noch keinem event beigetreten</h3>
            <p style={{ color: 'var(--muted)', marginBottom: '24px' }}>schau dich auf dem dashboard um!</p>
            <Link href="/dashboard" className="btn-primary">events entdecken</Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
            {joined.map((a: any) => <ActivityCard key={a.id} activity={a} joined />)}
          </div>
        )}
      </div>
    </>
  )
}
