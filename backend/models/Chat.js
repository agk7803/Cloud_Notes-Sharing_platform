const mongoose = require('mongoose');

const chatSchema = mongoose.Schema({
    groupId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Group',
        required: true
    },
    senderId: {
        type: String, // Firebase UID
        required: true
    },
    senderName: { type: String, required: true },
    message: { type: String }, // Optional if audioUrl exists
    messageType: {
        type: String,
        enum: ['text', 'audio'],
        default: 'text'
    },
    audioUrl: { type: String },
    replyTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Chat'
    },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Chat', chatSchema);
