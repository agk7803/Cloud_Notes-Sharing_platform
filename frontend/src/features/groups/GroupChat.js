import React, { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { FaPaperPlane, FaMicrophone, FaStop, FaRobot } from 'react-icons/fa';

import api from '../../services/api';
import { getAvatarColor } from './Constants';
import '../../styles/GroupChat.css';

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5050';

// ─── Avatar ────────────────────────────────────────────────────────────────────
const Avatar = ({ name = '', uid = '', size = 28 }) => {
    const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
    return (
        <div style={{
            width: size, height: size, minWidth: size,
            background: getAvatarColor(uid || name),
            borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: size * 0.35, fontWeight: 900, color: '#1e293b',
            border: '1px solid rgba(0,0,0,0.06)',
        }}>
            {initials}
        </div>
    );
};

// ─── Inline Markdown (AI messages) ─────────────────────────────────────────────
const SimpleMarkdown = ({ text }) => (
    <div className="gc-markdown">
        {text.split('\n').map((line, i) => {
            if (line.startsWith('## ')) return <div key={i} style={{ fontWeight: 800, fontSize: 16, marginTop: 12 }}>{line.slice(3)}</div>;
            if (/^\d+\./.test(line)) return <div key={i} style={{ marginLeft: 16, marginBottom: 4, fontWeight: 600 }}>{line}</div>;
            return <div key={i} style={{ marginBottom: 4 }}>{line}</div>;
        })}
    </div>
);

// ─── Single Message ────────────────────────────────────────────────────────────
const ChatMessage = ({ msg, user, onDelete }) => {
    const isMe = msg.senderId === user?.uid;
    const isAI = msg.isAI || msg.senderId === 'ai';

    return (
        <div className={`gc-msg ${isMe ? 'gc-msg--me' : 'gc-msg--other'}`}>
            <div className={`gc-msg__meta ${isMe ? 'gc-msg__meta--me' : ''}`} style={{ flexDirection: isMe ? 'row-reverse' : 'row' }}>
                <Avatar name={msg.senderName} uid={msg.senderId} size={24} />
                <span className="gc-msg__sender">{msg.senderName}</span>
                <span className="gc-msg__time">
                    {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'NEW'}
                </span>
            </div>

            <div className={`gc-bubble ${isAI ? 'gc-bubble--ai' : isMe ? 'gc-bubble--me' : 'gc-bubble--other'}`}>
                {isAI && <div className="gc-ai-badge"><FaRobot size={12} /> ByteScholar AI</div>}
                
                {msg.messageType === 'audio' ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        🎙️ <audio controls src={msg.audioUrl} style={{ height: 26, width: 160 }} />
                    </div>
                ) : isAI ? (
                    <SimpleMarkdown text={msg.message} />
                ) : (
                    <div>{msg.message}</div>
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
            senderName: user.displayName || 'Me',
            message: input.trim(),
            messageType: 'text',
        });
        setInput('');
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
                form.append('audio', blob, 'vocal.webm');
                const res = await api.post('/upload/audio', form);
                socketRef.current?.emit('send_message', {
                    groupId,
                    senderId: user.uid,
                    senderName: user.displayName || 'Me',
                    message: 'Voice Transmission',
                    messageType: 'audio',
                    audioUrl: res.data.audioUrl,
                });
            };
            recorder.start();
            setIsRecording(true);
        } catch { }
    };

    return (
        <div className="gc-root">
            <div className="gc-panel">
                <div className="gc-messages">
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: 40, color: '#94a3b8', fontSize: 11, fontWeight: 800 }}>BUFFERING FREQUENCY...</div>
                    ) : (
                        messages.map(msg => <ChatMessage key={msg._id} msg={msg} user={user} />)
                    )}
                    <div ref={messagesEndRef} />
                </div>

                <div className="gc-input-area">
                    <div className="gc-chat-glass-wrap">
                        <button 
                            className="gc-action-btn-circle" 
                            style={{ background: isRecording ? '#fee2e2' : '#f1f5f9', color: isRecording ? '#ef4444' : '#64748b' }}
                            onClick={isRecording ? () => { mediaRecorderRef.current.stop(); setIsRecording(false); } : startRecording}
                        >
                            {isRecording ? <FaStop size={12} /> : <FaMicrophone size={14} />}
                        </button>
                        <textarea
                            className="gc-textarea-modern"
                            placeholder="Connect with the hub..."
                            rows={1}
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                        />
                        <button className="gc-action-btn-circle" style={{ background: '#1a7a7a', color: '#fff' }} onClick={sendMessage}>
                            <FaPaperPlane size={12} />
                        </button>
                    </div>
                </div>
            </div>

            <div className="gc-sidebar">
                <div className="gc-sidebar__header">Group Members · {members.length}</div>
                <div className="gc-sidebar-list">
                    {members.map(m => (
                        <div key={m._id} className="gc-sidebar-member">
                            <Avatar name={m.name} uid={m._id} size={28} />
                            <div className="gc-sidebar-name">{m.name}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}