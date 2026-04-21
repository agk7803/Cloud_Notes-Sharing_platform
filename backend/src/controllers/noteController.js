const Note = require('../models/Note');
const mongoose = require('mongoose');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { GetObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const s3 = require('../config/s3');

const MIME_MAP = {
    'application/pdf': 'pdf',
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
    'application/msword': 'doc',
    'text/plain': 'txt',
    'application/zip': 'zip'
};

const getExt = (mime) => MIME_MAP[mime] || 'bin';
const sanitize = (str) => str.replace(/[^a-z0-9]/gi, '_').toLowerCase();

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

        // Generate signed URLs for immediate access
        const noteObj = createdNote.toObject();
        if (noteObj.s3Key) {
            try {
                const ext = getExt(noteObj.fileType);
                const safeName = `${sanitize(noteObj.title)}.${ext}`;

                // 1. Inline URL for viewing
                const viewCommand = new GetObjectCommand({
                    Bucket: process.env.AWS_BUCKET_NAME,
                    Key: noteObj.s3Key,
                    ResponseContentDisposition: 'inline',
                    ResponseContentType: noteObj.fileType
                });
                noteObj.fileUrl = await getSignedUrl(s3, viewCommand, { expiresIn: 3600 });

                // 2. Attachment URL for downloading
                const downCommand = new GetObjectCommand({
                    Bucket: process.env.AWS_BUCKET_NAME,
                    Key: noteObj.s3Key,
                    ResponseContentDisposition: `attachment; filename="${safeName}"`,
                    ResponseContentType: noteObj.fileType
                });
                noteObj.downloadUrl = await getSignedUrl(s3, downCommand, { expiresIn: 3600 });
            } catch (error) {
                console.error("Error signing new note URLs:", error);
            }
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


        const notes = await Note.find(query).sort({ createdAt: -1 });

        console.log("Found notes:", notes.length);

        // Generate Signed URLs for each note
        const notesWithSignedUrls = await Promise.all(notes.map(async (note) => {
            const noteObj = note.toObject();
            if (note.s3Key) {
                try {
                    const ext = getExt(note.fileType);
                    const safeName = `${sanitize(note.title)}.${ext}`;

                    // Inline
                    const vCmd = new GetObjectCommand({
                        Bucket: process.env.AWS_BUCKET_NAME,
                        Key: note.s3Key,
                        ResponseContentDisposition: 'inline',
                        ResponseContentType: note.fileType
                    });
                    noteObj.fileUrl = await getSignedUrl(s3, vCmd, { expiresIn: 3600 });

                    // Download
                    const dCmd = new GetObjectCommand({
                        Bucket: process.env.AWS_BUCKET_NAME,
                        Key: note.s3Key,
                        ResponseContentDisposition: `attachment; filename="${safeName}"`,
                        ResponseContentType: note.fileType
                    });
                    noteObj.downloadUrl = await getSignedUrl(s3, dCmd, { expiresIn: 3600 });
                } catch (err) {
                    console.error(`Error signing URLs for note ${note.id}:`, err);
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

// @desc    Get all public notes
// @route   GET /api/notes/public
// @access  Public
const getPublicNotes = async (req, res) => {
    try {
        const { query, subject, fileType, difficulty, sort, limit = 10, skip = 0 } = req.query;

        // 1. Build Filter Object
        const filter = { visibility: 'public' };

        if (query) {
            filter.$or = [
                { title: { $regex: query, $options: 'i' } },
                { subject: { $regex: query, $options: 'i' } }
            ];
        }

        if (subject) filter.subject = subject;
        if (fileType) filter.fileType = fileType;
        if (difficulty) filter.difficulty = difficulty;

        // 2. Build Sort Object
        const sortOptions = {};
        if (sort === 'popular') {
            // Placeholder: Sort by popularity if implemented later
            sortOptions.createdAt = -1;
        } else {
            sortOptions.createdAt = -1; // Default: Latest
        }

        // 3. Execute Query
        const notes = await Note.find(filter)
            .sort(sortOptions)
            .skip(Number(skip))
            .limit(Number(limit));

        const total = await Note.countDocuments(filter);

        // 4. Generate Signed URLs
        const notesWithSignedUrls = await Promise.all(notes.map(async (note) => {
            const noteObj = note.toObject();
            if (note.s3Key) {
                try {
                    const ext = getExt(note.fileType);
                    const safeName = `${sanitize(note.title)}.${ext}`;

                    // Inline
                    const vCmd = new GetObjectCommand({
                        Bucket: process.env.AWS_BUCKET_NAME,
                        Key: note.s3Key,
                        ResponseContentDisposition: 'inline',
                        ResponseContentType: note.fileType
                    });
                    noteObj.fileUrl = await getSignedUrl(s3, vCmd, { expiresIn: 3600 });

                    // Download
                    const dCmd = new GetObjectCommand({
                        Bucket: process.env.AWS_BUCKET_NAME,
                        Key: note.s3Key,
                        ResponseContentDisposition: `attachment; filename="${safeName}"`,
                        ResponseContentType: note.fileType
                    });
                    noteObj.downloadUrl = await getSignedUrl(s3, dCmd, { expiresIn: 3600 });
                } catch (err) {
                    console.error(`Error signing URLs for public note ${note.id}:`, err);
                }
            }
            return noteObj;
        }));

        res.json({
            notes: notesWithSignedUrls,
            total,
            hasMore: Number(skip) + Number(limit) < total
        });

    } catch (error) {
        console.error("Error fetching public notes:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};

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

const getNoteCount = async (req, res) => {
    try {
        const count = await Note.countDocuments({});
        res.json({ count });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

const getNoteSubjects = async (req, res) => {
    try {
        const subjects = [
            "Machine Learning",
            "Compiler Design",
            "Computer Networks",
            "Software Engineering",
            "Cloud Computing",
            "Other"
        ];
        res.json(subjects);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

const getGroupNotes = async (req, res) => {
    try {
        const { id } = req.params;

        // Find all notes that are shared with this group
        const notes = await Note.find({ sharedGroups: id }).sort({ createdAt: -1 });

        // Generate Signed URLs for each note
        const notesWithSignedUrls = await Promise.all(notes.map(async (note) => {
            const noteObj = note.toObject();
            if (note.s3Key) {
                try {
                    const ext = getExt(note.fileType);
                    const safeName = `${sanitize(note.title)}.${ext}`;

                    // Inline
                    const vCmd = new GetObjectCommand({
                        Bucket: process.env.AWS_BUCKET_NAME,
                        Key: note.s3Key,
                        ResponseContentDisposition: 'inline',
                        ResponseContentType: note.fileType
                    });
                    noteObj.fileUrl = await getSignedUrl(s3, vCmd, { expiresIn: 3600 });

                    // Download
                    const dCmd = new GetObjectCommand({
                        Bucket: process.env.AWS_BUCKET_NAME,
                        Key: note.s3Key,
                        ResponseContentDisposition: `attachment; filename="${safeName}"`,
                        ResponseContentType: note.fileType
                    });
                    noteObj.downloadUrl = await getSignedUrl(s3, dCmd, { expiresIn: 3600 });
                } catch (err) {
                    console.error(`Error signing URLs for group note ${note.id}:`, err);
                }
            }
            return noteObj;
        }));

        res.json(notesWithSignedUrls);
    } catch (error) {
        console.error("Error fetching group notes:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    uploadNote,
    getNotes,
    getPublicNotes,
    getNoteCount,
    getNoteSubjects,
    getGroupNotes,
    deleteNote
};
