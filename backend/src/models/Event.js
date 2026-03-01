const mongoose = require('mongoose');

const eventSchema = mongoose.Schema({
    userId: {
        type: String,
        required: true,
        index: true // Efficient lookup by user
    },
    title: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true,
        enum: ['study', 'exam', 'deadline', 'group']
    },
    time: {
        type: String
    },
    duration: {
        type: String
    },
    date: {
        type: String,
        required: true // YYYY-MM-DD format
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Event', eventSchema);
