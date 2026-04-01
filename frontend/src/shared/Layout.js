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

const Sidebar = ({ active, setActive, onLogout, navigate }) => {
    const [collapsed, setCollapsed] = useState(false);

    return (
        <div style={{
            position: "sticky",
            top: 16,
            height: "calc(100vh - 32px)",
            flexShrink: 0,
            margin: "16px 0 16px 16px",
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
            justifyContent: "space-between",
            borderRadius: 24,
            background: T.glass,
            backdropFilter: "blur(18px)",
            WebkitBackdropFilter: "blur(18px)",
            border: `1px solid ${T.border}`,
            boxShadow: "0 8px 32px rgba(0,0,0,0.08), 0 1px 0 rgba(255,255,255,0.6) inset",
            padding: "20px 12px",
            overflow: "hidden",
        }}>



            <div>
                {/* logo */}
                <div style={{
                    display: "flex", alignItems: "center", gap: 10,
                    paddingLeft: collapsed ? 4 : 8, marginBottom: 28,
                    justifyContent: collapsed ? "center" : "flex-start",
                    overflow: "hidden",
                }}>
                    <div style={{
                        width: 36, height: 36, borderRadius: 10, overflow: "hidden",
                        flexShrink: 0, boxShadow: "0 4px 12px rgba(29,201,98,0.20)",
                    }}>
                        <img src={logo} alt="StuNotes" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    </div>
                    {!collapsed && (
                        <span style={{
                            fontSize: 17, fontWeight: 900, color: T.dark,
                            letterSpacing: "-0.5px", whiteSpace: "nowrap",
                            fontFamily: "'Nunito', 'Plus Jakarta Sans', sans-serif",
                        }}>
                            Stu<span style={{ color: T.green }}>Notes</span>
                        </span>
                    )}
                </div>

                {/* menu */}
                <nav style={{ display: "flex", flexDirection: "column", gap: 4 }}>
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
                                    gap: 10,
                                    padding: "10px 12px",
                                    borderRadius: 14,
                                    border: "none",
                                    cursor: "pointer",
                                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                                    fontSize: 13,
                                    fontWeight: 700,
                                    justifyContent: collapsed ? "center" : "flex-start",
                                    background: isActive
                                        ? "linear-gradient(135deg,rgba(13,148,136,0.14),rgba(29,201,98,0.10))"
                                        : "transparent",
                                    color: isActive ? T.teal : T.muted,
                                    borderLeft: isActive ? `3px solid ${T.teal}` : "3px solid transparent",
                                    transition: "all 0.18s cubic-bezier(.22,1,.36,1)",
                                    boxShadow: isActive ? "0 2px 10px rgba(13,148,136,0.10)" : "none",
                                    whiteSpace: "nowrap",
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
                                <span style={{ fontSize: 15, flexShrink: 0 }}>{item.icon}</span>
                                {!collapsed && <span>{item.label}</span>}
                            </button>
                        );
                    })}
                </nav>
            </div>

            {/* logout */}
            <button
                onClick={onLogout}
                title={collapsed ? "Logout" : ""}
                style={{
                    display: "flex", alignItems: "center", gap: 10,
                    padding: "10px 12px",
                    borderRadius: 14,
                    border: "none",
                    cursor: "pointer",
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontSize: 13,
                    fontWeight: 700,
                    justifyContent: collapsed ? "center" : "flex-start",
                    background: "transparent",
                    color: "#ef4444",
                    transition: "all 0.18s",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    width: "100%",
                }}
                onMouseEnter={e => { e.currentTarget.style.background = "#fef2f2"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
            >
                <FaSignOutAlt style={{ fontSize: 15, flexShrink: 0 }} />
                {!collapsed && <span>Logout</span>}
            </button>
        </aside>
        </div>
    );
};

/* ─── layout ─── */
export default function Layout() {
    const [activeTab, setActiveTab] = useState("dashboard");
    const { user, loading, refreshUser } = useUser();
    const navigate = useNavigate();
    const location = useLocation();

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
            />

            {/* main content */}
            <div style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                minWidth: 0,
                height: "100vh",
                overflowY: "auto",
                position: "relative",
                zIndex: 1,
            }}>
                <Outlet context={{ user, refreshUser }} />
            </div>
        </div>
    );
}
