import React, { useEffect, useState } from 'react';
import { useParams, useOutletContext, useNavigate } from 'react-router-dom';
import { FaUsers, FaGlobe, FaLock, FaTrash, FaDownload, FaEye, FaUserPlus, FaChevronLeft, FaFileUpload } from 'react-icons/fa';

import api from '../../services/api';
import GroupChat from './GroupChat';
import InviteModal from './Invitemodal';
import { getSubjectColor, getAvatarColor, getFileIcon, getViewUrl, ROLE_STYLES } from './Constants';
import '../../styles/GroupPage.css';

// ─── Shared Avatar ─────────────────────────────────────────────────────────────
const Avatar = ({ name = '', uid = '', size = 32 }) => {
    const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
    return (
        <div style={{
            width: size, height: size, minWidth: size,
            background: getAvatarColor(uid || name),
            borderRadius: size * 0.35,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: size * 0.35, fontWeight: 850, color: '#1e293b',
            border: '1.5px solid rgba(0,0,0,0.06)', flexShrink: 0,
        }}>
            {initials}
        </div>
    );
};

// ─── Notes (Assets) Tab ────────────────────────────────────────────────────────
const NotesTab = ({ groupId, isCreator, user }) => {
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        api.get(`/groups/${groupId}/notes`)
            .then(res => setNotes(res.data || []))
            .catch(() => { })
            .finally(() => setLoading(false));
    }, [groupId]);

    const handleUpload = async (file) => {
        const form = new FormData();
        form.append('file', file);
        form.append('groupId', groupId);
        try {
            const res = await api.post('/notes/upload', form);
            setNotes(prev => [res.data, ...prev]);
        } catch (err) {
            alert(err.response?.data?.message || 'Update failed');
        }
    };

    if (loading) return <div style={{ textAlign: 'center', padding: '60px 0', color: '#94a3b8', fontSize: 13, fontWeight: 800 }}>SYNCING ASSETS...</div>;

    return (
        <div className="gp-content-scroller">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
                <h3 className="gp-header__name">Shared Materials</h3>
                <label className="gp-asset-btn" style={{ background: '#1a7a7a', color: '#fff' }}>
                    <FaFileUpload /> Upload Asset
                    <input type="file" hidden onChange={e => e.target.files[0] && handleUpload(e.target.files[0])} />
                </label>
            </div>

            {notes.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 0', color: '#94a3b8' }}>No frequency detected in this asset pool.</div>
            ) : (
                <div className="gp-asset-grid">
                    {notes.map(note => {
                        const fi = getFileIcon(note.fileType || note.title?.split('.').pop());
                        return (
                            <div key={note._id} className="gp-asset-card" onClick={() => note.fileUrl && window.open(getViewUrl(note.fileUrl), '_blank')}>
                                <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 16 }}>
                                    <div className="gp-asset-icon-box" style={{ background: fi.bg, color: fi.color }}>
                                        <span style={{ fontSize: 18 }}>{fi.emoji}</span>
                                        <span style={{ fontSize: 7, fontWeight: 900, textTransform: 'uppercase' }}>{fi.label}</span>
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div className="gp-asset-title">{note.title}</div>
                                        <div className="gp-asset-meta">by {note.authorName}</div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: 8 }}>
                                    <button className="gp-asset-btn"><FaEye size={10} /> View</button>
                                    <a href={note.fileUrl} download className="gp-asset-btn" onClick={e => e.stopPropagation()}>
                                        <FaDownload size={10} /> Get
                                    </a>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

// ─── Group Page Root ───────────────────────────────────────────────────────────
const GroupPage = () => {
    const { id: groupId } = useParams();
    const { user } = useOutletContext();
    const navigate = useNavigate();
    const [group, setGroup] = useState(null);
    const [members, setMembers] = useState([]);
    const [activeTab, setActiveTab] = useState('chat');
    const [showInvite, setShowInvite] = useState(false);

    useEffect(() => {
        if (!groupId) return;
        api.get(`/groups/${groupId}`).then(res => setGroup(res.data)).catch(() => navigate('/groups'));
        api.get(`/groups/${groupId}/members`).then(res => setMembers(res.data)).catch(() => { });
    }, [groupId, navigate]);

    if (!group) return <div className="gp-page" style={{ alignItems: 'center', justifyContent: 'center' }}>Authenticating Hub...</div>;

    const isCreator = group.creatorId === user?.uid;
    const sc = getSubjectColor(group.subject);

    return (
        <div className="gp-page">
            {/* --- BREADCRUMB HEADER --- */}
            <header className="gp-header">
                <div className="gp-header__nav" onClick={() => navigate('/groups')}>
                    <FaChevronLeft size={10} />
                    <span>Study Hubs</span>
                    <span className="gp-header__sep">/</span>
                    <span className="gp-header__name">{group.name}</span>
                </div>

                <div className="gp-header__actions">
                    <div className="gp-header-pill">
                        {group.type === 'Public' ? <FaGlobe size={10} /> : <FaLock size={10} />}
                        {group.type} Hub
                    </div>
                    <button className="gp-asset-btn" style={{ background: '#f1f5f9' }} onClick={() => setShowInvite(true)}>
                        <FaUserPlus size={10} /> Invite
                    </button>
                </div>
            </header>

            {/* --- NAVIGATION TABS --- */}
            <div className="gp-nav-section">
                <div className="gp-tabs">
                    <button className={`gp-tab ${activeTab === 'chat' ? 'active' : ''}`} onClick={() => setActiveTab('chat')}>Discussions</button>
                    <button className={`gp-tab ${activeTab === 'notes' ? 'active' : ''}`} onClick={() => setActiveTab('notes')}>Shared Materials</button>
                    <button className={`gp-tab ${activeTab === 'members' ? 'active' : ''}`} onClick={() => setActiveTab('members')}>Members</button>
                </div>
            </div>

            {/* --- CONTENT AREA --- */}
            <main className="gp-body">
                {activeTab === 'notes' && <NotesTab groupId={groupId} isCreator={isCreator} user={user} />}
                {activeTab === 'chat' && <GroupChat groupId={groupId} user={user} />}
                {activeTab === 'members' && (
                    <div className="gp-content-scroller">
                        <div style={{ maxWidth: 800 }}>
                            <div style={{ fontSize: 11, fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', marginBottom: 20 }}>Group Members · {members.length}</div>
                            {members.map(m => (
                                <div key={m.firebaseUid} className="gp-member-item">
                                    <Avatar name={m.name} uid={m.firebaseUid} size={36} />
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 850, fontSize: 13, color: '#1e293b', display: 'flex', alignItems: 'center', gap: 6 }}>
                                            {m.name} {(m.firebaseUid === user?.uid) && <span style={{ fontSize: 9, padding: '2px 6px', background: '#e0f5f5', color: '#1a7a7a', borderRadius: 4 }}>YOU</span>}
                                        </div>
                                        <div style={{ fontSize: 11, color: '#64748b' }}>{m.email}</div>
                                    </div>
                                    <div style={{ padding: '4px 12px', background: '#f8fafc', borderRadius: 8, fontSize: 10, fontWeight: 900, color: '#1a7a7a', textTransform: 'uppercase', border: '1px solid #e2e8f0' }}>
                                        {m.role || 'Member'}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </main>

            {showInvite && <InviteModal group={group} onClose={() => setShowInvite(false)} />}
        </div>
    );
};

export default GroupPage;