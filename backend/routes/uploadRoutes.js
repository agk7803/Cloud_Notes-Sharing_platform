const express = require('express');
const router = express.Router();
const multer = require('multer');
const { uploadAudio, uploadProfilePicture } = require('../controllers/uploadController');
const { protect } = require('../middleware/authMiddleware');

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post('/audio', protect, upload.single('audio'), uploadAudio);
router.post('/profile-pic', protect, upload.single('image'), uploadProfilePicture);

module.exports = router;
