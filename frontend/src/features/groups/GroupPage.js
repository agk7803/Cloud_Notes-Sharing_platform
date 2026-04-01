import React, { useEffect, useState } from 'react';
import { useParams, useOutletContext, useNavigate } from 'react-router-dom';
import { FaUsers, FaGlobe, FaLock, FaTrash, FaDownload, FaEye, FaUserPlus, FaArrowUp, FaChevronLeft } from 'react-icons/fa';

import api from '../../services/api';
import GroupChat from './GroupChat';
import InviteModal from './Invitemodal';
import { getSubjectColor, getAvatarColor, getFileIcon, getViewUrl, ROLE_STYLES } from './Constants';
import '../../styles/GroupPage.css';

// ─── Shared Avatar ─────────────────────────────────────────────────────────────
const Avatar = ({ name = '', uid = '', size = 36 }) => {
    const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
    return (
        <div style={{
            width: size, height: size, minWidth: size,
            background: getAvatarColor(uid || name),
            borderRadius: size * 0.3,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: size * 0.35, fontWeight: 800, color: '#1e293b',
            border: '1.5px solid rgba(0,0,0,0.06)', flexShrink: 0,
        }}>
            {initials}
        </div>
    );
};

// ─── Notes Tab ──────────────────────────────────────────────────────────
const NotesTab = ({ groupId, isCreator, user }) => {
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        api.get(`/groups/${groupId}/notes`)
            .then(res => setNotes(res.data || []))
            .catch(err => console.error('Notes fetch error', err))
            .finally(() => setLoading(false));
    }, [groupId]);

    const handleDelete = async (e, noteId) => {
        e.stopPropagation();
        if (!window.confirm('Remove this resource?')) return;
        try {
            await api.delete(`/groups/${groupId}/notes/${noteId}`);
            setNotes(prev => prev.filter(n => n._id !== noteId));
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to delete');
        }
    };

    const handleUpload = async (file) => {
        const form = new FormData();
        form.append('file', file);
        form.append('groupId', groupId);
        try {
            const res = await api.post('/notes/upload', form);
            setNotes(prev => [res.data, ...prev]);
        } catch (err) {
            alert(err.response?.data?.message || 'Upload failed');
        }
    };

    if (loading) return <div className="gp-state-msg">Preparing knowledge assets...</div>;

    return (
        <div className="gp-content-scroller">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <h3 className="gp-header__name" style={{ fontSize: 18 }}>Shared Materials</h3>
                <label className="gp-btn-action gp-btn-action--invite" style={{ padding: '8px 16px', fontSize: 12 }}>
                    + Upload Resource
                    <input type="file" hidden onChange={e => e.target.files[0] && handleUpload(e.target.files[0])} />
                </label>
            </div>

            {notes.length === 0 ? (
                <div className="gp-empty">No shared materials in this agora yet.</div>
            ) : (
                <div className="gp-asset-grid">
                    {notes.map(note => {
                        const fi = getFileIcon(note.fileType || note.title?.split('.').pop());
                        const isOwn = user && note.authorId === user.uid;
                        return (
                            <div key={note._id} className="gp-asset-card" onClick={() => note.fileUrl && window.open(getViewUrl(note.fileUrl), '_blank')}>
                                <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                                    <div className="gp-asset-icon-box" style={{ background: fi.bg, color: fi.color }}>
                                        <span style={{ fontSize: 20 }}>{fi.emoji}</span>
                                        <span style={{ fontSize: 8, fontWeight: 900, textTransform: 'uppercase' }}>{fi.label}</span>
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div className="gp-asset-title">{note.title}</div>
                                        <div className="gp-asset-meta">by {note.authorName}</div>
                                    </div>
                                </div>
                                <div className="gp-asset-actions">
                                    <button className="gp-asset-btn gp-asset-btn--view"><FaEye size={10} /> View</button>
                                    <a href={note.fileUrl} download className="gp-asset-btn gp-asset-btn--dl" onClick={e => e.stopPropagation()}>
                                        <FaDownload size={10} /> Download
                                    </a>
                                    {(isCreator || isOwn) && (
                                        <button className="gp-asset-btn" style={{ flex: 0, padding: 8, background: '#fef2f2', color: '#ef4444' }} onClick={e => handleDelete(e, note._id)}>
                                            <FaTrash size={10} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

// ─── Members Tab ───────────────────────────────────────────────────────────────
const MembersTab = ({ group, isCreator, user }) => {
    const [members, setMembers] = useState(group.members || []);

    useEffect(() => {
        if (!group._id) return;
        api.get(`/groups/${group._id}/members`)
            .then(res => setMembers(res.data || []))
            .catch(() => { });
    }, [group._id]);

    return (
        <div className="gp-content-scroller">
            <h3 className="gp-header__name" style={{ fontSize: 18, marginBottom: 20 }}>Member Roster · {members.length}</h3>
            <div className="gp-member-list">
                {members.map(m => {
                    const uid = m._id || m.id || m;
                    const name = m.name || m.displayName || uid;
                    const role = m.role || 'Member';
                    const rs = ROLE_STYLES[role] || ROLE_STYLES.Member;
                    const isMe = user && uid === user.uid;

                    return (
                        <div key={uid} className="gp-member-item">
                            <Avatar name={name} uid={uid} size={42} />
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div className="gp-member-name">{name}{isMe && ' (You)'}</div>
                                <div className="gp-asset-meta">Active Participant</div>
                            </div>
                            <span className="gp-member-role" style={{ background: rs.bg, color: rs.text, border: `1.5px solid ${rs.border}` }}>
                                {role}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

// ─── Group Workspace ────────────────────────────────────────────────────────────────
export default function GroupPage() {
    const { id } = useParams();
    const { user } = useOutletContext();
    const navigate = useNavigate();

    const [group, setGroup] = useState(null);
    const [activeTab, setActiveTab] = useState('chat');
    const [loading, setLoading] = useState(true);
    const [showInvite, setShowInvite] = useState(false);

    useEffect(() => {
        if (!id) return;
        setLoading(true);
        api.get(`/groups/${id}`)
            .then(res => setGroup(res.data))
            .catch(() => setGroup(null))
            .finally(() => setLoading(false));
    }, [id]);

    if (loading) return <div className="gp-state-msg">Syncing with agora...</div>;
    if (!group) return <div className="gp-state-msg gp-state-msg--error">This hub is currently unreachable.</div>;

    const isCreator = user && group.createdBy === user.uid;
    const sc = getSubjectColor(group.subject);

    const handleLeave = async () => {
        if (!window.confirm('Are you sure you want to exit this group?')) return;
        try {
            await api.post(`/groups/${id}/leave`);
            navigate('/groups');
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to leave');
        }
    };

    return (
        <div className="gp-root">
            {showInvite && <InviteModal group={group} onClose={() => setShowInvite(false)} />}

            {/* --- PREMIUM WORKSPACE HEADER --- */}
            <div className="gp-header">
                <div className="gp-header__top">
                    <div className="gp-header__info">
                        <button className="gp-btn-action" style={{ padding: 0, background: 'transparent' }} onClick={() => navigate('/groups')}>
                            <div className="gp-header__icon"><FaChevronLeft size={16} /></div>
                        </button>
                        <div className="gp-header__name-row">
                            <h2 className="gp-header__name">{group.name}</h2>
                            <div className="gp-header__meta">
                                <div className={`gp-badge ${group.type === 'Public' ? 'gp-badge--public' : 'gp-badge--private'}`}>
                                    {group.type === 'Public' ? <FaGlobe size={10} /> : <FaLock size={10} />} {group.type}
                                </div>
                                <span className="gp-badge" style={{ background: sc.bg, color: sc.text, border: `1px solid ${sc.border}` }}>
                                    {group.subject}
                                </span>
                                <span className="gp-asset-meta" style={{ marginLeft: 4 }}>
                                    <FaUsers size={12} style={{ marginRight: 6 }} />
                                    {group.members?.length || 0} Members
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="gp-header__actions">
                        <button className="gp-btn-action gp-btn-action--invite" onClick={() => setShowInvite(true)}>
                            <FaUserPlus size={14} /> Invite Peer
                        </button>
                        <button className="gp-btn-action gp-btn-action--secondary" onClick={handleLeave}>Exit Hub</button>
                    </div>
                </div>

                {/* --- SEGMENTED TABS --- */}
                <div className="gp-tab-bar">
                    {[{ id: 'chat', label: 'HUB CHAT' }, { id: 'notes', label: 'SHARED ASSETS' }, { id: 'members', label: 'PARTICIPANTS' }].map(tab => (
                        <button
                            key={tab.id}
                            className={`gp-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                            onClick={() => setActiveTab(tab.id)}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* --- WORKSPACE CONTENT --- */}
            {activeTab === 'chat' && <GroupChat groupId={id} user={user} groupMembers={group.members} />}
            {activeTab === 'notes' && <NotesTab groupId={id} isCreator={isCreator} user={user} />}
            {activeTab === 'members' && <MembersTab group={group} isCreator={isCreator} user={user} />}
        </div>
    );
}