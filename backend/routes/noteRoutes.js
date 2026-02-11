const express = require('express');
const router = express.Router();
const { uploadNote, getNotes, deleteNote } = require('../controllers/noteController');
const upload = require('../middleware/upload');

router.route('/')
    .get(getNotes)
    .post(upload.single('file'), uploadNote);

router.route('/:id')
    .delete(deleteNote);

module.exports = router;
