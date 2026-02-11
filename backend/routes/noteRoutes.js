const express = require('express');
const router = express.Router();
const { uploadNote, getNotes, deleteNote } = require('../controllers/noteController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');

router.route('/')
    .get(protect, getNotes)
    .post(protect, upload.single('file'), uploadNote);

router.route('/:id')
    .delete(deleteNote);

module.exports = router;
