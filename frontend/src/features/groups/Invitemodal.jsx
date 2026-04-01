import React, { useState } from 'react';
import { FaLink, FaEnvelope, FaLock } from 'react-icons/fa';
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
            setError(err.response?.data?.message || 'Failed to send invite. Please try again.');
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-box" style={{ width: 440 }} onClick={e => e.stopPropagation()}>

                <div className="modal-header" style={{ padding: '24px 28px 16px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between' }}>
                    <div>
                        <h2 className="modal-title" style={{ fontWeight: 800, fontSize: 18, color: '#1e293b' }}>Invite Members</h2>
                        <p className="modal-subtitle" style={{ fontSize: 13, color: '#94a3b8' }}>to {group.name}</p>
                    </div>
                    <button className="modal-close" onClick={onClose} style={{ background: '#f1f5f9', border: 'none', borderRadius: 8, width: 32, height: 32, cursor: 'pointer' }}>✕</button>
                </div>

                <div className="modal-body">

                    {/* Copy link */}
                    <div className="form-group">
                        <label className="form-label"><FaLink size={11} color="#7ec8c8" style={{ marginRight: 5 }} />Copy Invite Link</label>
                        <div className="invite-link-row">
                            <div className="invite-link-box">{inviteLink}</div>
                            <button
                                className={`invite-copy-btn ${copied ? 'invite-copy-btn--copied' : ''}`}
                                onClick={handleCopy}
                            >
                                {copied ? '✓ Copied!' : 'Copy'}
                            </button>
                        </div>
                    </div>

                    <div className="invite-divider"><span>or invite by email</span></div>

                    {/* Email invite */}
                    <div className="form-group">
                        <label className="form-label"><FaEnvelope size={11} color="#7ec8c8" style={{ marginRight: 5 }} />Email or Username</label>
                        <form className="invite-email-row" onSubmit={handleSend}>
                            <input
                                className="form-input"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                placeholder="friend@university.edu"
                                type="email"
                                style={{ flex: 1, marginBottom: 0 }}
                            />
                            <button
                                type="submit"
                                className={`invite-send-btn ${sent ? 'invite-send-btn--sent' : ''}`}
                                disabled={sending || !email.trim()}
                            >
                                {sending ? '...' : sent ? '✓ Sent!' : 'Send'}
                            </button>
                        </form>
                        {error && <p className="form-error" style={{ marginTop: 8 }}>{error}</p>}
                    </div>

                    {/* Private group notice */}
                    {group.type === 'Private' && (
                        <div className="invite-notice">
                            <FaLock size={12} style={{ flexShrink: 0, marginTop: 2 }} />
                            <div>
                                <strong>Private group</strong> — users not directly invited must submit a join request,
                                which admins can approve or decline.
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}