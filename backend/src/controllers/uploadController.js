const { PutObjectCommand } = require('@aws-sdk/client-s3');
const s3 = require('../config/s3');
const { v4: uuidv4 } = require('uuid');

// @desc    Upload audio file
// @route   POST /api/upload/audio
// @access  Private
const uploadAudio = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No audio file uploaded' });
        }

        const fileKey = `audio/${req.user.uid}/${uuidv4()}-${req.file.originalname}`;

        const command = new PutObjectCommand({
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: fileKey,
            Body: req.file.buffer,
            ContentType: req.file.mimetype,
            // ACL: 'public-read' // Remove if bucket is private
        });

        await s3.send(command);

        // Construct Public URL (if bucket is public) 
        // OR use Signed URL logic if private (for simplicity using public pattern here or assuming presign logic needed later)
        // For this user request, we'll store the direct S3 URL assuming public access or proxy.
        // If private, we'd generally store Key and sign on fetch, but for Chat audio, public read is often easier.
        // Let's assume standard S3 URL format:
        const location = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileKey}`;

        res.json({ audioUrl: location });
    } catch (error) {
        console.error("Audio Upload Error:", error);
        res.status(500).json({ message: 'Audio upload failed' });
    }
};

module.exports = { uploadAudio };

// @desc    Upload profile picture
// @route   POST /api/upload/profile-pic
// @access  Private
const uploadProfilePicture = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No image file uploaded' });
        }

        const fileKey = `profile-pics/${req.user.uid}/${uuidv4()}-${req.file.originalname}`;

        const command = new PutObjectCommand({
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: fileKey,
            Body: req.file.buffer,
            ContentType: req.file.mimetype,
        });

        await s3.send(command);

        const location = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileKey}`;

        res.json({ imageUrl: location });
    } catch (error) {
        console.error("Profile Pic Upload Error:", error);
        res.status(500).json({ message: 'Image upload failed' });
    }
};

module.exports = { uploadAudio, uploadProfilePicture };
