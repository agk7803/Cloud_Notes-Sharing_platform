const mongoose = require('mongoose');

const groupSchema = mongoose.Schema({
    name: { type: String, required: true },
    subject: { type: String, required: true },
    description: { type: String },
    type: {
        type: String,
        enum: ['Public', 'Private'],
        required: true
    },
    createdBy: {
        type: String, // Firebase UID
        required: true
    },
    members: [{
        type: String // Array of Firebase UIDs
    }],
    notes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Note'
    }],
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Group', groupSchema);
