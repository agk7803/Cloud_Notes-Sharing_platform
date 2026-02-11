import React, { useState } from 'react';
import { FaCloudUploadAlt, FaTimes, FaLock, FaGlobe, FaUsers } from 'react-icons/fa';

const MOCK_GROUPS = [
    { id: 1, name: "Sem 6 Official", type: "public_group" },
    { id: 2, name: "Machine Learning Projects", type: "public_group" },
    { id: 3, name: "Placement Preparation 2026", type: "public_group" },
    { id: 4, name: "Hostel Block A Study Group", type: "private_group" },
    { id: 5, name: "Compiler Design Lab Team", type: "private_group" },
    { id: 6, name: "Weekend Hackathon Squad", type: "private_group" },
];

export default function UploadModal({ isOpen, onClose, onUpload }) {
    const [title, setTitle] = useState('');
    const [subject, setSubject] = useState('');
    const [visibility, setVisibility] = useState('private_group'); // private_group, public_group
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

        if (selectedGroups.length === 0) {
            alert("Please select at least one group.");
            return;
        }

        onUpload({
            title,
            subject,
            visibility,
            sharedGroups: selectedGroups,
            file: file
        });
        // Reset
        setTitle('');
        setSubject('');
        setVisibility('private_group');
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-gray-100 flex flex-col max-h-[90vh] animate-fade-in-up">
                <div className="flex justify-between items-center p-5 border-b border-gray-100 bg-gray-50/50 flex-shrink-0">
                    <h3 className="text-lg font-bold text-gray-800">Upload Note</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <FaTimes />
                    </button>
                </div>

                <div className="overflow-y-auto p-5 space-y-5 custom-scrollbar">
                    <form id="upload-form" onSubmit={handleSubmit} className="space-y-5">
                        {/* File Drop Area */}
                        <div className="border-2 border-dashed border-indigo-200 rounded-2xl p-6 flex flex-col items-center justify-center bg-indigo-50/30 hover:bg-indigo-50 transition-colors cursor-pointer relative group">
                            <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleFileChange} required />
                            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-2 group-hover:scale-110 transition-transform">
                                <FaCloudUploadAlt className="text-2xl text-indigo-500" />
                            </div>
                            <p className="font-medium text-sm text-gray-700 text-center">{file ? file.name : "Click or Drag to Upload"}</p>
                            <p className="text-[10px] text-gray-400 mt-1">PDF, DOCX, PPTX up to 10MB</p>
                        </div>

                        {/* Metadata */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-gray-500 uppercase">Title</label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={e => setTitle(e.target.value)}
                                    placeholder="e.g. Unit 3 Notes"
                                    className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-sm"
                                    required
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-gray-500 uppercase">Subject</label>
                                <select
                                    value={subject}
                                    onChange={e => setSubject(e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-white text-sm"
                                    required
                                >
                                    <option value="" disabled>Select Subject</option>
                                    <option value="Machine Learning">Machine Learning</option>
                                    <option value="Compiler Design">Compiler Design</option>
                                    <option value="Computer Networks">Computer Networks</option>
                                    <option value="Software Engineering">Software Engineering</option>
                                    <option value="Cloud Computing">Cloud Computing</option>
                                    <option value="Web Engineering">Web Engineering</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                        </div>

                        {/* Visibility & Sharing */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-gray-500 uppercase">Visibility (Group Selection Required)</label>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={() => setVisibility('private_group')}
                                    className={`flex flex-col items-center p-2.5 rounded-xl border-2 transition-all ${visibility === 'private_group' ? 'border-gray-500 bg-gray-50 text-gray-800' : 'border-gray-100 hover:border-gray-200 text-gray-500'}`}
                                >
                                    <FaLock className="mb-1 text-sm" />
                                    <span className="text-[10px] font-bold">Private Group</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setVisibility('public_group')}
                                    className={`flex flex-col items-center p-2.5 rounded-xl border-2 transition-all ${visibility === 'public_group' ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-100 hover:border-gray-200 text-gray-500'}`}
                                >
                                    <FaGlobe className="mb-1 text-sm" />
                                    <span className="text-[10px] font-bold">Public Group</span>
                                </button>
                            </div>
                        </div>

                        {/* Group Selection (Always Visible) */}
                        <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 max-h-24 overflow-y-auto custom-scrollbar">
                            <p className="text-[10px] font-bold text-gray-500 mb-2 uppercase">Select Group (Required):</p>
                            <div className="space-y-1.5">
                                {MOCK_GROUPS.filter(g => g.type === visibility).map(group => (
                                    <label key={group.id} className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 p-1 rounded-lg transition-colors">
                                        <input
                                            type="checkbox"
                                            checked={selectedGroups.includes(group.id)}
                                            onChange={() => toggleGroup(group.id)}
                                            className="w-3.5 h-3.5 text-indigo-600 rounded focus:ring-indigo-500"
                                        />
                                        <span className="text-xs text-gray-700">{group.name}</span>
                                    </label>
                                ))}
                            </div>
                            {selectedGroups.length === 0 && (
                                <p className="text-[10px] text-red-500 mt-1">* Please select at least one group.</p>
                            )}
                        </div>
                    </form>
                </div>

                <div className="p-5 border-t border-gray-100 bg-gray-50/50 flex-shrink-0">
                    <button
                        type="submit"
                        form="upload-form"
                        className="w-full bg-black text-white py-3 rounded-xl font-bold text-sm hover:bg-gray-800 transition-transform active:scale-[0.98]"
                    >
                        Upload Note
                    </button>
                </div>
            </div>
        </div>
    );
}
