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
            <div className="modal-box cgm-modal-box" onClick={e => e.stopPropagation()}>

                {/* Header */}
                <div className="cgm-header">
                    <div>
                        <h2 className="cgm-header__title">Create New Group</h2>
                        <p className="cgm-header__sub">Set up your study hub in seconds</p>
                    </div>
                    <button className="cgm-close" onClick={onClose}>✕</button>
                </div>

                {/* Form */}
                <form className="cgm-body" onSubmit={handleSubmit}>
                    <div className="cgm-group">
                        <label className="cgm-label">Group Name</label>
                        <input
                            required
                            className="cgm-input"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            placeholder="e.g. Advanced Cloud Orchestration"
                            maxLength={80}
                        />
                    </div>

                    <div className="cgm-group">
                        <label className="cgm-label">Subject Category</label>
                        <input
                            required
                            className="cgm-input"
                            value={subject}
                            onChange={e => setSubject(e.target.value)}
                            placeholder="e.g. Computer Science"
                            maxLength={60}
                        />
                    </div>

                    <div className="cgm-group">
                        <label className="cgm-label">Description</label>
                        <textarea
                            className="cgm-input cgm-textarea"
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            placeholder="Share the purpose of this agora..."
                            rows={3}
                            maxLength={300}
                        />
                    </div>

                    <div className="cgm-group">
                        <label className="cgm-label">Privacy Model</label>
                        <div className="cgm-privacy-row">
                            {['Public', 'Private'].map(opt => (
                                <button
                                    key={opt}
                                    type="button"
                                    className={`cgm-privacy-btn ${type === opt ? 'cgm-privacy-btn--active' : 'cgm-privacy-btn--inactive'}`}
                                    onClick={() => setType(opt)}
                                >
                                    {opt === 'Public' ? '🌐' : '🔒'} {opt}
                                </button>
                            ))}
                        </div>
                        <p className="cgm-privacy-hint">
                            {type === 'Public'
                                ? 'Anyone can discover and join this group freely.'
                                : 'Members join by invite or administrator approval only.'}
                        </p>
                    </div>

                    {error && <p className="cgm-error">{error}</p>}

                    <div className="cgm-actions">
                        <button type="button" className="cgm-btn-cancel" onClick={onClose}>Cancel</button>
                        <button type="submit" className={`cgm-btn-submit ${loading ? 'cgm-btn-submit--disabled' : 'cgm-btn-submit--active'}`} disabled={loading}>
                            {loading ? 'CRAFTING...' : '✦ Create Hub'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}