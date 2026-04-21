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

// ─── Restricted Access View ────────────────────────────────────────────────────
const RestrictedView = ({ group, hasRequested, onJoin }) => (
    <div style={{ 
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', 
        height: '100%', padding: '0 40px', textAlign: 'center', background: '#f8fafc' 
    }}>
        <div style={{ 
            fontSize: 48, marginBottom: 24, padding: 24, background: '#fff', borderRadius: 24,
            boxShadow: '0 12px 24px rgba(0,0,0,0.04)', border: '1px solid #e2e8f0'
        }}>
            {hasRequested ? '⏳' : '🔒'}
        </div>
        <h2 style={{ fontSize: 24, fontWeight: 900, color: '#1e293b', marginBottom: 12, letterSpacing: '-0.02em' }}>
            {hasRequested ? 'Access Under Review' : 'Restricted Academic Core'}
        </h2>
        <p style={{ fontSize: 15, color: '#64748b', maxWidth: 400, lineHeight: 1.6, marginBottom: 32, fontWeight: 600 }}>
            {hasRequested 
                ? 'Your deployment request is currently being reviewed by the administrative faculty of this hub.' 
                : `This workspace is reserved for authorized personnel. You must submit a formal request to access shared materials and discussions in ${group.name}.`}
        </p>
        
        {hasRequested ? (
            <div style={{ 
                padding: '12px 32px', background: '#fef3c7', color: '#92400e', borderRadius: 14, 
                fontWeight: 900, fontSize: 13, border: '1.5px solid #fde68a'
            }}>
                REQUEST PENDING
            </div>
        ) : (
            <button 
                onClick={onJoin}
                className="btn-press"
                style={{ 
                    padding: '16px 40px', background: '#111', color: '#fff', border: 'none', borderRadius: 14, 
                    fontWeight: 900, fontSize: 14, cursor: 'pointer', boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
                }}
            >
                REQUEST ACCESS
            </button>
        )}
    </div>
);
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

    const [requests, setRequests] = useState([]);
    
    const myUid = user?.uid || user?.firebaseUid || user?.id || user?._id;
    const isCreator = (group?.createdBy && myUid && group.createdBy === myUid) || 
                      (group?.creatorId && myUid && group.creatorId === myUid);
                      
    const isMember = group?.isMember === true || 
                     (group?.members && myUid && group.members.includes(myUid)) ||
                     isCreator;

    // Debugging only — remove in production
    if (group && !isMember && !isCreator && group.type === 'Private') {
        console.warn("[Hub Access Denied]", {
            group_name: group.name,
            group_creator: group.createdBy,
            current_user_uid: user?.uid,
            current_user_fuid: user?.firebaseUid,
            resolved_myUid: myUid,
            resolved_isCreator: isCreator,
            resolved_isMember: isMember
        });
    }

    useEffect(() => {
        if (isCreator) {
            api.get(`/groups/${groupId}/requests`).then(res => setRequests(res.data)).catch(() => { });
        }
    }, [groupId, isCreator]);

    const handleManageRequest = async (userId, action) => {
        try {
            await api.post(`/groups/${groupId}/manage-request`, { userId, action });
            setRequests(prev => prev.filter(r => r.firebaseUid !== userId));
            if (action === 'approve') {
                // Fetch members again to update list
                api.get(`/groups/${groupId}/members`).then(res => setMembers(res.data));
            }
        } catch (err) {
            alert(`Failed to ${action} request`);
        }
    };

    const handleRequestInPage = async () => {
        try {
            await api.post(`/groups/${groupId}/request`);
            setGroup(prev => ({ ...prev, hasRequested: true }));
            alert('Access request submitted.');
        } catch (err) {
            alert(err.response?.data?.message || 'Request failed');
        }
    };

    if (!group) return (
        <div className="gp-page" style={{ alignItems: 'center', justifyContent: 'center', color: '#64748b', fontSize: 13, fontWeight: 800 }}>
            Authenticating Hub...
        </div>
    );

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
                    <button className={`gp-tab ${activeTab === 'members' ? 'active' : ''}`} onClick={() => setActiveTab('members')}>
                        Members {isCreator && requests.length > 0 && <span className="gp-badge">{requests.length}</span>}
                    </button>
                </div>
            </div>

            {/* --- CONTENT AREA --- */}
            <main className="gp-body">
                {(!isMember && !isCreator && group.type === 'Private') ? (
                    <RestrictedView 
                        group={group} 
                        hasRequested={group.hasRequested} 
                        onJoin={handleRequestInPage} 
                    />
                ) : (
                    <>
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
                                                {m.role || (m.firebaseUid === group.createdBy ? 'Creator' : 'Member')}
                                            </div>
                                        </div>
                                    ))}

                                    {isCreator && requests.length > 0 && (
                                        <>
                                            <div style={{ fontSize: 11, fontWeight: 900, color: '#f59e0b', textTransform: 'uppercase', marginTop: 40, marginBottom: 20 }}>Pending Access Requests · {requests.length}</div>
                                            {requests.map(r => (
                                                <div key={r.firebaseUid} className="gp-member-item" style={{ borderLeft: '3px solid #f59e0b' }}>
                                                    <Avatar name={r.name} uid={r.firebaseUid} size={36} />
                                                    <div style={{ flex: 1 }}>
                                                        <div style={{ fontWeight: 850, fontSize: 13, color: '#1e293b' }}>{r.name}</div>
                                                        <div style={{ fontSize: 11, color: '#64748b' }}>{r.email}</div>
                                                    </div>
                                                    <div style={{ display: 'flex', gap: 8 }}>
                                                        <button 
                                                            onClick={() => handleManageRequest(r.firebaseUid, 'approve')}
                                                            style={{ padding: '6px 12px', background: '#10b981', color: '#fff', border: 'none', borderRadius: 8, fontSize: 10, fontWeight: 900, cursor: 'pointer' }}
                                                        >
                                                            APPROVE
                                                        </button>
                                                        <button 
                                                            onClick={() => handleManageRequest(r.firebaseUid, 'reject')}
                                                            style={{ padding: '6px 12px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: 8, fontSize: 10, fontWeight: 900, cursor: 'pointer' }}
                                                        >
                                                            REJECT
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </>
                                    )}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </main>

            {showInvite && <InviteModal group={group} onClose={() => setShowInvite(false)} />}
        </div>
    );
};

export default GroupPage;