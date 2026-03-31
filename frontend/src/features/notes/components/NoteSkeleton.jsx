import React from 'react';

export default function NoteSkeleton() {
  return (
    <div style={{
      height: 320, borderRadius: 28, background: '#fff', border: '1px solid rgba(0,0,0,0.03)',
      padding: 28, display: 'flex', flexDirection: 'column', gap: 18, position: 'relative', overflow: 'hidden'
    }}>
      <div className="skeleton" style={{ width: 52, height: 52, borderRadius: 16 }} />
      <div style={{ flex: 1 }}>
        <div className="skeleton" style={{ width: '80%', height: 18, borderRadius: 4, marginBottom: 10 }} />
        <div className="skeleton" style={{ width: '40%', height: 12, borderRadius: 4 }} />
      </div>
      <div style={{ display: 'flex', gap: 6 }}>
        <div className="skeleton" style={{ width: 60, height: 20, borderRadius: 10 }} />
        <div className="skeleton" style={{ width: 80, height: 20, borderRadius: 10 }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 18, borderTop: '1px solid #f8fafc' }}>
        <div className="skeleton" style={{ width: 100, height: 12, borderRadius: 4 }} />
        <div className="skeleton" style={{ width: 70, height: 32, borderRadius: 16 }} />
      </div>
    </div>
  );
}
