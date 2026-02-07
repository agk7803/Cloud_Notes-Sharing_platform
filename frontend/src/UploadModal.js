import React, { useState } from 'react';
import { FaCloudUploadAlt, FaTimes, FaLock, FaGlobe, FaUsers } from 'react-icons/fa';

const MOCK_GROUPS = [
    { id: 1, name: "Advanced Calculus Study Circle" },
    { id: 2, name: "Physics GRE Prep" },
    { id: 3, name: "European History Enthusiasts" },
    { id: 4, name: "Organic Chemistry Lab Group" },
];

export default function UploadModal({ isOpen, onClose, onUpload }) {
    const [title, setTitle] = useState('');
    const [subject, setSubject] = useState('');
    const [visibility, setVisibility] = useState('private'); // private, public, groups
    const [selectedGroups, setSelectedGroups] = useState([]);
    const [file, setFile] = useState(null);

    if (!isOpen) return null;

    const handleFileChange = (e) => {
        if (e.target.files[0]) {
            setFile(e.target.files[0]);
            if (!title) setTitle(e.target.files[0].name.split('.')[0]);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onUpload({
            title,
            subject,
            visibility,
            sharedGroups: visibility === 'groups' ? selectedGroups : [],
            file: file ? file.name : 'Untitled'
        });
        // Reset
        setTitle('');
        setSubject('');
        setVisibility('private');
        setSelectedGroups([]);
        setFile(null);
        onClose();
    };

    const toggleGroup = (id) => {
        setSelectedGroups(prev =>
            prev.includes(id) ? prev.filter(g => g !== id) : [...prev, id]
        );
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-gray-100 overflow-hidden animate-fade-in-up">
                <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50/50">
                    <h3 className="text-xl font-bold text-gray-800">Upload Note</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <FaTimes />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* File Drop Area */}
                    <div className="border-2 border-dashed border-indigo-200 rounded-2xl p-8 flex flex-col items-center justify-center bg-indigo-50/30 hover:bg-indigo-50 transition-colors cursor-pointer relative group">
                        <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleFileChange} required />
                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-3 group-hover:scale-110 transition-transform">
                            <FaCloudUploadAlt className="text-3xl text-indigo-500" />
                        </div>
                        <p className="font-medium text-gray-700">{file ? file.name : "Click or Drag to Upload"}</p>
                        <p className="text-xs text-gray-400 mt-1">PDF, DOCX, PPTX up to 10MB</p>
                    </div>

                    {/* Metadata */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 uppercase">Title</label>
                            <input
                                type="text"
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                placeholder="e.g. Week 4 Summary"
                                className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                                required
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 uppercase">Subject</label>
                            <select
                                value={subject}
                                onChange={e => setSubject(e.target.value)}
                                className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-white"
                                required
                            >
                                <option value="" disabled>Select Subject</option>
                                <option value="Mathematics">Mathematics</option>
                                <option value="Physics">Physics</option>
                                <option value="History">History</option>
                                <option value="Chemistry">Chemistry</option>
                                <option value="Computer Science">Computer Science</option>
                            </select>
                        </div>
                    </div>

                    {/* Visibility */}
                    <div className="space-y-3">
                        <label className="text-xs font-bold text-gray-500 uppercase">Visibility & Sharing</label>
                        <div className="grid grid-cols-3 gap-3">
                            <button
                                type="button"
                                onClick={() => setVisibility('private')}
                                className={`flex flex-col items-center p-3 rounded-xl border-2 transition-all ${visibility === 'private' ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-gray-100 hover:border-gray-200 text-gray-500'}`}
                            >
                                <FaLock className="mb-1" />
                                <span className="text-xs font-bold">Private</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setVisibility('public')}
                                className={`flex flex-col items-center p-3 rounded-xl border-2 transition-all ${visibility === 'public' ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-100 hover:border-gray-200 text-gray-500'}`}
                            >
                                <FaGlobe className="mb-1" />
                                <span className="text-xs font-bold">Public</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setVisibility('groups')}
                                className={`flex flex-col items-center p-3 rounded-xl border-2 transition-all ${visibility === 'groups' ? 'border-purple-500 bg-purple-50 text-purple-700' : 'border-gray-100 hover:border-gray-200 text-gray-500'}`}
                            >
                                <FaUsers className="mb-1" />
                                <span className="text-xs font-bold">Groups</span>
                            </button>
                        </div>
                    </div>

                    {/* Group Selection (Conditional) */}
                    {visibility === 'groups' && (
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 max-h-32 overflow-y-auto">
                            <p className="text-xs font-bold text-gray-500 mb-2 uppercase">Select Groups to Share With:</p>
                            <div className="space-y-2">
                                {MOCK_GROUPS.map(group => (
                                    <label key={group.id} className="flex items-center gap-3 cursor-pointer hover:bg-gray-100 p-1.5 rounded-lg transition-colors">
                                        <input
                                            type="checkbox"
                                            checked={selectedGroups.includes(group.id)}
                                            onChange={() => toggleGroup(group.id)}
                                            className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                                        />
                                        <span className="text-sm text-gray-700">{group.name}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    )}

                    <button type="submit" className="w-full bg-black text-white py-3.5 rounded-xl font-bold hover:bg-gray-800 transition-transform active:scale-[0.98]">
                        Upload Note
                    </button>
                </form>
            </div>
        </div>
    );
}
