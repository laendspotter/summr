'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Activity, CATEGORIES } from '@/lib/supabase'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
import { User } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import ActivityCard from '@/components/ActivityCard'
import Link from 'next/link'

export default function Dashboard() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [activities, setActivities] = useState<Activity[]>([])
  const [joinedIds, setJoinedIds] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState<string>('all')
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
    // aktivitäten laden
    const { data: acts } = await supabase
      .from('activities')
      .select('*, participants(count)')
      .gte('datetime', new Date().toISOString())
      .order('datetime', { ascending: true })

    // beigetretene ids laden
    const { data: joined } = await supabase
      .from('participants')
      .select('activity_id')
      .eq('user_id', userId)

    if (acts) {
      const mapped = acts.map((a: any) => ({
        ...a,
        participant_count: a.participants?.[0]?.count || 0
      }))
      setActivities(mapped)
    }
    if (joined) setJoinedIds(joined.map((j: any) => j.activity_id))
    setLoading(false)
  }

  const filtered = activities.filter(a => {
    const matchCat = category === 'all' || a.category === category
    const matchSearch = a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.location.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  return (
    <>
      <Navbar user={user} />
      <div className="page-wrap">
        {/* header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <div>
            <h1 style={{ fontSize: '32px', fontWeight: 800, letterSpacing: '-1px' }}>
              aktivitäten 🌞
            </h1>
            <p style={{ color: 'var(--muted)', marginTop: '4px' }}>
              finde was in deiner nähe los ist
            </p>
          </div>
          <Link href="/create" className="btn-primary">
            + event erstellen
          </Link>
        </div>

        {/* filter + search */}
        <div style={{ marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <input
            className="input"
            placeholder="🔍 aktivität oder ort suchen..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ maxWidth: '400px' }}
          />
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              onClick={() => setCategory('all')}
              className={`badge ${category === 'all' ? 'badge-sun' : ''}`}
              style={{ cursor: 'pointer', border: category === 'all' ? 'none' : '1px solid var(--border)', background: category === 'all' ? undefined : 'white', padding: '8px 14px', fontSize: '13px' }}
            >
              alle
            </button>
            {CATEGORIES.map(c => (
              <button
                key={c.id}
                onClick={() => setCategory(c.id)}
                className={`badge ${category === c.id ? 'badge-sun' : ''}`}
                style={{ cursor: 'pointer', border: category === c.id ? 'none' : '1px solid var(--border)', background: category === c.id ? undefined : 'white', padding: '8px 14px', fontSize: '13px' }}
              >
                {c.emoji} {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* grid */}
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="loading-shimmer" style={{ height: '320px' }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 24px' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>☀️</div>
            <h3 style={{ fontWeight: 700, marginBottom: '8px' }}>keine aktivitäten gefunden</h3>
            <p style={{ color: 'var(--muted)', marginBottom: '24px' }}>erstell selbst eins!</p>
            <Link href="/create" className="btn-primary">+ event erstellen</Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
            {filtered.map(a => (
              <ActivityCard key={a.id} activity={a} joined={joinedIds.includes(a.id)} />
            ))}
          </div>
        )}
      </div>
    </>
  )
}
