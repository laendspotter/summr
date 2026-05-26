'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { User } from '@supabase/supabase-js'
import { useRouter, useParams } from 'next/navigation'
import Navbar from '@/components/Navbar'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const LABELS = ['', 'naja...', 'ging so', 'war okay', 'war gut! 👍', 'krass geil! 🔥']

export default function RatePage() {
  const router = useRouter()
  const params = useParams()
  const activityId = params.activityId as string
  const userId = params.userId as string
  const [user, setUser] = useState<User | null>(null)
  const [targetName, setTargetName] = useState('')
  const [stars, setStars] = useState(0)
  const [hover, setHover] = useState(0)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [already, setAlready] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { router.push('/'); return }
      setUser(session.user)
      const { data: existing } = await supabase.from('ratings').select('id')
        .eq('activity_id', activityId).eq('from_user_id', session.user.id).eq('to_user_id', userId).single()
      if (existing) { setAlready(true); return }
      const { data: prof } = await supabase.from('profiles').select('name').eq('id', userId).single()
      if (prof) setTargetName(prof.name)
    })
  }, [])

  async function handleSubmit() {
    if (!user || stars === 0) return
    setLoading(true)
    const fromName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'jemand'
    await supabase.from('ratings').insert({ activity_id: activityId, from_user_id: user.id, to_user_id: userId, from_user_name: fromName, stars, comment })
    const { data: allRatings } = await supabase.from('ratings').select('stars').eq('to_user_id', userId)
    if (allRatings?.length) {
      const avg = allRatings.reduce((s: number, r: any) => s + r.stars, 0) / allRatings.length
      await supabase.from('profiles').update({ avg_rating: Math.round(avg * 10) / 10, rating_count: allRatings.length }).eq('id', userId)
    }
    router.push(`/activity/${activityId}`)
  }

  if (already) return (
    <>
      <Navbar user={user} />
      <div className="page-wrap" style={{ maxWidth: '480px', textAlign: 'center', paddingTop: '80px' }}>
        <div style={{ fontSize: '44px', marginBottom: '16px' }}>✅</div>
        <h2 style={{ fontWeight: 800, marginBottom: '8px' }}>schon bewertet</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '24px', fontSize: '14px' }}>du hast diese person bereits bewertet.</p>
        <button onClick={() => router.back()} className="btn-primary">zurück</button>
      </div>
    </>
  )

  const displayStars = hover || stars

  return (
    <>
      <Navbar user={user} />
      <div className="page-wrap" style={{ maxWidth: '480px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 800, letterSpacing: '-1px', marginBottom: '6px' }}>bewertung ⭐</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '28px', fontSize: '14px' }}>
          wie war {targetName || 'diese person'} beim event?
        </p>

        <div className="card" style={{ padding: '28px' }}>
          <div style={{ marginBottom: '24px' }}>
            <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-sub)', marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '0.3px' }}>
              deine bewertung *
            </div>
            <div style={{ display: 'flex', gap: '6px', marginBottom: '10px' }}>
              {[1,2,3,4,5].map(s => (
                <button key={s} type="button"
                  onClick={() => setStars(s)}
                  onMouseEnter={() => setHover(s)}
                  onMouseLeave={() => setHover(0)}
                  style={{
                    fontSize: '34px', background: 'none', border: 'none', cursor: 'pointer',
                    filter: s <= displayStars ? 'none' : 'grayscale(1) opacity(0.2)',
                    transform: s <= displayStars ? 'scale(1.15)' : 'scale(1)',
                    transition: 'all 0.12s',
                  }}>⭐</button>
              ))}
            </div>
            {displayStars > 0 && (
              <p style={{ fontSize: '13px', color: 'var(--sun)', fontWeight: 600 }}>{LABELS[displayStars]}</p>
            )}
          </div>

          <div style={{ marginBottom: '24px' }}>
            <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-sub)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.3px' }}>
              kommentar (optional)
            </div>
            <textarea className="input" placeholder="z.b. super nett, pünktlich, würde ich empfehlen..." value={comment}
              onChange={e => setComment(e.target.value)} rows={3} maxLength={300} />
            <div style={{ textAlign: 'right', fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>{comment.length}/300</div>
          </div>

          <button onClick={handleSubmit} className="btn-primary" disabled={stars === 0 || loading}
            style={{ width: '100%', justifyContent: 'center', padding: '13px', fontSize: '15px', opacity: stars === 0 ? 0.4 : 1 }}>
            {loading ? 'wird gespeichert...' : '⭐ bewertung abschicken'}
          </button>
        </div>
      </div>
    </>
  )
}
