import React, { useState, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { FaGlobe, FaLock, FaSearch, FaFire, FaUsers } from 'react-icons/fa';

import api from '../../services/api';
import CreateGroupModal from './Creategroupmodal';
import { getSubjectColor, getAvatarColor, EMOJI_AVATARS } from './Constants';
import '../../styles/StudyGroups.css';

// ─── Member Avatar Stack ───────────────────────────────────────────────────────
const MemberStack = ({ members = [], limit = 3 }) => (
    <div style={{ display: 'flex', alignItems: 'center' }}>
        {members.slice(0, limit).map((uid, i) => (
            <div key={uid} style={{
                width: 26, height: 26, borderRadius: 7,
                background: getAvatarColor(uid),
                border: '2px solid #fff', marginLeft: i > 0 ? -7 : 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 13, zIndex: limit - i, boxShadow: '0 1px 3px rgba(0,0,0,.08)',
            }}>
                {EMOJI_AVATARS[i % EMOJI_AVATARS.length]}
            </div>
        ))}
        {members.length > limit && (
            <div style={{
                width: 26, height: 26, borderRadius: 7, background: '#f1f5f9',
                border: '2px solid #fff', marginLeft: -7, display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                fontSize: 10, fontWeight: 800, color: '#64748b',
            }}>
                +{members.length - limit}
            </div>
        )}
    </div>
);

// ─── Group Card ────────────────────────────────────────────────────────────────
const GroupCard = ({ group, currentUserId, onClick }) => {
    const [hovered, setHovered] = useState(false);
    const sc = getSubjectColor(group.subject);
    const isPublic = group.type === 'Public';
    const isMember = group.members?.includes(currentUserId);

    return (
        <div
            className="sg-card"
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            onClick={onClick}
            style={{
                border: `1.5px solid ${hovered ? '#7ec8c8' : '#e8edf2'}`,
                transform: hovered ? 'translateY(-6px)' : 'none',
                boxShadow: hovered
                    ? '0 18px 40px rgba(126,200,200,.22), 0 4px 12px rgba(0,0,0,.06)'
                    : '0 1px 4px rgba(0,0,0,.04)',
            }}
        >
            <div className="sg-card__accent" style={{ opacity: hovered ? 1 : 0, background: `linear-gradient(90deg, ${sc.text}, #00c96e)` }} />

            <div className="sg-card__header">
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="sg-card__name" style={{ color: hovered ? '#1a7a7a' : '#1e293b' }}>{group.name}</div>
                    <span className="sg-card__subject" style={{ background: sc.bg, color: sc.text, border: `1px solid ${sc.border}` }}>
                        {group.subject}
                    </span>
                </div>
                <div className="sg-card__type" style={{
                    background: isPublic ? '#e0f5f5' : '#fff7ed',
                    color: isPublic ? '#1a7a7a' : '#b45309',
                    border: `1px solid ${isPublic ? '#a8dcdc' : '#fcd9a0'}`,
                }}>
                    {isPublic ? <FaGlobe size={10} /> : <FaLock size={10} />} {group.type}
                </div>
            </div>

            <p className="sg-card__desc">{group.description}</p>

            <div className="sg-card__footer">
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <MemberStack members={group.members} />
                    <span className="sg-card__member-count">
                        <FaUsers size={10} style={{ marginRight: 4 }} />
                        {group.members?.length || 0} members
                    </span>
                </div>
                {group.lastActivity && (
                    <div className="sg-card__activity">
                        <div className="sg-card__activity-dot" />
                        {group.lastActivity}
                    </div>
                )}
            </div>

            {!isMember ? (
                <button
                    className={`sg-card__cta ${isPublic ? 'sg-card__cta--join' : 'sg-card__cta--request'}`}
                    onClick={e => { e.stopPropagation(); onClick(); }}
                >
                    {isPublic ? '+ Join Group' : '🔒 Request to Join'}
                </button>
            ) : (
                <div className="sg-card__view-wrap" style={{ maxHeight: hovered ? 44 : 0, opacity: hovered ? 1 : 0 }}>
                    <button className="sg-card__cta sg-card__cta--view" onClick={e => { e.stopPropagation(); onClick(); }}>
                        → View Group
                    </button>
                </div>
            )}
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
    };

    return (
        <div className="bs-landing sg-page">
            <div className="sg-container">

                {/* Page header */}
                <div className="sg-page-header">
                    <div>
                        <h1 className="sg-page-title">Study Groups</h1>
                        <p className="sg-page-subtitle">Discover groups, collaborate, and study smarter together.</p>
                    </div>
                    <button className="sg-create-btn" onClick={() => setShowCreate(true)}>
                        <span>+</span> Create Group
                    </button>
                </div>

                {/* Toolbar row 1 — tabs + search */}
                <div className="sg-toolbar-row">
                    <div className="sg-tabs">
                        {[{ id: 'all', label: 'All Groups' }, { id: 'my', label: 'My Groups' }].map(t => (
                            <button
                                key={t.id}
                                className={`sg-tab ${activeTab === t.id ? 'sg-tab--active' : ''}`}
                                onClick={() => setActiveTab(t.id)}
                            >
                                {t.label}
                            </button>
                        ))}
                    </div>
                    <div className="sg-search-wrap">
                        <FaSearch className="sg-search-icon" />
                        <input
                            className="sg-search-input"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Search groups by name or subject..."
                        />
                    </div>
                </div>

                {/* Toolbar row 2 — filters */}
                <div className="sg-filter-row">
                    <span className="sg-filter-label">Filter by:</span>
                    <select
                        className={`sg-filter-select ${subjectFilter ? 'sg-filter-select--active' : ''}`}
                        value={subjectFilter}
                        onChange={e => setSubFilter(e.target.value)}
                    >
                        <option value="">Subject ▾</option>
                        {subjects.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <select
                        className={`sg-filter-select ${typeFilter ? 'sg-filter-select--active' : ''}`}
                        value={typeFilter}
                        onChange={e => setTypeFilter(e.target.value)}
                    >
                        <option value="">Visibility ▾</option>
                        <option value="Public">🌐 Public</option>
                        <option value="Private">🔒 Private</option>
                    </select>
                    {hasFilters && (
                        <button className="sg-filter-clear" onClick={() => { setSearch(''); setSubFilter(''); setTypeFilter(''); }}>
                            ✕ Clear
                        </button>
                    )}
                </div>

                {/* Your Groups quick-access strip */}
                {activeTab === 'all' && myGroups.length > 0 && (
                    <div className="sg-section">
                        <p className="sg-section-label">Your Groups</p>
                        <div className="sg-quick-strip">
                            {myGroups.slice(0, 5).map(g => (
                                <div key={g._id} className="sg-quick-item" onClick={() => navigate(`/groups/${g._id}`)}>
                                    <div className="sg-quick-item__icon">📖</div>
                                    <div>
                                        <div className="sg-quick-item__name">{g.name}</div>
                                        <div className="sg-quick-item__activity">
                                            <div className="sg-quick-dot" />
                                            {g.lastActivity || 'Recently active'}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Trending chips */}
                {!hasFilters && activeTab === 'all' && trending.length > 0 && (
                    <div className="sg-section">
                        <p className="sg-section-label"><FaFire color="#f97316" /> Trending Groups</p>
                        <div className="sg-trending-strip">
                            {trending.map((t, i) => (
                                <button key={i} className="sg-trending-chip" onClick={() => setSearch(t.label)}>
                                    {t.emoji && <span>{t.emoji}</span>}
                                    {t.label}
                                    {t.count != null && <span className="sg-trending-count">{t.count}</span>}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Group grid */}
                {loading ? (
                    <div className="sg-state-msg">Loading groups...</div>
                ) : filtered.length === 0 ? (
                    <div className="sg-empty">
                        <div className="sg-empty__icon">🔍</div>
                        <div className="sg-empty__title">No groups found</div>
                        <p className="sg-empty__sub">Try a different search or clear filters</p>
                        <button className="sg-empty__cta" onClick={() => setShowCreate(true)}>
                            + Create a new group
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