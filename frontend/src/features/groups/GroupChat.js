import React, { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import {
    FaPaperPlane,
    FaMicrophone,
    FaStop,
    FaTrash,
    FaPen,
    FaTimes,
    FaCheck
} from "react-icons/fa";

import ReactMarkdown from "react-markdown";

import api from "../../services/api";

const SOCKET_URL = "http://localhost:5050";

const GroupChat = ({ groupId, user }) => {

    /* ================= STATE ================= */

    const [messages, setMessages] = useState([]);
    const [currentMessage, setCurrentMessage] = useState("");

    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);

    const [editingMessageId, setEditingMessageId] = useState(null);
    const [editContent, setEditContent] = useState("");


    /* ================= REFS ================= */

    const socketRef = useRef(null);
    const messagesEndRef = useRef(null);

    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const timerRef = useRef(null);


    /* ================= FETCH HISTORY ================= */

    useEffect(() => {

        if (!groupId) return;

        const fetchHistory = async () => {
            try {
                const res = await api.get(`/groups/${groupId}/chats`);
                setMessages(res.data || []);
            } catch (err) {
                console.error("Chat History Error:", err);
            }
        };

        fetchHistory();

    }, [groupId]);


    /* ================= SOCKET ================= */

    useEffect(() => {

        if (!groupId || !user) return;

        const socket = io(SOCKET_URL, {
            transports: ["websocket"],
            reconnection: true
        });

        socketRef.current = socket;


        /* Join Room */
        socket.emit("join_group", groupId);


        /* New Message */
        socket.on("receive_message", (msg) => {

            setMessages(prev => {

                // Prevent duplicates
                if (prev.some(m => m._id === msg._id)) return prev;

                return [...prev, msg];
            });
        });


        /* Edit */
        socket.on("message_updated", (updated) => {

            setMessages(prev =>
                prev.map(m =>
                    m._id === updated._id ? updated : m
                )
            );
        });


        /* Delete */
        socket.on("message_deleted", (id) => {

            setMessages(prev =>
                prev.filter(m => m._id !== id)
            );
        });


        /* Debug */
        socket.on("connect", () => {
            console.log("Socket Connected:", socket.id);
        });


        /* Cleanup */
        return () => {

            socket.off();
            socket.disconnect();

            if (timerRef.current) clearInterval(timerRef.current);
        };

    }, [groupId, user]);


    /* ================= AUTO SCROLL ================= */

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({
            behavior: "smooth"
        });
    }, [messages, editingMessageId]);


    /* ================= SEND ================= */

    const sendMessage = () => {

        if (!currentMessage.trim()) return;

        const data = {
            groupId,
            senderId: user.uid,
            senderName: user.displayName || user.name || "User",
            message: currentMessage,
            messageType: "text"
        };

        socketRef.current.emit("send_message", data);

        setCurrentMessage("");
    };


    /* ================= EDIT ================= */

    const handleEdit = (msg) => {

        setEditingMessageId(msg._id);
        setEditContent(msg.message);
    };


    const submitEdit = () => {

        if (!editContent.trim()) return;

        socketRef.current.emit("edit_message", {
            messageId: editingMessageId,
            newContent: editContent,
            groupId
        });

        setEditingMessageId(null);
        setEditContent("");
    };


    /* ================= DELETE ================= */

    const handleDelete = (id) => {

        if (!window.confirm("Delete this message?")) return;

        socketRef.current.emit("delete_message", {
            messageId: id,
            groupId
        });
    };


    /* ================= VOICE ================= */

    const startRecording = async () => {

        try {

            const stream =
                await navigator.mediaDevices.getUserMedia({ audio: true });

            const recorder = new MediaRecorder(stream);

            mediaRecorderRef.current = recorder;
            audioChunksRef.current = [];


            recorder.ondataavailable = (e) => {
                if (e.data.size > 0)
                    audioChunksRef.current.push(e.data);
            };


            recorder.onstop = async () => {

                const blob = new Blob(audioChunksRef.current, {
                    type: "audio/webm"
                });

                await uploadAudio(blob);

                stream.getTracks().forEach(t => t.stop());
            };


            recorder.start();

            setIsRecording(true);
            setRecordingTime(0);


            timerRef.current = setInterval(() => {
                setRecordingTime(t => t + 1);
            }, 1000);


        } catch (err) {

            console.error("Mic Error:", err);
            alert("Microphone permission denied");
        }
    };


    const stopRecording = () => {

        if (!mediaRecorderRef.current) return;

        mediaRecorderRef.current.stop();

        setIsRecording(false);

        if (timerRef.current) clearInterval(timerRef.current);
    };


    const uploadAudio = async (blob) => {

        const form = new FormData();

        form.append("audio", blob, "voice.webm");


        try {

            const res = await api.post("/upload/audio", form);


            const data = {
                groupId,
                senderId: user.uid,
                senderName: user.displayName || user.name || "User",
                message: "Voice Message",
                messageType: "audio",
                audioUrl: res.data.audioUrl
            };


            socketRef.current.emit("send_message", data);


        } catch (err) {

            console.error("Upload Error:", err);
            alert("Voice upload failed");
        }
    };


    /* ================= UTILS ================= */

    const formatTime = (s) => {

        const m = Math.floor(s / 60);
        const sec = s % 60;

        return `${m}:${sec < 10 ? "0" : ""}${sec}`;
    };


    /* ================= UI ================= */

    return (

        <div className="flex flex-col h-full bg-white rounded-2xl shadow border overflow-hidden">


            {/* HEADER */}
            <div className="p-4 border-b bg-gray-50 flex justify-between">

                <h3 className="font-bold">Group Chat</h3>

                <span className="text-xs text-green-600 font-bold">
                    Live
                </span>

            </div>


            {/* MESSAGES */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">

                {messages.length === 0 && (
                    <p className="text-center text-gray-400 text-sm mt-10">
                        No messages yet
                    </p>
                )}


                {messages.map(msg => {

                    const own = msg.senderId === user.uid;
                    const editing = editingMessageId === msg._id;

                    return (

                        <div
                            key={msg._id}
                            className={`flex ${own ? "justify-end" : "justify-start"}`}
                        >

                            <div
                                className={`group max-w-[80%] p-3 rounded-2xl relative
                ${own
                                        ? "bg-[#1dc962] text-white"
                                        : "bg-gray-100 text-gray-800"
                                    }`}
                            >

                                <p className="text-xs font-bold opacity-70 mb-1">
                                    {msg.senderName}
                                </p>


                                {editing ? (

                                    <div className="flex flex-col gap-2">

                                        <input
                                            value={editContent}
                                            onChange={e => setEditContent(e.target.value)}
                                            className="p-1 rounded text-sm text-black"
                                            autoFocus
                                        />

                                        <div className="flex justify-end gap-2">

                                            <button onClick={() => setEditingMessageId(null)}>
                                                <FaTimes />
                                            </button>

                                            <button onClick={submitEdit}>
                                                <FaCheck />
                                            </button>

                                        </div>

                                    </div>

                                ) : (

                                    <>
                                        {msg.messageType === "audio" ? (

                                            <audio controls src={msg.audioUrl} />

                                        ) : msg.isAI ? (

                                            <div className="text-sm break-words bg-blue-50 p-3 rounded-xl border border-blue-200">
                                                <ReactMarkdown>
                                                    {msg.message}
                                                </ReactMarkdown>
                                            </div>

                                        ) : (

                                            <p className="text-sm break-words">
                                                {msg.message}
                                            </p>

                                        )}


                                        {/* ACTIONS */}
                                        {own && (

                                            <div className="
                        absolute -left-16 top-1/2 -translate-y-1/2
                        flex gap-1 opacity-0 group-hover:opacity-100
                        bg-white shadow p-1 rounded border
                      ">

                                                {msg.messageType === "text" && (
                                                    <button
                                                        className="text-blue-500 hover:bg-blue-50 p-1 rounded"
                                                        onClick={() => handleEdit(msg)}
                                                    >
                                                        <FaPen size={12} />
                                                    </button>
                                                )}

                                                <button
                                                    className="text-red-500 hover:bg-red-50 p-1 rounded"
                                                    onClick={() => handleDelete(msg._id)}
                                                >
                                                    <FaTrash size={12} />
                                                </button>

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


            {/* INPUT */}
            <div className="p-4 border-t bg-white">

                {isRecording ? (

                    <div className="flex items-center gap-4 bg-red-50 p-3 rounded-xl">

                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>

                        <span className="flex-1 text-red-500 font-bold">
                            Recording {formatTime(recordingTime)}
                        </span>

                        <button
                            onClick={stopRecording}
                            className="bg-red-500 text-white p-2 rounded-full"
                        >
                            <FaStop />
                        </button>

                    </div>

                ) : (

                    <div className="flex gap-2">

                        <button
                            onClick={startRecording}
                            className="p-3 bg-gray-100 rounded-xl"
                        >
                            <FaMicrophone />
                        </button>


                        <input
                            value={currentMessage}
                            onChange={e => setCurrentMessage(e.target.value)}
                            onKeyDown={e => e.key === "Enter" && sendMessage()}
                            placeholder="Type a message..."
                            className="flex-1 p-3 bg-gray-50 rounded-xl outline-none"
                        />


                        <button
                            onClick={sendMessage}
                            className="p-3 bg-[#1dc962] text-white rounded-xl"
                        >
                            <FaPaperPlane />
                        </button>

                    </div>

                )}

            </div>

        </div>
    );
};

export default GroupChat;