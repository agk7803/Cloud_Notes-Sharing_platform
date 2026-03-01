const express = require('express');
const router = express.Router();
const { getEvents, createEvent, deleteEvent } = require('../controllers/eventController');
const { protect } = require('../middleware/authMiddleware');

// All routes are protected
router.get('/', protect, getEvents);
router.post('/', protect, createEvent);
router.delete('/:id', protect, deleteEvent);

module.exports = router;
