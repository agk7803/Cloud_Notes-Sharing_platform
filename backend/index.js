const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

const connectDB = require('./config/db');
const noteRoutes = require('./routes/noteRoutes');
const groupRoutes = require('./routes/groupRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const Chat = require('./models/Chat');
const userRoutes = require("./routes/userRoutes");
const aiRoutes = require("./routes/aiRoutes"); // ✅ CORRECT (CommonJS)
const assessmentRoutes = require("./routes/assessmentRoutes");


/* ================= INIT ================= */

connectDB();

const app = express();
const server = http.createServer(app);


/* ================= SOCKET SETUP ================= */

const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"]
    }
});


/* ================= MIDDLEWARE ================= */

app.use(cors());
app.use(express.json());


/* ================= ROUTES ================= */

app.use('/api/notes', noteRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/users', userRoutes);
app.use('/api', aiRoutes);   // ✅ Academic AI will be /api/academic-chat
app.use("/api/assessments", assessmentRoutes);


/* ================= SOCKET LOGIC ================= */

io.on('connection', (socket) => {

    console.log("User Connected:", socket.id);

    socket.on('join_group', (groupId) => {
        if (!groupId) return;
        socket.join(groupId);
        console.log(`User ${socket.id} joined group ${groupId}`);
    });

    socket.on('send_message', async (data) => {
        try {
            if (!data?.groupId || !data?.message) return;

            const newChat = await Chat.create({
                groupId: data.groupId,
                senderId: data.senderId,
                senderName: data.senderName,
                message: data.message,
                messageType: data.messageType || 'text',
                audioUrl: data.audioUrl || null
            });

            io.to(data.groupId).emit('receive_message', newChat);

        } catch (error) {
            console.error("Chat Send Error:", error);
        }
    });

    socket.on("edit_message", async ({ messageId, newContent, groupId }) => {
        try {
            if (!messageId || !groupId) return;

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
            if (!messageId || !groupId) return;

            await Chat.findByIdAndDelete(messageId);
            io.to(groupId).emit("message_deleted", messageId);

        } catch (error) {
            console.error("Socket Delete Error:", error);
        }
    });

    /* ================= VOICE SIGNALING ================= */

    socket.on("join_voice", (roomId) => {
        if (!roomId) return;
        socket.join(roomId);
        socket.to(roomId).emit("user_joined_voice", socket.id);
    });

    socket.on("offer", (payload) => {
        if (payload?.target) {
            io.to(payload.target).emit("offer", payload);
        }
    });

    socket.on("answer", (payload) => {
        if (payload?.target) {
            io.to(payload.target).emit("answer", payload);
        }
    });

    socket.on("ice-candidate", (payload) => {
        if (payload?.target) {
            io.to(payload.target).emit("ice-candidate", payload);
        }
    });

    socket.on('disconnect', () => {
        console.log("User Disconnected:", socket.id);
    });

});


/* ================= ERROR HANDLER ================= */

app.use((err, req, res, next) => {

    console.error("Server Error:", err.stack || err);

    const status = res.statusCode === 200 ? 500 : res.statusCode;

    res.status(status).json({
        message: err.message || "Internal Server Error"
    });

});


/* ================= START SERVER ================= */

const PORT = process.env.PORT || 5050;

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
