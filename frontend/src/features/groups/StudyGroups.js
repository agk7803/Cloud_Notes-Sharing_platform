import React, { useState, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { FaGlobe, FaLock, FaSearch, FaUsers, FaPlus } from 'react-icons/fa';

import api from '../../services/api';
import CreateGroupModal from './Creategroupmodal';
import { getSubjectColor } from './Constants';
import '../../styles/StudyGroups.css';

// ─── Professional Group Card Component ─────────────────────────────────────────
const GroupCard = ({ group, currentUserId, onClick }) => {
    const isMember = group.members?.includes(currentUserId);
    const sc = getSubjectColor(group.subject);

    return (
        <div className="sg-premium-card" onClick={onClick}>
            {/* Hover Accent Line */}
            <div className="sg-acc" />

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
                <span className="sg-card-subject-tag">{group.subject}</span>
                <p className="sg-card-description">{group.description}</p>
            </div>

            <div className="sg-card-footer">
                <div className="sg-member-info">
                    <FaUsers size={12} /> {group.members?.length || 0} Members
                </div>
                {isMember ? (
                    <button className="sg-join-btn enter" onClick={e => { e.stopPropagation(); onClick(); }}>ENTER WORKSPACE</button>
                ) : group.type === 'Public' ? (
                    <button className="sg-join-btn join" onClick={e => { e.stopPropagation(); onClick(); }}>JOIN HUB</button>
                ) : (
                    <button className="sg-join-btn private" onClick={e => { e.stopPropagation(); onClick(); }}>PRIVATE</button>
                )}
            </div>
        </div>
    );
};

// ─── Study Groups Feature ──────────────────────────────────────────────────────
const StudyGroups = () => {
    const navigate = useNavigate();
    const { user } = useOutletContext();
    const [groups, setGroups] = useState([]);
    const [myGroups, setMyGroups] = useState([]);
    const [search, setSearch] = useState('');
    const [activeTab, setActiveTab] = useState('discovery');
    const [showCreate, setShowCreate] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        Promise.all([
            api.get('/groups'),
            api.get('/groups?filter=my')
        ]).then(([resAll, resMe]) => {
            setGroups(resAll.data || []);
            setMyGroups(resMe.data || []);
        }).finally(() => setLoading(false));
    }, []);

    const handleGroupClick = async (group) => {
        if (!user) return;
        if (group.members?.includes(user.uid)) {
            navigate(`/groups/${group._id}`);
            return;
        }
        if (group.type === 'Public') {
            if (!window.confirm(`Requesting access to "${group.name}". Proceed?`)) return;
            try {
                await api.post(`/groups/${group._id}/join`);
                navigate(`/groups/${group._id}`);
            } catch (err) {
                if (err.response?.status === 400 && err.response?.data?.message === 'Already a member') {
                    navigate(`/groups/${group._id}`);
                } else {
                    alert(err.response?.data?.message || 'Failed to sync with group frequency');
                }
            }
        } else {
            alert('This hub is strictly private. You require an administrative invite.');
        }
    };

    const handleCreated = (newGroup) => {
        setGroups(prev => [newGroup, ...prev]);
        setMyGroups(prev => [newGroup, ...prev]);
        setShowCreate(false);
    };

    const displayGroups = activeTab === 'discovery' ? groups : myGroups;
    const filtered = displayGroups.filter(g => {
        return !search || g.name.toLowerCase().includes(search.toLowerCase()) || g.subject?.toLowerCase().includes(search.toLowerCase());
    });

    return (
        <div className="sg-page">
            <div className="sg-container">

                {/* --- HERO SECTION --- */}
                <header className="sg-hero">
                    <div className="sg-hero__tag">Academic Hubs</div>
                    <h1 className="sg-hero__title">Research & Study Groups</h1>
                    <p className="sg-hero__subtitle">
                        Connect with specialized knowledge hubs, synchronize with peers, 
                        and build high-authority academic communities.
                    </p>
                    <button className="sg-create-btn-premium" onClick={() => setShowCreate(true)}>
                        <FaPlus size={12} /> Create Your Hub
                    </button>
                </header>

                {/* --- CONTROL BAR --- */}
                <div className="sg-control-bar">
                    <div className="sg-search-wrap">
                        <FaSearch size={14} className="sg-search-icon" />
                        <input
                            className="sg-search-input"
                            placeholder="Discover hubs, subjects, or keywords..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>

                    <div className="sg-tabs">
                        <button className={`sg-tab ${activeTab === 'discovery' ? 'active' : ''}`} onClick={() => setActiveTab('discovery')}>Global Discovery</button>
                        <button className={`sg-tab ${activeTab === 'my' ? 'active' : ''}`} onClick={() => setActiveTab('my')}>Joined Hubs</button>
                    </div>
                </div>

                {/* --- RESULTS GRID --- */}
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '100px 0', color: '#94a3b8', fontSize: 13, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                        Synchronizing Community Assets...
                    </div>
                ) : filtered.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '100px 0', color: '#94a3b8' }}>
                        No academic hubs found matching your parameters.
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
};

export default StudyGroups;