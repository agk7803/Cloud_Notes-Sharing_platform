import React, { useEffect, useState, useRef } from 'react';
import io from 'socket.io-client';
import { FaPaperPlane, FaMicrophone, FaStop, FaTrash, FaPen, FaTimes, FaCheck } from 'react-icons/fa';
import api from '../api/axios';

const socket = io('http://localhost:5050');

const GroupChat = ({ groupId, user }) => {
    const [messages, setMessages] = useState([]);
    const [currentMessage, setCurrentMessage] = useState("");
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const [editingMessageId, setEditingMessageId] = useState(null);
    const [editContent, setEditContent] = useState("");

    const messagesEndRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const timerRef = useRef(null);

    // Fetch History
    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const res = await api.get(`/groups/${groupId}/chats`);
                setMessages(res.data);
            } catch (error) {
                console.error("Failed to fetch chat history", error);
            }
        };
        fetchHistory();
    }, [groupId]);

    useEffect(() => {
        socket.emit("join_group", groupId);

        socket.on("receive_message", (message) => {
            setMessages((list) => [...list, message]);
        });

        socket.on("message_updated", (updatedMessage) => {
            setMessages((list) => list.map(msg => msg._id === updatedMessage._id ? updatedMessage : msg));
        });

        socket.on("message_deleted", (deletedMessageId) => {
            setMessages((list) => list.filter(msg => msg._id !== deletedMessageId));
        });

        // Cleanup on unmount
        return () => {
            socket.off("receive_message");
            socket.off("message_updated");
            socket.off("message_deleted");
            if (timerRef.current) clearInterval(timerRef.current);
        }
    }, [groupId]);

    const sendMessage = async () => {
        if (currentMessage.trim() !== "") {
            const messageData = {
                groupId: groupId,
                senderId: user.uid,
                senderName: user.displayName || user.name || "User",
                message: currentMessage,
                messageType: 'text',
                time: new Date().toISOString(), // Use ISO for consistency
            };

            await socket.emit("send_message", messageData);
            setCurrentMessage("");
        }
    };

    const handleEdit = (msg) => {
        setEditingMessageId(msg._id);
        setEditContent(msg.message);
    };

    const submitEdit = async () => {
        if (!editContent.trim()) return;
        socket.emit("edit_message", { messageId: editingMessageId, newContent: editContent, groupId });
        setEditingMessageId(null);
        setEditContent("");
    };

    const handleDelete = async (messageId) => {
        if (window.confirm("Delete this message?")) {
            socket.emit("delete_message", { messageId, groupId });
        }
    };

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = async () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' }); // Chrome/Firefox typical Support
                await uploadAudio(audioBlob);

                // Stop all tracks
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorder.start();
            setIsRecording(true);

            // Timer
            setRecordingTime(0);
            timerRef.current = setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);

        } catch (error) {
            console.error("Error accessing microphone:", error);
            alert("Microphone access denied.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            if (timerRef.current) clearInterval(timerRef.current);
        }
    };

    const uploadAudio = async (blob) => {
        const formData = new FormData();
        formData.append('audio', blob, 'voice-message.webm');

        try {
            const res = await api.post('/upload/audio', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            const { audioUrl } = res.data;

            // Send Socket Message
            const messageData = {
                groupId: groupId,
                senderId: user.uid,
                senderName: user.displayName || user.name || "User",
                message: "Voice Message",
                messageType: 'audio',
                audioUrl: audioUrl,
                time: new Date().toISOString(),
            };

            await socket.emit("send_message", messageData);

        } catch (error) {
            console.error("Audio Upload Failed", error);
            alert("Failed to send audio message");
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }

    useEffect(scrollToBottom, [messages, editingMessageId]); // Scroll on edit mode too to ensure view

    // Format timer
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    return (
        <div className="flex flex-col h-full bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden relative">
            <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center flex-shrink-0">
                <h3 className="font-bold text-gray-700">Group Chat</h3>
                <span className='text-xs text-green-600 font-bold flex items-center gap-1'>
                    Running Live
                </span>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white min-h-0 relative">
                {messages.length === 0 && <p className="text-center text-gray-400 text-sm mt-10">No messages yet. Start the conversation!</p>}

                {messages.map((msg, index) => {
                    const isOwnMessage = msg.senderId === user.uid;
                    const isEditing = editingMessageId === msg._id;

                    return (
                        <div key={index} className={`flex flex-col ${isOwnMessage ? "items-end" : "items-start"} group`}>
                            <div className={`max-w-[85%] p-3 rounded-2xl relative ${isOwnMessage
                                    ? "bg-[#1dc962] text-white rounded-tr-none"
                                    : "bg-gray-100 text-gray-800 rounded-tl-none"
                                }`}>
                                <p className={`text-xs font-bold mb-1 opacity-80 ${isOwnMessage ? 'text-green-100' : 'text-gray-500'}`}>
                                    {msg.senderName}
                                    {msg.createdAt && <span className="ml-2 font-normal opacity-70">{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>}
                                </p>

                                {isEditing ? (
                                    <div className="flex flex-col gap-2 min-w-[200px]">
                                        <input
                                            value={editContent}
                                            onChange={e => setEditContent(e.target.value)}
                                            className="text-gray-800 p-1 rounded text-sm w-full"
                                            autoFocus
                                        />
                                        <div className="flex justify-end gap-2">
                                            <button onClick={() => setEditingMessageId(null)} className="p-1 hover:bg-white/20 rounded"><FaTimes /></button>
                                            <button onClick={submitEdit} className="p-1 hover:bg-white/20 rounded"><FaCheck /></button>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        {msg.messageType === 'audio' ? (
                                            <audio controls src={msg.audioUrl} className="max-w-[200px] h-8 mt-1 block" />
                                        ) : (
                                            <p className="text-sm break-words">{msg.message}</p>
                                        )}

                                        {/* Edit/Delete Actions */}
                                        {isOwnMessage && !isEditing && (
                                            <div className="absolute -left-16 top-1/2 -translate-y-1/2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white shadow-sm p-1 rounded-lg border border-gray-100">
                                                {msg.messageType === 'text' && (
                                                    <button onClick={() => handleEdit(msg)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded"><FaPen size={10} /></button>
                                                )}
                                                <button onClick={() => handleDelete(msg._id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded"><FaTrash size={10} /></button>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-gray-100 flex-shrink-0">
                {isRecording ? (
                    <div className="flex items-center gap-4 bg-red-50 p-3 rounded-xl animate-pulse">
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        <span className="text-red-500 font-bold flex-1">Recording... {formatTime(recordingTime)}</span>
                        <button onClick={stopRecording} className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors">
                            <FaStop />
                        </button>
                    </div>
                ) : (
                    <div className="flex gap-2">
                        <button onClick={startRecording} className="p-3 bg-gray-100 text-gray-600 rounded-xl hover:bg-red-50 hover:text-red-500 transition-colors">
                            <FaMicrophone />
                        </button>
                        <input
                            type="text"
                            value={currentMessage}
                            onChange={(event) => setCurrentMessage(event.target.value)}
                            onKeyPress={(event) => {
                                event.key === "Enter" && sendMessage();
                            }}
                            placeholder="Type a message..."
                            className="flex-1 p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-[#1dc962] outline-none transition-all"
                        />
                        <button onClick={sendMessage} className="p-3 bg-[#1dc962] text-white rounded-xl hover:bg-green-600 transition-colors">
                            <FaPaperPlane />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default GroupChat;
