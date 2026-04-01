import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Landing.css';
import api from '../../services/api';
import logo from '../../assets/generated-image.png';

/* ═══════════════════════════════════════════════
   DESIGN TOKENS
═══════════════════════════════════════════════ */
const C = {
  green: '#1dc962',
  greenDark: '#065f46',
  greenLight: '#e8faf0',
  pink: '#ec4899',
  pinkBg: '#fce7f3',
  teal: '#0d9488',
  tealBg: '#ccfbf1',
  mintBg: '#d1fae5',
  lavender: '#ede9fe',
  peach: '#fde8dc',
  softMint: '#d4f4e2',
  softYellow: '#fef9c3',
  softBlue: '#dbeafe',
  muted: '#6b7280',
  // New "Playful" Editorial Pastels
  paleTeal: '#e0f2f1',
  paleRose: '#fce4ec',
  paleLavender: '#f3e5f5',
  paleOrange: '#fff3e0',
  paleMuted: '#f8fafc',
};



/* ═══════════════════════════════════════════════
   DATA
═══════════════════════════════════════════════ */
const FREE_LIMIT = 10;


const HOW = [
  { n: '01', bg: C.lavender, title: 'Search instantly', desc: 'Find notes by subject, topic, or keyword across thousands of student-uploaded resources.', icon: 'search' },
  { n: '02', bg: C.peach, title: 'View 10 notes free', desc: 'No account needed. Preview your first ten notes immediately — no strings attached.', icon: 'doc' },
  { n: '03', bg: C.softMint, title: 'Unlock everything', desc: 'Sign up free to access unlimited notes, AI assistant, study groups, and assessments.', icon: 'lock' },
];

const FEATURES = [
  { bg: C.lavender, icon: 'notes', title: 'Notes Sharing', desc: 'Upload and share notes with the entire community. Build karma, help others grow.' },
  { bg: C.peach, icon: 'groups', title: 'Study Groups', desc: 'Join or create study groups. Collaborate in real-time with peers on any topic.' },
  { bg: C.softMint, icon: 'ai', title: 'AI Assistant', desc: 'Instant AI answers, note summaries, and personalised study recommendations.' },
  { bg: C.softBlue, icon: 'assessment', title: 'Assessments', desc: 'Practice quizzes and assessments linked to your note topics and subjects.' },
];

const TOPICS = [
  "Machine Learning",
  "Compiler Design",
  "Computer Networks",
  "Software Engineering",
  "Cloud Computing",
  "Other"
];
const PASTELS = [C.paleLavender, C.paleRose, C.paleTeal, C.paleOrange, C.mintBg, C.peach];

const NOTE_OMBRES = [
  'linear-gradient(135deg, #fff5f5 0%, #fff0f6 100%)', // Rose
  'linear-gradient(135deg, #f0fdfa 0%, #f0fdf4 100%)', // Teal-Mint
  'linear-gradient(135deg, #f5f3ff 0%, #eff6ff 100%)', // Lavender-Sky
  'linear-gradient(135deg, #fffbeb 0%, #fff7ed 100%)', // Honey
  'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)', // Slate-Cool
];

/* ═══════════════════════════════════════════════
   ICON COMPONENTS  (SVG stroked icons matching app style)
═══════════════════════════════════════════════ */
function Icon({ name, size = 22, color = '#6b7280', strokeWidth = 1.8 }) {
  const s = { fill: 'none', stroke: color, strokeWidth, strokeLinecap: 'round', strokeLinejoin: 'round' };
  switch (name) {
    case 'search': return <svg width={size} height={size} viewBox="0 0 24 24" {...s}><circle cx="11" cy="11" r="7" /><line x1="16.5" y1="16.5" x2="22" y2="22" /></svg>;
    case 'doc': return <svg width={size} height={size} viewBox="0 0 24 24" {...s}><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg>;
    case 'lock': return <svg width={size} height={size} viewBox="0 0 24 24" {...s}><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0110 0v4" /></svg>;
    case 'notes': return <svg width={size} height={size} viewBox="0 0 24 24" {...s}><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg>;
    case 'groups': return <svg width={size} height={size} viewBox="0 0 24 24" {...s}><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" /></svg>;
    case 'ai': return <svg width={size} height={size} viewBox="0 0 24 24" {...s}><rect x="2" y="9" width="20" height="12" rx="2" /><path d="M12 9V6" /><circle cx="12" cy="5" r="1.5" fill={color} stroke="none" /><circle cx="8" cy="15" r="1" fill={color} stroke="none" /><circle cx="12" cy="15" r="1" fill={color} stroke="none" /><circle cx="16" cy="15" r="1" fill={color} stroke="none" /><path d="M8 9V8a4 4 0 018 0v1" /></svg>;
    case 'assessment': return <svg width={size} height={size} viewBox="0 0 24 24" fill={color} stroke="none"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" /></svg>;
    case 'user': return <svg width={size} height={size} viewBox="0 0 24 24" {...s}><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>;
    case 'eye': return <svg width={size} height={size} viewBox="0 0 24 24" {...s}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>;
    default: return null;
  }
}

