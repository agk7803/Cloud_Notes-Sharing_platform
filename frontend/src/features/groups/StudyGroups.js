import React, { useState, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { FaUsers, FaSearch, FaFilter, FaLock, FaGlobe, FaPlus } from 'react-icons/fa';
import api from '../../services/api';

const CreateGroupModal = ({ onClose, onCreated }) => {
    const [name, setName] = useState('');
    const [subject, setSubject] = useState('');
    const [description, setDescription] = useState('');
    const [type, setType] = useState('Public');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post('/groups', { name, subject, description, type });
            onCreated(res.data);
            onClose();
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to create group');
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
                <h3 className="text-xl font-bold mb-4">Create New Group</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Group Name</label>
                        <input required type="text" value={name} onChange={e => setName(e.target.value)} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-[#1dc962] outline-none" placeholder="Ex: Cloud Computing Study Circle" />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Subject</label>
                        <input required type="text" value={subject} onChange={e => setSubject(e.target.value)} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-[#1dc962] outline-none" placeholder="Ex: Cloud Computing" />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Description</label>
                        <textarea value={description} onChange={e => setDescription(e.target.value)} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-[#1dc962] outline-none" placeholder="Brief description..." />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Type</label>
                        <select value={type} onChange={e => setType(e.target.value)} className="w-full p-2 border rounded-lg outline-none">
                            <option value="Public">Public (Anyone can join)</option>
                            <option value="Private">Private (Invite only)</option>
                        </select>
                    </div>
                    <button type="submit" className="w-full py-3 bg-[#1dc962] text-white font-bold rounded-xl hover:bg-green-600 transition-colors">
                        Create Group
                    </button>
                </form>
            </div>
        </div>
    );
};

export default function StudyGroups() {
    const navigate = useNavigate();
    const { user } = useOutletContext();
    const [activeTab, setActiveTab] = useState('all');
    const [groups, setGroups] = useState([]);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [loading, setLoading] = useState(true);

    const fetchGroups = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/groups?filter=${activeTab}`);
            setGroups(res.data);
        } catch (error) {
            console.error("Failed to fetch groups", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGroups();
    }, [activeTab]);

    const handleCreate = (newGroup) => {
        setGroups([newGroup, ...groups]);
    };

    const handleGroupClick = async (group) => {
        if (group.members.includes(user.uid)) {
            navigate(`/groups/${group._id}`);
        } else if (group.type === 'Public') {
            if (window.confirm(`Join "${group.name}"?`)) {
                try {
                    await api.post(`/groups/${group._id}/join`);
                    navigate(`/groups/${group._id}`);
                } catch (error) {
                    alert(error.response?.data?.message || "Failed to join group");
                }
            }
        } else {
            alert("This group is private. You need an invite to join.");
        }
    };

    return (
        <div className="min-h-screen p-8">
            <div className="max-w-6xl mx-auto">
                <div className="mb-10">
                    <header className="flex flex-col md:flex-row justify-between md:items-center gap-6">
                        <div className="space-y-2">
                            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900">
                                Study Groups
                            </h1>
                            <p className="text-gray-500 text-lg">Collaborate and prepare with peers.</p>
                        </div>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="group flex items-center gap-2 px-6 py-3 rounded-xl bg-black text-white font-semibold hover:bg-gray-800 hover:shadow-xl shadow-lg active:scale-95 transition-all duration-200"
                        >
                            <FaPlus className="transition-transform duration-300 group-hover:rotate-90" />
                            Create New Group
                        </button>
                    </header>
                </div>

                {showCreateModal && <CreateGroupModal onClose={() => setShowCreateModal(false)} onCreated={handleCreate} />}

                {/* Toolbar */}
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-8 flex flex-col md:flex-row gap-4 justify-between items-center">
                    <div className="flex gap-2 p-1 bg-gray-50 rounded-xl">
                        {['All Groups', 'My Groups'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab.toLowerCase().split(' ')[0])}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === tab.toLowerCase().split(' ')[0]
                                    ? 'bg-white text-[#1dc962] shadow-sm'
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
                                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 text-sm"
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
                    {loading ? (
                        <div className="col-span-full py-12 text-center text-gray-500">Loading groups...</div>
                    ) : groups.length > 0 ? (
                        groups.map(group => (
                            <div key={group._id} className="bg-white p-6 rounded-2xl border border-gray-100 hover:border-green-200 hover:shadow-lg transition-all cursor-pointer group flex flex-col justify-between h-56"
                                onClick={() => handleGroupClick(group)}
                            >
                                <div>
                                    <div className="flex justify-between items-start mb-4">
                                        <span className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${group.type === 'Public' ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'}`}>
                                            {group.type === 'Public' ? <FaGlobe /> : <FaLock />} {group.type}
                                        </span>
                                        <div className="text-gray-400 text-sm font-semibold flex items-center gap-1">
                                            <FaUsers /> {group.members.length}
                                        </div>
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-[#1dc962] transition-colors line-clamp-2">{group.name}</h3>
                                    <p className="text-sm text-gray-500 font-medium">{group.subject}</p>
                                </div>

                                <div className="pt-4 border-t border-gray-50 flex items-center gap-3">
                                    <div className="flex -space-x-2 overflow-hidden">
                                        {group.members.slice(0, 3).map((member, i) => (
                                            <div key={i} className="inline-block h-8 w-8 rounded-full ring-2 ring-white bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-500">
                                                U{i + 1}
                                            </div>
                                        ))}
                                    </div>
                                    <span className="text-xs text-gray-400 font-medium">
                                        {group.members.length > 3 ? `+ ${group.members.length - 3} others` : ''}
                                    </span>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full py-12 text-center text-gray-500">
                            <p>No groups found. Create one to get started!</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
