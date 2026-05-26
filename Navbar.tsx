'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { User } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import ActivityCard from '@/components/ActivityCard'
import Link from 'next/link'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<any>(null)
  const [myActivities, setMyActivities] = useState<any[]>([])
  const [ratings, setRatings] = useState<any[]>([])
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [name, setName] = useState('')
  const [bio, setBio] = useState('')
  const [radius, setRadius] = useState(20)

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { router.push('/'); return }
      setUser(session.user)

      let { data: prof } = await supabase.from('profiles').select('*').eq('id', session.user.id).single()
      if (!prof) {
        const defaultName = session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'jemand'
        const { data: newProf } = await supabase.from('profiles').insert({
          id: session.user.id, name: defaultName,
          avatar_url: session.user.user_metadata?.avatar_url,
          location_radius: 20, avg_rating: 0, rating_count: 0,
        }).select().single()
        prof = newProf
      }
      if (prof) { setProfile(prof); setName(prof.name || ''); setBio(prof.bio || ''); setRadius(prof.location_radius || 20) }

      const { data: acts } = await supabase.from('activities').select('*').eq('creator_id', session.user.id).order('datetime', { ascending: false })
      if (acts) setMyActivities(acts)

      const { data: rats } = await supabase.from('ratings').select('*').eq('to_user_id', session.user.id).order('created_at', { ascending: false })
      if (rats) setRatings(rats)
    })
  }, [])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!user) return
    setSaving(true)
    await supabase.from('profiles').upsert({ id: user.id, name, bio, location_radius: radius, avatar_url: user.user_metadata?.avatar_url })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const avgStars = profile?.avg_rating || 0

  return (
    <>
      <Navbar user={user} />
      <div className="page-wrap">
        <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '24px', alignItems: 'start' }}>
          {/* LEFT */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="card" style={{ padding: '24px' }}>
              {/* avatar + rating */}
              <div style={{ textAlign: 'center', marginBottom: '24px', paddingBottom: '24px', borderBottom: '1px solid var(--border)' }}>
                <div style={{
                  width: '72px', height: '72px', borderRadius: '50%',
                  background: user?.user_metadata?.avatar_url ? 'transparent' : 'var(--sun)',
                  backgroundImage: user?.user_metadata?.avatar_url ? `url(${user.user_metadata.avatar_url})` : undefined,
                  backgroundSize: 'cover', color: 'white',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '28px', fontWeight: 800, margin: '0 auto 12px',
                }}>
                  {!user?.user_metadata?.avatar_url && (name[0]?.toUpperCase() || '?')}
                </div>
                <div style={{ fontWeight: 700, fontSize: '17px', marginBottom: '6px' }}>{name || 'jemand'}</div>
                {profile?.rating_count > 0 ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
                    <div style={{ display: 'flex', gap: '1px' }}>
                      {[1,2,3,4,5].map(s => (
                        <span key={s} style={{ fontSize: '14px', filter: s <= Math.round(avgStars) ? 'none' : 'grayscale(1) opacity(0.2)' }}>⭐</span>
                      ))}
                    </div>
                    <span style={{ fontWeight: 700, fontSize: '15px' }}>{avgStars.toFixed(1)}</span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>({profile.rating_count})</span>
                  </div>
                ) : (
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>noch keine bewertungen</span>
                )}
              </div>

              <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {[
                  { label: 'name', key: 'name', val: name, set: setName, placeholder: 'dein name', type: 'input' },
                  { label: 'bio', key: 'bio', val: bio, set: setBio, placeholder: 'kurze beschreibung...', type: 'textarea' },
                ].map(f => (
                  <div key={f.key}>
                    <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.3px' }}>{f.label}</label>
                    {f.type === 'textarea' ? (
                      <textarea className="input" value={f.val} onChange={e => f.set(e.target.value)} placeholder={f.placeholder} rows={2} style={{ resize: 'none' }} />
                    ) : (
                      <input className="input" value={f.val} onChange={e => f.set(e.target.value)} placeholder={f.placeholder} />
                    )}
                  </div>
                ))}
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.3px' }}>
                    suchradius — <span style={{ color: 'var(--sun)', textTransform: 'none' }}>{radius} km</span>
                  </label>
                  <input type="range" min={5} max={100} value={radius} onChange={e => setRadius(parseInt(e.target.value))} style={{ width: '100%' }} />
                </div>
                <button type="submit" className="btn-primary" disabled={saving} style={{ justifyContent: 'center' }}>
                  {saved ? '✓ gespeichert' : saving ? 'speichert...' : 'speichern'}
                </button>
              </form>
            </div>

            {/* bewertungen */}
            {ratings.length > 0 && (
              <div className="card" style={{ padding: '20px' }}>
                <h3 style={{ fontWeight: 700, marginBottom: '14px', fontSize: '15px' }}>bewertungen ({ratings.length})</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {ratings.slice(0, 5).map((r: any, i) => (
                    <div key={i} style={{ paddingBottom: '12px', borderBottom: i < Math.min(ratings.length, 5) - 1 ? '1px solid var(--border)' : 'none' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                        {[1,2,3,4,5].map(s => <span key={s} style={{ fontSize: '11px', filter: s <= r.stars ? 'none' : 'grayscale(1) opacity(0.2)' }}>⭐</span>)}
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginLeft: '4px' }}>von {r.from_user_name}</span>
                      </div>
                      {r.comment && <p style={{ fontSize: '13px', color: 'var(--text-sub)', lineHeight: 1.5 }}>{r.comment}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '22px', fontWeight: 800, letterSpacing: '-0.5px' }}>
                meine events ({myActivities.length})
              </h2>
              <Link href="/create" className="btn-primary" style={{ fontSize: '13px', padding: '8px 14px' }}>+ erstellen</Link>
            </div>
            {myActivities.length === 0 ? (
              <div className="card" style={{ padding: '48px', textAlign: 'center' }}>
                <div style={{ fontSize: '36px', marginBottom: '12px' }}>🌞</div>
                <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>noch keine events erstellt</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '14px' }}>
                {myActivities.map((a: any) => <ActivityCard key={a.id} activity={a} />)}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