/* ═══════════════════════════════════════════════
   HERO BG — identical to Academic AI page
═══════════════════════════════════════════════ */
function HeroBg({ children, id }) {
  return (
    <div id={id} className="relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg,#e8faf0 0%,#f0fdf8 40%,#fce7f3 75%,#ccfbf1 100%)' }}>
      <div className="ln-grid" />
      <div className="ln-bg">
        <div className="ln-blob-teal" />
        <div className="ln-blob-pink" />
        <div className="ln-blob-sage" />
      </div>

      {/* Floating SVG decorations — Engineering Theme */}
      <div className="sv-float-el sv-chip sv-float-a">
        <svg viewBox="0 0 52 52" xmlns="http://www.w3.org/2000/svg">
          <rect x="12" y="12" width="28" height="28" rx="3" fill="#EEEDFE" stroke="#534AB7" strokeWidth="1.2" />
          <rect x="18" y="18" width="16" height="16" rx="2" fill="#534AB7" />
          <line x1="16" y1="18" x2="8" y2="18" stroke="#7F77DD" strokeWidth="1.2" />
          <line x1="16" y1="24" x2="8" y2="24" stroke="#7F77DD" strokeWidth="1.2" />
          <line x1="16" y1="30" x2="8" y2="30" stroke="#7F77DD" strokeWidth="1.2" />
          <line x1="36" y1="18" x2="44" y2="18" stroke="#7F77DD" strokeWidth="1.2" />
          <line x1="36" y1="24" x2="44" y2="24" stroke="#7F77DD" strokeWidth="1.2" />
          <line x1="36" y1="30" x2="44" y2="30" stroke="#7F77DD" strokeWidth="1.2" />
          <line x1="18" y1="16" x2="18" y2="8" stroke="#7F77DD" strokeWidth="1.2" />
          <line x1="26" y1="12" x2="26" y2="4" stroke="#AFA9EC" strokeWidth="1" />
          <line x1="34" y1="16" x2="34" y2="8" stroke="#7F77DD" strokeWidth="1.2" />
          <line x1="18" y1="36" x2="18" y2="44" stroke="#7F77DD" strokeWidth="1.2" />
          <line x1="26" y1="40" x2="26" y2="48" stroke="#AFA9EC" strokeWidth="1" />
          <line x1="34" y1="36" x2="34" y2="44" stroke="#7F77DD" strokeWidth="1.2" />
          <rect x="22" y="22" width="8" height="8" rx="1" fill="#AFA9EC" opacity="0.6" />
        </svg>
      </div>
      <div className="sv-float-el sv-resistor sv-float-b">
        <svg viewBox="0 0 52 20" xmlns="http://www.w3.org/2000/svg">
          <line x1="0" y1="10" x2="12" y2="10" stroke="#BA7517" strokeWidth="1.5" strokeLinecap="round" />
          <rect x="12" y="4" width="28" height="12" rx="3" fill="#FAC775" stroke="#BA7517" strokeWidth="1" />
          <line x1="40" y1="10" x2="52" y2="10" stroke="#BA7517" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="18" y1="4" x2="18" y2="16" stroke="#D4537E" strokeWidth="0.8" />
          <line x1="24" y1="4" x2="24" y2="16" stroke="#9FE1CB" strokeWidth="0.8" />
          <line x1="30" y1="4" x2="30" y2="16" stroke="#D4537E" strokeWidth="0.8" />
          <line x1="36" y1="4" x2="36" y2="16" stroke="#534AB7" strokeWidth="0.8" />
        </svg>
      </div>

      <div className="sv-float-el sv-gear sv-float-d">
        <svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
          <path d="M26 4 L28 4 L30 8 L34 6 L36 8 L34 12 Q38 14 40 18 L44 16 L46 18 L44 22 L48 26 L48 28 L44 30 L46 34 L44 36 L40 34 Q38 38 34 40 L36 44 L34 46 L30 44 L28 48 L26 48 L24 44 L20 46 L18 44 L20 40 Q16 38 14 34 L10 36 L8 34 L10 30 L6 28 L6 26 L10 24 L8 20 L10 18 L14 20 Q16 16 20 14 L18 10 L20 8 L24 10 Z" fill="#9FE1CB" stroke="#1D9E75" strokeWidth="1" />
          <circle cx="27" cy="26" r="9" fill="#E6F1FB" stroke="#1D9E75" strokeWidth="1" />
          <circle cx="27" cy="26" r="5" fill="#5DCAA5" />
        </svg>
      </div>
      <div className="sv-float-el sv-oscwave sv-float-e">
        <svg viewBox="0 0 76 50" xmlns="http://www.w3.org/2000/svg">
          <rect x="0" y="0" width="76" height="50" rx="6" fill="#0a1628" stroke="#378ADD" strokeWidth="1" />
          <rect x="4" y="4" width="68" height="42" rx="3" fill="#0a2040" />
          <line x1="8" y1="25" x2="68" y2="25" stroke="#1a4060" strokeWidth="0.6" />
          <line x1="38" y1="8" x2="38" y2="42" stroke="#1a4060" strokeWidth="0.6" />
          <polyline points="8,25 16,25 16,12 24,12 24,38 32,38 32,12 40,12 40,38 48,38 48,12 56,12 56,25 68,25" fill="none" stroke="#5DCAA5" strokeWidth="1.4" strokeLinejoin="round" />
          <circle cx="8" cy="25" r="1.5" fill="#FAC775" />
        </svg>
      </div>

      <div className="sv-float-el sv-binary sv-float-f">
        <svg viewBox="0 0 76 50" xmlns="http://www.w3.org/2000/svg">
          <rect x="0" y="0" width="76" height="50" rx="6" fill="#1a1a2e" stroke="#534AB7" strokeWidth="1" />
          <text x="8" y="16" fontFamily="monospace" fontSize="10" fill="#7F77DD">01001000</text>
          <text x="8" y="28" fontFamily="monospace" fontSize="10" fill="#AFA9EC">11010011</text>
          <text x="8" y="40" fontFamily="monospace" fontSize="10" fill="#534AB7">10110110</text>
          <rect x="52" y="3" width="20" height="10" rx="2" fill="#534AB7" />
          <text x="62" y="11" textAnchor="middle" fontFamily="monospace" fontSize="7" fill="#EEEDFE">BIN</text>
        </svg>
      </div>

      {/* Stacked textbooks */}
      <div className="sv-float-el sv-books sv-float-h">
        <svg viewBox="0 0 72 64" xmlns="http://www.w3.org/2000/svg">
          <rect x="4" y="44" width="64" height="12" rx="2" fill="#ED93B1" stroke="#D4537E" strokeWidth="1" />
          <rect x="2" y="44" width="4" height="12" rx="1" fill="#BA3060" stroke="#993556" strokeWidth="0.8" />
          <rect x="8" y="28" width="56" height="16" rx="2" fill="#FAC775" stroke="#BA7517" strokeWidth="1" />
          <rect x="6" y="28" width="4" height="16" rx="1" fill="#EF9F27" stroke="#BA7517" strokeWidth="0.8" />
          <rect x="10" y="10" width="52" height="18" rx="2" fill="#9FE1CB" stroke="#1D9E75" strokeWidth="1" />
          <rect x="8" y="10" width="4" height="18" rx="1" fill="#5DCAA5" stroke="#1D9E75" strokeWidth="0.8" />
          <line x1="20" y1="16" x2="54" y2="16" stroke="#E6F9F3" strokeWidth="0.8" />
          <line x1="20" y1="20" x2="46" y2="20" stroke="#E6F9F3" strokeWidth="0.8" />
          <line x1="18" y1="34" x2="54" y2="34" stroke="#FAEEDA" strokeWidth="0.8" />
          <line x1="18" y1="38" x2="46" y2="38" stroke="#FAEEDA" strokeWidth="0.8" />
          <line x1="16" y1="49" x2="54" y2="49" stroke="#F4C0D1" strokeWidth="0.8" />
        </svg>
      </div>

      {/* Study timer / clock */}
      <div className="sv-float-el sv-clock sv-float-a">
        <svg viewBox="0 0 58 64" xmlns="http://www.w3.org/2000/svg">
          <line x1="20" y1="4" x2="38" y2="4" stroke="#534AB7" strokeWidth="2" strokeLinecap="round" />
          <line x1="29" y1="4" x2="29" y2="10" stroke="#534AB7" strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="29" cy="36" r="24" fill="#EEEDFE" stroke="#534AB7" strokeWidth="1.2" />
          <circle cx="29" cy="36" r="20" fill="white" stroke="#AFA9EC" strokeWidth="0.6" />
          <line x1="29" y1="36" x2="29" y2="20" stroke="#534AB7" strokeWidth="1.8" strokeLinecap="round" />
          <line x1="29" y1="36" x2="40" y2="42" stroke="#7F77DD" strokeWidth="1.4" strokeLinecap="round" />
          <circle cx="29" cy="36" r="2.5" fill="#534AB7" />
          <line x1="29" y1="17" x2="29" y2="19" stroke="#AFA9EC" strokeWidth="1" strokeLinecap="round" />
          <line x1="29" y1="53" x2="29" y2="55" stroke="#AFA9EC" strokeWidth="1" strokeLinecap="round" />
          <line x1="10" y1="36" x2="12" y2="36" stroke="#AFA9EC" strokeWidth="1" strokeLinecap="round" />
          <line x1="46" y1="36" x2="48" y2="36" stroke="#AFA9EC" strokeWidth="1" strokeLinecap="round" />
        </svg>
      </div>

      {/* Trophy / achievement */}
      <div className="sv-float-el sv-trophy sv-float-c" style={{ animationDelay: '0.6s' }}>
        <svg viewBox="0 0 54 66" xmlns="http://www.w3.org/2000/svg">
          <path d="M14 6 Q10 6 8 14 Q6 24 14 30 Q18 34 27 36 Q36 34 40 30 Q48 24 46 14 Q44 6 40 6 Z" fill="#FAC775" stroke="#BA7517" strokeWidth="1" />
          <path d="M8 10 Q2 10 2 18 Q2 26 10 28" fill="none" stroke="#EF9F27" strokeWidth="1.4" strokeLinecap="round" />
          <path d="M46 10 Q52 10 52 18 Q52 26 44 28" fill="none" stroke="#EF9F27" strokeWidth="1.4" strokeLinecap="round" />
          <rect x="22" y="36" width="10" height="14" rx="1" fill="#EF9F27" stroke="#BA7517" strokeWidth="0.8" />
          <rect x="14" y="50" width="26" height="8" rx="3" fill="#FAC775" stroke="#BA7517" strokeWidth="1" />
          <rect x="16" y="58" width="22" height="4" rx="2" fill="#EF9F27" stroke="#BA7517" strokeWidth="0.8" />
          <polygon points="27,12 29,18 35,18 30,22 32,28 27,24 22,28 24,22 19,18 25,18" fill="#FAEEDA" opacity="0.8" />
        </svg>
      </div>

      <div className="sv-dot sv-dot-1"></div>
      <div className="sv-dot sv-dot-2"></div>
      <div className="sv-dot sv-dot-3"></div>
      <div className="sv-dot sv-dot-4"></div>
      <div className="sv-dot sv-dot-5"></div>

      <div style={{ position: 'relative', zIndex: 10 }}>{children}</div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   SKELETON CARD
═══════════════════════════════════════════════ */
function SkeletonCard() {
  return (
    <div style={{ borderRadius: 16, border: '1px solid #f0f0f0', background: '#fff', padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,.04)' }}>
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 12 }}>
        <div className="shimmer" style={{ width: 44, height: 44, borderRadius: 12, flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <div className="shimmer" style={{ height: 14, marginBottom: 8 }} />
          <div className="shimmer" style={{ height: 11, width: '60%' }} />
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
        <div className="shimmer" style={{ height: 20, width: 60, borderRadius: 99 }} />
        <div className="shimmer" style={{ height: 20, width: 48, borderRadius: 99 }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, borderTop: '1px solid #f9fafb' }}>
        <div className="shimmer" style={{ height: 11, width: 80 }} />
        <div className="shimmer" style={{ height: 28, width: 64, borderRadius: 10 }} />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   LOCK MODAL
═══════════════════════════════════════════════ */
function LockModal({ onClose }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(0,0,0,.38)', backdropFilter: 'blur(4px)', padding: '0 16px'
    }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-pop" style={{
        background: '#fff', borderRadius: 24, boxShadow: '0 24px 80px rgba(0,0,0,.18)',
        padding: 32, maxWidth: 360, width: '100%', textAlign: 'center'
      }}>
        <div className="float-slow" style={{
          width: 64, height: 64, borderRadius: 18,
          background: `linear-gradient(135deg,${C.lavender},${C.peach})`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px'
        }}>
          <Icon name="lock" size={28} color="#7c3aed" strokeWidth={2.2} />
        </div>
        <h3 style={{ fontSize: 18, fontWeight: 800, color: '#111', marginBottom: 8 }}>Free limit reached</h3>
        <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 6, lineHeight: 1.6 }}>
          You've previewed <strong style={{ color: '#374151' }}>{FREE_LIMIT} of {FREE_LIMIT}</strong> free notes.
        </p>
        <p style={{ fontSize: 11, color: '#9ca3af', marginBottom: 20, lineHeight: 1.6 }}>
          Create a free account to unlock unlimited notes, AI assistance, study groups, and assessments.
        </p>
        <div style={{ height: 6, borderRadius: 99, background: C.lavender, marginBottom: 20, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: '100%', borderRadius: 99, background: `linear-gradient(90deg,${C.green},${C.teal})` }} />
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <a href="/login" className="btn-press" style={{
            flex: 1, padding: '11px 0', borderRadius: 14, fontWeight: 700,
            fontSize: 13, color: '#fff', textAlign: 'center', background: `linear-gradient(135deg,${C.green},${C.teal})`,
            textDecoration: 'none', display: 'block'
          }}>
            Login
          </a>
          <a href="/register" className="btn-press" style={{
            flex: 1, padding: '11px 0', borderRadius: 14, fontWeight: 700,
            fontSize: 13, color: C.green, textAlign: 'center', border: `2px solid ${C.green}`,
            textDecoration: 'none', display: 'block'
          }}>
            Sign Up Free
          </a>
        </div>
        <button onClick={onClose} style={{ marginTop: 14, fontSize: 11, color: '#9ca3af', background: 'none', border: 'none', cursor: 'pointer' }}>
          Maybe later
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   NOTE CARD — matches screenshot exactly
═══════════════════════════════════════════════ */
function NoteCard({ note, locked, onLock, onView, index }) {
  const ombreBg = NOTE_OMBRES[index % NOTE_OMBRES.length];

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
        position: 'relative', borderRadius: '28px', border: '1px solid rgba(0,0,0,0.05)',
        background: ombreBg,
        padding: '28px', boxShadow: '0 12px 32px rgba(0,0,0,.04)',
        display: 'flex', flexDirection: 'column', gap: 16,
        overflow: 'hidden'
      }}>

      {/* 1. PREVIEW SECTION (Top - Blurred if locked) */}
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

        {/* Lock Icon (only over preview area) */}
        {locked && (
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(255,255,255,0.1)'
          }}>
            <div style={{
              width: 52, height: 52, borderRadius: '50%', background: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 8px 24px rgba(0,0,0,0.08)'
            }}>
              <Icon name="lock" size={24} color="#7c3aed" strokeWidth={2.5} />
            </div>
          </div>
        )}
      </div>

      {/* 2. CONTENT SECTION (Bottom — always clear) */}
      <div style={{
        display: 'flex', flexDirection: 'column', gap: 16, height: '100%',
        zIndex: 1
      }}>
        {/* BADGE */}
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

