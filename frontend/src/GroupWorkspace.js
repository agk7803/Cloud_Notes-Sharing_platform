import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaHashtag, FaBook, FaClipboardList, FaCalendarAlt, FaPaperPlane, FaEllipsisV, FaPlus } from 'react-icons/fa';
import { useNotes } from './NoteContext';

const DISCUSSION_THREADS = [
    { id: 1, user: "Sarah J.", text: "Can someone help me with the Stokes Theorem problem from yesterday?", time: "10m ago", replies: 3 },
    { id: 2, user: "Mike T.", text: "Uploaded the notes for Chapter 4. Check Shared Notes tab.", time: "1h ago", replies: 0, pinned: true },
];

const SHARED_NOTES = [
    { id: 1, title: "Vector Calculus Summary", author: "Mike T.", size: "2.4 MB", date: "Feb 06" },
    { id: 2, title: "Practice Problem Set 3", author: "Sarah J.", size: "1.1 MB", date: "Feb 05" },
];

const GROUP_TESTS = [
    { id: 1, title: "Weekly Quiz: Integration", duration: "30 min", questions: 10, status: "Active" },
    { id: 2, title: "Mock Midterm", duration: "90 min", questions: 25, status: "Scheduled" },
];

export default function GroupWorkspace() {
    const { groupId } = useParams();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('discussion');
    const [message, setMessage] = useState('');
    const { getGroupNotes } = useNotes();

    const renderContent = () => {
        switch (activeTab) {
            case 'discussion':
                return (
                    <div className="flex flex-col h-full bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="p-4 border-b border-gray-100 bg-gray-50">
                            <h3 className="font-bold text-gray-700 flex items-center gap-2"><FaHashtag className="text-gray-400" /> General Discussion</h3>
                        </div>
                        <div className="flex-1 p-6 overflow-y-auto space-y-6">
                            {DISCUSSION_THREADS.map(thread => (
                                <div key={thread.id} className={`flex gap-4 ${thread.pinned ? 'bg-yellow-50/50 p-4 rounded-xl border border-yellow-100' : ''}`}>
                                    <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold flex-shrink-0">
                                        {thread.user[0]}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-baseline mb-1">
                                            <h4 className="font-bold text-gray-800 text-sm">{thread.user} {thread.pinned && <span className="ml-2 bg-yellow-100 text-yellow-700 text-[10px] uppercase font-bold px-1.5 py-0.5 rounded">Pinned</span>}</h4>
                                            <span className="text-xs text-gray-400">{thread.time}</span>
                                        </div>
                                        <p className="text-gray-600 text-sm leading-relaxed">{thread.text}</p>
                                        {thread.replies > 0 && <button className="text-indigo-600 text-xs font-semibold mt-2 hover:underline">{thread.replies} Replies</button>}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="p-4 border-t border-gray-100 bg-white">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder="Type your doubt or message..."
                                    className="flex-1 px-4 py-3 rounded-xl bg-gray-50 border-transparent focus:bg-white focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100 transition-all text-sm outline-none"
                                />
                                <button className="p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors">
                                    <FaPaperPlane />
                                </button>
                            </div>
                        </div>
                    </div>
                );
            case 'notes':
                const groupNotes = getGroupNotes(groupId);
                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {groupNotes.length > 0 ? groupNotes.map(note => (
                            <div key={note.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all cursor-pointer group">
                                <div className="w-10 h-10 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center text-lg mb-4">
                                    <FaBook />
                                </div>
                                <h4 className="font-bold text-gray-800 mb-1 group-hover:text-indigo-600 transition-colors">{note.title}</h4>
                                <p className="text-xs text-gray-500 mb-4">Uploaded by {note.author} • {note.date}</p>
                                <div className="flex justify-between items-center pt-3 border-t border-gray-50">
                                    <span className="text-xs font-mono text-gray-400">{note.size}</span>
                                    <button className="text-indigo-600 text-xs font-bold hover:underline">Download</button>
                                </div>
                            </div>
                        )) : (
                            <div className="col-span-full text-center py-10 text-gray-400">
                                <FaBook className="mx-auto text-3xl mb-2 opacity-20" />
                                <p>No shared notes yet.</p>
                            </div>
                        )}
                        <button className="border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center p-6 text-gray-400 hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50/30 transition-all h-48">
                            <FaPlus className="mb-2" />
                            <span className="text-sm font-semibold">Upload Note</span>
                        </button>
                    </div>
                );
            case 'tests':
                return (
                    <div className="space-y-4">
                        {GROUP_TESTS.map(test => (
                            <div key={test.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
                                <div>
                                    <h4 className="font-bold text-gray-800 mb-1">{test.title}</h4>
                                    <div className="text-sm text-gray-500 flex gap-3">
                                        <span>{test.questions} Questions</span>
                                        <span>•</span>
                                        <span>{test.duration}</span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => navigate(`/test-window/${test.id}`)}
                                    className={`px-5 py-2 rounded-lg font-bold text-sm transition-colors ${test.status === 'Active' ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                                >
                                    {test.status === 'Active' ? 'Start Test' : 'Coming Soon'}
                                </button>
                            </div>
                        ))}
                    </div>
                );
            case 'schedule':
                return (
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center text-gray-500">
                        <FaCalendarAlt className="text-4xl mx-auto mb-4 text-gray-300" />
                        <p>No upcoming scheduled events for this group.</p>
                        <button className="mt-4 text-indigo-600 font-semibold hover:underline">Sync Calendar</button>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-[#f8fbfa] p-4 lg:p-8 flex flex-col h-screen">
            <header className="flex-shrink-0 mb-6 flex items-center gap-4">
                <button onClick={() => navigate('/groups')} className="p-2 hover:bg-white rounded-full transition-colors text-gray-500">
                    <FaArrowLeft />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Advanced Calculus Study Circle</h1>
                    <p className="text-sm text-gray-500">142 Members • Public Group</p>
                </div>
                <div className="ml-auto flex gap-2">
                    <button className="p-2 text-gray-400 hover:text-gray-900"><FaEllipsisV /></button>
                </div>
            </header>

            <div className="flex-1 flex gap-8 overflow-hidden">
                {/* Sidebar Navigation */}
                <aside className="w-64 flex-shrink-0 hidden lg:block">
                    <nav className="space-y-1">
                        {[
                            { id: 'discussion', label: 'Discussion', icon: <FaHashtag /> },
                            { id: 'notes', label: 'Shared Notes', icon: <FaBook /> },
                            { id: 'tests', label: 'Group Tests', icon: <FaClipboardList /> },
                            { id: 'schedule', label: 'Schedule', icon: <FaCalendarAlt /> },
                        ].map(item => (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${activeTab === item.id
                                    ? 'bg-white text-indigo-600 shadow-sm border border-gray-100'
                                    : 'text-gray-500 hover:bg-white/50 hover:text-gray-900'
                                    }`}
                            >
                                <span className="text-lg">{item.icon}</span>
                                {item.label}
                            </button>
                        ))}
                    </nav>
                </aside>

                {/* Main Content */}
                <main className="flex-1 overflow-y-auto">
                    {renderContent()}
                </main>
            </div>
        </div>
    );
}
