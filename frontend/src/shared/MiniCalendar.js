import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaChevronRight } from 'react-icons/fa';

/* ── standard design tokens ── */
const T = {
    teal:       "#0d9488",
    tealSoft:   "rgba(126,200,200,0.18)",
    tealDeep:   "#1a7a7a",
    green:      "#1dc962",
    pink:       "#ec4899",
    pinkSoft:   "rgba(249,168,201,0.15)",
    dark:       "#0f172a",
    muted:      "#64748b",
    glass:      "rgba(255,255,255,0.82)",
    glassHover: "rgba(255,255,255,0.96)",
    border:     "#e2e8f0",
};

export default function MiniCalendar() {
    const navigate = useNavigate();
    const today = new Date();
    const currentDay = today.getDate();
    const monthName = today.toLocaleString('default', { month: 'long' });
    const year = today.getFullYear();

    // Get number of days in current month
    const daysInMonth = new Date(year, today.getMonth() + 1, 0).getDate();
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    // Mock events for the demo/UI
    const events = {
        [Math.min(currentDay + 2, daysInMonth)]: 'study',
        [Math.min(currentDay + 5, daysInMonth)]: 'exam',
        [Math.min(currentDay - 3, daysInMonth)]: 'study',
    };

    return (
        <div style={{
            background: T.glass, backdropFilter: "blur(20px)",
            padding: "20px", borderRadius: 24, border: `1px solid ${T.border}`,
            boxShadow: "0 8px 32px rgba(0,0,0,0.04)",
            fontFamily: "'Plus Jakarta Sans', sans-serif"
        }}>
            <div style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                marginBottom: 20
            }}>
                <h3 style={{ fontSize: 16, fontWeight: 900, color: T.dark, letterSpacing: "-0.5px" }}>
                    {monthName} {year}
                </h3>
                <button
                    onClick={() => navigate('/calendar')}
                    style={{
                        width: 32, height: 32, borderRadius: "50%",
                        background: "rgba(255,255,255,0.6)", border: `1.5px solid ${T.border}`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        cursor: "pointer", color: T.muted, transition: "all 0.2s"
                    }}
                    onMouseEnter={e => { e.currentTarget.style.color = T.teal; e.currentTarget.style.background = "#fff"; }}
                    onMouseLeave={e => { e.currentTarget.style.color = T.muted; e.currentTarget.style.background = "rgba(255,255,255,0.6)"; }}
                >
                    <FaChevronRight size={10} />
                </button>
            </div>

            <div style={{
                display: "grid", gridTemplateColumns: "repeat(7, 1fr)",
                gap: 4, marginBottom: 8, textAlign: "center"
            }}>
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => (
                    <span key={d} style={{ fontSize: 11, fontWeight: 800, color: T.muted }}>{d}</span>
                ))}
            </div>

            <div style={{
                display: "grid", gridTemplateColumns: "repeat(7, 1fr)",
                gap: 4
            }}>
                {days.map(day => {
                    const isToday = day === currentDay;
                    const eventType = events[day];
                    
                    return (
                        <div
                            key={day}
                            onClick={() => navigate('/calendar')}
                            style={{
                                aspectRatio: "1/1", borderRadius: 12,
                                display: "flex", flexDirection: "column",
                                alignItems: "center", justifyContent: "center",
                                fontSize: 13, fontWeight: isToday ? 900 : 700,
                                cursor: "pointer", transition: "all 0.2s",
                                position: "relative",
                                background: isToday ? T.dark : "transparent",
                                color: isToday ? "#fff" : T.dark,
                                border: isToday ? "none" : "1px solid transparent",
                                boxShadow: isToday ? "0 4px 12px rgba(0,0,0,0.15)" : "none"
                            }}
                            onMouseEnter={e => { if(!isToday) e.currentTarget.style.background = "rgba(13,148,136,0.08)"; }}
                            onMouseLeave={e => { if(!isToday) e.currentTarget.style.background = "transparent"; }}
                        >
                            {day}
                            {eventType && (
                                <div style={{
                                    position: "absolute", bottom: 4, left: "50%",
                                    transform: "translateX(-50%)", width: 4, height: 4,
                                    borderRadius: "50%",
                                    background: eventType === 'exam' ? T.green : T.teal
                                }} />
                            )}
                        </div>
                    );
                })}
            </div>

            <div style={{
                display: "flex", gap: 12, marginTop: 20,
                justifyContent: "center", borderTop: `1.5px solid ${T.border}`,
                paddingTop: 16
            }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, fontWeight: 700, color: T.muted }}>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: T.green }}></span> Exam
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, fontWeight: 700, color: T.muted }}>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: T.teal }}></span> Study
                </div>
            </div>
        </div>
    );
}
