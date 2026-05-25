'use client'
import Link from 'next/link'
import { Activity, CATEGORIES } from '@/lib/supabase'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'

export default function ActivityCard({ activity, joined }: { activity: Activity, joined?: boolean }) {
  const cat = CATEGORIES.find(c => c.id === activity.category)
  const date = new Date(activity.datetime)
  const isFull = (activity.participant_count || 0) >= activity.max_people

  return (
    <Link href={`/activity/${activity.id}`} style={{ textDecoration: 'none', display: 'block' }}>
      <div className="card" style={{ padding: '0' }}>
        {/* header stripe */}
        <div style={{
          background: isFull ? '#F1F5F9' : 'linear-gradient(135deg, #FF6B35 0%, #FF9A6C 100%)',
          padding: '20px 20px 16px',
          position: 'relative',
        }}>
          <span style={{ fontSize: '32px' }}>{cat?.emoji || '✨'}</span>
          {joined && (
            <span className="badge badge-grass" style={{ position: 'absolute', top: '16px', right: '16px' }}>
              ✓ dabei
            </span>
          )}
          {isFull && (
            <span className="badge" style={{ position: 'absolute', top: '16px', right: '16px', background: '#F1F5F9', color: 'var(--muted)' }}>
              voll
            </span>
          )}
        </div>

        {/* content */}
        <div style={{ padding: '16px 20px 20px' }}>
          <div className="badge badge-sun" style={{ marginBottom: '10px' }}>
            {cat?.label || 'sonstiges'}
          </div>
          <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px', lineHeight: 1.3 }}>
            {activity.title}
          </h3>
          {activity.description && (
            <p style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '12px', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
              {activity.description}
            </p>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--muted)' }}>
              <span>📅</span>
              <span>{format(date, "EEEE, d. MMMM 'um' HH:mm 'Uhr'", { locale: de })}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--muted)' }}>
              <span>📍</span>
              <span>{activity.location}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--muted)' }}>
              <span>👥</span>
              <span>{activity.participant_count || 0} / {activity.max_people} personen</span>
            </div>
          </div>

          <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '28px', height: '28px', borderRadius: '50%',
              background: 'var(--sun)', color: 'white',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '12px', fontWeight: 700
            }}>
              {activity.creator_name?.[0]?.toUpperCase() || '?'}
            </div>
            <span style={{ fontSize: '13px', color: 'var(--muted)' }}>
              von <strong style={{ color: 'var(--dark)' }}>{activity.creator_name}</strong>
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}
