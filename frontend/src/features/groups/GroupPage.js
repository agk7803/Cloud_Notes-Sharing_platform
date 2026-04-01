import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useOutletContext, useNavigate } from 'react-router-dom';
import { FaGlobe, FaLock, FaUserPlus, FaChevronLeft, FaFileUpload, FaSearch } from 'react-icons/fa';

import api from '../../services/api';
import GroupChat from './GroupChat';
import InviteModal from './Invitemodal';
import NoteCard from '../notes/components/NoteCard';
import NoteSkeleton from '../notes/components/NoteSkeleton';
import UploadModal from '../notes/UploadModal';
import { C } from '../../shared/theme';
import { getAvatarColor } from './Constants';
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
    const [search, setSearch] = useState('');
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const [isUploadOpen, setIsUploadOpen] = useState(false);

    useEffect(() => {
        setLoading(true);
        api.get(`/groups/${groupId}/notes`)
            .then(res => setNotes(res.data || []))
            .catch(() => { })
            .finally(() => setLoading(false));
    }, [groupId]);

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this material permanently?")) return;
        try {
            await api.delete(`/notes/${id}`);
            setNotes(prev => prev.filter(n => n._id !== id));
        } catch (err) {
            alert("Failed to delete asset");
        }
    };

    const handleView = (note) => {
        if (!note?.fileUrl) return;
        const url = note.fileUrl;
        const mime = (note.fileType || "").toLowerCase();
        const ext = url.split("?")[0].split(".").pop().toLowerCase();

        const isOffice = ["doc", "docx", "ppt", "pptx", "xls", "xlsx"].includes(ext)
            || mime.includes("word") || mime.includes("presentation")
            || mime.includes("sheet") || mime.includes("excel");

        if (isOffice) {
            window.open(`https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(url)}`, "_blank");
        } else {
            window.open(url, "_blank");
        }
    };

    const handleDownload = (note) => {
        window.open(note.downloadUrl || note.fileUrl, '_blank');
    };

    const filteredNotes = useMemo(() => {
        return notes.filter(n => 
            n.title?.toLowerCase().includes(search.toLowerCase()) ||
            n.subject?.toLowerCase().includes(search.toLowerCase())
        );
    }, [notes, search]);

    return (
        <div className="gp-content-scroller">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h3 className="gp-header__name">Shared Materials</h3>
                <button 
                    onClick={() => setIsUploadOpen(true)}
                    className="btn-press"
                    style={{ 
                        background: '#111', color: '#fff', padding: '10px 20px', borderRadius: 12, border: 'none', 
                        fontWeight: 850, fontSize: 13, display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }}
                >
                    <FaFileUpload /> Upload Asset
                </button>
            </div>

            {/* --- Premium Search Bar --- */}
            <div className={`gp-search-wrap ${isSearchFocused ? 'active' : ''}`}>
                <FaSearch style={{ color: C.teal, fontSize: 16 }} />
                <input 
                    type="text" 
                    placeholder="Search shared materials..." 
                    value={search}
                    onFocus={() => setIsSearchFocused(true)}
                    onBlur={() => setIsSearchFocused(false)}
                    onChange={e => setSearch(e.target.value)}
                />
            </div>

            {loading ? (
                <div className="gp-asset-grid">
                    {Array(4).fill(0).map((_, i) => <NoteSkeleton key={i} />)}
                </div>
            ) : filteredNotes.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '100px 0', border: '2px dashed #e2e8f0', borderRadius: 24, background: '#f8fafc' }}>
                    <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
                    <div style={{ color: '#94a3b8', fontWeight: 800 }}>No assets matching frequency detected.</div>
                </div>
            ) : (
                <div className="gp-asset-grid">
                    {filteredNotes.map((note, i) => (
                        <NoteCard 
                            key={note._id}
                            note={note}
                            index={i}
                            onView={handleView}
                            onDownload={handleDownload}
                            onDelete={note.authorId === user?.uid ? handleDelete : null}
                        />
                    ))}
                </div>
            )}

            {isUploadOpen && (
                <UploadModal 
                    groupId={groupId}
                    onClose={() => setIsUploadOpen(false)}
                    onUpload={(newNote) => setNotes(prev => [newNote, ...prev])}
                />
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
                    <button 
                        className="btn-press" 
                        style={{ 
                            background: '#f1f5f9', color: '#1e293b', border: 'none', borderRadius: 12, padding: '8px 18px',
                            fontSize: 13, fontWeight: 850, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8
                        }} 
                        onClick={() => setShowInvite(true)}
                    >
                        <FaUserPlus size={12} /> Invite
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