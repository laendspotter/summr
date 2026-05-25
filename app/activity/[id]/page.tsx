'use client'
import { useEffect, useState, useRef } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Activity, Message, CATEGORIES } from '@/lib/supabase'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
import { User } from '@supabase/supabase-js'
import { useRouter, useParams } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'
import Link from 'next/link'

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
    if (parts) {
      setParticipants(parts)
      setJoined(parts.some((p: any) => p.user_id === userId))
    }
    if (msgs) setMessages(msgs)
    setLoading(false)
  }

  // realtime chat
  useEffect(() => {
    if (!id) return
    const channel = supabase.channel(`chat-${id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `activity_id=eq.${id}`
      }, (payload) => {
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
    await supabase.from('participants').insert({
      activity_id: id, user_id: user.id, user_name: displayName
    })
    setJoined(true)
    setParticipants(p => [...p, { user_id: user.id, user_name: displayName }])
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
    await supabase.from('messages').insert({
      activity_id: id,
      user_id: user.id,
      user_name: displayName,
      content: newMsg.trim(),
    })
    setNewMsg('')
  }

  if (loading) return (
    <>
      <Navbar user={user} />
      <div className="page-wrap">
        <div className="loading-shimmer" style={{ height: '300px', marginBottom: '20px' }} />
        <div className="loading-shimmer" style={{ height: '200px' }} />
      </div>
    </>
  )

  if (!activity) return (
    <>
      <Navbar user={user} />
      <div className="page-wrap" style={{ textAlign: 'center', padding: '80px 24px' }}>
        <h2>aktivität nicht gefunden</h2>
        <Link href="/dashboard" className="btn-primary" style={{ marginTop: '16px' }}>zurück</Link>
      </div>
    </>
  )

  const cat = CATEGORIES.find(c => c.id === activity.category)
  const date = new Date(activity.datetime)
  const isPast = date < new Date()
  const isFull = participants.length >= activity.max_people
  const isCreator = user?.id === activity.creator_id

  return (
    <>
      <Navbar user={user} />
      <div className="page-wrap">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '24px', alignItems: 'start' }}>
          {/* LEFT */}
          <div>
            {/* activity card */}
            <div className="card" style={{ marginBottom: '24px' }}>
              <div style={{
                background: 'linear-gradient(135deg, #FF6B35 0%, #FF9A6C 100%)',
                padding: '32px',
              }}>
                <span style={{ fontSize: '48px' }}>{cat?.emoji}</span>
                <div className="badge" style={{ marginTop: '12px', background: 'rgba(255,255,255,0.2)', color: 'white' }}>
                  {cat?.label}
                </div>
              </div>
              <div style={{ padding: '24px' }}>
                <h1 style={{ fontSize: '28px', fontWeight: 800, letterSpacing: '-0.5px', marginBottom: '16px' }}>
                  {activity.title}
                </h1>
                {activity.description && (
                  <p style={{ color: 'var(--muted)', lineHeight: 1.7, marginBottom: '20px' }}>
                    {activity.description}
                  </p>
                )}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <span>📅</span>
                    <span style={{ fontWeight: 500 }}>{format(date, "EEEE, d. MMMM yyyy 'um' HH:mm 'Uhr'", { locale: de })}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <span>📍</span>
                    <span>{activity.location}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <span>👥</span>
                    <span><strong>{participants.length}</strong> / {activity.max_people} personen dabei</span>
                    {isFull && <span className="badge" style={{ background: '#FEE2E2', color: '#DC2626' }}>voll</span>}
                  </div>
                </div>

                {/* join/leave buttons */}
                <div style={{ marginTop: '24px', display: 'flex', gap: '12px' }}>
                  {!isPast && !isCreator && (
                    joined ? (
                      <button onClick={handleLeave} className="btn-secondary" style={{ color: '#DC2626', borderColor: '#FCA5A5' }}>
                        verlassen
                      </button>
                    ) : (
                      <button
                        onClick={handleJoin}
                        className="btn-primary"
                        disabled={isFull || joining}
                        style={{ opacity: isFull ? 0.5 : 1 }}
                      >
                        {joining ? 'trete bei...' : isFull ? 'voll' : '🌞 dabei sein'}
                      </button>
                    )
                  )}
                  {isPast && (
                    <span className="badge badge-sky">event vorbei</span>
                  )}
                </div>
              </div>
            </div>

            {/* teilnehmer */}
            <div className="card" style={{ padding: '24px' }}>
              <h3 style={{ fontWeight: 700, marginBottom: '16px' }}>teilnehmer ({participants.length})</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {participants.map((p: any, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '36px', height: '36px', borderRadius: '50%',
                      background: p.user_id === activity.creator_id ? 'var(--sun)' : 'var(--sky)',
                      color: 'white', display: 'flex', alignItems: 'center',
                      justifyContent: 'center', fontSize: '14px', fontWeight: 700
                    }}>
                      {p.user_name?.[0]?.toUpperCase() || '?'}
                    </div>
                    <div>
                      <span style={{ fontWeight: 500 }}>{p.user_name}</span>
                      {p.user_id === activity.creator_id && (
                        <span className="badge badge-sun" style={{ marginLeft: '8px', fontSize: '11px' }}>host</span>
                      )}
                    </div>
                    {isPast && user && p.user_id !== user.id && (
                      <Link
                        href={`/rate/${id}/${p.user_id}`}
                        style={{ marginLeft: 'auto', fontSize: '13px', color: 'var(--sun)', fontWeight: 600, textDecoration: 'none' }}
                      >
                        bewerten ⭐
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT — CHAT */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '600px', position: 'sticky', top: '80px' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
              <h3 style={{ fontWeight: 700 }}>💬 gruppenchat</h3>
              <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '2px' }}>
                wird nach dem event gelöscht
              </p>
            </div>

            {/* messages */}
            <div ref={chatRef} style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {!joined ? (
                <div style={{ textAlign: 'center', color: 'var(--muted)', margin: 'auto', fontSize: '14px' }}>
                  tritt dem event bei um am chat teilzunehmen
                </div>
              ) : messages.length === 0 ? (
                <div style={{ textAlign: 'center', color: 'var(--muted)', margin: 'auto', fontSize: '14px' }}>
                  noch keine nachrichten 👋
                </div>
              ) : (
                messages.map((m, i) => {
                  const isMe = m.user_id === user?.id
                  return (
                    <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start' }}>
                      {!isMe && (
                        <span style={{ fontSize: '11px', color: 'var(--muted)', marginBottom: '2px', paddingLeft: '4px' }}>
                          {m.user_name}
                        </span>
                      )}
                      <div className={`chat-bubble ${isMe ? 'me' : 'other'}`}>
                        {m.content}
                      </div>
                    </div>
                  )
                })
              )}
            </div>

            {/* input */}
            {joined && (
              <form onSubmit={sendMessage} style={{ padding: '12px 16px', borderTop: '1px solid var(--border)', display: 'flex', gap: '8px' }}>
                <input
                  className="input"
                  placeholder="nachricht..."
                  value={newMsg}
                  onChange={e => setNewMsg(e.target.value)}
                  style={{ flex: 1, padding: '10px 14px', fontSize: '14px' }}
                />
                <button type="submit" className="btn-primary" style={{ padding: '10px 16px' }}>
                  ↑
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
