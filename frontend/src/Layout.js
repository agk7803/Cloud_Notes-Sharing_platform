import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { FaBook, FaClipboardList, FaUsers, FaChartPie, FaSignOutAlt, FaCalendarAlt, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { auth } from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';

const Sidebar = ({ active, setActive, onLogout, navigate }) => {
    const [collapsed, setCollapsed] = useState(false);
    const menuItems = [
        { id: "dashboard", label: "Dashboard", icon: <FaChartPie />, path: "/dashboard" },
        { id: "calendar", label: "Calendar", icon: <FaCalendarAlt />, path: "/calendar" },
        { id: "notes", label: "My Notes", icon: <FaBook />, path: "/view" },
        { id: "assessments", label: "Assessments", icon: <FaClipboardList />, path: "/assessments" },
        { id: "groups", label: "Study Groups", icon: <FaUsers />, path: "/groups" },
    ];

    return (
        <aside className={`${collapsed ? 'w-24' : 'w-72'} flex-shrink-0 flex flex-col justify-between p-4 m-4 ml-4 rounded-3xl bg-white/60 backdrop-blur-xl shadow-xl border border-white/50 hidden lg:flex sticky top-4 h-[calc(100vh-2rem)] transition-all duration-300 relative`}>

            <button
                onClick={() => setCollapsed(!collapsed)}
                className="absolute -right-3 top-10 bg-white p-1.5 rounded-full shadow-md text-gray-400 hover:text-purple-600 border border-gray-100 transition-colors z-50"
            >
                {collapsed ? <FaChevronRight size={12} /> : <FaChevronLeft size={12} />}
            </button>

            <div>
                <div className={`flex items-center gap-3 px-2 mb-10 ${collapsed ? 'justify-center' : ''}`}>
                    <div className="p-2.5 bg-gradient-to-tr from-purple-600 to-indigo-600 rounded-xl shadow-lg shadow-purple-200">
                        <FaBook className="text-white text-xl" />
                    </div>
                    {!collapsed && (
                        <span className="text-2xl font-bold text-gray-800 tracking-tight animate-fade-in">
                            StudyNotes
                        </span>
                    )}
                </div>

                <nav className="space-y-2">
                    {menuItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => {
                                setActive(item.id);
                                if (item.path !== "#") navigate(item.path);
                            }}
                            className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 font-medium group relative
                                ${active === item.id
                                    ? "bg-purple-600 text-white shadow-lg shadow-purple-200"
                                    : "text-gray-500 hover:bg-white/60 hover:text-purple-600"
                                } 
                                ${collapsed ? 'justify-center' : ''}
                            `}
                        >
                            <span className="text-xl relative z-10">{item.icon}</span>
                            {!collapsed && <span className="animate-fade-in relative z-10">{item.label}</span>}

                            {/* Tooltip for collapsed state */}
                            {collapsed && (
                                <div className="absolute left-16 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                                    {item.label}
                                </div>
                            )}
                        </button>
                    ))}
                </nav>
            </div>

            <button
                onClick={onLogout}
                className={`flex items-center gap-4 px-4 py-3 text-red-500 hover:bg-red-50 rounded-2xl transition-colors font-medium cursor-pointer ${collapsed ? 'justify-center' : ''}`}
            >
                <FaSignOutAlt className="text-lg" />
                {!collapsed && <span>Logout</span>}
            </button>
        </aside>
    );
};

export default function Layout() {
    const [activeTab, setActiveTab] = useState("dashboard");
    const [user, setUser] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        // Sync active tab with current URL path
        const path = location.pathname;
        if (path.includes('/dashboard')) setActiveTab('dashboard');
        else if (path.includes('/calendar')) setActiveTab('calendar');
        else if (path.includes('/view')) setActiveTab('notes');
        else if (path.includes('/assessments')) setActiveTab('assessments');
        else if (path.includes('/groups')) setActiveTab('groups');
        else setActiveTab('dashboard');
    }, [location]);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            if (!currentUser) {
                navigate("/login");
            } else {
                setUser(currentUser);
            }
        });
        return () => unsubscribe();
    }, [navigate]);

    const handleLogout = async () => {
        try {
            await signOut(auth);
            navigate('/login');
        } catch (error) {
            console.error('Error signing out:', error);
        }
    };

    return (
        <div className="flex min-h-screen bg-gradient-to-br from-pink-100 via-gray-100 to-purple-100 font-sans text-gray-800">
            {/* Persistent Sidebar */}
            <Sidebar active={activeTab} setActive={setActiveTab} onLogout={handleLogout} navigate={navigate} />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0">
                <Outlet context={{ user }} />
            </div>
        </div>
    );
}
