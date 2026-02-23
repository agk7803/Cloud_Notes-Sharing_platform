const Note = require('../models/Note');
const mongoose = require('mongoose');

// @desc    Upload a new note
// @route   POST /api/notes
// @access  Public (for now, will secure later)
const { GetObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const s3 = require('../config/s3');

// @desc    Upload a new note
// @route   POST /api/notes
// @access  Public (for now, will secure later)
const uploadNote = async (req, res) => {
    console.log("uploadNote controller reached");
    console.log("req.body:", req.body);
    console.log("req.file:", req.file);
    try {
        if (!req.file) {
            return res.status(400).send({ message: 'No file uploaded' });
        }

        const { title, subject, visibility, sharedGroups, size } = req.body;

        // Validation for authorId is now handled by middleware (req.user)
        const authorId = req.user.uid;
        const authorName = req.user.name || req.user.email;

        const note = new Note({
            title,
            subject,
            fileUrl: req.file.location, // S3 URL (Public, fallback)
            s3Key: req.file.key,        // S3 Key (For signing)
            fileType: req.file.mimetype,
            size: size || formatBytes(req.file.size),
            authorId,
            authorName,
            visibility,
            visibility,
            sharedGroups: sharedGroups ? JSON.parse(sharedGroups).filter(id => mongoose.Types.ObjectId.isValid(id)).map(id => new mongoose.Types.ObjectId(id)) : []
        });

        const createdNote = await note.save();

        // Generate signed URL for immediate access
        const noteObj = createdNote.toObject();
        try {
            const command = new GetObjectCommand({
                Bucket: process.env.AWS_BUCKET_NAME,
                Key: noteObj.s3Key,
                ResponseContentDisposition: 'inline'
            });
            noteObj.fileUrl = await getSignedUrl(s3, command, { expiresIn: 3600 });
        } catch (error) {
            console.error("Error signing new note URL:", error);
        }

        res.status(201).json(noteObj);
    } catch (error) {
        console.error("FULL UPLOAD ERROR:", error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: error.message || 'Server Error' });
    }
};

// @desc    Get all notes (with optional filtering)
// @route   GET /api/notes
// @access  Public
const getNotes = async (req, res) => {
    try {
        const { visibility, groupId } = req.query;

        // Default: User's own notes
        let query = { authorId: req.user.uid };

        if (visibility === 'groups' && groupId) {
            query = { sharedGroups: groupId };
        }


        const notes = await Note.find({
            authorId: req.user.uid
        }).sort({ createdAt: -1 });

        console.log("Found notes:", notes.length);

        // Generate Signed URLs for each note
        const notesWithSignedUrls = await Promise.all(notes.map(async (note) => {
            const noteObj = note.toObject();
            if (note.s3Key) {
                try {
                    const command = new GetObjectCommand({
                        Bucket: process.env.AWS_BUCKET_NAME,
                        Key: note.s3Key,
                        ResponseContentDisposition: 'inline'
                    });
                    // URL valid for 1 hour (3600 seconds)
                    noteObj.fileUrl = await getSignedUrl(s3, command, { expiresIn: 3600 });
                } catch (err) {
                    console.error(`Error signing URL for note ${note.id}:`, err);
                }
            }
            return noteObj;
        }));

        res.json(notesWithSignedUrls);

    } catch (error) {
        console.error("Error fetching notes:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Delete a note
// @route   DELETE /api/notes/:id
// @access  Public
const deleteNote = async (req, res) => {
    try {
        const note = await Note.findById(req.params.id);

        if (note) {
            // Delete from S3
            if (note.s3Key) {
                try {
                    const command = new DeleteObjectCommand({
                        Bucket: process.env.AWS_BUCKET_NAME,
                        Key: note.s3Key,
                    });
                    await s3.send(command);
                } catch (err) {
                    console.error("Error deleting from S3:", err);
                    // Continue to delete from DB even if S3 fails
                }
            }

            await note.deleteOne();
            res.json({ message: 'Note removed' });
        } else {
            res.status(404).json({ message: 'Note not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

function formatBytes(bytes, decimals = 2) {
    if (!+bytes) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

module.exports = {
    uploadNote,
    getNotes,
    deleteNote
};
