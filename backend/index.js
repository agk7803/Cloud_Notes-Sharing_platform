const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const noteRoutes = require('./routes/noteRoutes');

connectDB();

const http = require('http');
const { Server } = require('socket.io');
const Chat = require('./models/Chat');
const groupRoutes = require('./routes/groupRoutes');
const uploadRoutes = require('./routes/uploadRoutes');

const app = express();
const server = http.createServer(app);

// Socket.io Setup
const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"]
    }
});

app.use(cors());
app.use(express.json());

app.use('/api/notes', noteRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/upload', uploadRoutes);

// Socket Logic
io.on('connection', (socket) => {
    console.log(`User Connected: ${socket.id}`);

    socket.on('join_group', (groupId) => {
        socket.join(groupId);
        console.log(`User ${socket.id} joined group: ${groupId}`);
    });

    socket.on('send_message', async (data) => {
        // data: { groupId, senderId, senderName, message, messageType, audioUrl }
        try {
            const newChat = await Chat.create({
                groupId: data.groupId,
                senderId: data.senderId,
                senderName: data.senderName,
                message: data.message,
                messageType: data.messageType || 'text',
                audioUrl: data.audioUrl
            });
            // Broadcast to room including sender (for real-time update)
            io.to(data.groupId).emit('receive_message', newChat);
        } catch (error) {
            console.error("Chat Error:", error);
        }
    });

    socket.on("edit_message", async ({ messageId, newContent, groupId }) => {
        try {
            const updatedChat = await Chat.findByIdAndUpdate(
                messageId,
                { message: newContent },
                { new: true }
            );
            if (updatedChat) {
                io.to(groupId).emit("message_updated", updatedChat);
            }
        } catch (error) {
            console.error("Socket Edit Error:", error);
        }
    });

    socket.on("delete_message", async ({ messageId, groupId }) => {
        try {
            await Chat.findByIdAndDelete(messageId);
            io.to(groupId).emit("message_deleted", messageId);
        } catch (error) {
            console.error("Socket Delete Error:", error);
        }
    });

    // Voice Signaling
    socket.on("join_voice", (roomId) => {
        socket.join(roomId);
        socket.to(roomId).emit("user_joined_voice", socket.id);
    });

    socket.on("offer", (payload) => {
        io.to(payload.target).emit("offer", payload);
    });

    socket.on("answer", (payload) => {
        io.to(payload.target).emit("answer", payload);
    });

    socket.on("ice-candidate", (payload) => {
        io.to(payload.target).emit("ice-candidate", payload);
    });

    socket.on('disconnect', () => {
        console.log('User Disconnected', socket.id);
    });
});

// Error Handling Middleware
// Error Handling Middleware
app.use((err, req, res, next) => {
    console.error("Server Error Stack:", err.stack || err);

    const message = err.message || err.toString();
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

    res.status(statusCode).json({ message: message });
});

const PORT = process.env.PORT || 5050;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
