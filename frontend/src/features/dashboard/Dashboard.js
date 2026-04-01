import React, { useEffect, useState, useRef } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import {
    FaSearch, FaBell, FaFire, FaFilePdf, FaCalendarAlt,
    FaClipboardList, FaChevronRight, FaBook
} from "react-icons/fa";
import MiniCalendar from "../../shared/MiniCalendar";
import api from "../../services/api";
import { useNotes } from "../notes/NoteContext";

/* ── design tokens (identical to Landing / AcademicAI) ── */
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
    lavender:   "#ede9fe",
    peach:      "#fde8dc",
    mint:       "#d1fae5",
    sky:        "#dbeafe",
};

/* ── helper: open a note file directly in a new tab ── */
const openFile = (note) => {
    if (!note?.fileUrl) return;

    const url  = note.fileUrl;
    const mime = (note.fileType || "").toLowerCase();
    // Derive extension from URL path (before any query string)
    const ext  = url.split("?")[0].split(".").pop().toLowerCase();

    const isOffice = ["doc","docx","ppt","pptx","xls","xlsx"].includes(ext)
        || mime.includes("word") || mime.includes("presentation")
        || mime.includes("sheet") || mime.includes("excel");

    const isPdf = ext === "pdf" || mime.includes("pdf");

    if (isOffice) {
        // Microsoft Online Viewer — opens properly in a new tab
        window.open(
            `https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(url)}`,
            "_blank"
        );
    } else if (isPdf) {
        // Open the raw PDF URL — browser opens it natively in a new tab
        window.open(url, "_blank");
    } else {
        // Images, text, etc. — open directly
        window.open(url, "_blank");
    }
};

/* ── avatar ── */
const Avatar = ({ user }) => {
    const [err, setErr] = useState(false);
    useEffect(() => { setErr(false); }, [user?.profilePicture]);

    if (!user?.profilePicture || err) {
        return (
            <div style={{
                width: "100%", height: "100%",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontWeight: 900, fontSize: 16,
                background: "linear-gradient(135deg,rgba(13,148,136,0.15),rgba(29,201,98,0.10))",
                color: T.teal,
            }}>
                {user?.name?.[0]?.toUpperCase() || "U"}
            </div>
        );
    }
    return (
        <img src={user.profilePicture} alt="Profile" onError={() => setErr(true)}
            style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }} />
    );
};

/* ── header ── */
const Header = ({ user }) => {
    const [showNotifs, setShowNotifs] = useState(false);
    const navigate = useNavigate();
    const hour = new Date().getHours();
    const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

    return (
        <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            marginBottom: 32, flexWrap: "wrap", gap: 16,
        }}>
            {/* left */}
            <div>
                <div style={{
                    display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 12px",
                    borderRadius: 99, background: T.tealSoft, marginBottom: 10,
                    border: "1px solid rgba(126,200,200,0.3)",
                }}>
                    <span style={{ width: 7, height: 7, borderRadius: "50%", background: T.green,
                        boxShadow: "0 0 0 2px rgba(29,201,98,0.3)", display: "inline-block" }} />
                    <span style={{ fontSize: 11, fontWeight: 800, color: T.tealDeep,
                        textTransform: "uppercase", letterSpacing: "0.8px" }}>
                        Student Dashboard
                    </span>
                </div>
                <h1 style={{
                    fontSize: "clamp(22px,3vw,30px)", fontWeight: 900, color: T.dark,
                    letterSpacing: "-0.8px", lineHeight: 1.25, marginBottom: 4,
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                }}>
                    {greeting},{" "}
                    <span style={{
                        background: `linear-gradient(135deg, ${T.green}, ${T.teal})`,
                        WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                    }}>
                        {user?.name?.split(" ")[0] || "Student"}
                    </span>
                    !
                </h1>
                <p style={{ color: T.muted, fontSize: 14, fontWeight: 600 }}>
                    Let's make progress today. Your notes await. 📚
                </p>
            </div>

            {/* right */}
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>

                {/* notifications */}
                <div style={{ position: "relative" }}>
                    <button onClick={() => setShowNotifs(!showNotifs)} style={{
                        width: 44, height: 44, borderRadius: 14,
                        background: T.glass, border: `1.5px solid ${T.border}`,
                        backdropFilter: "blur(12px)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        cursor: "pointer", position: "relative", color: T.muted,
                        boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
                        transition: "all .2s",
                    }}
                        onMouseEnter={e => { e.currentTarget.style.color = T.teal; e.currentTarget.style.borderColor = T.teal; }}
                        onMouseLeave={e => { e.currentTarget.style.color = T.muted; e.currentTarget.style.borderColor = T.border; }}
                    >
                        <FaBell size={16} />
                        <span style={{
                            position: "absolute", top: 9, right: 9, width: 7, height: 7,
                            borderRadius: "50%", background: "#ef4444",
                            border: "1.5px solid #fff",
                        }} />
                    </button>

                    {showNotifs && (
                        <div style={{
                            position: "absolute", right: 0, top: "calc(100% + 8px)",
                            width: 260, borderRadius: 18, zIndex: 50,
                            background: T.glassHover, backdropFilter: "blur(18px)",
                            border: `1.5px solid ${T.border}`,
                            boxShadow: "0 20px 60px rgba(0,0,0,0.12)",
                            padding: 18,
                            animation: "fadeUp 0.2s ease",
                        }}>
                            <p style={{ fontWeight: 800, fontSize: 13, color: T.dark, marginBottom: 8 }}>Notifications</p>
                            <p style={{ fontSize: 12, color: T.muted }}>No new notifications</p>
                        </div>
                    )}
                </div>

                {/* avatar */}
                <div onClick={() => navigate("/profile")} style={{
                    width: 44, height: 44, borderRadius: "50%",
                    border: `1.5px solid ${T.border}`,
                    background: T.glass, backdropFilter: "blur(12px)",
                    cursor: "pointer", overflow: "hidden",
                    boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
                    transition: "transform .2s, box-shadow .2s",
                }}
                    onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.07)"; e.currentTarget.style.boxShadow = `0 4px 18px rgba(13,148,136,0.20)`; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.boxShadow = "0 2px 10px rgba(0,0,0,0.08)"; }}
                    title="View profile"
                >
                    <Avatar user={user} />
                </div>
            </div>
        </div>
    );
};

