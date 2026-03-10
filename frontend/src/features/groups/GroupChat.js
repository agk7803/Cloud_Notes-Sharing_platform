import React, { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { FaPaperPlane, FaMicrophone, FaStop, FaTrash, FaPen, FaTimes, FaCheck, FaReply, FaUsers } from 'react-icons/fa';

import api from '../../services/api';
import { getAvatarColor, ROLE_STYLES } from './Constants';
import '../../styles/GroupChat.css';

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5050';

// ─── Avatar ────────────────────────────────────────────────────────────────────
const Avatar = ({ name = '', uid = '', size = 28 }) => {
    const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
    return (
        <div style={{
            width: size, height: size, minWidth: size,
            background: getAvatarColor(uid || name),
            borderRadius: size * 0.3,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: size * 0.34, fontWeight: 800, color: '#1e293b',
            border: '1.5px solid rgba(0,0,0,0.07)',
        }}>
            {initials}
        </div>
    );
};

// ─── Inline Markdown (for AI messages) ────────────────────────────────────────
const SimpleMarkdown = ({ text }) => (
    <div className="gc-markdown">
        {text.split('\n').map((line, i) => {
            if (line.startsWith('## ')) return <div key={i} className="gc-md-h2">{line.slice(3)}</div>;
            if (/^\d+\./.test(line)) return <div key={i} className="gc-md-li">{line}</div>;
            if (!line) return <div key={i} className="gc-md-gap" />;
            return (
                <div key={i} className="gc-md-p">
                    {line.split(/(\*\*[^*]+\*\*)/g).map((p, j) =>
                        p.startsWith('**') ? <strong key={j}>{p.slice(2, -2)}</strong> : p
                    )}
                </div>
            );
        })}
    </div>
);

// ─── Single Message ────────────────────────────────────────────────────────────
const ChatMessage = ({ msg, user, onReply, onEdit, onDelete }) => {
    const [hovered, setHovered] = useState(false);
    const [editing, setEditing] = useState(false);
    const [editContent, setEditContent] = useState(msg.message);

    const isMe = msg.senderId === user?.uid;
    const isAI = msg.isAI || msg.senderId === 'ai';

    const submitEdit = () => {
        if (!editContent.trim()) return;
        onEdit(msg._id, editContent);
        setEditing(false);
    };

    return (
        <div
            className="gc-msg"
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{ alignItems: isMe ? 'flex-end' : 'flex-start' }}
        >
            {/* Meta */}
            <div className="gc-msg__meta" style={{ flexDirection: isMe ? 'row-reverse' : 'row' }}>
                <Avatar name={msg.senderName || ''} uid={msg.senderId || ''} size={26} />
                <span className="gc-msg__sender" style={{ color: isAI ? '#1a7a7a' : isMe ? '#b5376e' : '#475569' }}>
                    {msg.senderName}
                </span>
                <span className="gc-msg__time">{msg.timestamp || (msg.createdAt && new Date(msg.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }))}</span>

                {hovered && !editing && (
                    <div className="gc-msg__actions">
                        <button className="gc-action-btn" onClick={() => onReply(msg)}>
                            <FaReply size={10} /> Reply
                        </button>
                        {isMe && msg.messageType !== 'audio' && (
                            <button className="gc-action-btn gc-action-btn--edit" onClick={() => setEditing(true)}>
                                <FaPen size={9} /> Edit
                            </button>
                        )}
                        {isMe && (
                            <button className="gc-action-btn gc-action-btn--del" onClick={() => onDelete(msg._id)}>
                                <FaTrash size={9} /> Delete
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Bubble */}
            <div style={{ maxWidth: '80%' }}>
                {msg.replyTo && (
                    <div className="gc-reply-preview">
                        <strong>{msg.replyTo.senderName}:</strong>{' '}
                        {msg.replyTo.message?.slice(0, 60)}{msg.replyTo.message?.length > 60 ? '…' : ''}
                    </div>
                )}

                {editing ? (
                    <div className="gc-edit-box">
                        <input
                            autoFocus
                            className="gc-edit-input"
                            value={editContent}
                            onChange={e => setEditContent(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter') submitEdit(); if (e.key === 'Escape') setEditing(false); }}
                        />
                        <div className="gc-edit-actions">
                            <button className="gc-edit-btn" onClick={() => setEditing(false)}><FaTimes size={10} /> Cancel</button>
                            <button className="gc-edit-btn gc-edit-btn--save" onClick={submitEdit}><FaCheck size={10} /> Save</button>
                        </div>
                    </div>
                ) : isAI ? (
                    <div className="gc-bubble gc-bubble--ai" style={{ borderRadius: msg.replyTo ? '0 12px 12px 12px' : '4px 12px 12px 12px' }}>
                        <div className="gc-bubble__ai-label">✦ StuNotes AI</div>
                        <SimpleMarkdown text={msg.message} />
                    </div>
                ) : msg.messageType === 'audio' ? (
                    <div className={`gc-bubble ${isMe ? 'gc-bubble--me' : 'gc-bubble--other'}`} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ fontSize: 18 }}>🎙️</span>
                        <audio controls src={msg.audioUrl} style={{ height: 28, maxWidth: 180 }} />
                    </div>
                ) : (
                    <div
                        className={`gc-bubble ${isMe ? 'gc-bubble--me' : 'gc-bubble--other'}`}
                        style={{ borderRadius: msg.replyTo ? (isMe ? '12px 0 12px 12px' : '0 12px 12px 12px') : undefined }}
                    >
                        {msg.message}
                    </div>
                )}
            </div>
        </div>
    );
};

// ─── Group Chat ────────────────────────────────────────────────────────────────
export default function GroupChat({ groupId, user, groupMembers = [] }) {
    const [messages, setMessages] = useState([]);
    const [members, setMembers] = useState([]);
    const [input, setInput] = useState('');
    const [replyingTo, setReplyingTo] = useState(null);
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const [loading, setLoading] = useState(true);

    const socketRef = useRef(null);
    const messagesEndRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const timerRef = useRef(null);

    // Fetch chat history
    useEffect(() => {
        if (!groupId) return;
        setLoading(true);
        api.get(`/groups/${groupId}/chats`)
            .then(res => setMessages(res.data || []))
            .catch(err => console.error('Chat history error:', err))
            .finally(() => setLoading(false));
    }, [groupId]);

    // Fetch members for sidebar
    useEffect(() => {
        if (!groupId) return;
        api.get(`/groups/${groupId}/members`)
            .then(res => setMembers(res.data || []))
            .catch(() => { });
    }, [groupId]);

    // Socket connection
    useEffect(() => {
        if (!groupId || !user) return;
        const socket = io(SOCKET_URL, { transports: ['websocket'], reconnection: true });
        socketRef.current = socket;
        socket.emit('join_group', groupId);
        socket.on('receive_message', msg => setMessages(prev => prev.some(m => m._id === msg._id) ? prev : [...prev, msg]));
        socket.on('message_updated', upd => setMessages(prev => prev.map(m => m._id === upd._id ? upd : m)));
        socket.on('message_deleted', id => setMessages(prev => prev.filter(m => m._id !== id)));
        return () => { socket.off(); socket.disconnect(); clearInterval(timerRef.current); };
    }, [groupId, user]);

    // Auto-scroll
    useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

    const sendMessage = () => {
        if (!input.trim()) return;
        socketRef.current?.emit('send_message', {
            groupId,
            senderId: user.uid,
            senderName: user.displayName || user.name || 'You',
            message: input.trim(),
            messageType: 'text',
            replyTo: replyingTo || null,
        });
        setInput('');
        setReplyingTo(null);
    };

    const handleEdit = (messageId, newContent) => {
        socketRef.current?.emit('edit_message', { messageId, newContent, groupId });
    };

    const handleDelete = (id) => {
        if (!window.confirm('Delete this message?')) return;
        socketRef.current?.emit('delete_message', { messageId: id, groupId });
    };

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const recorder = new MediaRecorder(stream);
            mediaRecorderRef.current = recorder;
            audioChunksRef.current = [];
            recorder.ondataavailable = e => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };
            recorder.onstop = async () => {
                stream.getTracks().forEach(t => t.stop());
                const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                const form = new FormData();
                form.append('audio', blob, 'voice.webm');
                try {
                    const res = await api.post('/upload/audio', form);
                    socketRef.current?.emit('send_message', {
                        groupId,
                        senderId: user.uid,
                        senderName: user.displayName || user.name || 'You',
                        message: 'Voice Message',
                        messageType: 'audio',
                        audioUrl: res.data.audioUrl,
                    });
                } catch { alert('Voice upload failed'); }
            };
            recorder.start();
            setIsRecording(true);
            setRecordingTime(0);
            timerRef.current = setInterval(() => setRecordingTime(t => t + 1), 1000);
        } catch { alert('Microphone permission denied'); }
    };

    const stopRecording = () => {
        mediaRecorderRef.current?.stop();
        setIsRecording(false);
        clearInterval(timerRef.current);
    };

    const fmt = s => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

    return (
        <div className="gc-root">
            {/* Chat panel */}
            <div className="gc-panel">
                <div className="gc-panel__header">
                    <span className="gc-panel__title">💬 Group Chat</span>
                    <div className="gc-live-dot"><div className="gc-live-dot__circle" />Live</div>
                </div>

                <div className="gc-messages">
                    {loading && <div className="gc-state-msg">Loading messages...</div>}
                    {!loading && messages.length === 0 && (
                        <div className="gc-state-msg">No messages yet. Say hello 👋</div>
                    )}
                    {messages.map(msg => (
                        <ChatMessage
                            key={msg._id}
                            msg={msg}
                            user={user}
                            onReply={setReplyingTo}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                        />
                    ))}
                    <div ref={messagesEndRef} />
                </div>

                <div className="gc-input-area">
                    {replyingTo && (
                        <div className="gc-reply-banner">
                            <span><strong>Replying to {replyingTo.senderName}:</strong> {replyingTo.message?.slice(0, 50)}…</span>
                            <button className="gc-reply-banner__close" onClick={() => setReplyingTo(null)}>✕</button>
                        </div>
                    )}

                    {isRecording ? (
                        <div className="gc-recording">
                            <div className="gc-recording__dot" />
                            <span>Recording {fmt(recordingTime)}</span>
                            <button className="gc-recording__stop" onClick={stopRecording}>
                                <FaStop size={11} /> Stop
                            </button>
                        </div>
                    ) : (
                        <div className="chat-wrap">
                            <button className="gc-icon-btn" title="Voice message" onClick={startRecording}>
                                <FaMicrophone size={14} />
                            </button>
                            <textarea
                                className="bs-textarea"
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                                placeholder="Type a message… (Enter to send)"
                                rows={1}
                            />
                            <button
                                className="send-btn"
                                onClick={sendMessage}
                                style={{ background: input.trim() ? 'linear-gradient(135deg,#00c96e,#1a7a7a)' : '#f1f5f9', color: input.trim() ? '#fff' : '#94a3b8' }}
                            >
                                <FaPaperPlane size={14} />
                            </button>
                        </div>
                    )}
                    <div className="gc-hint">Enter to send · Shift+Enter for new line</div>
                </div>
            </div>

            {/* Members sidebar */}
            <div className="gc-sidebar">
                <div className="gc-sidebar__header">
                    <FaUsers size={12} color="#94a3b8" />
                    <span>Members · {members.length}</span>
                </div>
                <div className="gc-sidebar__list">
                    {members.map(m => {
                        const uid = m._id || m.id;
                        const name = m.name || m.displayName || uid;
                        const role = m.role || 'Member';
                        return (
                            <div key={uid} className="gc-sidebar__member">
                                <div style={{ position: 'relative' }}>
                                    <Avatar name={name} uid={uid} size={30} />
                                    <div className="gc-online-dot" />
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div className="gc-sidebar__name">{name}</div>
                                    <div className="gc-sidebar__role" style={{ color: (ROLE_STYLES[role] || ROLE_STYLES.Member).text }}>
                                        {role}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}