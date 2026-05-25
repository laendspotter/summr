'use client'
import Link from 'next/link'
import { signInWithGoogle, signInWithApple, signInAsGuest } from '@/lib/auth'
import { useState } from 'react'

export default function Landing() {
  const [loading, setLoading] = useState<string | null>(null)

  async function handleAuth(type: 'google' | 'apple' | 'guest') {
    setLoading(type)
    try {
      if (type === 'google') await signInWithGoogle()
      if (type === 'apple') await signInWithApple()
      if (type === 'guest') {
        await signInAsGuest()
        window.location.href = '/dashboard'
      }
    } catch (e) {
      console.error(e)
      setLoading(null)
    }
  }

  const features = [
    { emoji: '📍', title: 'aktivitäten in deiner nähe', desc: 'finde events im einstellbaren umkreis — spontan oder geplant.' },
    { emoji: '💬', title: 'gruppenchat inklusive', desc: 'jedes event hat einen chat, der nach dem event automatisch gelöscht wird.' },
    { emoji: '⭐', title: 'bewertungen nach dem event', desc: 'alle bewerten alle — transparenz und vertrauen in der community.' },
    { emoji: '🌞', title: 'kein sommer alleine', desc: 'ob sport, musik, essen oder gaming — hier ist für jeden was dabei.' },
  ]

  return (
    <main>
      {/* NAV */}
      <nav>
        <div className="nav-inner">
          <span className="logo">summr</span>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button className="btn-secondary" onClick={() => handleAuth('google')} style={{ padding: '8px 18px', fontSize: '14px' }}>
              anmelden
            </button>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section style={{
        background: 'linear-gradient(135deg, #fff7ed 0%, #e0f2fe 100%)',
        padding: '80px 24px 100px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* deko kreise */}
        <div style={{
          position: 'absolute', top: '-60px', right: '-60px',
          width: '300px', height: '300px',
          background: 'radial-gradient(circle, rgba(255,107,53,0.15) 0%, transparent 70%)',
          borderRadius: '50%', pointerEvents: 'none'
        }} />
        <div style={{
          position: 'absolute', bottom: '-80px', left: '-80px',
          width: '400px', height: '400px',
          background: 'radial-gradient(circle, rgba(14,165,233,0.1) 0%, transparent 70%)',
          borderRadius: '50%', pointerEvents: 'none'
        }} />

        <div style={{ maxWidth: '680px', margin: '0 auto', position: 'relative' }}>
          <div className="badge badge-sun fade-up" style={{ marginBottom: '24px', fontSize: '13px' }}>
            🌞 sommer 2025
          </div>
          <h1 className="fade-up" style={{
            fontSize: 'clamp(44px, 8vw, 80px)',
            fontWeight: 800,
            lineHeight: 1.05,
            letterSpacing: '-2px',
            marginBottom: '24px',
            animationDelay: '0.1s',
          }}>
            kein sommer<br />
            <span style={{ color: 'var(--sun)' }}>alleine.</span>
          </h1>
          <p className="fade-up" style={{
            fontSize: '18px',
            color: 'var(--muted)',
            lineHeight: 1.7,
            marginBottom: '40px',
            animationDelay: '0.2s',
            fontWeight: 300,
          }}>
            finde aktivitäten in deiner nähe, triff neue leute<br />und mach diesen sommer unvergesslich.
          </p>

          {/* auth buttons */}
          <div className="fade-up" style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap', animationDelay: '0.3s' }}>
            <button className="btn-primary" onClick={() => handleAuth('google')} disabled={!!loading} style={{ fontSize: '16px', padding: '14px 28px' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="white"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="white" opacity="0.8"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="white" opacity="0.6"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="white" opacity="0.9"/>
              </svg>
              {loading === 'google' ? 'lädt...' : 'mit google anmelden'}
            </button>
            <button className="btn-secondary" onClick={() => handleAuth('apple')} disabled={!!loading} style={{ fontSize: '16px', padding: '14px 28px' }}>
              {loading === 'apple' ? 'lädt...' : '🍎 mit apple'}
            </button>
            <button className="btn-secondary" onClick={() => handleAuth('guest')} disabled={!!loading} style={{ fontSize: '16px', padding: '14px 28px', opacity: 0.7 }}>
              {loading === 'guest' ? 'lädt...' : 'als gast weiter'}
            </button>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section style={{ padding: '80px 24px', maxWidth: '1100px', margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', fontSize: '36px', fontWeight: 800, marginBottom: '48px', letterSpacing: '-1px' }}>
          wie funktioniert summr?
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
          {features.map((f, i) => (
            <div key={i} className="card fade-up" style={{ padding: '28px', animationDelay: `${i * 0.1}s` }}>
              <div style={{ fontSize: '36px', marginBottom: '16px' }}>{f.emoji}</div>
              <h3 style={{ fontSize: '17px', fontWeight: 700, marginBottom: '8px' }}>{f.title}</h3>
              <p style={{ color: 'var(--muted)', fontSize: '14px', lineHeight: 1.6 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{
        background: 'var(--dark)',
        padding: '80px 24px',
        textAlign: 'center',
        margin: '0',
      }}>
        <h2 style={{ color: 'white', fontSize: '40px', fontWeight: 800, marginBottom: '16px', letterSpacing: '-1px' }}>
          bereit für den besten sommer?
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '32px', fontSize: '16px' }}>
          kostenlos, keine app nötig, sofort loslegen.
        </p>
        <button className="btn-primary" onClick={() => handleAuth('google')} style={{ fontSize: '16px', padding: '16px 32px' }}>
          jetzt starten 🌞
        </button>
      </section>

      {/* FOOTER */}
      <footer style={{ background: '#0a0f1a', padding: '24px', textAlign: 'center' }}>
        <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '13px' }}>summr © 2025 — kein sommer alleine</span>
      </footer>
    </main>
  )
}
