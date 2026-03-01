const mongoose = require('mongoose');

const noteSchema = mongoose.Schema({
    title: { type: String, required: true },
    subject: { type: String, required: true },
    fileUrl: { type: String, required: true },
    s3Key: { type: String, required: true }, // For signed URLs
    fileType: { type: String, required: true },
    size: { type: String },
    authorId: { type: String, required: true }, // From Firebase UID
    authorName: { type: String },
    visibility: {
        type: String,
        enum: ['private', 'public', 'groups', 'private_group', 'public_group'], // Updated for new logic
        default: 'private'
    },
    sharedGroups: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Group'
    }], // Array of Group ObjectIds
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Note', noteSchema);
