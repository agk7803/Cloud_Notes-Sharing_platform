import React, { useState } from 'react';
import api from '../../services/api';
import '../../styles/CreateGroupModal.css';

export default function CreateGroupModal({ onClose, onCreated }) {
    const [name, setName] = useState('');
    const [subject, setSubject] = useState('');
    const [description, setDescription] = useState('');
    const [type, setType] = useState('Public');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await api.post('/groups', { name, subject, description, type });
            onCreated(res.data);
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create group. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-box" onClick={e => e.stopPropagation()}>

                {/* Header */}
                <div className="modal-header">
                    <div>
                        <h2 className="modal-title">Create New Group</h2>
                        <p className="modal-subtitle">Set up your study group in seconds</p>
                    </div>
                    <button className="modal-close" onClick={onClose}>✕</button>
                </div>

                {/* Form */}
                <form className="modal-body" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Group Name</label>
                        <input
                            required
                            className="form-input"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            placeholder="e.g. Cloud Computing Study Circle"
                            maxLength={80}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Subject</label>
                        <input
                            required
                            className="form-input"
                            value={subject}
                            onChange={e => setSubject(e.target.value)}
                            placeholder="e.g. Computer Science"
                            maxLength={60}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Description</label>
                        <textarea
                            className="form-input form-textarea"
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            placeholder="What will this group study?"
                            rows={3}
                            maxLength={300}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Privacy</label>
                        <div className="form-toggle-row">
                            {['Public', 'Private'].map(opt => (
                                <button
                                    key={opt}
                                    type="button"
                                    className={`form-toggle ${type === opt ? 'form-toggle--active' : ''}`}
                                    onClick={() => setType(opt)}
                                >
                                    {opt === 'Public' ? '🌐' : '🔒'} {opt}
                                </button>
                            ))}
                        </div>
                        <p className="form-hint">
                            {type === 'Public'
                                ? 'Anyone can discover and join this group'
                                : 'Members join by invite or approval only'}
                        </p>
                    </div>

                    {error && <p className="form-error">{error}</p>}

                    <div className="modal-actions">
                        <button type="button" className="btn-cancel" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn-submit" disabled={loading}>
                            {loading ? 'Creating...' : '✦ Create Group'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}