'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Activity, CATEGORIES } from '@/lib/supabase'
import { User } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import ActivityCard from '@/components/ActivityCard'
import Link from 'next/link'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function Dashboard() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [activities, setActivities] = useState<Activity[]>([])
  const [joinedIds, setJoinedIds] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState('all')
  const [search, setSearch] = useState('')

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { router.push('/'); return }
      setUser(session.user)
      fetchActivities(session.user.id)
    })
  }, [])

  async function fetchActivities(userId: string) {
    setLoading(true)
    const { data: acts, error } = await supabase
      .from('activities')
      .select('*, participants(count)')
      .gte('datetime', new Date().toISOString())
      .order('datetime', { ascending: true })

    if (error) console.error('activities error:', error)

    const { data: joined } = await supabase
      .from('participants')
      .select('activity_id')
      .eq('user_id', userId)

    if (acts) setActivities(acts.map((a: any) => ({ ...a, participant_count: a.participants?.[0]?.count || 0 })))
    if (joined) setJoinedIds(joined.map((j: any) => j.activity_id))
    setLoading(false)
  }

  const filtered = activities.filter(a => {
    const matchCat = category === 'all' || a.category === category
    const matchSearch = !search ||
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.location.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  return (
    <>
      <Navbar user={user} />
      <div className="page-wrap">
        {/* header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px', gap: '16px', flexWrap: 'wrap' }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: 800, letterSpacing: '-1px', marginBottom: '4px' }}>
              aktivitäten 🌞
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>finde was in deiner nähe los ist</p>
          </div>
          <Link href="/create" className="btn-primary">+ event erstellen</Link>
        </div>

        {/* search */}
        <input
          className="input"
          placeholder="🔍 aktivität oder ort..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ maxWidth: '360px', marginBottom: '14px' }}
        />

        {/* category filter */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '28px' }}>
          {[{ id: 'all', label: 'alle', emoji: '✨' }, ...CATEGORIES].map(c => (
            <button
              key={c.id}
              onClick={() => setCategory(c.id)}
              style={{
                padding: '6px 14px',
                borderRadius: '99px',
                fontSize: '12px',
                fontWeight: 600,
                fontFamily: 'Syne, sans-serif',
                cursor: 'pointer',
                border: '1px solid',
                transition: 'all 0.15s',
                background: category === c.id ? 'var(--sun)' : 'var(--bg-card)',
                borderColor: category === c.id ? 'var(--sun)' : 'var(--border)',
                color: category === c.id ? 'white' : 'var(--text-muted)',
              }}
            >
              {c.emoji} {c.label}
            </button>
          ))}
        </div>

        {/* grid */}
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
            {[1,2,3,4,5,6].map(i => <div key={i} className="loading-shimmer" style={{ height: '300px' }} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 24px', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '40px', marginBottom: '14px' }}>☀️</div>
            <h3 style={{ fontWeight: 700, marginBottom: '8px', color: 'var(--text)' }}>nichts gefunden</h3>
            <p style={{ fontSize: '14px', marginBottom: '24px' }}>erstell selbst was!</p>
            <Link href="/create" className="btn-primary">+ event erstellen</Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
            {filtered.map(a => <ActivityCard key={a.id} activity={a} joined={joinedIds.includes(a.id)} />)}
          </div>
        )}
      </div>
    </>
  )
}
