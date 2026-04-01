import React, { useState, useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { FaRobot, FaBook, FaClipboardList, FaUsers, FaChartPie, FaSignOutAlt, FaCalendarAlt, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import logo from "../assets/generated-image.png";
import { signOut } from "firebase/auth";
import { auth } from "../services/firebase";
import { useUser } from "./UserContext";

/* ─── design tokens matching landing page ─── */
const T = {
    teal: "#0d9488",
    tealLight: "rgba(126,200,200,0.18)",
    green: "#1dc962",
    pink: "#ec4899",
    pinkLight: "rgba(249,168,201,0.16)",
    dark: "#0f172a",
    muted: "#64748b",
    border: "rgba(226,232,240,1)",
    glass: "rgba(255,255,255,0.82)",
    glassHover: "rgba(255,255,255,0.96)",
};

/* ─── floating blobs background shared across the whole app ─── */
function AppBackground() {
    return (
        <div style={{
            position: "fixed", inset: 0, zIndex: 0, overflow: "hidden",
            pointerEvents: "none",
            background: "linear-gradient(135deg,#e8faf0 0%,#f0fdf8 40%,#fce7f3 75%,#ccfbf1 100%)"
        }}>
            {/* grid */}
            <div style={{
                position: "absolute", inset: 0,
                backgroundImage: "linear-gradient(rgba(126,200,200,0.14) 1px,transparent 1px),linear-gradient(90deg,rgba(126,200,200,0.14) 1px,transparent 1px)",
                backgroundSize: "40px 40px"
            }} />
            {/* blobs */}
            <div className="sn-bg__blob-teal" />
            <div className="sn-bg__blob-pink" />
            <div className="sn-bg__blob-sage" />
        </div>
    );
}

/* ─── sidebar ─── */
const menuItems = [
    { id: "dashboard",   label: "Dashboard",    icon: <FaChartPie />,     path: "/dashboard" },
    { id: "calendar",    label: "Calendar",     icon: <FaCalendarAlt />,  path: "/calendar" },
    { id: "notes",       label: "My Notes",     icon: <FaBook />,         path: "/view" },
    { id: "assessments", label: "Assessments",  icon: <FaClipboardList />,path: "/assessments" },
    { id: "groups",      label: "Study Groups", icon: <FaUsers />,        path: "/groups" },
    { id: "academic-ai", label: "Academic AI",  icon: <FaRobot />,        path: "/academic-ai" },
];

const Sidebar = ({ active, setActive, onLogout, navigate, collapsed, setCollapsed }) => {

    return (
        <div style={{
            position: "fixed",
            top: 16,
            left: 16,
            height: "calc(100vh - 32px)",
            flexShrink: 0,
            width: collapsed ? 72 : 268,
            transition: "width 0.3s cubic-bezier(.22,1,.36,1)",
            zIndex: 50,
        }}>
        {/* collapse toggle — rendered OUTSIDE the aside so it's never clipped */}
        <button
            onClick={() => setCollapsed(!collapsed)}
            title={collapsed ? "Expand" : "Collapse"}
            style={{
                position: "absolute", top: 20, right: -13,
                width: 26, height: 26, borderRadius: "50%",
                background: "#fff",
                border: `1.5px solid ${T.border}`,
                boxShadow: "0 2px 10px rgba(0,0,0,0.14)",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", zIndex: 60,
                color: T.muted,
                transition: "color .2s, box-shadow .2s",
                padding: 0,
            }}
            onMouseEnter={e => { e.currentTarget.style.color = T.teal; e.currentTarget.style.boxShadow = `0 2px 14px rgba(13,148,136,0.22)`; }}
            onMouseLeave={e => { e.currentTarget.style.color = T.muted; e.currentTarget.style.boxShadow = "0 2px 10px rgba(0,0,0,0.14)"; }}
        >
            {collapsed ? <FaChevronRight size={10} /> : <FaChevronLeft size={10} />}
        </button>
        <aside style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            borderRadius: 24,
            background: T.glass,
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            border: `1px solid ${T.border}`,
            boxShadow: "0 10px 40px rgba(0,0,0,0.06), 0 1px 0 rgba(255,255,255,0.7) inset",
            padding: "24px 14px",
            overflow: "hidden",
            justifyContent: "space-between",
        }}>

            <div>
                {/* ── Logo ── */}
                <div style={{
                    display: "flex", alignItems: "center", gap: 12,
                    paddingLeft: collapsed ? 0 : 10, marginBottom: 36,
                    justifyContent: collapsed ? "center" : "flex-start",
                }}>
                    <div style={{
                        width: 40, height: 40, borderRadius: 12, overflow: "hidden",
                        flexShrink: 0, boxShadow: "0 6px 16px rgba(13,148,136,0.18)",
                        background: "#fff", padding: 2, border: "1px solid rgba(13,148,136,0.12)",
                    }}>
                        <img src={logo} alt="StuNotes" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 10 }} />
                    </div>
                    {!collapsed && (
                        <span style={{
                            fontSize: 19, fontWeight: 900, color: T.dark,
                            letterSpacing: "-0.8px", whiteSpace: "nowrap",
                            fontFamily: "'Plus Jakarta Sans', sans-serif",
                        }}>
                            Stu<span style={{ color: T.teal }}>Notes</span>
                        </span>
                    )}
                </div>

                {/* ── Navigation ── */}
                <nav style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {menuItems.map((item) => {
                        const isActive = active === item.id;
                        return (
                            <button
                                key={item.id}
                                onClick={() => { setActive(item.id); navigate(item.path); }}
                                title={collapsed ? item.label : ""}
                                style={{
                                    width: "100%",
                                    display: "flex", alignItems: "center",
                                    gap: 12,
                                    padding: "10px 14px",
                                    height: 48,
                                    borderRadius: 14,
                                    border: "none",
                                    cursor: "pointer",
                                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                                    fontSize: 15,
                                    fontWeight: 700,
                                    justifyContent: collapsed ? "center" : "flex-start",
                                    background: isActive
                                        ? "linear-gradient(135deg,rgba(13,148,136,0.10),rgba(13,148,136,0.04))"
                                        : "transparent",
                                    color: isActive ? T.teal : T.muted,
                                    boxShadow: isActive ? "0 4px 14px rgba(13,148,136,0.08)" : "none",
                                    transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                                    position: "relative",
                                    overflow: "hidden",
                                }}
                                onMouseEnter={e => {
                                    if (!isActive) {
                                        e.currentTarget.style.background = "rgba(126,200,200,0.10)";
                                        e.currentTarget.style.color = T.teal;
                                    }
                                }}
                                onMouseLeave={e => {
                                    if (!isActive) {
                                        e.currentTarget.style.background = "transparent";
                                        e.currentTarget.style.color = T.muted;
                                    }
                                }}
                            >
                                {isActive && (
                                    <div style={{
                                        position: "absolute", left: 0, top: "25%", bottom: "25%",
                                        width: 3, background: T.teal, borderRadius: 2
                                    }} />
                                )}
                                <span style={{ fontSize: 18, flexShrink: 0, opacity: isActive ? 1 : 0.8 }}>{item.icon}</span>
                                {!collapsed && <span style={{ opacity: isActive ? 1 : 0.9 }}>{item.label}</span>}
                            </button>
                        );
                    })}
                </nav>
            </div>

            {/* ── Footer / Logout ── */}
            <div style={{ padding: "0 2px" }}>
                <button
                    onClick={onLogout}
                    title={collapsed ? "Logout" : ""}
                    style={{
                        display: "flex", alignItems: "center", gap: 12,
                        padding: "12px 14px",
                        borderRadius: 16,
                        border: "1px solid transparent",
                        cursor: "pointer",
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                        fontSize: 14,
                        fontWeight: 800,
                        justifyContent: collapsed ? "center" : "flex-start",
                        background: collapsed ? "transparent" : "rgba(239, 68, 68, 0.05)",
                        color: "#ef4444",
                        transition: "all 0.2s ease",
                        width: "100%",
                        boxShadow: "none",
                    }}
                    onMouseEnter={e => { 
                        e.currentTarget.style.background = "rgba(239, 68, 68, 0.12)";
                        e.currentTarget.style.borderColor = "rgba(239, 68, 68, 0.15)";
                        e.currentTarget.style.transform = "translateY(-1px)";
                    }}
                    onMouseLeave={e => { 
                        e.currentTarget.style.background = collapsed ? "transparent" : "rgba(239, 68, 68, 0.05)";
                        e.currentTarget.style.borderColor = "transparent";
                        e.currentTarget.style.transform = "none";
                    }}
                >
                    <FaSignOutAlt style={{ fontSize: 18, flexShrink: 0 }} />
                    {!collapsed && <span>Sign Out</span>}
                </button>
            </div>
        </aside>
        </div>
    );
};

