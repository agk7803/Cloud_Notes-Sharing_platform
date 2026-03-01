const Event = require('../models/Event');

// @desc    Get all events for a user
// @route   GET /api/events
// @access  Private
const getEvents = async (req, res) => {
    try {
        const events = await Event.find({ userId: req.user.uid }).sort({ createdAt: -1 });
        res.status(200).json(events);
    } catch (error) {
        console.error("🔥 Get Events Error:", error.message);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Create a new event
// @route   POST /api/events
// @access  Private
const createEvent = async (req, res) => {
    try {
        const { title, type, time, duration, date } = req.body;

        if (!title || !type || !date) {
            return res.status(400).json({ message: 'Please provide title, type, and date' });
        }

        const newEvent = new Event({
            userId: req.user.uid,
            title,
            type,
            time,
            duration,
            date
        });

        const savedEvent = await newEvent.save();
        res.status(201).json(savedEvent);
    } catch (error) {
        console.error("🔥 Create Event Error:", error.message);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Delete an event
// @route   DELETE /api/events/:id
// @access  Private
const deleteEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);

        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        // Check ownership
        if (event.userId !== req.user.uid) {
            return res.status(403).json({ message: 'Not authorized to delete this event' });
        }

        await event.deleteOne();
        res.status(200).json({ message: 'Event removed' });
    } catch (error) {
        console.error("🔥 Delete Event Error:", error.message);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    getEvents,
    createEvent,
    deleteEvent
};
