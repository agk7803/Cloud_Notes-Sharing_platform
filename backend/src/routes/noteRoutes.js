const express = require('express');
const router = express.Router();
const { uploadNote, getNotes, getPublicNotes, getNoteCount, getNoteSubjects, deleteNote } = require('../controllers/noteController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');

router.get('/public', getPublicNotes);
router.get('/count', getNoteCount);
router.get('/subjects', getNoteSubjects);

router.route('/')
    .get(protect, getNotes)
    .post(protect, upload.single('file'), uploadNote);

router.route('/:id')
    .delete(protect, deleteNote);

module.exports = router;
