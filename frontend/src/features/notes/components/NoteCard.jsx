import React from 'react';
import Icon from '../../../shared/components/Icon';
import { C, NOTE_OMBRES } from '../../../shared/theme';

export default function NoteCard({ note, locked, onLock, onView, index, isExplorer = false }) {
  const ombreBg = NOTE_OMBRES[index % NOTE_OMBRES.length];

  return (
    <div className={`note-card fade-up fade-up-${Math.min(index + 2, 5)}`}
      style={{
        position: 'relative', borderRadius: '28px', border: '1px solid rgba(0,0,0,0.05)',
        background: ombreBg,
        padding: '28px', boxShadow: '0 12px 32px rgba(0,0,0,.04)',
        display: 'flex', flexDirection: 'column', gap: 16,
        overflow: 'hidden',
        height: '100%'
      }}>

      {/* 1. PREVIEW SECTION (Top) */}
      <div style={{
        position: 'relative',
        height: '160px',
        borderRadius: '20px',
        overflow: 'hidden',
        background: 'rgba(255,255,255,0.4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: '1px solid rgba(0,0,0,0.03)',
      }}>
        {/* Actual Preview Content (Blurred if locked) */}
        <div style={{
          position: 'absolute', inset: 0, 
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          filter: locked ? 'blur(10px)' : 'none',
          opacity: locked ? 0.6 : 1,
          transition: 'all 0.4s ease'
        }}>
            <Icon name="doc" size={64} color="rgba(0,0,0,0.15)" strokeWidth={1} />
            {/* Optional: Add a subtle gradient overlay */}
            <div style={{ 
                position: 'absolute', inset: 0, 
                background: 'linear-gradient(to bottom, transparent, rgba(255,255,255,0.2))' 
            }} />
        </div>

        {/* Lock Overlay (Centered over preview only) */}
        {locked && (
            <div style={{ 
                position: 'absolute', inset: 0, 
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                background: 'rgba(255,255,255,0.1)',
                backdropFilter: 'none' // We already blurred the background div
            }}>
                <div style={{ 
                    width: 52, height: 52, borderRadius: '50%', background: '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
                    transform: 'scale(1)', transition: 'all 0.3s'
                }}>
                    <Icon name="lock" size={24} color="#7c3aed" strokeWidth={2.5} />
                </div>
            </div>
        )}
      </div>

      {/* 2. CONTENT SECTION (Bottom - Always Clear) */}
      <div style={{
        display: 'flex', flexDirection: 'column', gap: 16, height: '100%',
        zIndex: 1
      }}>
        {/* BADGE ROW */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', minHeight: 24 }}>
          {note.badge ? (
            <span style={{
              fontSize: 9, fontWeight: 900, padding: '4px 14px', borderRadius: 99,
              background: '#fff', color: note.badge.includes('🔥') ? C.pink : C.teal,
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)', textTransform: 'uppercase', letterSpacing: '0.8px'
            }}>
              {note.badge}
            </span>
          ) : <span />}
        </div>

        {/* TITLE ROW */}
        <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{
              fontSize: 15, fontWeight: 900, color: '#0f172a', lineHeight: 1.4, marginBottom: 5,
              display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
              letterSpacing: '-0.3px'
            }}>
              {note.title}
            </p>
            <p style={{ fontSize: 12, fontWeight: 700, color: '#64748b' }}>{note.subject}</p>
          </div>
        </div>

        {/* TAGS */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {(note.tags || []).map(t => (
            <span key={t} style={{
              fontSize: 10, fontWeight: 800, padding: '4px 14px', borderRadius: 99,
              background: 'rgba(255,255,255,0.6)', color: '#4b5563',
              border: '1px solid rgba(0,0,0,0.05)', boxShadow: '0 1px 4px rgba(0,0,0,0.02)'
            }}>
              {t}
            </span>
          ))}
        </div>

        {/* FOOTER */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          paddingTop: 18, borderTop: '1px solid rgba(0,0,0,0.06)', marginTop: 'auto'
        }}>
          <span style={{ fontSize: 11, color: '#64748b', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Icon name="user" size={14} color="#94a3b8" strokeWidth={2.2} />
            {note.uploader || note.authorName || 'Student'}
          </span>
          <button onClick={locked ? onLock : () => onView(note)} className="btn-press"
            style={{
              fontSize: 11, fontWeight: 900, padding: '8px 18px', borderRadius: 99,
              background: '#fff', color: '#0f172a', border: '1px solid rgba(0,0,0,0.06)', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 6, boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
            }}>
            {locked ? <span>🔒 Unlock</span> : <><Icon name="eye" size={14} color="#0f172a" strokeWidth={2.2} /> View</>}
          </button>
        </div>
      </div>
    </div>
  );
}