/* ═══════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════ */
export default function Landing() {
  const navigate = useNavigate();
  const [notes, setNotes] = useState([]);
  const [subjects, setSubjects] = useState(TOPICS);
  const [counts, setCounts] = useState({ notes: 0, users: 0 });
  const [loading, setLoading] = useState(true);
  const [showSearch, setShowSearch] = useState(false);
  const [query, setQuery] = useState('');
  const [showLock, setShowLock] = useState(false);
  const [activeNav, setActiveNav] = useState('home');
  const resultsRef = useRef(null);
  const searchInputRef = useRef(null);

  useEffect(() => {
    // 1. Fetch live notes
    api.get('/notes/public', { params: { limit: 3 } })
      .then(res => {
        setNotes(res.data.notes || []);
      })
      .catch(err => console.error("Error fetching landing stats:", err));

    // 2. Fetch total counts
    Promise.all([
      api.get('/notes/count'),
      api.get('/users/count')
    ]).then(([nr, ur]) => {
      setCounts({ notes: nr.data.count || 0, users: ur.data.count || 0 });
    }).catch(err => console.error("Error counts:", err));

    // 3. Fetch authoritative subjects
    api.get('/notes/subjects')
      .then(res => {
        if (Array.isArray(res.data)) setSubjects(res.data);
      })
      .catch(err => console.error("Error subjects:", err));

    setTimeout(() => setLoading(false), 900);
  }, []);

  /* localStorage freemium */
  const [viewedNotes, setViewedNotes] = useState(() => {
    try { return JSON.parse(localStorage.getItem('stunotes_viewed')) || []; }
    catch { return []; }
  });
  useEffect(() => {
    localStorage.setItem('stunotes_viewed', JSON.stringify(viewedNotes));
    localStorage.setItem('notes_viewed_count', viewedNotes.length.toString());
  }, [viewedNotes]);

  const scrollToSection = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setActiveNav(id);
  };

  const doSearch = (term) => {
    const s = term || query || '';
    if (s.trim()) {
      navigate(`/notes?query=${encodeURIComponent(s.trim())}`);
    } else {
      navigate('/notes');
    }
  };

  const handleViewNote = (note) => {
    if (note.fileUrl) window.open(note.fileUrl, '_blank');
    if (viewedNotes.includes(note.id)) return;
    if (viewedNotes.length >= FREE_LIMIT) { setShowLock(true); return; }
    setViewedNotes(prev => [...prev, note.id]);
  };

  const handleDownloadNote = (note) => {
    if (note.downloadUrl) window.open(note.downloadUrl, '_blank');
    if (viewedNotes.includes(note.id)) return;
    if (viewedNotes.length >= FREE_LIMIT) { setShowLock(true); return; }
    setViewedNotes(prev => [...prev, note.id]);
  };

  const isLocked = (note, idx) => {
    if (viewedNotes.includes(note.id)) return false;
    return viewedNotes.length >= FREE_LIMIT || idx >= FREE_LIMIT;
  };

  // Helper to turn MIME types into clean labels
  const getFileLabel = (fileType) => {
    if (!fileType) return 'DOC';
    const ft = fileType.toLowerCase();
    if (ft.includes('pdf')) return 'PDF';
    if (ft.includes('presentation') || ft.includes('ppt')) return 'PPT';
    if (ft.includes('word') || ft.includes('doc')) return 'DOC';
    if (ft.includes('image') || ft.includes('png') || ft.includes('jpg')) return 'IMG';
    if (ft.includes('sheet') || ft.includes('excel')) return 'XLS';
    return ft.split('/').pop().toUpperCase().slice(0, 4);
  };

  const displayNotes = notes.map(n => ({
    ...n,
    id: n._id,
    uploader: n.authorName || 'Student',
    tags: [n.subject, getFileLabel(n.fileType)].filter(Boolean),
    badge: (new Date() - new Date(n.createdAt)) < 604800000 ? '✨ NEW' : null
  }));

  const filteredNotes = displayNotes;

  const freeUsed = Math.min(viewedNotes.length, FREE_LIMIT);

  const dynamicStats = [
    { value: counts.notes > 0 ? `${counts.notes}` : '0', label: 'Notes shared', bg: C.lavender },
    { value: '98%', label: 'Students satisfied', bg: C.peach },
    { value: '<2min', label: 'Avg search time', bg: C.softMint },
    { value: '100%', label: 'Free to explore', bg: C.softYellow },
  ];

  /* ──────────── RENDER ──────────── */
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#fff', overflowX: 'clip' }}>

      {/* ══════ HEADER ══════ */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 40, display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', padding: '12px 56px', borderBottom: '1px solid #f3f4f6',
        background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(14px)'
      }}>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 42, height: 42, borderRadius: 12, overflow: 'hidden',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 16px rgba(29,201,98,0.15)', background: '#fff'
          }}>
            <img src={logo} alt="StuNotes Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <span style={{ fontSize: 19, fontWeight: 900, color: '#0f172a', letterSpacing: '-0.5px' }}>StuNotes</span>
        </div>

        <nav style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
          {[['Home', 'home'], ['Features', 'features'], ['How it works', 'how-it-works'], ['Notes', 'results']].map(([label, id]) => (
            <button key={id} onClick={() => scrollToSection(id)}
              className={`nav-link ${activeNav === id ? 'nav-active' : ''}`}
              style={{
                fontSize: 14, fontWeight: 700, color: activeNav === id ? '#111' : '#6b7280',
                background: 'none', border: 'none', cursor: 'pointer', padding: '2px 0', transition: 'color .15s'
              }}>
              {label}
            </button>
          ))}
        </nav>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link to="/login" style={{ fontSize: 13, fontWeight: 800, color: '#0f172a', textDecoration: 'none', padding: '10px 20px' }}>Login</Link>
          <Link to="/register" className="btn-press" style={{
            fontSize: 13, fontWeight: 800, color: '#fff', background: '#111',
            padding: '10px 24px', borderRadius: 12, textDecoration: 'none'
          }}>Join Free</Link>
        </div>
      </header>

      <main style={{ flex: 1 }}>
        {/* ══════ HERO SECTION ══════ */}
        <HeroBg id="home">
          <section style={{
            padding: '100px 24px 120px', display: 'flex', flexDirection: 'column',
            alignItems: 'center', textAlign: 'center', position: 'relative', zIndex: 1
          }}>

            {/* LOGO BANNER */}
            <div className="fade-up banner-glow" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '6px 14px', borderRadius: 99, background: '#fff',
              border: '1.5px solid #f1f5f9', marginBottom: 32
            }}>
              <div style={{ width: 18, height: 18, borderRadius: 5, background: C.green, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="search" size={10} color="#fff" strokeWidth={3} />
              </div>
              <span style={{ fontSize: 11, fontWeight: 900, color: '#475569', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                Community Driven Learning
              </span>
            </div>

            <h1 className="fade-up fade-up-1"
              style={{
                fontSize: 'clamp(32px,5vw,52px)', fontWeight: 900, lineHeight: 1.15,
                letterSpacing: '-1.5px', color: '#0f172a', maxWidth: 840, marginBottom: 40
              }}>
              Your ultimate shortcut to{' '}
              <span style={{
                background: `linear-gradient(135deg, ${C.green}, ${C.teal})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                display: 'inline-block'
              }}>
                academic excellence.
              </span>
            </h1>

            {/* SEARCH BAR */}
            <div className="fade-up fade-up-3" style={{ width: '100%', maxWidth: 720, padding: '0 10px' }}>
              <div className={`glass-search ${showSearch ? 'search-focus' : ''}`} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                borderRadius: 22, padding: '10px 10px 10px 24px',
                position: 'relative', zIndex: 2
              }}>
                {loading ? (
                  <svg style={{ width: 22, height: 22, flexShrink: 0, animation: 'spin 1s linear infinite', color: C.teal }} fill="none" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2.5" opacity=".25" />
                    <path fill="currentColor" opacity=".75" d="M4 12a8 8 0 018-8v3l3.5-3.5L12 0v3A9 9 0 003 12h1z" />
                  </svg>
                ) : (
                  <Icon name="search" size={22} color={C.teal} strokeWidth={2.5} />
                )}

                <input type="text" value={query} ref={searchInputRef}
                  onFocus={() => setShowSearch(true)}
                  onBlur={() => setShowSearch(false)}
                  onChange={e => setQuery(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && doSearch()}
                  placeholder={`Search ${counts.notes > 0 ? counts.notes : 'all'} notes...`}
                  style={{
                    flex: 1, border: 'none', outline: 'none', fontSize: 'clamp(15px, 2vw, 18px)', color: '#0f172a',
                    fontFamily: 'inherit', fontWeight: 600, background: 'transparent'
                  }} />

                <button onClick={() => doSearch()} disabled={loading} className="btn-press"
                  style={{
                    width: 52, height: 52, borderRadius: 99, flexShrink: 0,
                    background: query.trim() ? `linear-gradient(135deg, ${C.green}, ${C.teal})` : '#f1f5f9',
                    color: query.trim() ? '#fff' : '#94a3b8',
                    border: 'none', cursor: query.trim() ? 'pointer' : 'default',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all .3s', boxShadow: query.trim() ? `0 8px 20px ${C.teal}40` : 'none'
                  }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13"></line>
                    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                  </svg>
                </button>
              </div>

              {/* MINI FEATURE ROW */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginTop: 28, flexWrap: 'wrap' }}>
                {[
                  { icon: 'search', txt: 'Search instantly' },
                  { icon: 'eye', txt: 'Preview 10 free' },
                  { icon: 'lock', txt: 'Unlock full access' }
                ].map(f => (
                  <div key={f.txt} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 800, color: '#4b5563' }}>
                    <Icon name={f.icon} size={15} color={C.teal} strokeWidth={2.5} />
                    {f.txt}
                  </div>
                ))}
              </div>

              {/* TOPIC PILLS */}
              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 8, marginTop: 32 }}>
                {subjects.slice(0, -1).map(topic => ( // slice to exclude 'Other' if needed, or just iterate all
                  <Link key={topic} to={`/notes?subject=${encodeURIComponent(topic)}`} className="topic-pill" style={{
                    padding: '8px 20px', borderRadius: 12, fontSize: 11, fontWeight: 900, textDecoration: 'none',
                    background: 'rgba(255,255,255,0.7)', color: '#0f172a', border: '1px solid rgba(15, 23, 42, 0.12)',
                    backdropFilter: 'blur(16px)', transition: 'all 0.3s ease', textTransform: 'uppercase', letterSpacing: '0.8px',
                    boxShadow: '0 4px 12px rgba(15, 23, 42, 0.04)'
                  }}>
                    {topic}
                  </Link>
                ))}
              </div>
            </div>

          </section>
        </HeroBg>

        {/* ══════ STATS BAND ══════ */}
        <section style={{ background: '#fff', padding: '40px 24px 60px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 20 }}>
            {dynamicStats.map((s, i) => (
              <div key={i} className={`stat-card ${i % 2 === 0 ? 'asym-up' : 'asym-down'}`}
                style={{
                  borderRadius: 24, padding: '32px 20px',
                  background: PASTELS[i % PASTELS.length],
                  border: '1.5px solid rgba(15, 23, 42, 0.08)',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                  boxShadow: '0 12px 32px rgba(15, 23, 42, 0.06)'
                }}>
                <span style={{ fontSize: 34, fontWeight: 900, color: '#0f172a', letterSpacing: '-1.5px' }}>{s.value}</span>
                <span style={{ fontSize: 13, fontWeight: 900, color: '#1e293b', textAlign: 'center', textTransform: 'uppercase', letterSpacing: '0.8px' }}>{s.label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ══════ BROWSE / RESULTS ══════ */}
        <section id="results" ref={resultsRef} className="grid-bg" style={{
          background: 'linear-gradient(180deg, #fafafa 0%, #fff 100%)',
          padding: '88px 24px',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Blobs for depth - subtle opacity */}
          <div className="ln-bg" style={{ opacity: 0.5 }}>
            <div className="ln-blob-teal" style={{ top: '10%', left: '70%', width: '45%', height: '45%' }} />
            <div className="ln-blob-pink" style={{ top: '60%', left: '-5%', width: '40%', height: '40%' }} />
            <div className="ln-blob-sage" style={{ top: '30%', left: '20%', width: '50%', height: '50%' }} />
          </div>

          <div style={{ maxWidth: 1140, margin: '0 auto', position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 40 }}>
              <h2 style={{ fontSize: 28, fontWeight: 900, color: '#000', letterSpacing: '-1px' }}>
                Browse Popular Notes
              </h2>
            </div>

            {loading && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 20 }}>
                {[1, 2, 3, 4, 5, 6].map(i => <SkeletonCard key={i} />)}
              </div>
            )}


            {/* Cards grid */}
            <div style={{ position: 'relative' }}>
              {loading ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 18 }}>
                  {[0, 1, 2, 3].map(i => <SkeletonCard key={i} />)}
                </div>
              ) : (
                filteredNotes.length > 0 ? (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 18 }}>
                    {filteredNotes.slice(0, 3).map((note, idx) => (
                      <NoteCard key={note.id} note={note} index={idx}
                        locked={isLocked(note, idx)}
                        onLock={() => setShowLock(true)}
                        onView={handleViewNote}
                        onDownload={handleDownloadNote} />
                    ))}
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '60px 24px', opacity: 0.6 }}>
                    <p style={{ fontSize: 18, fontWeight: 800 }}>No notes found</p>
                    <p style={{ fontSize: 14 }}>Try searching for a different subject or topic.</p>
                  </div>
                )
              )}
            </div>

            {/* VIEW ALL BUTTON */}
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 48 }}>
              <button onClick={() => navigate('/notes')} className="btn-press" style={{
                padding: '14px 40px', borderRadius: 99, background: '#fff',
                border: '1px solid rgba(15, 23, 42, 0.15)',
                color: '#0f172a', fontWeight: 800, fontSize: 15, cursor: 'pointer',
                boxShadow: '0 12px 32px rgba(15, 23, 42, 0.12)', transition: 'all 0.3s'
              }}>
                View All Notes →
              </button>
            </div>

            {/* Freemium banner */}
            {!loading && (
              <div className="banner-glow" style={{
                marginTop: 40, display: 'flex', alignItems: 'center', gap: 20,
                borderRadius: 24, border: '1px solid rgba(0,0,0,0.03)', padding: '24px 32px',
                background: C.paleOrange, flexWrap: 'wrap', boxShadow: '0 8px 32px rgba(0,0,0,0.02)'
              }}>
                <div className="float-slow" style={{ fontSize: 32, transform: 'rotate(-5deg)' }}>🔒</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 5, flexWrap: 'wrap' }}>
                    <p style={{ fontSize: 16, fontWeight: 900, color: '#0f172a', letterSpacing: '-0.3px' }}>
                      Free limit: {freeUsed}/{FREE_LIMIT} notes viewed
                    </p>
                    {freeUsed >= FREE_LIMIT && (
                      <span style={{
                        fontSize: 10, fontWeight: 900, padding: '3px 12px', borderRadius: 99,
                        background: '#fff', color: '#ea580c', boxShadow: '0 2px 6px rgba(0,0,0,0.05)'
                      }}>LIMIT REACHED</span>
                    )}
                  </div>
                  <p style={{ fontSize: 13, color: '#64748b', fontWeight: 600 }}>Unlock unlimited access — signing up is completely free, forever.</p>
                </div>
                <a href="/register" className="btn-press"
                  style={{
                    padding: '12px 32px', borderRadius: 99, fontSize: 13, fontWeight: 800, color: '#fff',
                    background: '#0f172a', textDecoration: 'none',
                    display: 'inline-block', whiteSpace: 'nowrap', flexShrink: 0,
                    boxShadow: '0 8px 20px rgba(15,23,42,0.15)'
                  }}>
                  Sign Up Free →
                </a>
              </div>
            )}
          </div>
        </section>

        {/* ══════ HOW IT WORKS ══════ */}
        <section id="how-it-works" style={{
          background: '#fff',
          padding: '72px 24px',
          position: 'relative'
        }}>
          {/* Soft-fade divider to match reference */}
          <div style={{
            height: '1px',
            background: 'linear-gradient(to right, transparent, rgba(15, 23, 42, 0.08) 50%, transparent)',
            width: '100%',
            position: 'absolute',
            top: 0,
            left: 0
          }} />

          <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 52 }}>

              <h2 style={{ fontSize: 34, fontWeight: 900, color: '#111827', letterSpacing: '-1px', marginBottom: 10 }}>
                How It Works
              </h2>
              <p style={{ fontSize: 14, color: '#6b7280', fontWeight: 500, maxWidth: 480, margin: '0 auto', lineHeight: 1.7 }}>
                Three steps from zero to fully prepared — no friction, no paywalls to start.
              </p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 24 }}>
              {HOW.map((s, i) => (
                <div key={s.n} className={`how-card ${i === 1 ? 'asym-down' : ''}`} style={{
                  position: 'relative', borderRadius: 28, padding: '40px 32px',
                  background: PASTELS[(i + 2) % PASTELS.length], border: '1px solid rgba(0,0,0,0.02)',
                  display: 'flex', flexDirection: 'column', gap: 18,
                  boxShadow: '0 4px 12px rgba(0,0,0,.02)'
                }}>
                  <span style={{
                    position: 'absolute', top: 20, right: 28, fontSize: 64, fontWeight: 950,
                    color: 'rgba(0,0,0,0.03)', lineHeight: 1, userSelect: 'none'
                  }}>
                    {s.n}
                  </span>
                  <div style={{
                    width: 56, height: 56, borderRadius: 18, background: '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,.05)'
                  }}>
                    <Icon name={s.icon} size={26} color="#0f172a" strokeWidth={2} />
                  </div>
                  <h3 style={{ fontSize: 18, fontWeight: 900, color: '#0f172a', letterSpacing: '-0.5px' }}>{s.title}</h3>
                  <p style={{ fontSize: 14, color: '#475569', lineHeight: 1.7, fontWeight: 600 }}>{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════ FEATURES ══════ */}
        <section id="features" className="grid-bg" style={{ background: '#fafafa', padding: '72px 24px' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 52 }}>

              <h2 style={{ fontSize: 42, fontWeight: 900, color: '#000', letterSpacing: '-1.5px', marginBottom: 0 }}>
                Key Features
              </h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 20 }}>
              {FEATURES.map((f, i) => {
                return (
                  <div key={f.title} className="feat-card" style={{
                    borderRadius: 24, padding: '32px 24px',
                    background: PASTELS[(i + 4) % PASTELS.length], border: '1px solid rgba(0,0,0,0.02)',
                    display: 'flex', flexDirection: 'column', gap: 16,
                    boxShadow: '0 4px 12px rgba(0,0,0,.02)'
                  }}>
                    <div style={{
                      width: 52, height: 52, borderRadius: 16, background: '#fff',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 10px rgba(0,0,0,.04)'
                    }}>
                      <Icon name={f.icon} size={24} color="#0f172a" strokeWidth={2} />
                    </div>
                    <h3 style={{ fontSize: 19, fontWeight: 900, color: '#0f172a', letterSpacing: '-0.3px' }}>{f.title}</h3>
                  </div>
                );
              })}
            </div>
          </div>
        </section>


        {/* ══════ FINAL CTA ══════ */}
        <HeroBg>
          <section style={{ padding: '80px 24px', textAlign: 'center' }}>
            <div className="float-slow" style={{
              display: 'inline-flex', alignItems: 'center', gap: 7,
              borderRadius: 99, border: '1px solid rgba(29,201,98,.28)', padding: '7px 16px', fontSize: 12,
              fontWeight: 800, background: 'rgba(255,255,255,.68)', color: C.greenDark, marginBottom: 24
            }}>
              ✨ Free to join · No credit card required
            </div>
            <h2 style={{
              fontSize: 'clamp(28px,4vw,48px)', fontWeight: 900, color: '#111827', letterSpacing: '-1.2px',
              maxWidth: 600, margin: '0 auto 18px', lineHeight: 1.22
            }}>
              Unlock the full{' '}
              <span style={{
                background: C.mintBg, color: C.greenDark, borderRadius: 12,
                padding: '0 12px', display: 'inline-block'
              }}>
                StuNotes
              </span>
              {' '}experience.
            </h2>
            <p style={{
              fontSize: 14, color: '#6b7280', maxWidth: 420, margin: '0 auto 36px',
              lineHeight: 1.7, fontWeight: 600
            }}>
              Join thousands of students already studying smarter. Unlimited notes, AI assistance,
              and real collaboration — all free.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 16, flexWrap: 'wrap' }}>
              <a href="/register" className="btn-press"
                style={{
                  padding: '14px 36px', borderRadius: 99, fontSize: 14, fontWeight: 800, color: '#fff',
                  background: '#0f172a',
                  boxShadow: '0 8px 24px rgba(15,23,42,0.2)', textDecoration: 'none', display: 'inline-block'
                }}>
                Get Started Free →
              </a>
              <a href="/login" className="btn-press"
                style={{
                  padding: '14px 36px', borderRadius: 99, fontSize: 14, fontWeight: 800, color: '#0f172a',
                  border: '2px solid #0f172a', textDecoration: 'none', display: 'inline-block', background: '#fff'
                }}>
                Login
              </a>
            </div>
          </section>
        </HeroBg>

      </main>

      {/* ══════ FOOTER ══════ */}
      <footer style={{ background: '#fff', borderTop: '1px solid #f3f4f6', padding: '28px 24px' }}>
        <div style={{
          maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', flexWrap: 'wrap', gap: 16
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: `linear-gradient(135deg, ${C.green}, ${C.teal})`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: `0 4px 12px ${C.teal}40`
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10 9 9 9 8 9"></polyline>
              </svg>
            </div>
            <span style={{ fontSize: 16, fontWeight: 900, color: '#0f172a', letterSpacing: '-0.3px' }}>StuNotes</span>
          </div>
          <nav style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
            {[['About', '/about'], ['Contact', '/contact'], ['Privacy Policy', '/privacy'], ['Terms', '/terms']].map(([l, to]) => (
              <Link key={l} to={to}
                style={{ fontSize: 12, fontWeight: 700, color: '#9ca3af', textDecoration: 'none' }}>
                {l}
              </Link>
            ))}
          </nav>
          <p style={{ fontSize: 12, fontWeight: 600, color: '#9ca3af' }}>© 2025 StuNotes. All rights reserved.</p>
        </div>
      </footer>

      {showLock && <LockModal onClose={() => setShowLock(false)} freeUsed={viewedNotes.length} />}
    </div>
  );
}