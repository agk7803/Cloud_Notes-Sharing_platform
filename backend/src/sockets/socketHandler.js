const Chat = require('../models/Chat');

/**
 * Initialize all Socket.IO event handlers
 * @param {import('socket.io').Server} io
 */
function setupSocket(io) {

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
                    { returnDocument: 'after' }
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
}

module.exports = setupSocket;
