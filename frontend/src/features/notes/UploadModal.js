import React, { useState, useEffect } from 'react';
import { FaCloudUploadAlt, FaTimes, FaUsers } from 'react-icons/fa';
import api from '../../services/api';

const SUBJECTS = ["Machine Learning", "Compiler Design", "Computer Networks", "Software Engineering", "Cloud Computing", "Web Engineering", "Other"];

const UploadModal = ({ onClose, onUpload }) => {
    const [title, setTitle] = useState('');
    const [subject, setSubject] = useState('');
    const [file, setFile] = useState(null);
    const [visibility, setVisibility] = useState('private');
    const [userGroups, setUserGroups] = useState([]);
    const [selectedGroups, setSelectedGroups] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Fetch user's groups for sharing
        const fetchGroups = async () => {
            try {
                const res = await api.get('/groups?filter=my');
                setUserGroups(res.data);
            } catch (error) {
                console.error("Failed to fetch groups", error);
            }
        };
        fetchGroups();
    }, []);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const toggleGroupSelection = (groupId) => {
        if (selectedGroups.includes(groupId)) {
            setSelectedGroups(selectedGroups.filter(id => id !== groupId));
        } else {
            setSelectedGroups([...selectedGroups, groupId]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) {
            alert("Please select a file");
            return;
        }

        setLoading(true);
        const formData = new FormData();
        formData.append('title', title);
        formData.append('subject', subject);
        formData.append('file', file);
        formData.append('visibility', visibility); // 'private' or 'groups'

        if (selectedGroups.length > 0) {
            formData.append('sharedGroups', JSON.stringify(selectedGroups));
            // If groups selected, force visibility to groups logic if not set
            // But backend handles visibility tag. 
            // Ideally if groups selected, visibility should indicate that.
        }

        try {
            const res = await api.post('/notes', formData);
            onUpload(res.data);
            onClose();
        } catch (error) {
            console.error("Upload failed", error);
            alert(error.response?.data?.message || "Upload failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-gray-800">Upload Note</h3>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <FaTimes />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Title</label>
                        <input required type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-[#1dc962] outline-none bg-gray-50" placeholder="Ex: Cloud Architecture Notes" />
                    </div>



                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Subject</label>
                        <select required value={subject} onChange={e => setSubject(e.target.value)} className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-[#1dc962] outline-none bg-gray-50">
                            <option value="" disabled>Select Subject</option>
                            {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>

                    <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:bg-gray-50 transition-colors cursor-pointer relative">
                        <input type="file" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" accept=".pdf,.doc,.docx,.ppt,.pptx" />
                        <FaCloudUploadAlt className="mx-auto text-4xl text-gray-400 mb-2" />
                        <p className="text-sm font-bold text-gray-600">{file ? file.name : "Click to select file"}</p>
                        <p className="text-xs text-gray-400 mt-1">PDF, Word, PPT up to 10MB</p>
                    </div>

                    {/* Sharing Section */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Share with Groups (Optional)</label>
                        {userGroups.length > 0 ? (
                            <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-2 border rounded-xl bg-gray-50">
                                {userGroups.map(group => (
                                    <div
                                        key={group._id}
                                        onClick={() => toggleGroupSelection(group._id)}
                                        className={`p-2 rounded-lg text-sm font-medium cursor-pointer border transition-all flex items-center gap-2 ${selectedGroups.includes(group._id)
                                            ? 'bg-green-50 border-green-200 text-green-700'
                                            : 'bg-white border-gray-100 text-gray-600 hover:border-green-200'
                                            }`}
                                    >
                                        <div className={`w-4 h-4 rounded border flex items-center justify-center ${selectedGroups.includes(group._id) ? 'bg-[#1dc962] border-[#1dc962]' : 'border-gray-300'}`}>
                                            {selectedGroups.includes(group._id) && <span className="text-white text-[10px]">✓</span>}
                                        </div>
                                        <span className="truncate">{group.name}</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-gray-400 italic">Join groups to share notes!</p>
                        )}
                    </div>

                    <button disabled={loading} type="submit" className="w-full py-4 bg-[#1dc962] text-white font-bold rounded-xl hover:bg-green-600 transition-colors shadow-lg shadow-green-200 disabled:opacity-50">
                        {loading ? 'Uploading...' : 'Upload Note'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default UploadModal;
