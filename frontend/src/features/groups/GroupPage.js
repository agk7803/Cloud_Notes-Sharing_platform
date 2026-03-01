import React, { useState, useEffect } from 'react';
import { useParams, useOutletContext } from 'react-router-dom';
import {
    FaUsers,
    FaGlobe,
    FaLock,
    FaFilePdf,
    FaTrash
} from 'react-icons/fa';

import api from '../../services/api';
import GroupChat from './GroupChat';

const GroupPage = () => {
    const { id } = useParams();
    const { user } = useOutletContext();

    const [group, setGroup] = useState(null);
    const [activeTab, setActiveTab] = useState('chat');
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(true);


    /* ---------------- FETCH GROUP DATA ---------------- */

    useEffect(() => {
        if (!id) return;

        const fetchGroupData = async () => {
            try {
                setLoading(true);

                const groupRes = await api.get(`/groups/${id}`);
                setGroup(groupRes.data);

                if (activeTab === 'notes') {
                    const notesRes = await api.get(
                        `/notes?visibility=groups&groupId=${id}`
                    );
                    setNotes(notesRes.data || []);
                }

            } catch (err) {
                console.error('Failed to load group data:', err);
                setGroup(null);
            } finally {
                setLoading(false);
            }
        };

        fetchGroupData();

    }, [id, activeTab]);


    /* ---------------- ONLINE VIEWER ---------------- */

    const getViewUrl = (fileUrl) => {

        if (!fileUrl) return "";

        const ext = fileUrl
            .split('.')
            .pop()
            .split('?')[0]
            .toLowerCase();

        const officeTypes = [
            'doc', 'docx',
            'ppt', 'pptx',
            'xls', 'xlsx'
        ];

        // Office → Microsoft Viewer
        if (officeTypes.includes(ext)) {
            return `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(fileUrl)}`;
        }

        // PDF / Others → Google Viewer
        return `https://docs.google.com/gview?url=${encodeURIComponent(fileUrl)}&embedded=true`;
    };


    /* ---------------- LOADING ---------------- */

    if (loading || !user) {
        return (
            <div className="p-8 text-center text-gray-500">
                Loading user and group...
            </div>
        );
    }

    if (!group) {
        return (
            <div className="p-8 text-center text-red-500">
                Group not found or access denied.
            </div>
        );
    }


    /* ---------------- PERMISSIONS ---------------- */

    const isCreator =
        user && group?.createdBy === user.uid;


    /* ---------------- DELETE NOTE ---------------- */

    const handleDeleteNote = async (e, noteId) => {

        e.stopPropagation(); // prevent opening file

        if (!window.confirm('Delete this shared note?')) return;

        try {

            await api.delete(`/notes/${noteId}`);

            setNotes(prev =>
                prev.filter(n => n._id !== noteId)
            );

        } catch (err) {
            console.error('Delete failed:', err);
            alert('Failed to delete note');
        }
    };


    /* ---------------- UI ---------------- */

    return (
        <div className="min-h-screen bg-gray-50 p-4 lg:p-8">

            <div className="max-w-7xl mx-auto">


                {/* ================= HEADER ================= */}

                <div className="bg-white p-6 rounded-3xl shadow-sm border mb-6">

                    <div className="flex flex-col md:flex-row justify-between gap-4">

                        <div>
                            <div className="flex items-center gap-3 mb-2">

                                <h1 className="text-3xl font-bold">
                                    {group.name}
                                </h1>

                                <span
                                    className={`px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1
                                    ${group.type === 'Public'
                                            ? 'bg-green-50 text-green-600'
                                            : 'bg-orange-50 text-orange-600'
                                        }`}
                                >
                                    {group.type === 'Public'
                                        ? <FaGlobe />
                                        : <FaLock />
                                    }

                                    {group.type}
                                </span>

                            </div>

                            <p className="text-gray-500">
                                {group.description || group.subject}
                            </p>
                        </div>


                        <div className="flex items-center gap-2 text-gray-400 font-bold bg-gray-50 px-4 py-2 rounded-xl">
                            <FaUsers />
                            {group.members?.length || 0} Members
                        </div>

                    </div>


                    {/* ================= TABS ================= */}

                    <div className="flex gap-4 mt-6 border-b">

                        {['chat', 'notes'].map(tab => (

                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`pb-3 px-4 font-bold text-sm capitalize
                                ${activeTab === tab
                                        ? 'text-[#1dc962] border-b-2 border-[#1dc962]'
                                        : 'text-gray-400 hover:text-gray-600'
                                    }`}
                            >
                                {tab === 'notes'
                                    ? 'Shared Notes'
                                    : 'Group Chat'}
                            </button>

                        ))}

                    </div>

                </div>


                {/* ================= CONTENT ================= */}

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 min-h-[600px]">


                    {/* ========== CHAT TAB ========== */}

                    {activeTab === 'chat' && (

                        <>

                            <div className="lg:col-span-3 h-[55vh] lg:h-[450px]">

                                {user && (
                                    <GroupChat
                                        groupId={id}
                                        user={user}
                                    />
                                )}

                            </div>


                            {/* Members */}

                            <div className="lg:col-span-1 hidden lg:block">

                                <div className="bg-white p-6 rounded-2xl shadow-sm border">

                                    <h3 className="font-bold mb-4 flex items-center gap-2">
                                        <FaUsers />
                                        Members ({group.members?.length || 0})
                                    </h3>

                                    <div className="flex flex-col gap-2 max-h-[400px] overflow-y-auto">

                                        {group.members?.map((m, i) => (

                                            <div
                                                key={i}
                                                className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg"
                                            >

                                                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold">
                                                    U
                                                </div>

                                                <span className="text-sm truncate">
                                                    {user && m === user.uid
                                                        ? 'You'
                                                        : `User ${m.substring(0, 6)}`
                                                    }
                                                </span>

                                            </div>

                                        ))}

                                    </div>

                                </div>

                            </div>

                        </>

                    )}


                    {/* ========== NOTES TAB ========== */}

                    {activeTab === 'notes' && (

                        <div className="col-span-full">

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">

                                {notes.length > 0 ? (

                                    notes.map(note => (

                                        <div
                                            key={note._id}
                                            onClick={() =>
                                                window.open(
                                                    getViewUrl(note.fileUrl),
                                                    '_blank'
                                                )
                                            }
                                            className="bg-white p-4 rounded-xl border shadow-sm flex flex-col cursor-pointer hover:shadow-md transition"
                                        >

                                            <div className="flex gap-3">

                                                <div className="w-10 h-10 bg-red-50 text-red-500 rounded-lg flex items-center justify-center">
                                                    <FaFilePdf />
                                                </div>

                                                <div>
                                                    <h4 className="font-bold line-clamp-1">
                                                        {note.title}
                                                    </h4>

                                                    <p className="text-xs text-gray-400">
                                                        by {note.authorName || 'Unknown'}
                                                    </p>

                                                </div>

                                            </div>


                                            {/* Delete Button */}
                                            {(isCreator ||
                                                (user && note.authorId === user.uid)) && (

                                                    <button
                                                        onClick={(e) => handleDeleteNote(e, note._id)}
                                                        className="mt-4 self-end p-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-100"
                                                    >
                                                        <FaTrash />
                                                    </button>

                                                )}

                                        </div>

                                    ))

                                ) : (

                                    <div className="col-span-full py-12 text-center text-gray-400 bg-white rounded-xl border-dashed border">

                                        <p>No notes shared yet.</p>

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