import React from 'react';
import Icon from '../../../shared/components/Icon';
import { C } from '../../../shared/theme';

const FREE_LIMIT = 10;

export default function LockModal({ onClose, freeUsed = 3 }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)',
      backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex',
      alignItems: 'center', justifyContent: 'center', padding: 20,
      animation: 'fadeIn 0.3s ease'
    }}>
      <div className="scale-up" style={{
        background: '#fff', borderRadius: 32, width: '100%', maxWidth: 440,
        padding: '40px 32px', textAlign: 'center', position: 'relative',
        boxShadow: '0 20px 50px rgba(0,0,0,0.2)'
      }}>
        <div style={{
          width: 64, height: 64, borderRadius: '50%', background: C.lavender,
          display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px'
        }}>
          <Icon name="lock" size={28} color="#7c3aed" strokeWidth={2.2} />
        </div>
        <h3 style={{ fontSize: 18, fontWeight: 800, color: '#111', marginBottom: 8 }}>Free limit reached</h3>
        <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 6, lineHeight: 1.6 }}>
          You've previewed <strong style={{ color: '#374151' }}>{freeUsed} of {FREE_LIMIT}</strong> free notes.
        </p>
        <p style={{ fontSize: 11, color: '#9ca3af', marginBottom: 20, lineHeight: 1.6 }}>
          Create a free account to unlock unlimited notes, AI assistance, study groups, and assessments.
        </p>
        <div style={{ height: 6, borderRadius: 99, background: C.lavender, marginBottom: 20, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: '100%', borderRadius: 99, background: `linear-gradient(90deg,${C.pink},${C.teal})` }} />
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <a href="/login" className="btn-press" style={{
            flex: 1, padding: '11px 0', borderRadius: 14, fontWeight: 700,
            fontSize: 13, color: '#fff', textAlign: 'center', background: `linear-gradient(135deg,${C.pink},${C.teal})`,
            textDecoration: 'none', display: 'block'
          }}>
            Login
          </a>
          <a href="/register" className="btn-press" style={{
            flex: 1, padding: '11px 0', borderRadius: 14, fontWeight: 700,
            fontSize: 13, color: C.pink, textAlign: 'center', border: `2px solid ${C.pink}`,
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
