const express = require('express');
const router = express.Router();
const multer = require('multer');
const { uploadAudio } = require('../controllers/uploadController');
const { protect } = require('../middleware/authMiddleware');

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post('/audio', protect, upload.single('audio'), uploadAudio);

module.exports = router;
