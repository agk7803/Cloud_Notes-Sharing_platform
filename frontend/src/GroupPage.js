import React, { useState, useEffect } from 'react';
import { useParams, useOutletContext } from 'react-router-dom';
import { FaUsers, FaGlobe, FaLock, FaFilePdf, FaDownload, FaTrash } from 'react-icons/fa';
import api from './api/axios';
import GroupChat from './components/GroupChat';

const GroupPage = () => {
    const { id } = useParams();
    const { user } = useOutletContext();
    const [group, setGroup] = useState(null);
    const [activeTab, setActiveTab] = useState('chat');
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchGroupData = async () => {
            try {
                const groupRes = await api.get(`/groups/${id}`);
                setGroup(groupRes.data);

                // Fetch notes initially to show count or if active
                if (activeTab === 'notes' || activeTab === 'chat') {
                    // Optimization: maybe fetch notes separately or only when needed. 
                    // For 1/4 sidebar in chat mode, we might want to show "Shared Notes" summary?
                    // For now just fetching when tab is active.
                }

                if (activeTab === 'notes') {
                    const notesRes = await api.get(`/notes?visibility=groups&groupId=${id}`);
                    setNotes(notesRes.data);
                }
            } catch (error) {
                console.error("Failed to load group data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchGroupData();
    }, [id, activeTab]);

    if (loading) return <div className="p-8 text-center text-gray-500">Loading group...</div>;
    if (!group) return <div className="p-8 text-center text-red-500">Group not found or access denied.</div>;

    const isCreator = group.createdBy === user.uid;

    const handleDeleteNote = async (noteId) => {
        if (!window.confirm("Delete this shared note?")) return;
        try {
            await api.delete(`/notes/${noteId}`);
            setNotes(notes.filter(n => n._id !== noteId));
        } catch (error) {
            console.error("Failed to delete note", error);
            alert("Failed to delete note");
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-4 lg:p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 mb-6">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <h1 className="text-3xl font-bold text-gray-900">{group.name}</h1>
                                <span className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${group.type === 'Public' ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'}`}>
                                    {group.type === 'Public' ? <FaGlobe /> : <FaLock />} {group.type}
                                </span>
                            </div>
                            <p className="text-gray-500">{group.description || group.subject}</p>
                        </div>
                        <div className="flex items-center gap-2 text-gray-400 font-bold bg-gray-50 px-4 py-2 rounded-xl">
                            <FaUsers /> {group.members.length} Members
                        </div>
                    </div>

                    {/* Tabs / Navigation */}
                    <div className="flex gap-4 mt-6 border-b border-gray-200">
                        {['chat', 'notes'].map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`pb-3 px-4 font-bold text-sm capitalize transition-all ${activeTab === tab
                                        ? 'text-[#1dc962] border-b-2 border-[#1dc962]'
                                        : 'text-gray-400 hover:text-gray-600'
                                    }`}
                            >
                                {tab === 'notes' ? 'Shared Notes' : 'Group Chat'}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 min-h-[600px]">
                    {activeTab === 'chat' && (
                        <>
                            {/* Chat Area - 3/4 Width */}
                            <div className="lg:col-span-3 h-[70vh] lg:h-[800px]">
                                <GroupChat groupId={id} user={user} />
                            </div>

                            {/* Sidebar - 1/4 Width (Members/Info) */}
                            <div className="lg:col-span-1 hidden lg:block space-y-6">
                                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                                    <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                                        <FaUsers /> Members ({group.members.length})
                                    </h3>
                                    <div className="flex flex-col gap-2 max-h-[400px] overflow-y-auto">
                                        {/* Mocking Member display as we store UIDs currently. 
                                            In production, we'd fetch user details. 
                                            Listing 'User' placeholders for now or if we populate members. 
                                        */}
                                        {group.members.map((m, i) => (
                                            <div key={i} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg">
                                                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-500">
                                                    U
                                                </div>
                                                <span className="text-sm text-gray-600 truncate">{m === user.uid ? 'You' : `User ${m.substring(0, 6)}`}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {activeTab === 'notes' && (
                        <div className="col-span-full">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                {notes.length > 0 ? notes.map(note => (
                                    <div key={note._id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
                                        <div className="flex items-start gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-red-50 text-red-500 flex items-center justify-center text-lg flex-shrink-0">
                                                <FaFilePdf />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-gray-800 line-clamp-1" title={note.title}>{note.title}</h4>
                                                <p className="text-xs text-gray-400">by {note.authorName || "Unknown"}</p>
                                                <span className="text-[10px] text-gray-300">{new Date(note.createdAt).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                        <div className="mt-4 flex gap-2">
                                            <a href={note.fileUrl} target="_blank" rel="noreferrer" className="flex-1 py-2 bg-gray-50 text-gray-600 rounded-lg text-xs font-bold flex items-center justify-center gap-2 hover:bg-gray-100 transition-colors">
                                                <FaDownload /> Download
                                            </a>
                                            {(isCreator || note.authorId === user.uid) && (
                                                <button onClick={() => handleDeleteNote(note._id)} className="p-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition-colors">
                                                    <FaTrash />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                )) : (
                                    <div className="col-span-full py-12 text-center text-gray-400 bg-white rounded-xl border border-dashed border-gray-200">
                                        <p className="mb-2">No notes shared yet.</p>
                                        <p className="text-sm">Go to "My Notes" and upload a note to this group!</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default GroupPage;