/* ─── layout ─── */
export default function Layout() {
    const [collapsed, setCollapsed] = useState(false);
    const [activeTab, setActiveTab] = useState("dashboard");
    const { user, loading, refreshUser } = useUser();
    const navigate = useNavigate();
    const location = useLocation();
    
    // Streak logic
    const [streak, setStreak] = useState(0);

    useEffect(() => {
        if (!user) return;
        const today = new Date().toLocaleDateString("en-CA"); // YYYY-MM-DD
        let storedData;
        try {
            storedData = JSON.parse(localStorage.getItem(`stu_streak_${user.uid}`)) || { count: 0, lastLogin: "" };
        } catch {
            storedData = { count: 0, lastLogin: "" };
        }

        const lastLogin = storedData.lastLogin;
        
        if (lastLogin !== today) {
            let newStreak = storedData.count;
            if (lastLogin) {
                // Check if last login was exactly yesterday
                const yesterday = new Date(Date.now() - 86400000).toLocaleDateString("en-CA");
                if (lastLogin === yesterday) {
                    newStreak += 1;
                } else {
                    newStreak = 1; // Streak broken
                }
            } else {
                newStreak = 1; // First ever login tracker
            }
            
            const updatedData = { count: newStreak, lastLogin: today };
            localStorage.setItem(`stu_streak_${user.uid}`, JSON.stringify(updatedData));
            setStreak(newStreak);
        } else {
            setStreak(storedData.count);
        }
    }, [user]);

    useEffect(() => {
        const path = location.pathname;
        if (path.includes("/dashboard"))   setActiveTab("dashboard");
        else if (path.includes("/calendar"))    setActiveTab("calendar");
        else if (path.includes("/view"))        setActiveTab("notes");
        else if (path.includes("/assessments")) setActiveTab("assessments");
        else if (path.includes("/groups"))      setActiveTab("groups");
        else if (path.includes("/academic-ai")) setActiveTab("academic-ai");
        else setActiveTab("dashboard");
    }, [location]);

    useEffect(() => {
        if (!loading && !user) {
            if (location.pathname !== "/" && !location.pathname.startsWith("/login") && !location.pathname.startsWith("/register")) {
                navigate("/login");
            }
        }
    }, [user, loading, navigate, location.pathname]);

    const handleLogout = async () => {
        await signOut(auth);
        localStorage.removeItem("user");
        navigate("/login");
    };

    if (loading) {
        return (
            <div style={{
                minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
                background: "linear-gradient(135deg,#e8faf0 0%,#f0fdf8 40%,#fce7f3 75%,#ccfbf1 100%)",
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontWeight: 800, color: T.teal, fontSize: 18
            }}>
                Loading…
            </div>
        );
    }

    return (
        <div style={{ display: "flex", minHeight: "100vh", position: "relative" }}>
            <AppBackground />

            {/* sidebar */}
            <Sidebar
                active={activeTab}
                setActive={setActiveTab}
                onLogout={handleLogout}
                navigate={navigate}
                collapsed={collapsed}
                setCollapsed={setCollapsed}
            />

            {/* main content, native scrolling */}
            <div style={{
                flex: 1,
                marginLeft: collapsed ? 88 : 284, // sidebar width (72|268) + 16px gap
                transition: "margin-left 0.3s cubic-bezier(.22,1,.36,1)",
                display: "flex",
                flexDirection: "column",
                minWidth: 0,
                minHeight: "100vh",
                position: "relative",
            }}>
                <Outlet context={{ user, refreshUser, streak }} />
            </div>
        </div>
    );
}
