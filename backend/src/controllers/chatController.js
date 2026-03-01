const Chat = require('../models/Chat');

// @desc    Get chat messages for a group
// @route   GET /api/groups/:id/chats
// @access  Private
const getGroupChats = async (req, res) => {
    try {
        const { id } = req.params;
        // Basic pagination or limit could be added here
        const chats = await Chat.find({ groupId: id })
            .sort({ createdAt: 1 }) // Oldest first for chat log
            .limit(100);
        res.json(chats);
    } catch (error) {
        console.error("Error fetching chats:", error);
        res.status(500).json({ message: "Failed to load chat history" });
    }
};

module.exports = { getGroupChats };
