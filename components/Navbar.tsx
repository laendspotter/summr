'use client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import { User } from '@supabase/supabase-js'

export default function Navbar({ user }: { user: User | null }) {
  const router = useRouter()

  async function handleSignOut() {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <nav>
      <div className="nav-inner">
        <Link href="/dashboard" className="logo">summr</Link>
        <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
          <Link href="/dashboard" style={{ color: 'var(--muted)', fontSize: '14px', fontWeight: 500, textDecoration: 'none', padding: '8px 12px' }}>
            entdecken
          </Link>
          <Link href="/create" style={{ color: 'var(--muted)', fontSize: '14px', fontWeight: 500, textDecoration: 'none', padding: '8px 12px' }}>
            + event
          </Link>
          <Link href="/my-activities" style={{ color: 'var(--muted)', fontSize: '14px', fontWeight: 500, textDecoration: 'none', padding: '8px 12px' }}>
            meine events
          </Link>
          <Link href="/profile" className="btn-secondary" style={{ padding: '8px 16px', fontSize: '14px' }}>
            profil
          </Link>
          <button onClick={handleSignOut} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--muted)', fontSize: '13px', padding: '8px'
          }}>
            logout
          </button>
        </div>
      </div>
    </nav>
  )
}
