'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { CATEGORIES } from '@/lib/supabase'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
import { User } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'

export default function CreateActivity() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    title: '',
    description: '',
    location: '',
    datetime: '',
    max_people: 5,
    category: 'sonstiges',
  })

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { router.push('/'); return }
      setUser(session.user)
      const { data } = await supabase.from('profiles').select('*').eq('id', session.user.id).single()
      setProfile(data)
    })
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!user) return
    setLoading(true)

    const displayName = profile?.name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'jemand'

    const { data: activity, error } = await supabase.from('activities').insert({
      ...form,
      creator_id: user.id,
      creator_name: displayName,
      creator_avatar: profile?.avatar_url || user.user_metadata?.avatar_url,
    }).select().single()

    if (!error && activity) {
      // creator automatisch als teilnehmer hinzufügen
      await supabase.from('participants').insert({
        activity_id: activity.id,
        user_id: user.id,
        user_name: displayName,
      })
      router.push(`/activity/${activity.id}`)
    } else {
      alert('fehler beim erstellen — bitte nochmal versuchen')
      setLoading(false)
    }
  }

  return (
    <>
      <Navbar user={user} />
      <div className="page-wrap" style={{ maxWidth: '600px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 800, letterSpacing: '-1px', marginBottom: '8px' }}>
          event erstellen 🎉
        </h1>
        <p style={{ color: 'var(--muted)', marginBottom: '32px' }}>
          was planst du diesen sommer?
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* kategorie */}
          <div>
            <label style={{ fontWeight: 600, fontSize: '14px', display: 'block', marginBottom: '10px' }}>
              kategorie *
            </label>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {CATEGORIES.map(c => (
                <button
                  type="button"
                  key={c.id}
                  onClick={() => setForm(f => ({ ...f, category: c.id }))}
                  className={`badge ${form.category === c.id ? 'badge-sun' : ''}`}
                  style={{
                    cursor: 'pointer',
                    border: form.category === c.id ? 'none' : '2px solid var(--border)',
                    background: form.category === c.id ? undefined : 'white',
                    padding: '10px 16px',
                    fontSize: '14px'
                  }}
                >
                  {c.emoji} {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* titel */}
          <div>
            <label style={{ fontWeight: 600, fontSize: '14px', display: 'block', marginBottom: '8px' }}>
              titel *
            </label>
            <input
              className="input"
              placeholder="z.b. beach volleyball am see"
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              required
              maxLength={80}
            />
          </div>

          {/* beschreibung */}
          <div>
            <label style={{ fontWeight: 600, fontSize: '14px', display: 'block', marginBottom: '8px' }}>
              beschreibung
            </label>
            <textarea
              className="input"
              placeholder="was ist geplant? was braucht man mitbringen? ..."
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              rows={3}
              style={{ resize: 'vertical' }}
            />
          </div>

          {/* wann */}
          <div>
            <label style={{ fontWeight: 600, fontSize: '14px', display: 'block', marginBottom: '8px' }}>
              wann? *
            </label>
            <input
              className="input"
              type="datetime-local"
              value={form.datetime}
              onChange={e => setForm(f => ({ ...f, datetime: e.target.value }))}
              required
              min={new Date().toISOString().slice(0, 16)}
            />
          </div>

          {/* wo */}
          <div>
            <label style={{ fontWeight: 600, fontSize: '14px', display: 'block', marginBottom: '8px' }}>
              wo? *
            </label>
            <input
              className="input"
              placeholder="z.b. strandbad bodensee, stadtpark stuttgart..."
              value={form.location}
              onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
              required
            />
          </div>

          {/* max personen */}
          <div>
            <label style={{ fontWeight: 600, fontSize: '14px', display: 'block', marginBottom: '8px' }}>
              max. teilnehmer: <strong style={{ color: 'var(--sun)' }}>{form.max_people}</strong>
            </label>
            <input
              type="range"
              min={2}
              max={50}
              value={form.max_people}
              onChange={e => setForm(f => ({ ...f, max_people: parseInt(e.target.value) }))}
              style={{ width: '100%', accentColor: 'var(--sun)' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>
              <span>2</span><span>50</span>
            </div>
          </div>

          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
            style={{ fontSize: '16px', padding: '14px', justifyContent: 'center' }}
          >
            {loading ? 'wird erstellt...' : '🌞 event erstellen'}
          </button>
        </form>
      </div>
    </>
  )
}
