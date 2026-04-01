import React, { useState, useEffect } from 'react';
import { FaCloudUploadAlt, FaTimes } from 'react-icons/fa';
import api from '../../services/api';

const SUBJECTS = ["Machine Learning", "Compiler Design", "Computer Networks", "Software Engineering", "Cloud Computing", "Other"];

const UploadModal = ({ onClose, onUpload }) => {
    const [title, setTitle] = useState('');
    const [subject, setSubject] = useState('');
    const [file, setFile] = useState(null);
    const [visibility, setVisibility] = useState('private');
    const [loading, setLoading] = useState(false);
    const [fetchedSubjects, setFetchedSubjects] = useState(SUBJECTS);

    useEffect(() => {
        // Fetch authoritative subjects
        api.get('/notes/subjects')
            .then(res => {
                if (Array.isArray(res.data)) setFetchedSubjects(res.data);
            })
            .catch(err => console.error("Error subjects:", err));
    }, []);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (loading) return; // High-authority Gatekeeper: Prevents duplicate broadcast
        if (!file) {
            alert("Please select a file");
            return;
        }

        setLoading(true);
        const formData = new FormData();
        formData.append('title', title);
        formData.append('subject', subject);
        formData.append('file', file);
        formData.append('visibility', visibility); // 'private' or 'public'

        try {
            const res = await api.post('/notes', formData);
            alert("Upload Successful!");
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
                            {fetchedSubjects.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>

                    <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:bg-gray-50 transition-colors cursor-pointer relative">
                        <input type="file" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" accept=".pdf,.doc,.docx,.ppt,.pptx" />
                        <FaCloudUploadAlt className="mx-auto text-4xl text-gray-400 mb-2" />
                        <p className="text-sm font-bold text-gray-600">{file ? file.name : "Click to select file"}</p>
                        <p className="text-xs text-gray-400 mt-1">PDF, Word, PPT up to 10MB</p>
                    </div>

                    {/* Visibility Section */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Visibility</label>
                        <div className="flex gap-4">
                            <label className="flex items-center gap-3 cursor-pointer p-4 border rounded-xl flex-1 hover:bg-gray-50 transition-colors">
                                <input type="radio" value="private" checked={visibility === 'private'} onChange={() => setVisibility('private')} className="accent-[#1dc962] w-5 h-5" />
                                <div>
                                    <div className="font-bold text-sm text-gray-800">Private</div>
                                    <div className="text-xs text-gray-500">Only you can access</div>
                                </div>
                            </label>
                            <label className="flex items-center gap-3 cursor-pointer p-4 border rounded-xl flex-1 hover:bg-gray-50 transition-colors">
                                <input type="radio" value="public" checked={visibility === 'public'} onChange={() => setVisibility('public')} className="accent-[#1dc962] w-5 h-5" />
                                <div>
                                    <div className="font-bold text-sm text-gray-800">Public</div>
                                    <div className="text-xs text-gray-500">Visible to all users</div>
                                </div>
                            </label>
                        </div>
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
