import React from 'react';

export default function Icon({ name, size = 22, color = '#6b7280', strokeWidth = 1.8 }) {
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
    case 'download': return <svg width={size} height={size} viewBox="0 0 24 24" {...s}><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>;
    default: return null;
  }
}
