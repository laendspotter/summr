'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
import { User } from '@supabase/supabase-js'
import { useRouter, useParams } from 'next/navigation'
import Navbar from '@/components/Navbar'

export default function RatePage() {
  const router = useRouter()
  const params = useParams()
  const activityId = params.activityId as string
  const userId = params.userId as string

  const [user, setUser] = useState<User | null>(null)
  const [targetUser, setTargetUser] = useState<any>(null)
  const [stars, setStars] = useState(0)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [already, setAlready] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { router.push('/'); return }
      setUser(session.user)

      // check ob schon bewertet
      const { data: existing } = await supabase
        .from('ratings')
        .select('id')
        .eq('activity_id', activityId)
        .eq('from_user_id', session.user.id)
        .eq('to_user_id', userId)
        .single()
      if (existing) { setAlready(true); return }

      // ziel-profil laden
      const { data: prof } = await supabase.from('profiles').select('*').eq('id', userId).single()
      setTargetUser(prof)
    })
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!user || stars === 0) return
    setLoading(true)

    const fromName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'jemand'

    await supabase.from('ratings').insert({
      activity_id: activityId,
      from_user_id: user.id,
      to_user_id: userId,
      stars,
      comment,
      from_user_name: fromName,
    })

    // avg rating neu berechnen
    const { data: allRatings } = await supabase
      .from('ratings')
      .select('stars')
      .eq('to_user_id', userId)

    if (allRatings) {
      const avg = allRatings.reduce((s: number, r: any) => s + r.stars, 0) / allRatings.length
      await supabase.from('profiles').update({
        avg_rating: Math.round(avg * 10) / 10,
        rating_count: allRatings.length,
      }).eq('id', userId)
    }

    router.push(`/activity/${activityId}`)
  }

  if (already) return (
    <>
      <Navbar user={user} />
      <div className="page-wrap" style={{ maxWidth: '500px', textAlign: 'center', paddingTop: '80px' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>✅</div>
        <h2 style={{ fontWeight: 800, marginBottom: '8px' }}>schon bewertet!</h2>
        <p style={{ color: 'var(--muted)', marginBottom: '24px' }}>du hast diese person bereits bewertet.</p>
        <button onClick={() => router.back()} className="btn-primary">zurück</button>
      </div>
    </>
  )

  return (
    <>
      <Navbar user={user} />
      <div className="page-wrap" style={{ maxWidth: '500px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 800, letterSpacing: '-1px', marginBottom: '8px' }}>
          bewertung ⭐
        </h1>
        <p style={{ color: 'var(--muted)', marginBottom: '32px' }}>
          wie war {targetUser?.name || 'diese person'} beim event?
        </p>

        <div className="card" style={{ padding: '32px' }}>
          {/* sterne auswahl */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ fontWeight: 600, fontSize: '14px', display: 'block', marginBottom: '12px' }}>
              deine bewertung *
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              {[1,2,3,4,5].map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStars(s)}
                  style={{
                    fontSize: '36px',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    filter: s <= stars ? 'none' : 'grayscale(1) opacity(0.3)',
                    transform: s <= stars ? 'scale(1.1)' : 'scale(1)',
                    transition: 'all 0.15s',
                  }}
                >
                  ⭐
                </button>
              ))}
            </div>
            {stars > 0 && (
              <p style={{ marginTop: '8px', fontSize: '13px', color: 'var(--sun)', fontWeight: 600 }}>
                {['', 'naja...', 'ging so', 'war okay', 'war gut!', 'krass geil! 🔥'][stars]}
              </p>
            )}
          </div>

          {/* kommentar */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ fontWeight: 600, fontSize: '14px', display: 'block', marginBottom: '8px' }}>
              kommentar (optional)
            </label>
            <textarea
              className="input"
              placeholder="z.b. super nett, kommt immer pünktlich..."
              value={comment}
              onChange={e => setComment(e.target.value)}
              rows={3}
              maxLength={300}
            />
          </div>

          <button
            onClick={handleSubmit}
            className="btn-primary"
            disabled={stars === 0 || loading}
            style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: '16px', opacity: stars === 0 ? 0.5 : 1 }}
          >
            {loading ? 'wird gespeichert...' : '⭐ bewertung abschicken'}
          </button>
        </div>
      </div>
    </>
  )
}
