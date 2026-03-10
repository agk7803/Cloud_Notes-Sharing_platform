import React, { useEffect, useState } from 'react';
import { useParams, useOutletContext, useNavigate } from 'react-router-dom';
import { FaUsers, FaGlobe, FaLock, FaTrash, FaDownload, FaEye, FaUserPlus, FaArrowUp } from 'react-icons/fa';

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
            borderRadius: size * 0.28,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: size * 0.34, fontWeight: 800, color: '#1e293b',
            border: '1.5px solid rgba(0,0,0,0.07)', flexShrink: 0,
        }}>
            {initials}
        </div>
    );
};

// ─── Shared Notes Tab ──────────────────────────────────────────────────────────
const NotesTab = ({ groupId, isCreator, user }) => {
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dragging, setDragging] = useState(false);

    useEffect(() => {
        setLoading(true);
        api.get(`/groups/${groupId}/notes`)
            .then(res => setNotes(res.data || []))
            .catch(err => console.error('Notes fetch error', err))
            .finally(() => setLoading(false));
    }, [groupId]);

    const handleDelete = async (e, noteId) => {
        e.stopPropagation();
        if (!window.confirm('Remove this note from the group?')) return;
        try {
            await api.delete(`/groups/${groupId}/notes/${noteId}`);
            setNotes(prev => prev.filter(n => n._id !== noteId));
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to delete note');
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

    const handleDrop = (e) => {
        e.preventDefault();
        setDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) handleUpload(file);
    };

    if (loading) return <div className="gp-state-msg">Loading notes...</div>;

    return (
        <div className="gp-notes">
            <div className="gp-notes__toolbar">
                <label className="btn-primary" style={{ cursor: 'pointer' }}>
                    + Share Material
                    <input type="file" hidden accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx"
                        onChange={e => e.target.files[0] && handleUpload(e.target.files[0])} />
                </label>
            </div>

            <div
                className={`gp-notes__dropzone ${dragging ? 'gp-notes__dropzone--active' : ''}`}
                onDragOver={e => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
            >
                <div style={{ fontSize: 28, marginBottom: 8 }}>📁</div>
                <div className="gp-notes__drop-title">Drag & drop notes, slides, or PDFs here</div>
                <div className="gp-notes__drop-sub">PDF, DOC, PPT, XLS — max 25 MB</div>
            </div>

            {notes.length === 0 ? (
                <div className="gp-empty">No notes shared yet.</div>
            ) : (
                <div className="gp-notes__grid">
                    {notes.map(note => {
                        const fi = getFileIcon(note.fileType || note.title?.split('.').pop());
                        const isOwn = user && note.authorId === user.uid;
                        return (
                            <div key={note._id} className="gp-note-card"
                                onClick={() => note.fileUrl && window.open(getViewUrl(note.fileUrl), '_blank')}
                            >
                                <div className="gp-note-card__top">
                                    <div className="gp-note-card__icon" style={{ background: fi.bg }}>
                                        <span>{fi.emoji}</span>
                                        <span style={{ fontSize: 9, fontWeight: 800, color: fi.color }}>{fi.label}</span>
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div className="gp-note-card__title">{note.title}</div>
                                        <div className="gp-note-card__meta">by {note.authorName}</div>
                                        <div className="gp-note-card__meta">
                                            {note.createdAt ? new Date(note.createdAt).toLocaleDateString() : note.date}
                                        </div>
                                    </div>
                                </div>
                                <div className="gp-note-card__actions">
                                    <button className="gp-note-btn gp-note-btn--view">
                                        <FaEye size={11} /> View
                                    </button>
                                    <a href={note.fileUrl} download className="gp-note-btn gp-note-btn--dl" onClick={e => e.stopPropagation()}>
                                        <FaDownload size={11} /> Download
                                    </a>
                                    {(isCreator || isOwn) && (
                                        <button className="gp-note-btn gp-note-btn--del" onClick={e => handleDelete(e, note._id)}>
                                            <FaTrash size={11} />
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

    // If members are just IDs, fetch full member details
    useEffect(() => {
        if (!group._id) return;
        api.get(`/groups/${group._id}/members`)
            .then(res => setMembers(res.data || []))
            .catch(() => { }); // fall back to whatever members the group already has
    }, [group._id]);

    const handleRemove = async (memberId) => {
        if (!window.confirm('Remove this member from the group?')) return;
        try {
            await api.delete(`/groups/${group._id}/members/${memberId}`);
            setMembers(prev => prev.filter(m => (m._id || m.id || m) !== memberId));
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to remove member');
        }
    };

    const handlePromote = async (memberId) => {
        try {
            await api.put(`/groups/${group._id}/members/${memberId}/promote`);
            setMembers(prev => prev.map(m =>
                (m._id || m.id) === memberId ? { ...m, role: 'Admin' } : m
            ));
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to promote member');
        }
    };

    return (
        <div className="gp-members">
            {members.map(m => {
                const uid = m._id || m.id || m;
                const name = m.name || m.displayName || uid;
                const role = m.role || 'Member';
                const rs = ROLE_STYLES[role] || ROLE_STYLES.Member;
                const isMe = user && uid === user.uid;

                return (
                    <div key={uid} className="gp-member-row">
                        <Avatar name={name} uid={uid} size={40} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div className="gp-member-row__name">{name}{isMe && ' (you)'}</div>
                            {m.joinedAt && (
                                <div className="gp-member-row__meta">
                                    Joined {new Date(m.joinedAt).toLocaleDateString()}
                                </div>
                            )}
                        </div>
                        <span className="gp-member-row__role" style={{ background: rs.bg, color: rs.text, border: `1px solid ${rs.border}` }}>
                            {role}
                        </span>
                        {isCreator && role !== 'Creator' && !isMe && (
                            <div style={{ display: 'flex', gap: 6 }}>
                                {role !== 'Admin' && (
                                    <button className="gp-action-btn gp-action-btn--promote" onClick={() => handlePromote(uid)}>
                                        <FaArrowUp size={10} /> Promote
                                    </button>
                                )}
                                <button className="gp-action-btn gp-action-btn--remove" onClick={() => handleRemove(uid)}>
                                    Remove
                                </button>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

// ─── Group Page ────────────────────────────────────────────────────────────────
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

    if (loading) return <div className="gp-state-msg">Loading group...</div>;
    if (!group) return <div className="gp-state-msg gp-state-msg--error">Group not found or access denied.</div>;

    const isCreator = user && group.createdBy === user.uid;
    const sc = getSubjectColor(group.subject);

    const TABS = [
        { id: 'chat', label: '💬 Chat' },
        { id: 'notes', label: '📄 Shared Notes' },
        { id: 'members', label: '👥 Members' },
    ];

    const handleLeave = async () => {
        if (!window.confirm('Leave this group?')) return;
        try {
            await api.post(`/groups/${id}/leave`);
            navigate('/groups');
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to leave group');
        }
    };

    return (
        <div className="gp-root">
            {showInvite && <InviteModal group={group} onClose={() => setShowInvite(false)} />}

            {/* Group header */}
            <div className="gp-header">
                <div className="gp-header__top">
                    <div className="gp-header__info">
                        <div className="gp-header__icon">📚</div>
                        <div>
                            <div className="gp-header__title-row">
                                <h2 className="gp-header__name">{group.name}</h2>
                                <span className="gp-tag" style={{ background: sc.bg, color: sc.text, border: `1px solid ${sc.border}` }}>
                                    {group.subject}
                                </span>
                                <span className="gp-tag" style={{
                                    background: group.type === 'Public' ? '#e0f5f5' : '#fff7ed',
                                    color: group.type === 'Public' ? '#1a7a7a' : '#b45309',
                                }}>
                                    {group.type === 'Public' ? <FaGlobe size={9} /> : <FaLock size={9} />}
                                    {' '}{group.type}
                                </span>
                            </div>
                            <div className="gp-header__meta">
                                <FaUsers size={11} style={{ marginRight: 4 }} />
                                {group.members?.length || 0} members
                                {group.description && <> · {group.description}</>}
                            </div>
                        </div>
                    </div>

                    <div className="gp-header__actions">
                        <button className="hdr-btn gp-btn--invite" onClick={() => setShowInvite(true)}>
                            <FaUserPlus size={12} /> Invite
                        </button>
                        {isCreator && (
                            <button className="hdr-btn gp-btn--settings">⚙ Settings</button>
                        )}
                        <button className="hdr-btn gp-btn--leave" onClick={handleLeave}>Leave</button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="gp-tabs">
                    {TABS.map(tab => (
                        <button
                            key={tab.id}
                            className={`gp-tab ${activeTab === tab.id ? 'gp-tab--active' : ''}`}
                            onClick={() => setActiveTab(tab.id)}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Tab content */}
            <div className="gp-content">
                {activeTab === 'chat' && <GroupChat groupId={id} user={user} groupMembers={group.members} />}
                {activeTab === 'notes' && <NotesTab groupId={id} isCreator={isCreator} user={user} />}
                {activeTab === 'members' && <MembersTab group={group} isCreator={isCreator} user={user} />}
            </div>
        </div>
    );
}