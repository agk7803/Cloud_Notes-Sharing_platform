import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

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
};

/* ═══════════════════════════════════════════════
   GLOBAL CSS
═══════════════════════════════════════════════ */
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&display=swap');
  * { box-sizing: border-box; margin:0; padding:0; }
  body { font-family: 'Nunito', sans-serif; }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(24px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .fade-up   { animation: fadeUp 0.55s cubic-bezier(.22,.68,0,1.2) both; }
  .fade-up-1 { animation-delay: 0.05s; }
  .fade-up-2 { animation-delay: 0.13s; }
  .fade-up-3 { animation-delay: 0.22s; }
  .fade-up-4 { animation-delay: 0.32s; }
  .fade-up-5 { animation-delay: 0.42s; }

  /* mesh blobs — matches Academic AI page exactly */
  @keyframes blob1 {
    0%,100% { transform: translate(0,0) scale(1); }
    33%      { transform: translate(30px,-20px) scale(1.08); }
    66%      { transform: translate(-15px,25px) scale(0.95); }
  }
  @keyframes blob2 {
    0%,100% { transform: translate(0,0) scale(1); }
    33%      { transform: translate(-25px,20px) scale(1.05); }
    66%      { transform: translate(20px,-30px) scale(0.97); }
  }
  @keyframes blob3 {
    0%,100% { transform: translate(0,0) scale(1); }
    33%      { transform: translate(15px,25px) scale(0.93); }
    66%      { transform: translate(-20px,-15px) scale(1.06); }
  }

  .ln-bg { position:absolute; inset:0; overflow:hidden; pointer-events:none; }
  .ln-blob-teal {
    position:absolute; top:-15%; left:-10%; width:55%; height:55%;
    border-radius:50%;
    background: radial-gradient(circle, rgba(126,200,200,0.42) 0%, rgba(126,200,200,0.16) 45%, transparent 70%);
    animation: blob1 14s ease-in-out infinite; filter:blur(2px);
  }
  .ln-blob-pink {
    position:absolute; top:-10%; right:-12%; width:50%; height:50%;
    border-radius:50%;
    background: radial-gradient(circle, rgba(249,168,201,0.38) 0%, rgba(249,168,201,0.14) 45%, transparent 70%);
    animation: blob2 17s ease-in-out infinite; filter:blur(2px);
  }
  .ln-blob-sage {
    position:absolute; bottom:-18%; left:25%; width:52%; height:52%;
    border-radius:50%;
    background: radial-gradient(circle, rgba(184,224,200,0.40) 0%, rgba(0,201,110,0.10) 45%, transparent 70%);
    animation: blob3 20s ease-in-out infinite; filter:blur(2px);
  }
  .ln-grid {
    position:absolute; inset:0; pointer-events:none;
    background-image:
      linear-gradient(rgba(126,200,200,0.16) 1px, transparent 1px),
      linear-gradient(90deg, rgba(126,200,200,0.16) 1px, transparent 1px);
    background-size: 40px 40px;
  }

  @keyframes floatBadge {
    0%,100% { transform: translateY(0px); }
    50%      { transform: translateY(-6px); }
  }
  .float-slow { animation: floatBadge 3.8s ease-in-out infinite; }

  @keyframes pulseDot {
    0%,100% { opacity:1; transform:scale(1); }
    50%      { opacity:.45; transform:scale(1.5); }
  }
  .pulse-dot { animation: pulseDot 1.8s ease-in-out infinite; }

  @keyframes shimmer {
    0%   { background-position: -500px 0; }
    100% { background-position:  500px 0; }
  }
  .shimmer {
    background: linear-gradient(90deg,#f0f0f0 25%,#e4e4e4 50%,#f0f0f0 75%);
    background-size: 1000px 100%;
    animation: shimmer 1.5s infinite;
    border-radius: 8px;
  }

  .grid-bg {
    background-image:
      linear-gradient(rgba(29,201,98,0.06) 1px, transparent 1px),
      linear-gradient(90deg, rgba(29,201,98,0.06) 1px, transparent 1px);
    background-size: 40px 40px;
  }

  .note-card  { transition: transform .22s cubic-bezier(.22,.68,0,1.2), box-shadow .22s ease; }
  .note-card:hover { transform: translateY(-4px) scale(1.01); box-shadow: 0 12px 32px rgba(29,201,98,.13),0 2px 8px rgba(0,0,0,.05); }

  .feat-card  { transition: transform .2s cubic-bezier(.22,.68,0,1.2), box-shadow .2s ease; }
  .feat-card:hover { transform: translateY(-5px); box-shadow: 0 16px 40px rgba(0,0,0,.09); }

  .how-card   { transition: transform .2s ease, box-shadow .2s ease; }
  .how-card:hover { transform: translateY(-3px); box-shadow: 0 10px 28px rgba(0,0,0,.08); }

  .testi-card { transition: transform .2s ease, box-shadow .2s ease; }
  .testi-card:hover { transform: translateY(-3px); box-shadow: 0 10px 32px rgba(0,0,0,.08); }

  .stat-card  { transition: transform .2s ease, box-shadow .2s ease; }
  .stat-card:hover { transform: translateY(-3px); box-shadow: 0 8px 24px rgba(0,0,0,.08); }

  .btn-press:active { transform: scale(0.96); }

  .search-wrap:focus-within {
    box-shadow: 0 0 0 3px rgba(29,201,98,.22), 0 6px 28px rgba(29,201,98,.12) !important;
  }

  .topic-pill { transition: background .15s, transform .15s; }
  .topic-pill:hover { background: rgba(255,255,255,0.95) !important; transform: translateY(-2px); }

  @keyframes modalPop {
    from { opacity:0; transform: scale(.90) translateY(16px); }
    to   { opacity:1; transform: scale(1) translateY(0); }
  }
  .modal-pop { animation: modalPop .3s cubic-bezier(.22,.68,0,1.2) both; }

  .lock-overlay {
    background: linear-gradient(to bottom, rgba(255,255,255,.12) 0%, rgba(255,255,255,.88) 36%, rgba(255,255,255,.98) 100%);
    backdrop-filter: blur(3px);
  }

  @keyframes bannerGlow {
    0%,100% { box-shadow: 0 0 0 0 rgba(253,184,128,0); }
    50%      { box-shadow: 0 0 0 8px rgba(253,184,128,.18); }
  }
  .banner-glow { animation: bannerGlow 2.6s ease-in-out infinite; }

  .nav-link { position: relative; }
  .nav-link::after {
    content:''; position:absolute; bottom:-5px; left:0; right:0; height:2px;
    background:#1dc962; border-radius:99px; transform:scaleX(0);
    transition:transform .2s ease;
  }
  .nav-link:hover::after { transform:scaleX(1); }
  .nav-active { font-weight:900 !important; color:#111 !important; }
  .nav-active::after { transform:scaleX(1) !important; }

  @keyframes spin { to { transform:rotate(360deg); } }
`;

/* ═══════════════════════════════════════════════
   DATA
═══════════════════════════════════════════════ */
const NOTES = [
  { id: 1, title: 'Data Structures & Algorithms – Complete Guide', subject: 'Computer Science', uploader: 'Arjun M.', tags: ['Medium', 'PDF'], color: 'green', badge: '🔥 Trending' },
  { id: 2, title: 'Organic Chemistry: Reaction Mechanisms', subject: 'Chemistry', uploader: 'Priya S.', tags: ['Easy', 'Handwritten'], color: 'teal', badge: '⭐ Popular' },
  { id: 3, title: 'Macroeconomics – Keynesian Theory', subject: 'Economics', uploader: 'Rohan K.', tags: ['Advanced', 'Notes'], color: 'green', badge: null },
  { id: 4, title: 'Calculus III – Multivariable Functions', subject: 'Mathematics', uploader: 'Sneha T.', tags: ['Advanced', 'PDF'], color: 'teal', badge: '🔥 Trending' },
  { id: 5, title: 'World History: Industrial Revolution', subject: 'History', uploader: 'Dev P.', tags: ['Easy', 'Notes'], color: 'green', badge: null },
  { id: 6, title: 'Machine Learning Fundamentals', subject: 'Computer Science', uploader: 'Aisha R.', tags: ['Medium', 'PDF'], color: 'teal', badge: '⭐ Popular' },
];
const FREE_LIMIT = 3;

const TAG_STYLES = {
  Easy: { bg: '#d4f4e2', color: '#065f46' },
  Medium: { bg: '#fef9c3', color: '#854d0e' },
  Advanced: { bg: '#fde8dc', color: '#9a3412' },
  PDF: { bg: '#dbeafe', color: '#1d4ed8' },
  Handwritten: { bg: '#ede9fe', color: '#5b21b6' },
  Notes: { bg: '#f3f4f6', color: '#374151' },
};

const STATS = [
  { value: '12k+', label: 'Notes shared', bg: C.lavender },
  { value: '98%', label: 'Students satisfied', bg: C.peach },
  { value: '<2min', label: 'Avg search time', bg: C.softMint },
  { value: '100%', label: 'Free to explore', bg: C.softYellow },
];

const HOW = [
  { n: '01', bg: C.lavender, title: 'Search instantly', desc: 'Find notes by subject, topic, or keyword across thousands of student-uploaded resources.', icon: 'search' },
  { n: '02', bg: C.peach, title: 'View 3 notes free', desc: 'No account needed. Preview your first three notes immediately — no strings attached.', icon: 'doc' },
  { n: '03', bg: C.softMint, title: 'Unlock everything', desc: 'Sign up free to access unlimited notes, AI assistant, study groups, and assessments.', icon: 'lock' },
];

const FEATURES = [
  { bg: C.lavender, icon: 'notes', title: 'Notes Sharing', desc: 'Upload and share notes with the entire community. Build karma, help others grow.' },
  { bg: C.peach, icon: 'groups', title: 'Study Groups', desc: 'Join or create study groups. Collaborate in real-time with peers on any topic.' },
  { bg: C.softMint, icon: 'ai', title: 'AI Assistant', desc: 'Instant AI answers, note summaries, and personalised study recommendations.' },
  { bg: C.softBlue, icon: 'assessment', title: 'Assessments', desc: 'Practice quizzes and assessments linked to your note topics and subjects.' },
];

const TESTIMONIALS = [
  { quote: 'Found the exact ML notes I needed 10 minutes before my exam. Absolute lifesaver.', name: 'Arjun M.', subj: 'Computer Science', bg: C.lavender },
  { quote: 'The AI assistant explained a concept I was stuck on for a week in under a minute.', name: 'Priya S.', subj: 'Chemistry', bg: C.peach },
  { quote: 'Sharing my notes and reading others helped me retain everything way better.', name: 'Rohan K.', subj: 'Economics', bg: C.softMint },
];

const TOPICS = ['Computer Science', 'Mathematics', 'Chemistry', 'Economics', 'History', 'Physics'];
const SUGGESTIONS = ['Machine Learning', 'Data Structures', 'Organic Chemistry', 'Calculus', 'Economics', 'World History'];

/* ═══════════════════════════════════════════════
   ICON COMPONENTS  (SVG stroked icons matching app style)
═══════════════════════════════════════════════ */
function Icon({ name, size = 22, color = C.green, strokeWidth = 1.8 }) {
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

/* Rounded icon badge for feature/how cards */
function IconBadge({ name, bg, iconColor, size = 48 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: 12, background: bg,
      display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 1px 4px rgba(0,0,0,.06)'
    }}>
      <Icon name={name} size={Math.round(size * 0.46)} color={iconColor} strokeWidth={2} />
    </div>
  );
}

/* ═══════════════════════════════════════════════
   HERO BG — identical to Academic AI page
═══════════════════════════════════════════════ */
function HeroBg({ children, id }) {
  return (
    <div id={id} className="relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg,#e8faf0 0%,#f0fdf8 40%,#fce7f3 75%,#ccfbf1 100%)' }}>
      <div className="ln-bg">
        <div className="ln-blob-teal" />
        <div className="ln-blob-pink" />
        <div className="ln-blob-sage" />
      </div>
      <div className="ln-grid" />
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
  const iconBg = note.color === 'teal' ? C.tealBg : C.mintBg;
  const iconColor = note.color === 'teal' ? C.teal : C.greenDark;
  return (
    <div className={`note-card fade-up fade-up-${Math.min(index + 1, 5)}`}
      style={{
        position: 'relative', borderRadius: 16, border: '1px solid #efefef', background: '#fff',
        padding: '18px 20px 20px', boxShadow: '0 2px 10px rgba(0,0,0,.05)',
        display: 'flex', flexDirection: 'column', gap: 12
      }}>

      {/* LOCK OVERLAY */}
      {locked && (
        <div className="lock-overlay" style={{
          position: 'absolute', inset: 0, zIndex: 10, borderRadius: 16,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 24
        }}>
          <div style={{
            width: 48, height: 48, borderRadius: 14, background: `linear-gradient(135deg,${C.lavender},${C.peach})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10, boxShadow: '0 4px 12px rgba(0,0,0,.12)'
          }}>
            <Icon name="lock" size={22} color="#7c3aed" strokeWidth={2.2} />
          </div>
          <p style={{ fontSize: 12, fontWeight: 800, color: '#374151', marginBottom: 4 }}>Free limit reached</p>
          <p style={{ fontSize: 11, color: '#9ca3af', marginBottom: 14 }}>Login to unlock full access</p>
          <button onClick={onLock} className="btn-press"
            style={{
              fontSize: 12, fontWeight: 700, padding: '8px 20px', borderRadius: 10, color: '#fff',
              background: `linear-gradient(135deg,${C.green},${C.teal})`, border: 'none', cursor: 'pointer'
            }}>
            Unlock Now →
          </button>
        </div>
      )}

      {/* BADGE ROW */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', minHeight: 22 }}>
        {note.badge ? (
          <span style={{
            fontSize: 10, fontWeight: 800, padding: '3px 10px', borderRadius: 99,
            background: note.badge.includes('🔥') ? C.pinkBg : C.softYellow,
            color: note.badge.includes('🔥') ? '#be185d' : '#854d0e'
          }}>
            {note.badge}
          </span>
        ) : <span />}
        {locked && (
          <span style={{
            fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 99,
            background: C.peach, color: '#c2410c', marginLeft: 'auto'
          }}>
            🔒 Locked
          </span>
        )}
      </div>

      {/* TITLE ROW */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
        <div style={{
          width: 44, height: 44, borderRadius: 12, background: iconBg, flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 1px 4px rgba(0,0,0,.06)'
        }}>
          <Icon name="doc" size={20} color={iconColor} strokeWidth={1.9} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{
            fontSize: 13, fontWeight: 800, color: '#111', lineHeight: 1.4, marginBottom: 3,
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden'
          }}>
            {note.title}
          </p>
          <p style={{ fontSize: 11, fontWeight: 600, color: C.muted }}>{note.subject}</p>
        </div>
      </div>

      {/* TAGS */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {note.tags.map(t => {
          const ts = TAG_STYLES[t] || { bg: '#f3f4f6', color: '#374151' };
          return (
            <span key={t} style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 99, background: ts.bg, color: ts.color }}>
              {t}
            </span>
          );
        })}
      </div>

      {/* FOOTER */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        paddingTop: 10, borderTop: '1px solid #f9fafb', marginTop: 'auto'
      }}>
        <span style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
          <Icon name="user" size={12} color="#9ca3af" strokeWidth={2} />
          {note.uploader}
        </span>
        {locked ? (
          <button onClick={onLock} className="btn-press"
            style={{
              fontSize: 11, fontWeight: 700, padding: '6px 12px', borderRadius: 10,
              background: C.peach, color: '#c2410c', border: 'none', cursor: 'pointer'
            }}>
            🔒 Unlock
          </button>
        ) : (
          <button onClick={() => onView(note)} className="btn-press"
            style={{
              fontSize: 11, fontWeight: 700, padding: '6px 12px', borderRadius: 10,
              background: C.softMint, color: C.greenDark, border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 5
            }}>
            <Icon name="eye" size={13} color={C.greenDark} strokeWidth={2} />
            View
          </button>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════ */
export default function Landing() {
  const [query, setQuery] = useState('');
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState(false);
  const [activeNav, setActiveNav] = useState('home');
  const resultsRef = useRef(null);

  /* localStorage freemium */
  const [viewedNotes, setViewedNotes] = useState(() => {
    try { return JSON.parse(localStorage.getItem('stunotes_viewed')) || []; }
    catch { return []; }
  });
  useEffect(() => {
    localStorage.setItem('stunotes_viewed', JSON.stringify(viewedNotes));
  }, [viewedNotes]);

  /* inject CSS once */
  useEffect(() => {
    const id = 'stunotes-landing-css';
    if (!document.getElementById(id)) {
      const el = document.createElement('style');
      el.id = id; el.textContent = GLOBAL_CSS;
      document.head.appendChild(el);
    }
  }, []);

  const scrollToSection = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setActiveNav(id);
  };

  const scrollToResults = () => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  const doSearch = (override) => {
    if (loading) return;
    if (override !== undefined) setQuery(override);
    setLoading(true);
    setTimeout(() => { setSearched(true); setLoading(false); setTimeout(scrollToResults, 80); }, 660);
  };

  const handleViewNote = (note) => {
    if (viewedNotes.includes(note.id)) return;
    if (viewedNotes.length >= FREE_LIMIT) { setModal(true); return; }
    setViewedNotes(prev => [...prev, note.id]);
  };

  const isLocked = (note, idx) => {
    if (viewedNotes.includes(note.id)) return false;
    return viewedNotes.length >= FREE_LIMIT || idx >= FREE_LIMIT;
  };

  const notes = searched
    ? NOTES.filter(n => !query
      || n.title.toLowerCase().includes(query.toLowerCase())
      || n.subject.toLowerCase().includes(query.toLowerCase()))
    : NOTES;

  const freeUsed = Math.min(viewedNotes.length, FREE_LIMIT);
  const freeLeft = FREE_LIMIT - freeUsed;

  /* ──────────── RENDER ──────────── */
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#fff', overflowX: 'hidden' }}>

      {/* ══════ HEADER ══════ */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 40, display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', padding: '12px 56px', borderBottom: '1px solid #f3f4f6',
        background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(14px)'
      }}>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10, background: `linear-gradient(135deg,${C.green},${C.teal})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(29,201,98,.25)'
          }}>
            <svg fill="white" height="17" viewBox="0 0 256 256" width="17">
              <path d="M88,96a8,8,0,0,1,8-8h64a8,8,0,0,1,0,16H96A8,8,0,0,1,88,96Zm8,40h64a8,8,0,0,0,0-16H96a8,8,0,0,0,0,16Zm32,16H96a8,8,0,0,0,0,16h32a8,8,0,0,0,0-16ZM224,48V156.69A15.86,15.86,0,0,1,219.31,168L168,219.31A15.86,15.86,0,0,1,156.69,224H48a16,16,0,0,1-16-16V48A16,16,0,0,1,48,32H208A16,16,0,0,1,224,48ZM48,208H152V160a8,8,0,0,1,8-8h48V48H48Zm120-40v28.7L196.69,168Z" />
            </svg>
          </div>
          <span style={{ fontSize: 17, fontWeight: 800, color: '#111', letterSpacing: '-0.3px' }}>StuNotes</span>
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
          <Link to="/contact" className="nav-link"
            style={{ fontSize: 14, fontWeight: 700, color: '#6b7280', textDecoration: 'none' }}>
            Contact
          </Link>
          <a href="/login" className="btn-press"
            style={{
              padding: '8px 22px', borderRadius: 99, fontSize: 14, fontWeight: 800, color: '#fff',
              background: `linear-gradient(135deg,${C.green},${C.teal})`, boxShadow: '0 2px 8px rgba(29,201,98,.28)',
              textDecoration: 'none', display: 'inline-block'
            }}>
            Login
          </a>
        </nav>
      </header>

      <main>

        {/* ══════ HERO ══════ */}
        <HeroBg id="home">
          <section style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            padding: '84px 24px 104px', textAlign: 'center'
          }}>

            {/* Monospace chip */}
            <div className="fade-up" style={{
              fontFamily: 'monospace', fontSize: 13, fontWeight: 800,
              padding: '7px 16px', borderRadius: 10, border: '1px solid rgba(29,201,98,.3)',
              background: 'rgba(255,255,255,.68)', color: C.greenDark, marginBottom: 20,
              letterSpacing: 2, display: 'inline-block'
            }}>
              [stu<span style={{ color: C.green }}>.</span>notes]
            </div>

            {/* Live pill */}
            <span className="fade-up fade-up-1 float-slow" style={{
              display: 'inline-flex', alignItems: 'center', gap: 7,
              borderRadius: 99, border: '1px solid rgba(29,201,98,.25)', padding: '7px 16px',
              fontSize: 12, fontWeight: 800, background: 'rgba(255,255,255,.65)', color: C.greenDark, marginBottom: 32
            }}>
              <span className="pulse-dot" style={{ width: 7, height: 7, borderRadius: '50%', background: C.green, display: 'inline-block' }} />
              Free to explore · No account needed
            </span>

            {/* Headline — exact match to Academic AI page style */}
            <h1 className="fade-up fade-up-2"
              style={{
                fontSize: 'clamp(36px,5.5vw,60px)', fontWeight: 900, lineHeight: 1.18,
                letterSpacing: '-1.5px', color: '#0a0a0a', maxWidth: 700, marginBottom: 18
              }}>
              for the{' '}
              <span style={{
                display: 'inline-block', background: C.pinkBg, color: C.pink,
                borderRadius: 12, padding: '1px 12px'
              }}>
                note-hungry,
              </span>
              <br />
              the{' '}
              <span style={{
                display: 'inline-block', background: C.tealBg, color: C.teal,
                borderRadius: 12, padding: '1px 12px'
              }}>
                exam-chasing
              </span>
              <br />
              and the{' '}
              <span style={{
                display: 'inline-block', background: C.mintBg, color: C.greenDark,
                borderRadius: 12, padding: '1px 12px'
              }}>
                concept-obsessed.
              </span>
            </h1>

            <p className="fade-up fade-up-3" style={{
              fontSize: 16, color: '#6b7280', maxWidth: 520,
              marginBottom: 36, lineHeight: 1.7, fontWeight: 500
            }}>
              Discover, share, and master academic notes — built by students, for students.
              Search anything. Study smarter.
            </p>

            {/* SEARCH BAR */}
            <div className="fade-up fade-up-4" style={{ width: '100%', maxWidth: 580 }}>
              <div className="search-wrap" style={{
                display: 'flex', alignItems: 'center', gap: 8,
                background: '#fff', border: '1.5px solid #e5e7eb', borderRadius: 16,
                padding: '10px 10px 10px 16px',
                boxShadow: '0 4px 24px rgba(29,201,98,.10)', transition: 'box-shadow .2s'
              }}>
                {loading ? (
                  <svg style={{ width: 20, height: 20, flexShrink: 0, animation: 'spin 1s linear infinite', color: C.green }}
                    fill="none" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2.5" opacity=".25" />
                    <path fill="currentColor" opacity=".75" d="M4 12a8 8 0 018-8v3l3.5-3.5L12 0v3A9 9 0 003 12h1z" />
                  </svg>
                ) : (
                  <Icon name="search" size={20} color="#9ca3af" strokeWidth={2} />
                )}
                <input type="text" value={query}
                  onChange={e => setQuery(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && doSearch()}
                  placeholder="Search notes by subject, topic, or keyword…"
                  style={{
                    flex: 1, border: 'none', outline: 'none', fontSize: 14, color: '#374151',
                    fontFamily: 'Nunito,sans-serif', fontWeight: 600, background: 'transparent', padding: '4px 0'
                  }} />
                <button onClick={() => doSearch()} disabled={loading} className="btn-press"
                  style={{
                    padding: '9px 24px', borderRadius: 12, fontSize: 14, fontWeight: 800,
                    color: '#fff', background: `linear-gradient(135deg,${C.green},${C.teal})`,
                    border: 'none', cursor: 'pointer', flexShrink: 0, opacity: loading ? .6 : 1, transition: 'opacity .2s'
                  }}>
                  {loading ? 'Searching…' : 'Search'}
                </button>
              </div>

              <p style={{ fontSize: 11, color: '#9ca3af', marginTop: 10, fontWeight: 600 }}>
                💡 Try:{' '}
                <span style={{ color: C.teal, cursor: 'pointer', textDecoration: 'underline' }} onClick={() => doSearch('Machine Learning')}>Machine Learning</span>,{' '}
                <span style={{ color: C.pink, cursor: 'pointer', textDecoration: 'underline' }} onClick={() => doSearch('Chemistry')}>Chemistry</span>,{' '}
                <span style={{ color: C.greenDark, cursor: 'pointer', textDecoration: 'underline' }} onClick={() => doSearch('Calculus')}>Calculus</span>
              </p>

              {/* Topic pills */}
              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 8, marginTop: 14 }}>
                {TOPICS.map(t => (
                  <button key={t} onClick={() => doSearch(t)} className="topic-pill"
                    style={{
                      borderRadius: 99, border: '1px solid rgba(29,201,98,.28)', padding: '6px 14px',
                      fontSize: 12, fontWeight: 800, color: C.greenDark,
                      background: 'rgba(255,255,255,.65)', cursor: 'pointer'
                    }}>
                    {t}
                  </button>
                ))}
              </div>

              {/* Free counter bars */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 18 }}>
                <div style={{ display: 'flex', gap: 5 }}>
                  {[0, 1, 2].map(i => (
                    <div key={i} style={{
                      width: 28, height: 7, borderRadius: 99,
                      background: i < freeLeft ? C.green : '#e5e7eb', transition: 'background .3s'
                    }} />
                  ))}
                </div>
                <p style={{ fontSize: 12, fontWeight: 700, color: '#9ca3af' }}>
                  <span style={{ color: C.green, fontWeight: 800 }}>{freeLeft} free note{freeLeft !== 1 ? 's' : ''}</span> remaining
                </p>
              </div>
            </div>

            {/* Social proof */}
            <div className="fade-up fade-up-5" style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 32 }}>
              <div style={{ display: 'flex' }}>
                {[C.pinkBg, C.tealBg, C.lavender, C.softMint].map((bg, i) => (
                  <div key={i} style={{
                    width: 32, height: 32, borderRadius: '50%', border: '2.5px solid #fff',
                    background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 12, fontWeight: 800, color: '#374151', marginLeft: i ? -9 : 0, boxShadow: '0 1px 4px rgba(0,0,0,.1)'
                  }}>
                    {['A', 'P', 'R', 'S'][i]}
                  </div>
                ))}
              </div>
              <p style={{ fontSize: 12, color: '#6b7280', fontWeight: 600 }}>
                <span style={{ fontWeight: 900, color: '#111' }}>2,400+</span> students already studying smarter
              </p>
            </div>
          </section>
        </HeroBg>

        {/* ══════ STATS BAND ══════ */}
        <section style={{ background: '#fff', padding: '28px 24px 44px' }}>
          <div style={{
            maxWidth: 920, margin: '0 auto',
            display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16
          }}>
            {STATS.map(s => (
              <div key={s.value} className="stat-card" style={{
                borderRadius: 16, padding: '24px 16px',
                background: s.bg, border: '1px solid rgba(255,255,255,.8)', boxShadow: '0 2px 8px rgba(0,0,0,.04)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5
              }}>
                <span style={{ fontSize: 28, fontWeight: 900, color: '#111', letterSpacing: '-1px' }}>{s.value}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#6b7280', textAlign: 'center' }}>{s.label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ══════ BROWSE / RESULTS ══════ */}
        <section id="results" ref={resultsRef} className="grid-bg" style={{ background: '#fafafa', padding: '52px 24px' }}>
          <div style={{ maxWidth: 1140, margin: '0 auto' }}>

            {/* Header */}
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
              marginBottom: 28, flexWrap: 'wrap', gap: 12
            }}>
              <div>
                <h2 style={{ fontSize: 22, fontWeight: 800, color: '#111', letterSpacing: '-0.5px', marginBottom: 8 }}>
                  {searched ? `Results for "${query || 'all notes'}"` : 'Browse Popular Notes'}
                </h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ display: 'flex', gap: 5 }}>
                    {[0, 1, 2].map(i => (
                      <div key={i} style={{
                        width: 26, height: 7, borderRadius: 99,
                        background: i < freeLeft ? C.green : '#e5e7eb', transition: 'background .3s'
                      }} />
                    ))}
                  </div>
                  <p style={{ fontSize: 12, fontWeight: 700, color: '#6b7280' }}>
                    <span style={{ color: C.green, fontWeight: 800 }}>{freeLeft} free notes</span> remaining · Sign up to unlock all
                  </p>
                </div>
              </div>
              {searched && (
                <button onClick={() => { setQuery(''); setSearched(false); }}
                  style={{
                    fontSize: 12, fontWeight: 700, color: C.muted, textDecoration: 'underline',
                    background: 'none', border: 'none', cursor: 'pointer'
                  }}>
                  ✕ Clear search
                </button>
              )}
            </div>

            {/* Skeletons */}
            {loading && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 18 }}>
                {[1, 2, 3, 4, 5, 6].map(i => <SkeletonCard key={i} />)}
              </div>
            )}

            {/* Empty state */}
            {!loading && notes.length === 0 && (
              <div style={{ textAlign: 'center', padding: '60px 0' }}>
                <p style={{ fontSize: 48, marginBottom: 16 }}>📭</p>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: '#374151', marginBottom: 8 }}>No notes found</h3>
                <p style={{ fontSize: 14, color: '#9ca3af', marginBottom: 20 }}>Try a different keyword:</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 8 }}>
                  {SUGGESTIONS.map(s => (
                    <button key={s} onClick={() => doSearch(s)} className="topic-pill"
                      style={{
                        borderRadius: 99, padding: '7px 14px', fontSize: 12, fontWeight: 700,
                        background: C.lavender, color: '#5b21b6', border: 'none', cursor: 'pointer'
                      }}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Cards grid */}
            {!loading && notes.length > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 18 }}>
                {notes.map((note, idx) => (
                  <NoteCard key={note.id} note={note} index={idx}
                    locked={isLocked(note, idx)}
                    onLock={() => setModal(true)}
                    onView={handleViewNote} />
                ))}
              </div>
            )}

            {/* Freemium banner */}
            {!loading && (
              <div className="banner-glow" style={{
                marginTop: 32, display: 'flex', alignItems: 'center', gap: 16,
                borderRadius: 16, border: '1px solid #fcd5b7', padding: '18px 24px',
                background: C.peach, flexWrap: 'wrap'
              }}>
                <div className="float-slow" style={{ fontSize: 22 }}>🔒</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3, flexWrap: 'wrap' }}>
                    <p style={{ fontSize: 14, fontWeight: 800, color: '#111' }}>
                      Free limit: {freeUsed}/{FREE_LIMIT} notes viewed
                    </p>
                    {freeUsed >= FREE_LIMIT && (
                      <span style={{
                        fontSize: 10, fontWeight: 700, padding: '2px 9px', borderRadius: 99,
                        background: '#fde68a', color: '#854d0e'
                      }}>Limit reached</span>
                    )}
                  </div>
                  <p style={{ fontSize: 12, color: '#6b7280' }}>Unlock unlimited access — signing up is completely free, forever.</p>
                </div>
                <a href="/register" className="btn-press"
                  style={{
                    padding: '10px 24px', borderRadius: 14, fontSize: 13, fontWeight: 800, color: '#fff',
                    background: `linear-gradient(135deg,${C.green},${C.teal})`, textDecoration: 'none',
                    display: 'inline-block', whiteSpace: 'nowrap', flexShrink: 0
                  }}>
                  Sign Up Free →
                </a>
              </div>
            )}
          </div>
        </section>

        {/* ══════ HOW IT WORKS ══════ */}
        <section id="how-it-works" style={{ background: '#fff', padding: '72px 24px' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 52 }}>
              <p style={{
                fontSize: 11, fontWeight: 800, textTransform: 'uppercase',
                letterSpacing: 3, color: C.green, marginBottom: 10
              }}>
                Simple Process
              </p>
              <h2 style={{ fontSize: 34, fontWeight: 900, color: '#111', letterSpacing: '-1px', marginBottom: 10 }}>
                How It Works
              </h2>
              <p style={{ fontSize: 14, color: '#9ca3af', fontWeight: 600, maxWidth: 480, margin: '0 auto', lineHeight: 1.7 }}>
                Three steps from zero to fully prepared — no friction, no paywalls to start.
              </p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20 }}>
              {HOW.map(s => (
                <div key={s.n} className="how-card" style={{
                  position: 'relative', borderRadius: 20, padding: '28px 28px 32px',
                  background: s.bg, border: '1px solid rgba(255,255,255,.7)', boxShadow: '0 2px 8px rgba(0,0,0,.04)',
                  display: 'flex', flexDirection: 'column', gap: 14
                }}>
                  <span style={{
                    position: 'absolute', top: 18, right: 22, fontSize: 52, fontWeight: 900,
                    color: 'rgba(0,0,0,.07)', lineHeight: 1, userSelect: 'none'
                  }}>
                    {s.n}
                  </span>
                  <IconBadge name={s.icon} bg="#fff" iconColor={C.teal} size={48} />
                  <h3 style={{ fontSize: 15, fontWeight: 800, color: '#111' }}>{s.title}</h3>
                  <p style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.7, fontWeight: 600 }}>{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════ FEATURES ══════ */}
        <section id="features" className="grid-bg" style={{ background: '#fafafa', padding: '72px 24px' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 52 }}>
              <p style={{
                fontSize: 11, fontWeight: 800, textTransform: 'uppercase',
                letterSpacing: 3, color: C.green, marginBottom: 10
              }}>
                Everything You Need
              </p>
              <h2 style={{ fontSize: 34, fontWeight: 900, color: '#111', letterSpacing: '-1px', marginBottom: 10 }}>
                Key Features
              </h2>
              <p style={{ fontSize: 14, color: '#9ca3af', fontWeight: 600, maxWidth: 480, margin: '0 auto', lineHeight: 1.7 }}>
                A comprehensive suite of tools to enhance your entire learning journey.
              </p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 18 }}>
              {FEATURES.map(f => {
                const iconMeta = {
                  notes: { bg: '#f3f4f6', color: '#6b7280' },
                  groups: { bg: C.peach, color: '#5b21b6' },
                  ai: { bg: C.tealBg, color: C.teal },
                  assessment: { bg: C.mintBg, color: C.green },
                };
                const meta = iconMeta[f.icon];
                return (
                  <div key={f.title} className="feat-card" style={{
                    borderRadius: 20, padding: '28px 24px',
                    background: f.bg, border: '1px solid rgba(255,255,255,.7)', boxShadow: '0 2px 8px rgba(0,0,0,.04)',
                    display: 'flex', flexDirection: 'column', gap: 14
                  }}>
                    <IconBadge name={f.icon} bg={meta.bg} iconColor={meta.color} size={50} />
                    <h3 style={{ fontSize: 14, fontWeight: 800, color: '#111' }}>{f.title}</h3>
                    <p style={{ fontSize: 12, color: '#6b7280', lineHeight: 1.7, fontWeight: 600 }}>{f.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ══════ TESTIMONIALS ══════ */}
        <section style={{ background: '#fff', padding: '72px 24px' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 48 }}>
              <p style={{
                fontSize: 11, fontWeight: 800, textTransform: 'uppercase',
                letterSpacing: 3, color: C.green, marginBottom: 10
              }}>
                Student Voices
              </p>
              <h2 style={{ fontSize: 32, fontWeight: 900, color: '#111', letterSpacing: '-0.8px', marginBottom: 8 }}>
                What students say
              </h2>
              <p style={{ fontSize: 13, color: '#9ca3af', fontWeight: 600 }}>
                Real feedback from students using StuNotes every day.
              </p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 18 }}>
              {TESTIMONIALS.map(t => (
                <div key={t.name} className="testi-card" style={{
                  borderRadius: 20, padding: '28px 24px',
                  background: t.bg, border: '1px solid rgba(255,255,255,.7)', boxShadow: '0 2px 8px rgba(0,0,0,.04)',
                  display: 'flex', flexDirection: 'column', gap: 12
                }}>
                  <span style={{
                    fontSize: 40, fontWeight: 900, lineHeight: 1,
                    color: 'rgba(0,0,0,.09)', marginBottom: -4
                  }}>"</span>
                  <p style={{
                    fontSize: 13, color: '#374151', lineHeight: 1.7,
                    fontWeight: 600, marginTop: -8
                  }}>{t.quote}</p>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 10, marginTop: 'auto',
                    paddingTop: 12, borderTop: '1px solid rgba(255,255,255,.7)'
                  }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: '50%', background: '#fff',
                      boxShadow: '0 1px 4px rgba(0,0,0,.08)', display: 'flex', alignItems: 'center',
                      justifyContent: 'center', fontSize: 12, fontWeight: 800, color: '#374151'
                    }}>
                      {t.name[0]}
                    </div>
                    <div>
                      <p style={{ fontSize: 12, fontWeight: 800, color: '#111' }}>{t.name}</p>
                      <p style={{ fontSize: 11, fontWeight: 600, color: '#9ca3af' }}>{t.subj}</p>
                    </div>
                    <div style={{ marginLeft: 'auto', color: '#facc15', fontSize: 13, letterSpacing: 1 }}>★★★★★</div>
                  </div>
                </div>
              ))}
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
              fontSize: 'clamp(28px,4vw,48px)', fontWeight: 900, color: '#111', letterSpacing: '-1.2px',
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
            <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
              <a href="/register" className="btn-press"
                style={{
                  padding: '13px 32px', borderRadius: 14, fontSize: 14, fontWeight: 800, color: '#fff',
                  background: `linear-gradient(135deg,${C.green},${C.teal})`,
                  boxShadow: '0 4px 16px rgba(29,201,98,.3)', textDecoration: 'none', display: 'inline-block'
                }}>
                Get Started Free →
              </a>
              <a href="/login" className="btn-press"
                style={{
                  padding: '13px 32px', borderRadius: 14, fontSize: 14, fontWeight: 800, color: C.green,
                  border: `2px solid ${C.green}`, textDecoration: 'none', display: 'inline-block'
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
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 9,
              background: `linear-gradient(135deg,${C.green},${C.teal})`,
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <svg fill="white" height="14" viewBox="0 0 256 256" width="14">
                <path d="M88,96a8,8,0,0,1,8-8h64a8,8,0,0,1,0,16H96A8,8,0,0,1,88,96Zm8,40h64a8,8,0,0,0,0-16H96a8,8,0,0,0,0,16Zm32,16H96a8,8,0,0,0,0,16h32a8,8,0,0,0,0-16ZM224,48V156.69A15.86,15.86,0,0,1,219.31,168L168,219.31A15.86,15.86,0,0,1,156.69,224H48a16,16,0,0,1-16-16V48A16,16,0,0,1,48,32H208A16,16,0,0,1,224,48ZM48,208H152V160a8,8,0,0,1,8-8h48V48H48Zm120-40v28.7L196.69,168Z" />
              </svg>
            </div>
            <span style={{ fontSize: 14, fontWeight: 800, color: '#111' }}>StuNotes</span>
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

      {modal && <LockModal onClose={() => setModal(false)} />}
    </div>
  );
}