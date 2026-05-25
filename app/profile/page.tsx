'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
import { User } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import ActivityCard from '@/components/ActivityCard'

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<any>(null)
  const [myActivities, setMyActivities] = useState<any[]>([])
  const [ratings, setRatings] = useState<any[]>([])
  const [saving, setSaving] = useState(false)
  const [name, setName] = useState('')
  const [bio, setBio] = useState('')
  const [radius, setRadius] = useState(20)

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { router.push('/'); return }
      setUser(session.user)

      // profil laden oder erstellen
      let { data: prof } = await supabase.from('profiles').select('*').eq('id', session.user.id).single()
      if (!prof) {
        const defaultName = session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'jemand'
        const { data: newProf } = await supabase.from('profiles').insert({
          id: session.user.id,
          name: defaultName,
          avatar_url: session.user.user_metadata?.avatar_url,
          location_radius: 20,
          avg_rating: 0,
          rating_count: 0,
        }).select().single()
        prof = newProf
      }
      if (prof) {
        setProfile(prof)
        setName(prof.name || '')
        setBio(prof.bio || '')
        setRadius(prof.location_radius || 20)
      }

      // eigene events
      const { data: acts } = await supabase
        .from('activities')
        .select('*')
        .eq('creator_id', session.user.id)
        .order('datetime', { ascending: false })
      if (acts) setMyActivities(acts)

      // bewertungen die ich bekommen habe
      const { data: rats } = await supabase
        .from('ratings')
        .select('*')
        .eq('to_user_id', session.user.id)
        .order('created_at', { ascending: false })
      if (rats) setRatings(rats)
    })
  }, [])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!user) return
    setSaving(true)
    await supabase.from('profiles').upsert({
      id: user.id,
      name,
      bio,
      location_radius: radius,
      avatar_url: user.user_metadata?.avatar_url,
    })
    setSaving(false)
  }

  const avgStars = profile?.avg_rating || 0

  return (
    <>
      <Navbar user={user} />
      <div className="page-wrap">
        <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '24px', alignItems: 'start' }}>
          {/* LEFT — profil edit */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="card" style={{ padding: '24px' }}>
              {/* avatar */}
              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <div style={{
                  width: '80px', height: '80px', borderRadius: '50%',
                  background: 'var(--sun)', color: 'white',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '32px', fontWeight: 800, margin: '0 auto 12px',
                  backgroundImage: user?.user_metadata?.avatar_url ? `url(${user.user_metadata.avatar_url})` : undefined,
                  backgroundSize: 'cover',
                }}>
                  {!user?.user_metadata?.avatar_url && (name[0]?.toUpperCase() || '?')}
                </div>
                {/* rating */}
                {profile?.rating_count > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                    <div style={{ display: 'flex', gap: '2px' }}>
                      {[1,2,3,4,5].map(s => (
                        <span key={s} style={{ fontSize: '16px', filter: s <= Math.round(avgStars) ? 'none' : 'grayscale(1) opacity(0.3)' }}>⭐</span>
                      ))}
                    </div>
                    <span style={{ fontWeight: 700, fontSize: '16px' }}>{avgStars.toFixed(1)}</span>
                    <span style={{ color: 'var(--muted)', fontSize: '13px' }}>({profile.rating_count})</span>
                  </div>
                )}
              </div>

              <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ fontWeight: 600, fontSize: '13px', display: 'block', marginBottom: '6px' }}>name</label>
                  <input className="input" value={name} onChange={e => setName(e.target.value)} placeholder="dein name" />
                </div>
                <div>
                  <label style={{ fontWeight: 600, fontSize: '13px', display: 'block', marginBottom: '6px' }}>bio</label>
                  <textarea className="input" value={bio} onChange={e => setBio(e.target.value)} placeholder="kurze beschreibung von dir..." rows={3} />
                </div>
                <div>
                  <label style={{ fontWeight: 600, fontSize: '13px', display: 'block', marginBottom: '6px' }}>
                    suchradius: <strong style={{ color: 'var(--sun)' }}>{radius} km</strong>
                  </label>
                  <input type="range" min={5} max={100} value={radius} onChange={e => setRadius(parseInt(e.target.value))} style={{ width: '100%', accentColor: 'var(--sun)' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--muted)', marginTop: '2px' }}>
                    <span>5 km</span><span>100 km</span>
                  </div>
                </div>
                <button type="submit" className="btn-primary" disabled={saving} style={{ justifyContent: 'center' }}>
                  {saving ? 'gespeichert ✓' : 'speichern'}
                </button>
              </form>
            </div>

            {/* bewertungen */}
            {ratings.length > 0 && (
              <div className="card" style={{ padding: '24px' }}>
                <h3 style={{ fontWeight: 700, marginBottom: '16px' }}>bewertungen ({ratings.length})</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {ratings.slice(0, 5).map((r: any, i) => (
                    <div key={i} style={{ paddingBottom: '12px', borderBottom: i < ratings.length - 1 ? '1px solid var(--border)' : 'none' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                        {[1,2,3,4,5].map(s => (
                          <span key={s} style={{ fontSize: '12px', filter: s <= r.stars ? 'none' : 'grayscale(1) opacity(0.3)' }}>⭐</span>
                        ))}
                        <span style={{ fontSize: '12px', color: 'var(--muted)', marginLeft: '4px' }}>von {r.from_user_name}</span>
                      </div>
                      {r.comment && <p style={{ fontSize: '13px', color: 'var(--dark)', lineHeight: 1.5 }}>{r.comment}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT — meine events */}
          <div>
            <h2 style={{ fontSize: '24px', fontWeight: 800, letterSpacing: '-0.5px', marginBottom: '20px' }}>
              meine events ({myActivities.length})
            </h2>
            {myActivities.length === 0 ? (
              <div className="card" style={{ padding: '48px', textAlign: 'center' }}>
                <div style={{ fontSize: '40px', marginBottom: '12px' }}>🌞</div>
                <p style={{ color: 'var(--muted)' }}>noch keine events erstellt</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
                {myActivities.map((a: any) => (
                  <ActivityCard key={a.id} activity={a} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
