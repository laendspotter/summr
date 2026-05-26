'use client'
import { useEffect, useState, useRef } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Activity, Message, CATEGORIES } from '@/lib/supabase'
import { User } from '@supabase/supabase-js'
import { useRouter, useParams } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'
import Link from 'next/link'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function ActivityDetail() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const [user, setUser] = useState<User | null>(null)
  const [activity, setActivity] = useState<Activity | null>(null)
  const [participants, setParticipants] = useState<any[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [joined, setJoined] = useState(false)
  const [newMsg, setNewMsg] = useState('')
  const [loading, setLoading] = useState(true)
  const [joining, setJoining] = useState(false)
  const [profile, setProfile] = useState<any>(null)
  const chatRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { router.push('/'); return }
      setUser(session.user)
      const { data: prof } = await supabase.from('profiles').select('*').eq('id', session.user.id).single()
      setProfile(prof)
      await loadActivity(session.user.id)
    })
  }, [id])

  async function loadActivity(userId: string) {
    const { data: act } = await supabase.from('activities').select('*').eq('id', id).single()
    const { data: parts } = await supabase.from('participants').select('*').eq('activity_id', id)
    const { data: msgs } = await supabase.from('messages').select('*').eq('activity_id', id).order('created_at')
    if (act) setActivity({ ...act, participant_count: parts?.length || 0 })
    if (parts) { setParticipants(parts); setJoined(parts.some((p: any) => p.user_id === userId)) }
    if (msgs) setMessages(msgs)
    setLoading(false)
    setTimeout(() => chatRef.current?.scrollTo({ top: 99999 }), 100)
  }

  useEffect(() => {
    if (!id) return
    const channel = supabase.channel(`chat-${id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `activity_id=eq.${id}` },
        (payload) => {
          setMessages(m => [...m, payload.new as Message])
          setTimeout(() => chatRef.current?.scrollTo({ top: 99999, behavior: 'smooth' }), 100)
        })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [id])

  async function handleJoin() {
    if (!user || !activity) return
    setJoining(true)
    const displayName = profile?.name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'jemand'
    const { error } = await supabase.from('participants').insert({ activity_id: id, user_id: user.id, user_name: displayName })
    if (!error) { setJoined(true); setParticipants(p => [...p, { user_id: user.id, user_name: displayName }]) }
    setJoining(false)
  }

  async function handleLeave() {
    if (!user) return
    await supabase.from('participants').delete().eq('activity_id', id).eq('user_id', user.id)
    setJoined(false)
    setParticipants(p => p.filter(x => x.user_id !== user.id))
  }

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault()
    if (!newMsg.trim() || !user || !joined) return
    const displayName = profile?.name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'jemand'
    await supabase.from('messages').insert({ activity_id: id, user_id: user.id, user_name: displayName, content: newMsg.trim() })
    setNewMsg('')
  }

  if (loading) return (
    <>
      <Navbar user={user} />
      <div className="page-wrap" style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '20px' }}>
        <div className="loading-shimmer" style={{ height: '400px' }} />
        <div className="loading-shimmer" style={{ height: '400px' }} />
      </div>
    </>
  )

  if (!activity) return (
    <>
      <Navbar user={user} />
      <div className="page-wrap" style={{ textAlign: 'center', padding: '80px' }}>
        <h2 style={{ marginBottom: '16px' }}>aktivität nicht gefunden</h2>
        <Link href="/dashboard" className="btn-primary">zurück</Link>
      </div>
    </>
  )

  const cat = CATEGORIES.find(c => c.id === activity.category)
  const date = new Date(activity.datetime)
  const isPast = date < new Date()
  const isFull = participants.length >= activity.max_people
  const isCreator = user?.id === activity.creator_id
  const pct = Math.round((participants.length / activity.max_people) * 100)

  return (
    <>
      <Navbar user={user} />
      <div className="page-wrap">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '20px', alignItems: 'start' }}>
          {/* LEFT */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* main card */}
            <div className="card">
              <div style={{
                padding: '28px',
                background: 'linear-gradient(135deg, rgba(255,107,53,0.14) 0%, rgba(255,107,53,0.03) 100%)',
                borderBottom: '1px solid var(--border)',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <span style={{ fontSize: '44px' }}>{cat?.emoji}</span>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                    <span className="badge badge-sun">{cat?.label}</span>
                    {isPast && <span className="badge badge-muted">vorbei</span>}
                    {isFull && !isPast && <span className="badge badge-muted">voll</span>}
                  </div>
                </div>
                <h1 style={{ fontSize: '26px', fontWeight: 800, letterSpacing: '-0.5px', marginBottom: '12px' }}>
                  {activity.title}
                </h1>
                {activity.description && (
                  <p style={{ color: 'var(--text-muted)', lineHeight: 1.65, fontSize: '14px' }}>{activity.description}</p>
                )}
              </div>

              <div style={{ padding: '20px 28px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
                  {[
                    { icon: '📅', text: format(date, "EEEE, d. MMMM yyyy 'um' HH:mm 'Uhr'", { locale: de }) },
                    { icon: '📍', text: activity.location },
                  ].map((item, i) => (
                    <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'center', fontSize: '14px' }}>
                      <span>{item.icon}</span>
                      <span style={{ color: 'var(--text-sub)' }}>{item.text}</span>
                    </div>
                  ))}
                </div>

                {/* kapazität bar */}
                <div style={{ marginBottom: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>
                    <span>{participants.length} dabei</span>
                    <span>max {activity.max_people}</span>
                  </div>
                  <div style={{ height: '4px', background: 'var(--bg-hover)', borderRadius: '2px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${Math.min(pct, 100)}%`, background: isFull ? '#EF4444' : 'var(--sun)', borderRadius: '2px', transition: 'width 0.5s' }} />
                  </div>
                </div>

                {/* buttons */}
                {!isPast && !isCreator && (
                  joined ? (
                    <button onClick={handleLeave} className="btn-secondary" style={{ color: '#EF4444', borderColor: 'rgba(239,68,68,0.3)' }}>
                      verlassen
                    </button>
                  ) : (
                    <button onClick={handleJoin} className="btn-primary" disabled={isFull || joining} style={{ opacity: isFull ? 0.5 : 1 }}>
                      {joining ? 'trete bei...' : isFull ? 'voll' : '🌞 dabei sein'}
                    </button>
                  )
                )}
                {isCreator && <span className="badge badge-sun">dein event</span>}
              </div>
            </div>

            {/* teilnehmer */}
            <div className="card" style={{ padding: '20px' }}>
              <h3 style={{ fontWeight: 700, marginBottom: '16px', fontSize: '15px' }}>
                teilnehmer ({participants.length})
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {participants.map((p: any, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0,
                      background: p.user_id === activity.creator_id ? 'var(--sun)' : 'var(--bg-hover)',
                      border: p.user_id === activity.creator_id ? 'none' : '1px solid var(--border)',
                      color: p.user_id === activity.creator_id ? 'white' : 'var(--text-sub)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700,
                    }}>
                      {p.user_name?.[0]?.toUpperCase() || '?'}
                    </div>
                    <span style={{ fontSize: '14px', flex: 1 }}>{p.user_name}</span>
                    {p.user_id === activity.creator_id && (
                      <span className="badge badge-sun" style={{ fontSize: '10px' }}>host</span>
                    )}
                    {isPast && user && p.user_id !== user.id && joined && (
                      <Link href={`/rate/${id}/${p.user_id}`} style={{
                        fontSize: '12px', color: 'var(--sun)', fontWeight: 600, textDecoration: 'none',
                        padding: '4px 10px', border: '1px solid rgba(255,107,53,0.3)', borderRadius: '6px',
                      }}>
                        bewerten ⭐
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT — CHAT */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '580px', position: 'sticky', top: '76px' }}>
            <div style={{ padding: '16px 18px', borderBottom: '1px solid var(--border)' }}>
              <div style={{ fontWeight: 700, fontSize: '15px', marginBottom: '2px' }}>💬 gruppenchat</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>wird nach dem event gelöscht</div>
            </div>

            <div ref={chatRef} style={{ flex: 1, overflowY: 'auto', padding: '14px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {!joined ? (
                <div style={{ textAlign: 'center', color: 'var(--text-muted)', margin: 'auto', fontSize: '13px', lineHeight: 1.6 }}>
                  tritt dem event bei<br />um am chat teilzunehmen
                </div>
              ) : messages.length === 0 ? (
                <div style={{ textAlign: 'center', color: 'var(--text-muted)', margin: 'auto', fontSize: '13px' }}>
                  noch keine nachrichten 👋
                </div>
              ) : (
                messages.map((m, i) => {
                  const isMe = m.user_id === user?.id
                  return (
                    <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start' }}>
                      {!isMe && (
                        <span style={{ fontSize: '10px', color: 'var(--text-muted)', marginBottom: '2px', paddingLeft: '4px' }}>
                          {m.user_name}
                        </span>
                      )}
                      <div className={`chat-bubble ${isMe ? 'me' : 'other'}`}>{m.content}</div>
                    </div>
                  )
                })
              )}
            </div>

            {joined && (
              <form onSubmit={sendMessage} style={{ padding: '12px 14px', borderTop: '1px solid var(--border)', display: 'flex', gap: '8px' }}>
                <input
                  className="input"
                  placeholder="nachricht..."
                  value={newMsg}
                  onChange={e => setNewMsg(e.target.value)}
                  style={{ flex: 1, padding: '9px 12px', fontSize: '13px' }}
                />
                <button type="submit" className="btn-primary" style={{ padding: '9px 14px', flexShrink: 0 }}>↑</button>
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
