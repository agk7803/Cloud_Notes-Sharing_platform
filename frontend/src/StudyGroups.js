import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUsers, FaSearch, FaFilter, FaLock, FaGlobe } from 'react-icons/fa';

const MOCK_GROUPS = [
    { id: 1, name: "Advanced Calculus Study Circle", subject: "Mathematics", members: 142, type: "Public" },
    { id: 2, name: "Physics GRE Prep", subject: "Physics", members: 56, type: "Private" },
    { id: 3, name: "European History Enthusiasts", subject: "History", members: 89, type: "Public" },
    { id: 4, name: "Organic Chemistry Lab Group", subject: "Chemistry", members: 24, type: "Private" },
];

export default function StudyGroups() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('all');

    return (
        <div className="min-h-screen bg-[#f8fbfa] p-8">
            <div className="max-w-6xl mx-auto">
                <header className="mb-10 flex justify-between items-end">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Study Groups</h1>
                        <p className="text-gray-500 mt-1">Collaborate, discuss, and prepare with peers.</p>
                    </div>
                    <button className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-colors shadow-sm">
                        + Create New Group
                    </button>
                </header>

                {/* Toolbar */}
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-8 flex flex-col md:flex-row gap-4 justify-between items-center">
                    <div className="flex gap-2 p-1 bg-gray-50 rounded-xl">
                        {['All Groups', 'My Groups'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab.toLowerCase().split(' ')[0])}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === tab.toLowerCase().split(' ')[0]
                                        ? 'bg-white text-indigo-600 shadow-sm'
                                        : 'text-gray-500 hover:text-gray-900'
                                    }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    <div className="flex gap-3 w-full md:w-auto">
                        <div className="relative flex-1 md:w-64">
                            <input
                                type="text"
                                placeholder="Search groups..."
                                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm"
                            />
                            <FaSearch className="absolute left-3.5 top-3 text-gray-400" />
                        </div>
                        <button className="p-2.5 border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-50">
                            <FaFilter />
                        </button>
                    </div>
                </div>

                {/* Groups Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {MOCK_GROUPS.map(group => (
                        <div key={group.id} className="bg-white p-6 rounded-2xl border border-gray-100 hover:border-indigo-200 hover:shadow-lg transition-all cursor-pointer group flex flex-col justify-between h-56"
                            onClick={() => navigate(`/groups/${group.id}`)}
                        >
                            <div>
                                <div className="flex justify-between items-start mb-4">
                                    <span className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${group.type === 'Public' ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'}`}>
                                        {group.type === 'Public' ? <FaGlobe /> : <FaLock />} {group.type}
                                    </span>
                                    <div className="text-gray-400 text-sm font-semibold flex items-center gap-1">
                                        <FaUsers /> {group.members}
                                    </div>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-indigo-600 transition-colors line-clamp-2">{group.name}</h3>
                                <p className="text-sm text-gray-500 font-medium">{group.subject}</p>
                            </div>

                            <div className="pt-4 border-t border-gray-50 flex items-center gap-3">
                                <div className="flex -space-x-2 overflow-hidden">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="inline-block h-8 w-8 rounded-full ring-2 ring-white bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-500">
                                            U{i}
                                        </div>
                                    ))}
                                </div>
                                <span className="text-xs text-gray-400 font-medium">+ {group.members - 3} others</span>
                            </div>
                        </div>
                    ))}

                    {/* Create New Placeholder */}
                    <button className="border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center p-6 text-gray-400 hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50/30 transition-all h-56">
                        <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center mb-3 group-hover:bg-indigo-100">
                            <span className="text-2xl font-light">+</span>
                        </div>
                        <span className="font-semibold">Create New Group</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