/* ── glassmorphic search bar ── */
const SearchBar = ({ notes }) => {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const [show, setShow] = useState(false);
    const [focused, setFocused] = useState(false);
    const navigate = useNavigate();
    const ref = useRef(null);

    useEffect(() => {
        const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setShow(false); };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    useEffect(() => {
        if (!query.trim()) { setResults([]); return; }
        
        // 1. Find matches in user's personal notes (fast, client-side)
        const localMatches = notes.filter(n => 
            n.title?.toLowerCase().includes(query.toLowerCase()) || 
            n.subject?.toLowerCase().includes(query.toLowerCase())
        ).slice(0, 3);
        
        // Show local matches immediately
        setResults(localMatches);

        // 2. Fetch global public notes (debounced)
        const timeoutId = setTimeout(() => {
            api.get(`/notes/public`, { params: { query: query.trim(), limit: 4 } })
                .then(res => {
                    const publicMatches = res.data.notes || [];
                    // Merge, avoiding duplicates
                    const merged = [...localMatches];
                    const localIds = new Set(localMatches.map(n => n._id || n.id));
                    
                    for (const pub of publicMatches) {
                        if (!localIds.has(pub._id || pub.id)) {
                            merged.push(pub);
                        }
                    }
                    setResults(merged.slice(0, 6)); // cap at 6 total
                })
                .catch(console.error);
        }, 250); 
        
        setShow(true);
        return () => clearTimeout(timeoutId);
    }, [query, notes]);

    return (
        <div ref={ref} style={{ position: "relative", marginBottom: 28 }}>
            <div style={{
                display: "flex", alignItems: "center", gap: 12,
                borderRadius: 18, padding: "10px 10px 10px 20px",
                background: focused ? "#fff" : T.glass,
                backdropFilter: "blur(18px)",
                border: `1.5px solid ${focused ? T.teal : T.border}`,
                boxShadow: focused
                    ? `0 8px 32px rgba(0,0,0,0.08), 0 0 0 4px rgba(13,148,136,0.12)`
                    : "0 4px 20px rgba(0,0,0,0.05)",
                transition: "all 0.3s cubic-bezier(.22,1,.36,1)",
            }}>

                <input
                    type="text"
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    onKeyDown={e => {
                        if (e.key === "Enter" && query.trim()) {
                            navigate(`/view?q=${encodeURIComponent(query.trim())}`);
                            setShow(false);
                        }
                    }}
                    placeholder="Search your notes…"
                    style={{
                        flex: 1, border: "none", outline: "none",
                        fontSize: 15, fontWeight: 600, color: T.dark,
                        background: "transparent", fontFamily: "inherit",
                    }}
                />
                <button
                    onClick={() => { if (query.trim()) { navigate(`/view?q=${encodeURIComponent(query.trim())}`); setShow(false); } }}
                    style={{
                        width: 40, height: 40, borderRadius: 12, border: "none",
                        background: query.trim()
                            ? `linear-gradient(135deg, ${T.green}, ${T.teal})`
                            : "#f1f5f9",
                        color: query.trim() ? "#fff" : "#94a3b8",
                        cursor: "pointer",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        transition: "all .3s",
                        boxShadow: query.trim() ? "0 4px 14px rgba(13,148,136,0.30)" : "none",
                    }}
                >
                    <FaSearch size={13} />
                </button>
            </div>

            {show && results.length > 0 && (
                <div style={{
                    position: "absolute", width: "100%", top: "calc(100% + 8px)",
                    borderRadius: 16, zIndex: 100,
                    background: T.glassHover, backdropFilter: "blur(18px)",
                    border: `1.5px solid ${T.border}`,
                    boxShadow: "0 16px 48px rgba(0,0,0,0.10)",
                    overflow: "hidden",
                }}>
                    {results.map((note) => (
                        <div key={note._id} onClick={() => { openFile(note); setShow(false); }}
                            style={{
                                padding: "12px 18px", cursor: "pointer",
                                display: "flex", alignItems: "center", gap: 10,
                                borderBottom: `1px solid ${T.border}`,
                                transition: "background .15s",
                            }}
                            onMouseEnter={e => { e.currentTarget.style.background = "rgba(126,200,200,0.10)"; }}
                            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
                        >
                            <FaFilePdf style={{ color: T.teal, fontSize: 13, flexShrink: 0 }} />
                            <span style={{ fontSize: 13, fontWeight: 700, color: T.dark }}>{note.title}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

/* ── study streak banner ── */
const StudyStreak = ({ streak }) => (
    <div style={{
        borderRadius: 20, padding: "20px 24px", marginBottom: 24,
        background: "linear-gradient(135deg,#ff6b35 0%,#ec4899 60%,#a855f7 100%)",
        boxShadow: "0 8px 32px rgba(236,72,153,0.25)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        position: "relative", overflow: "hidden",
    }}>
        <div style={{ position: "relative", zIndex: 1 }}>
            <p style={{ fontSize: 11, fontWeight: 800, color: "rgba(255,255,255,0.75)", letterSpacing: "1px", textTransform: "uppercase", marginBottom: 4 }}>
                Study Streak
            </p>
            <h3 style={{ fontSize: 24, fontWeight: 900, color: "#fff", letterSpacing: "-0.5px" }}>
                {streak} Day{streak !== 1 ? "s" : ""} 🔥
            </h3>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.80)", fontWeight: 600, marginTop: 2 }}>
                Keep the momentum going!
            </p>
        </div>
        <FaFire style={{ fontSize: 44, color: "rgba(255,255,255,0.25)", position: "relative", zIndex: 1 }} />
    </div>
);

/* ── note card ── */
const NOTE_BKGS = [
    "linear-gradient(135deg,#fff5f5 0%,#fff0f6 100%)",
    "linear-gradient(135deg,#f0fdfa 0%,#f0fdf4 100%)",
    "linear-gradient(135deg,#f5f3ff 0%,#eff6ff 100%)",
    "linear-gradient(135deg,#fffbeb 0%,#fff7ed 100%)",
];

const NoteCard = ({ note, index }) => {
    const [hov, setHov] = useState(false);

    return (
        <div
            onClick={() => openFile(note)}
            onMouseEnter={() => setHov(true)}
            onMouseLeave={() => setHov(false)}
            style={{
                borderRadius: 18, padding: "16px", cursor: "pointer",
                background: NOTE_BKGS[index % NOTE_BKGS.length],
                border: `1.5px solid ${hov ? "rgba(13,148,136,0.20)" : "rgba(0,0,0,0.05)"}`,
                boxShadow: hov ? "0 12px 32px rgba(0,0,0,0.09)" : "0 2px 8px rgba(0,0,0,0.04)",
                transform: hov ? "translateY(-4px) rotate(0.3deg)" : "none",
                transition: "all 0.3s cubic-bezier(.22,1,.36,1)",
                display: "flex", flexDirection: "column", gap: 10,
            }}
        >
            <div style={{
                width: 38, height: 38, borderRadius: 12,
                background: "rgba(255,255,255,0.7)",
                border: "1px solid rgba(0,0,0,0.05)",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: T.teal,
            }}>
                <FaFilePdf size={16} />
            </div>
            <div>
                <p style={{
                    fontSize: 13, fontWeight: 800, color: T.dark, lineHeight: 1.4,
                    marginBottom: 4, display: "-webkit-box",
                    WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
                }}>
                    {note.title}
                </p>
                <p style={{ fontSize: 11, color: T.muted, fontWeight: 700 }}>
                    {new Date(note.createdAt).toLocaleDateString()}
                </p>
            </div>
        </div>
    );
};

/* ── assessment card ── */
const AssessmentCard = ({ item }) => (
    <div style={{
        display: "flex", gap: 12, alignItems: "flex-start",
        padding: "14px 0",
        borderBottom: `1px solid ${T.border}`,
    }}>
        <div style={{
            width: 36, height: 36, borderRadius: 12, flexShrink: 0,
            background: "linear-gradient(135deg,rgba(13,148,136,0.12),rgba(29,201,98,0.08))",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: T.teal, fontWeight: 900, fontSize: 13,
        }}>
            A
        </div>
        <div style={{ minWidth: 0 }}>
            <p style={{ fontSize: 13, fontWeight: 800, color: T.dark,
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {item.title}
            </p>
            <p style={{ fontSize: 11, color: T.muted, fontWeight: 600, marginTop: 2 }}>{item.type}</p>
        </div>
    </div>
);

const StatChip = ({ icon, label, value, bg, color }) => (
    <div className="dash-stat-card" style={{
        borderRadius: 22, padding: "20px 22px", flex: 1, minWidth: 140,
        background: bg, border: "1px solid rgba(255,255,255,0.5)",
        boxShadow: "0 4px 16px rgba(0,0,0,0.03)",
        display: "flex", flexDirection: "column", gap: 16,
        position: "relative", overflow: "hidden", cursor: "pointer",
        transition: "all 0.35s cubic-bezier(0.25, 1, 0.5, 1)",
    }}>
        {/* Soft decorative background blob inside the card */}
        <div style={{
            position: "absolute", top: -15, right: -15,
            width: 70, height: 70, borderRadius: "50%",
            background: color, opacity: 0.08, zIndex: 0,
            transition: "transform 0.3s ease"
        }} />

        {/* Icon Floating Box */}
        <div style={{ position: "relative", zIndex: 1, display: "flex", justifyContent: "space-between" }}>
            <div style={{
                color: color, background: "rgba(255,255,255,0.75)",
                width: 42, height: 42, borderRadius: 14,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 18, boxShadow: "0 2px 8px rgba(0,0,0,0.04)"
            }}>
                {icon}
            </div>
        </div>

        {/* Metrics */}
        <div style={{ position: "relative", zIndex: 1 }}>
            <p style={{ fontSize: 28, fontWeight: 900, color: T.dark, letterSpacing: "-1px", lineHeight: 1 }}>
                {value}
            </p>
            <p style={{ fontSize: 11, fontWeight: 800, color: T.muted, textTransform: "uppercase", letterSpacing: "1px", marginTop: 6, opacity: 0.85 }}>
                {label}
            </p>
        </div>
    </div>
);

/* ── section title ── */
const SectionTitle = ({ title, route, routeLabel = "View All" }) => {
    const navigate = useNavigate();
    return (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h2 style={{ fontSize: 16, fontWeight: 900, color: T.dark, letterSpacing: "-0.3px" }}>{title}</h2>
            {route && (
                <button onClick={() => navigate(route)} style={{
                    display: "flex", alignItems: "center", gap: 4,
                    fontSize: 12, fontWeight: 800, color: T.teal,
                    background: "none", border: "none", cursor: "pointer",
                    padding: "4px 10px", borderRadius: 8,
                    transition: "background .15s",
                }}
                    onMouseEnter={e => { e.currentTarget.style.background = T.tealSoft; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "none"; }}
                >
                    {routeLabel} <FaChevronRight size={9} />
                </button>
            )}
        </div>
    );
};

/* ── right panel ── */
const RightPanel = ({ assessments }) => (
    <aside style={{
        width: 320, flexShrink: 0,
        padding: "0 16px 24px 0",
        display: "none",  // hidden on smaller screens — controlled via CSS below
        flexDirection: "column",
        gap: 16,
        position: "sticky", top: "24px",
        height: "calc(100vh - 48px)",
        overflowY: "auto",
        alignSelf: "flex-start",
    }}
        className="dashboard-right-panel"
    >
        {/* mini calendar */}
        <div style={{
            borderRadius: 20, overflow: "hidden",
            background: T.glass, backdropFilter: "blur(16px)",
            border: `1.5px solid ${T.border}`,
            boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
        }}>
            <MiniCalendar />
        </div>

        {/* assessments */}
        <div style={{
            borderRadius: 20, padding: "20px",
            background: T.glass, backdropFilter: "blur(16px)",
            border: `1.5px solid ${T.border}`,
            boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
        }}>
            <SectionTitle title="Upcoming Assessments" route="/assessments" />
            {assessments.length > 0 ? (
                assessments.map(a => <AssessmentCard key={a._id} item={a} />)
            ) : (
                <div style={{
                    padding: "24px 0", textAlign: "center",
                    color: T.muted, fontSize: 13, fontWeight: 600,
                }}>
                    <FaClipboardList style={{ fontSize: 28, opacity: 0.3, marginBottom: 8, display: "block", margin: "0 auto 8px" }} />
                    No upcoming assessments
                </div>
            )}
        </div>
    </aside>
);

/* ══════════════════════════════════════
   MAIN DASHBOARD
══════════════════════════════════════ */
export default function Dashboard() {
    const { user, streak } = useOutletContext();
    const { notes } = useNotes();
    const [assessments, setAssessments] = useState([]);       // top-2 for panel
    const [totalAssessments, setTotalAssessments] = useState(0); // real count

    useEffect(() => {
        api.get("/assessments")
            .then(res => {
                const sorted = (res.data || []).sort((a, b) =>
                    new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
                );
                setTotalAssessments(sorted.length);   // ← real total
                setAssessments(sorted.slice(0, 2));   // ← only show 2 in panel
            })
            .catch(console.error);
    }, []);

    const recentNotes = notes.slice(0, 4);

    return (
        <>
            {/* inline CSS for the right panel responsive show + animations */}
            <style>{`
                html { height: auto; overflow-x: hidden; }
                body { min-height: 100vh; overflow-x: hidden; }
                @media (min-width:1100px) {
                    .dashboard-right-panel { display: flex !important; }
                }
                @keyframes fadeUp {
                    from { opacity:0; transform:translateY(14px); }
                    to   { opacity:1; transform:translateY(0); }
                }
                .dash-fadein { animation: fadeUp 0.45s cubic-bezier(.22,.68,0,1.2) both; }
                .dash-stat-card:hover { transform: translateY(-6px); box-shadow: 0 14px 28px rgba(0,0,0,0.06) !important; }
                .dash-stat-card:hover div[style*="border-radius: 50%"] { transform: scale(1.4); }
            `}</style>

            <div style={{ 
                display: "grid", 
                gridTemplateColumns: "1fr auto",
                minHeight: "100vh", 
                position: "relative" 
            }}>

                {/* ── MAIN ── */}
                <main className="dash-fadein" style={{
                    padding: "28px 24px 40px",
                    maxWidth: 900,
                    minWidth: 0,
                }}>

                    <Header user={user} />

                    <SearchBar notes={notes} />

                    {/* streak + stat chips */}
                    <StudyStreak streak={streak || 0} />

                    {/* quick stat row */}
                    <div style={{ display: "flex", gap: 12, marginBottom: 28, flexWrap: "wrap" }}>
                        <StatChip
                            icon={<FaBook />} label="My Notes"
                            value={notes.length} bg={T.lavender} color="#7c3aed"
                        />
                    <StatChip
                            icon={<FaClipboardList />} label="Assessments"
                            value={totalAssessments} bg={T.peach} color="#ea580c"
                        />
                        <StatChip
                            icon={<FaCalendarAlt />} label="Today"
                            value={new Date().toLocaleDateString("en-US", { weekday: "short" })}
                            bg={T.mint} color={T.tealDeep}
                        />
                    </div>

                    {/* recent notes */}
                    <div style={{
                        borderRadius: 20, padding: "22px",
                        background: T.glass, backdropFilter: "blur(16px)",
                        border: `1.5px solid ${T.border}`,
                        boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
                        marginBottom: 20,
                    }}>
                        <SectionTitle title="My Uploaded Notes" route="/view" />
                        {recentNotes.length > 0 ? (
                            <div style={{
                                display: "grid",
                                gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
                                gap: 12,
                            }}>
                                {recentNotes.map((note, i) => (
                                    <NoteCard key={note._id} note={note} index={i} />
                                ))}
                            </div>
                        ) : (
                            <div style={{
                                padding: "32px 0", textAlign: "center",
                                color: T.muted, fontSize: 13, fontWeight: 600,
                            }}>
                                <FaBook style={{ fontSize: 32, opacity: 0.25, display: "block", margin: "0 auto 10px" }} />
                                No notes uploaded yet.{" "}
                                <span
                                    style={{ color: T.teal, cursor: "pointer", fontWeight: 800 }}
                                >
                                    Upload your first note →
                                </span>
                            </div>
                        )}
                    </div>

                </main>

                {/* ── RIGHT PANEL ── */}
                <RightPanel assessments={assessments} />

            </div>
        </>
    );
}