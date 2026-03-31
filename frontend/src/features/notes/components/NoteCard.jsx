import React from 'react';
import Icon from '../../../shared/components/Icon';
import { C, NOTE_OMBRES } from '../../../shared/theme';

export default function NoteCard({ note, locked, onLock, onView, onDownload, onDelete, index }) {
  // Use a stable index based on the note's ID to ensure consistent coloring everywhere
  const getStableIndex = (id) => {
    if (!id) return index || 0;
    let hash = 0;
    const str = id.toString();
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return Math.abs(hash);
  };

  const stableIdx = getStableIndex(note._id || note.id);
  const ombreBg = NOTE_OMBRES[stableIdx % NOTE_OMBRES.length];

  // Determine if the note file is a viewable image
  const isImage = note.fileType && (
    note.fileType.includes('image') ||
    note.fileType.includes('png') ||
    note.fileType.includes('jpg') ||
    note.fileType.includes('jpeg') ||
    note.fileType.includes('webp')
  );

  return (
    <div className={`note-card fade-up fade-up-${Math.min(index + 2, 5)}`}
      style={{
        position: 'relative', borderRadius: '28px', border: '1px solid rgba(15, 23, 42, 0.08)',
        background: ombreBg,
        padding: '28px', boxShadow: '0 16px 48px rgba(15, 23, 42, 0.10)',
        display: 'flex', flexDirection: 'column', gap: 16,
        overflow: 'hidden',
        height: '100%'
      }}>

      {/* 1. PREVIEW SECTION (Top - Blurred when locked) */}
      <div style={{
        position: 'relative',
        height: '160px',
        borderRadius: '20px',
        overflow: 'hidden',
        background: 'rgba(255,255,255,0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: '1px solid rgba(0,0,0,0.03)',
      }}>
        {/* Preview Content (blurred when locked) */}
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          filter: locked ? 'blur(10px)' : 'none',
          opacity: locked ? 0.6 : 1,
          transition: 'all 0.4s ease'
        }}>
          {isImage && note.fileUrl ? (
            <img
              src={note.fileUrl}
              alt={note.title}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              onError={e => { e.target.style.display = 'none'; }}
            />
          ) : (
            <>
              <Icon name="doc" size={64} color="rgba(0,0,0,0.15)" strokeWidth={1} />
              <div style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(to bottom, transparent, rgba(255,255,255,0.2))'
              }} />
            </>
          )}
        </div>

        {/* Lock Icon Overlay (centered over preview only) */}
        {locked && (
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(255,255,255,0.1)'
          }}>
            <div style={{
              width: 52, height: 52, borderRadius: '50%', background: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
              transition: 'all 0.3s'
            }}>
              <Icon name="lock" size={24} color="#7c3aed" strokeWidth={2.5} />
            </div>
          </div>
        )}
      </div>

      {/* 2. CONTENT SECTION (Bottom — always clear, never blurred) */}
      <div style={{
        display: 'flex', flexDirection: 'column', gap: 16, height: '100%',
        zIndex: 1
      }}>
        {/* VISIBILITY & BADGE */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', minHeight: 24, gap: 8 }}>
          <span style={{
            fontSize: 10, fontWeight: 800, padding: '4px 12px', borderRadius: 99,
            background: 'rgba(255,255,255,0.9)', color: note.visibility === 'public' ? C.teal : '#64748b',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)', textTransform: 'uppercase', letterSpacing: '0.5px',
            display: 'flex', alignItems: 'center', gap: 4
          }}>
            {note.visibility === 'public' ? '🌍 Public' : '🔒 Private'}
          </span>
          {note.badge && (
            <span style={{
              fontSize: 9, fontWeight: 900, padding: '4px 14px', borderRadius: 99,
              background: '#fff', color: note.badge.includes('🔥') ? C.pink : C.teal,
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)', textTransform: 'uppercase', letterSpacing: '0.8px'
            }}>
              {note.badge}
            </span>
          )}
        </div>

        {/* TITLE + SUBJECT */}
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
          <div style={{ display: 'flex', gap: 6 }}>
            {locked ? (
              <button onClick={onLock} className="btn-press"
                style={{
                  fontSize: 11, fontWeight: 900, padding: '8px 18px', borderRadius: 99,
                  background: '#fff', color: '#0f172a', border: '1px solid rgba(0,0,0,0.06)', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 6, boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                }}>
                <span>🔒 Unlock</span>
              </button>
            ) : (
              <>
                {onDelete && (
                  <button onClick={(e) => { e.stopPropagation(); onDelete(note._id || note.id); }} className="btn-press"
                    style={{
                      fontSize: 11, fontWeight: 900, padding: '8px 14px', borderRadius: 99,
                      background: '#fee2e2', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: 6, boxShadow: '0 4px 12px rgba(239, 68, 68, 0.1)'
                    }}>
                    <span>Delete</span>
                  </button>
                )}
                <button onClick={() => onView(note)} className="btn-press"
                  style={{
                    fontSize: 11, fontWeight: 900, padding: '8px 18px', borderRadius: 99,
                    background: '#fff', color: '#0f172a', border: '1px solid rgba(0,0,0,0.06)', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: 6, boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                  }}>
                  <Icon name="eye" size={14} color="#0f172a" strokeWidth={2.2} />
                  <span>View</span>
                </button>
                <button onClick={() => onDownload(note)} className="btn-press"
                  style={{
                    fontSize: 11, fontWeight: 900, padding: '8px 18px', borderRadius: 99,
                    background: '#fff', color: C.teal, border: '1px solid rgba(0,0,0,0.06)', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: 6, boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                  }}>
                  <Icon name="download" size={14} color={C.teal} strokeWidth={2.2} />
                  <span>Get</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
