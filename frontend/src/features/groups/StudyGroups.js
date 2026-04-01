import React, { useState, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { FaGlobe, FaLock, FaSearch, FaFire, FaUsers } from 'react-icons/fa';

import api from '../../services/api';
import CreateGroupModal from './Creategroupmodal';
import { getSubjectColor } from './Constants';
import '../../styles/StudyGroups.css';

// ─── Premium Group Card Component ─────────────────────────────────────────────
const GroupCard = ({ group, currentUserId, onClick }) => {
    const isMember = group.members?.includes(currentUserId);
    const sc = getSubjectColor(group.subject);

    return (
        <div className="sg-premium-card" onClick={onClick} style={{ '--card-tint': sc.bg, '--card-border': sc.border }}>
            <div className="sg-card-glow" style={{ background: sc.bg }} />
            
            <div className="sg-card-header">
                <div className="sg-card-icon" style={{ background: sc.bg, color: sc.text }}>
                    {group.name[0]}
                </div>
                <div className={`sg-privacy-badge ${group.type}`}>
                    {group.type === 'Public' ? <FaGlobe size={10} /> : <FaLock size={10} />} {group.type}
                </div>
            </div>

            <div className="sg-card-body">
                <h3 className="sg-card-title">{group.name}</h3>
                <span className="sg-card-subject-tag" style={{ border: `1px solid ${sc.border}`, color: sc.text, background: sc.bg }}>
                    {group.subject}
                </span>
                <p className="sg-card-description">{group.description}</p>
            </div>

            <div className="sg-card-footer">
                <div className="sg-member-count">
                    <FaUsers size={12} /> {group.members?.length || 0} Members
                </div>
                {isMember ? (
                    <button className="sg-v-btn active" onClick={onClick}>ENTER WORKSPACE</button>
                ) : group.type === 'Public' ? (
                    <button className="sg-v-btn join" onClick={onClick}>JOIN GROUP</button>
                ) : (
                    <button className="sg-v-btn private" onClick={onClick}>PRIVATE</button>
                )}
            </div>
        </div>
    );
};

// ─── Study Groups Discovery Page ───────────────────────────────────────────────
export default function StudyGroups() {
    const navigate = useNavigate();
    const { user } = useOutletContext();

    const [groups, setGroups] = useState([]);
    const [myGroups, setMyGroups] = useState([]);
    const [trending, setTrending] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [activeTab, setActiveTab] = useState('all');
    const [search, setSearch] = useState('');
    const [subjectFilter, setSubFilter] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [loading, setLoading] = useState(true);
    const [showCreate, setShowCreate] = useState(false);

    // Fetch all / my groups
    useEffect(() => {
        setLoading(true);
        api.get(`/groups?filter=${activeTab}`)
            .then(res => setGroups(res.data || []))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, [activeTab]);

    // Fetch my groups for quick-access strip (always)
    useEffect(() => {
        api.get('/groups?filter=my')
            .then(res => setMyGroups(res.data || []))
            .catch(() => { });
    }, []);

    // Fetch trending topics
    useEffect(() => {
        api.get('/groups/trending')
            .then(res => setTrending(res.data || []))
            .catch(() => { });
    }, []);

    // Fetch subject list for filter dropdown
    useEffect(() => {
        api.get('/groups/subjects')
            .then(res => setSubjects(res.data || []))
            .catch(() => {
                // fallback: derive from loaded groups
                setSubjects([...new Set(groups.map(g => g.subject).filter(Boolean))]);
            });
    }, [groups]);

    const filtered = groups.filter(g => {
        const inSearch = !search || g.name.toLowerCase().includes(search.toLowerCase()) || g.subject?.toLowerCase().includes(search.toLowerCase());
        const inSubject = !subjectFilter || g.subject === subjectFilter;
        const inType = !typeFilter || g.type === typeFilter;
        return inSearch && inSubject && inType;
    });

    const hasFilters = search || subjectFilter || typeFilter;

    const handleGroupClick = async (group) => {
        if (group.members?.includes(user.uid)) {
            navigate(`/groups/${group._id}`);
            return;
        }
        if (group.type === 'Public') {
            if (!window.confirm(`Join "${group.name}"?`)) return;
            try {
                await api.post(`/groups/${group._id}/join`);
                navigate(`/groups/${group._id}`);
            } catch (err) {
                alert(err.response?.data?.message || 'Failed to join group');
            }
        } else {
            alert('This is a private group. Request an invite to join.');
        }
    };

    const handleCreated = (newGroup) => {
        setGroups(prev => [newGroup, ...prev]);
        setMyGroups(prev => [newGroup, ...prev]);
        setShowCreate(false);
    };

    return (
        <div className="sg-page">
            <div className="sg-container">

                {/* --- HERO HEADER --- */}
                <div className="sg-hero">
                    <div className="sg-hero__tag">COMMUNITY HUB</div>
                    <h1 className="sg-hero__title">Study Groups</h1>
                    <p className="sg-hero__subtitle">
                        Collaborate with peers, share resources, and excel in your subjects together. 
                        Join a trending hub or build your own.
                    </p>
                    <button className="sg-create-btn-premium" onClick={() => setShowCreate(true)}>
                        <span className="sg-create-btn-premium__icon">+</span> 
                        Create Your Group
                    </button>
                </div>

                {/* --- TOOLBAR: TABS & SEARCH --- */}
                <div className="sg-toolbar-modern">
                    <div className="sg-segmented-controls">
                        {[{ id: 'all', label: 'Explore All' }, { id: 'my', label: 'My Groups' }].map(t => (
                            <button
                                key={t.id}
                                className={`sg-segmented-btn ${activeTab === t.id ? 'active' : ''}`}
                                onClick={() => setActiveTab(t.id)}
                            >
                                {t.label}
                            </button>
                        ))}
                    </div>

                    <div className="sg-premium-search">
                        <FaSearch className="sg-search-icon-modern" />
                        <input
                            className="sg-search-input-premium"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Find a group by name or subject..."
                        />
                    </div>
                </div>

                {/* --- FILTERS --- */}
                <div className="sg-filter-pill-row">
                    <div className="sg-filter-pill-label">FILTER BY</div>
                    
                    <div className="sg-custom-select-wrap">
                        <select
                            className={`sg-premium-select ${subjectFilter ? 'active' : ''}`}
                            value={subjectFilter}
                            onChange={e => setSubFilter(e.target.value)}
                        >
                            <option value="">All Subjects</option>
                            {subjects.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>

                    <div className="sg-custom-select-wrap">
                        <select
                            className={`sg-premium-select ${typeFilter ? 'active' : ''}`}
                            value={typeFilter}
                            onChange={e => setTypeFilter(e.target.value)}
                        >
                            <option value="">Any Privacy</option>
                            <option value="Public">🌐 Public</option>
                            <option value="Private">🔒 Private</option>
                        </select>
                    </div>

                    {hasFilters && (
                        <button className="sg-clear-pill" onClick={() => { setSearch(''); setSubFilter(''); setTypeFilter(''); }}>
                            Reset Filters
                        </button>
                    )}
                </div>

                {/* --- YOUR GROUPS QUICK STRIP --- */}
                {activeTab === 'all' && myGroups.length > 0 && (
                    <div className="sg-section">
                        <p className="sg-section-label">Your Quick Access</p>
                        <div className="sg-quick-strip">
                            {myGroups.slice(0, 5).map(g => (
                                <div key={g._id} className="sg-quick-item" onClick={() => navigate(`/groups/${g._id}`)}>
                                    <div className="sg-quick-item__icon">📖</div>
                                    <div>
                                        <div style={{ fontWeight: 800, fontSize: 13, color: '#1e293b' }}>{g.name}</div>
                                        <div style={{ fontSize: 11, color: '#00c96e', display: 'flex', alignItems: 'center', gap: 4 }}>
                                            <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#00c96e' }} />
                                            Active Now
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* --- TRENDING --- */}
                {!hasFilters && activeTab === 'all' && trending.length > 0 && (
                    <div className="sg-section">
                        <p className="sg-section-label"><FaFire color="#f97316" /> Trending Hubs</p>
                        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                            {trending.map((t, i) => (
                                <button key={i} className="sg-segmented-btn active" style={{ borderRadius: 20, fontSize: 12 }} onClick={() => setSearch(t.label)}>
                                    {t.emoji} {t.label}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* --- GROUP GRID --- */}
                {loading ? (
                    <div className="sg-state-msg">Crafting your feed...</div>
                ) : filtered.length === 0 ? (
                    <div className="sg-empty">
                        <div style={{ fontSize: 40 }}>🔎</div>
                        <h3 className="sg-card-title">No results found</h3>
                        <p className="sg-hero__subtitle">Try widening your search or clearing filters.</p>
                        <button className="sg-create-btn-premium" onClick={() => { setSearch(''); setSubFilter(''); setTypeFilter(''); }}>
                            Clear All Filters
                        </button>
                    </div>
                ) : (
                    <div className="sg-grid">
                        {filtered.map(g => (
                            <GroupCard key={g._id} group={g} currentUserId={user?.uid} onClick={() => handleGroupClick(g)} />
                        ))}
                    </div>
                )}
            </div>

            {showCreate && <CreateGroupModal onClose={() => setShowCreate(false)} onCreated={handleCreated} />}
        </div>
    );
}