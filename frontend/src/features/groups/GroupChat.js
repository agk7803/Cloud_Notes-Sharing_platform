import React, { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { FaPaperPlane, FaMicrophone, FaStop, FaTrash, FaPen, FaTimes, FaCheck, FaReply, FaUsers, FaRobot } from 'react-icons/fa';

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
            borderRadius: size * 0.35,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: size * 0.35, fontWeight: 850, color: '#1e293b',
            border: '1.5px solid rgba(0,0,0,0.06)',
        }}>
            {initials}
        </div>
    );
};

// ─── Inline Markdown (AI messages) ─────────────────────────────────────────────
const SimpleMarkdown = ({ text }) => (
    <div className="gc-markdown">
        {text.split('\n').map((line, i) => {
            if (line.startsWith('## ')) return <div key={i} style={{ fontWeight: 850, fontSize: 16, marginTop: 12 }}>{line.slice(3)}</div>;
            if (/^\d+\./.test(line)) return <div key={i} style={{ marginLeft: 16, marginBottom: 4 }}>{line}</div>;
            return <div key={i} style={{ marginBottom: 4 }}>{line}</div>;
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

    return (
        <div 
            className={`gc-msg ${isMe ? 'gc-msg--me' : 'gc-msg--other'}`}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            <div className="gc-msg__meta" style={{ flexDirection: isMe ? 'row-reverse' : 'row' }}>
                <Avatar name={msg.senderName} uid={msg.senderId} size={28} />
                <span className="gc-msg__sender">{msg.senderName}</span>
                <span className="gc-msg__time">
                    {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                </span>
            </div>

            <div className={`gc-bubble ${isAI ? 'gc-bubble--ai' : isMe ? 'gc-bubble--me' : 'gc-bubble--other'}`}>
                {isAI && <div className="gc-ai-badge"><FaRobot size={12} /> StuNotes AI Assistant</div>}
                
                {msg.messageType === 'audio' ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span style={{ fontSize: 20 }}>🎙️</span>
                        <audio controls src={msg.audioUrl} style={{ height: 30, maxWidth: 180 }} />
                    </div>
                ) : isAI ? (
                    <SimpleMarkdown text={msg.message} />
                ) : (
                    <div>{msg.message}</div>
                )}

                {hovered && !editing && isMe && (
                    <div style={{ position: 'absolute', top: -10, right: isMe ? 'auto' : -20, left: isMe ? -20 : 'auto', display: 'flex', gap: 4 }}>
                        <button style={{ border: 'none', background: '#fff', borderRadius: 8, padding: 6, cursor: 'pointer', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }} onClick={() => onDelete(msg._id)}>
                            <FaTrash size={10} color="#ef4444" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

// ─── Group Chat Component ───────────────────────────────────────────────────────
export default function GroupChat({ groupId, user }) {
    const [messages, setMessages] = useState([]);
    const [members, setMembers] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(true);
    const [isRecording, setIsRecording] = useState(false);

    const socketRef = useRef(null);
    const messagesEndRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);

    useEffect(() => {
        if (!groupId) return;
        setLoading(true);
        api.get(`/groups/${groupId}/chats`)
            .then(res => setMessages(res.data || []))
            .catch(() => { })
            .finally(() => setLoading(false));

        api.get(`/groups/${groupId}/members`)
            .then(res => setMembers(res.data || []))
            .catch(() => { });
    }, [groupId]);

    useEffect(() => {
        if (!groupId || !user) return;
        const socket = io(SOCKET_URL, { transports: ['websocket'] });
        socketRef.current = socket;
        socket.emit('join_group', groupId);
        socket.on('receive_message', msg => setMessages(prev => [...prev, msg]));
        socket.on('message_deleted', id => setMessages(prev => prev.filter(m => m._id !== id)));
        return () => socket.disconnect();
    }, [groupId, user]);

    useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

    const sendMessage = () => {
        if (!input.trim()) return;
        socketRef.current?.emit('send_message', {
            groupId,
            senderId: user.uid,
            senderName: user.displayName || 'You',
            message: input.trim(),
            messageType: 'text',
        });
        setInput('');
    };

    const handleDelete = (id) => {
        if (!window.confirm('Remove this message?')) return;
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
                const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                const form = new FormData();
                form.append('audio', blob, 'voice.webm');
                const res = await api.post('/upload/audio', form);
                socketRef.current?.emit('send_message', {
                    groupId,
                    senderId: user.uid,
                    senderName: user.displayName || 'You',
                    message: 'Voice Message',
                    messageType: 'audio',
                    audioUrl: res.data.audioUrl,
                });
            };
            recorder.start();
            setIsRecording(true);
        } catch { alert('Permission denied'); }
    };

    return (
        <div className="gc-root">
            {/* --- MAIN CHAT PANEL --- */}
            <div className="gc-panel">
                <div className="gc-messages">
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: 40, color: '#94a3b8' }}>Syncing hub history...</div>
                    ) : messages.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: 40, color: '#94a3b8' }}>No frequency detected. Start the conversation.</div>
                    ) : (
                        messages.map(msg => <ChatMessage key={msg._id} msg={msg} user={user} onDelete={handleDelete} />)
                    )}
                    <div ref={messagesEndRef} />
                </div>

                <div className="gc-input-area">
                    <div className="gc-chat-glass-wrap">
                        <button className="gc-action-btn-circle gc-action-btn-circle--voice" onClick={isRecording ? () => { mediaRecorderRef.current.stop(); setIsRecording(false); } : startRecording}>
                            {isRecording ? <FaStop size={14} color="#ef4444" /> : <FaMicrophone size={16} />}
                        </button>
                        <textarea
                            className="gc-textarea-modern"
                            placeholder="Share an insight or ask a question…"
                            rows={1}
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                        />
                        <button className={`gc-action-btn-circle gc-action-btn-circle--send ${input.trim() ? 'active' : ''}`} onClick={sendMessage}>
                            <FaPaperPlane size={14} />
                        </button>
                    </div>
                </div>
            </div>

            {/* --- MEMBER SIDEBAR --- */}
            <div className="gc-sidebar">
                <div className="gc-sidebar__header">PARTICIPANTS · {members.length}</div>
                <div className="gc-sidebar-list">
                    {members.map(m => (
                        <div key={m._id || m.uid} className="gc-sidebar-member">
                            <div style={{ position: 'relative' }}>
                                <Avatar name={m.name} uid={m._id} size={32} />
                                <div style={{ position: 'absolute', bottom: -1, right: -1, width: 9, height: 9, borderRadius: '50%', background: '#00c96e', border: '2px solid #fff' }} />
                            </div>
                            <div>
                                <div className="gc-sidebar-name">{m.name}</div>
                                <div style={{ fontSize: 10, fontWeight: 900, color: '#1a7a7a', textTransform: 'uppercase' }}>{m.role || 'Member'}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}