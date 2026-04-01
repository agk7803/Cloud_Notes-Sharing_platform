import React, { useState } from 'react';
import { FaLink, FaEnvelope, FaLock, FaCheck, FaCopy } from 'react-icons/fa';
import api from '../../services/api';
import '../../styles/Invitemodal.css';

export default function InviteModal({ group, onClose }) {
    const [copied, setCopied] = useState(false);
    const [email, setEmail] = useState('');
    const [sending, setSending] = useState(false);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState('');

    const inviteLink = `${window.location.origin}/groups/${group._id}/invite`;

    const handleCopy = () => {
        navigator.clipboard?.writeText(inviteLink).catch(() => { });
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!email.trim()) return;
        setError('');
        setSending(true);
        try {
            await api.post(`/groups/${group._id}/invite`, { email: email.trim() });
            setSent(true);
            setEmail('');
            setTimeout(() => setSent(false), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to sync transmission');
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-box inv-modal-box" onClick={e => e.stopPropagation()}>

                {/* --- Header --- */}
                <div className="inv-header">
                    <div>
                        <h2 className="inv-header__title">Hub Provisioning</h2>
                        <p className="inv-header__sub">Invite authorized members to {group.name}</p>
                    </div>
                    <button className="inv-close" onClick={onClose}>✕</button>
                </div>

                {/* --- Body --- */}
                <div className="inv-body">
                    
                    {/* Copy Link Section */}
                    <div className="inv-group">
                        <label className="inv-label"><FaLink size={10} color="#7ec8c8" /> Quick-Access Invite Link</label>
                        <div className="inv-link-row">
                            <div className="inv-box">{inviteLink}</div>
                            <button 
                                className={`inv-btn-copy ${copied ? 'inv-btn-copy--copied' : 'inv-btn-copy--default'}`}
                                onClick={handleCopy}
                            >
                                {copied ? <><FaCheck size={10} /> Copied</> : <><FaCopy size={10} /> Copy</>}
                            </button>
                        </div>
                    </div>

                    <div className="inv-divider">
                        <span>or provision by email</span>
                    </div>

                    {/* Email Provisioning Section */}
                    <div className="inv-group">
                        <label className="inv-label"><FaEnvelope size={10} color="#7ec8c8" /> Email Intelligence</label>
                        <form className="inv-link-row" onSubmit={handleSend}>
                            <input 
                                className="inv-input-modern"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                placeholder="academic@university.edu"
                                type="email"
                            />
                            <button 
                                type="submit" 
                                className={`inv-btn-send ${sent ? 'sent' : ''}`}
                                disabled={sending || !email.trim()}
                            >
                                {sending ? '...' : sent ? '✦ Provisioned' : '✦ Send Invite'}
                            </button>
                        </form>
                        {error && <p className="inv-error">{error}</p>}
                    </div>

                    {/* Notice */}
                    {group.type === 'Private' && (
                        <div className="inv-notice">
                            <FaLock size={12} style={{ flexShrink: 0, marginTop: 2, color: '#f59e0b' }} />
                            <div>
                                <strong>Private Infrastructure</strong> — Authorized invitations only.
                                Uninvited personnel must submit a formal join request for administrative review.
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}