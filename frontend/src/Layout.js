import React, { useState, useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { FaRobot } from "react-icons/fa";

import {
    FaBook,
    FaClipboardList,
    FaUsers,
    FaChartPie,
    FaSignOutAlt,
    FaCalendarAlt,
    FaChevronLeft,
    FaChevronRight,
} from "react-icons/fa";

import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "./firebase";

/* ================= SIDEBAR ================= */

const Sidebar = ({ active, setActive, onLogout, navigate }) => {
    const [collapsed, setCollapsed] = useState(false);

    const menuItems = [
        { id: "dashboard", label: "Dashboard", icon: <FaChartPie />, path: "/dashboard" },
        { id: "calendar", label: "Calendar", icon: <FaCalendarAlt />, path: "/calendar" },
        { id: "notes", label: "My Notes", icon: <FaBook />, path: "/view" },
        { id: "assessments", label: "Assessments", icon: <FaClipboardList />, path: "/assessments" },
        { id: "groups", label: "Study Groups", icon: <FaUsers />, path: "/groups" },
        { id: "academic-ai", label: "Academic AI", icon: <FaRobot />, path: "/academic-ai" },

    ];

    return (
        <aside
            className={`${collapsed ? "w-24" : "w-72"}
      flex-shrink-0 flex flex-col justify-between p-4 m-4 rounded-3xl
      bg-white shadow-xl border hidden lg:flex sticky top-4
      h-[calc(100vh-2rem)] transition-all duration-300 relative`}
        >
            {/* Collapse Button */}
            <button
                onClick={() => setCollapsed(!collapsed)}
                className="absolute -right-3 top-10 bg-white p-1.5 rounded-full shadow-md text-gray-400 hover:text-[#1dc962] border transition"
            >
                {collapsed ? <FaChevronRight size={12} /> : <FaChevronLeft size={12} />}
            </button>

            {/* Logo */}
            <div>
                <div className={`flex items-center gap-3 px-2 mb-10 ${collapsed ? "justify-center" : ""}`}>
                    <img src="/generated-image.png" alt="Logo" className="w-10 h-10" />

                    {!collapsed && (
                        <span className="text-2xl font-bold text-gray-800">
                            StuNotes
                        </span>
                    )}
                </div>

                {/* Menu */}
                <nav className="space-y-2">

                    {menuItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => {
                                setActive(item.id);
                                navigate(item.path);
                            }}
                            className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl font-medium transition
                ${active === item.id
                                    ? "bg-black text-white"
                                    : "text-gray-500 hover:bg-green-50 hover:text-[#1dc962]"
                                }
                ${collapsed ? "justify-center" : ""}
              `}
                        >
                            <span className="text-xl">{item.icon}</span>

                            {!collapsed && <span>{item.label}</span>}
                        </button>
                    ))}

                </nav>
            </div>

            {/* Logout */}
            <button
                onClick={onLogout}
                className={`flex items-center gap-4 px-4 py-3 text-red-500 hover:bg-red-50 rounded-2xl font-medium transition
        ${collapsed ? "justify-center" : ""}`}
            >
                <FaSignOutAlt className="text-lg" />

                {!collapsed && <span>Logout</span>}
            </button>
        </aside>
    );
};

/* ================= LAYOUT ================= */

export default function Layout() {
    const [activeTab, setActiveTab] = useState("dashboard");
    const [user, setUser] = useState(null);

    const navigate = useNavigate();
    const location = useLocation();

    /* ===== SYNC ACTIVE TAB ===== */

    useEffect(() => {
        const path = location.pathname;

        if (path.includes("/dashboard")) setActiveTab("dashboard");
        else if (path.includes("/calendar")) setActiveTab("calendar");
        else if (path.includes("/view")) setActiveTab("notes");
        else if (path.includes("/assessments")) setActiveTab("assessments");
        else if (path.includes("/groups")) setActiveTab("groups");
        else if (path.includes("/academic-ai")) setActiveTab("academic-ai");

        else setActiveTab("dashboard");
    }, [location]);

    /* ===== FIREBASE AUTH CHECK ===== */

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, (currentUser) => {

            if (!currentUser) {
                navigate("/login");
            } else {
                setUser(currentUser);
            }

        });

        return () => unsub();
    }, [navigate]);

    /* ===== LOGOUT ===== */

    const handleLogout = async () => {
        await signOut(auth);

        localStorage.removeItem("user");

        setUser(null);

        navigate("/login");
    };

    return (
        <div className="flex min-h-screen bg-gradient-to-br from-[#1dc962]/40 via-[#1dc962]/20 to-gray-200 text-gray-800">

            {/* Sidebar */}
            <Sidebar
                active={activeTab}
                setActive={setActiveTab}
                onLogout={handleLogout}
                navigate={navigate}
            />

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
                <Outlet context={{ user }} />
            </div>

        </div>
    );
}